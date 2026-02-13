import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const body = await req.json();
    const { action } = body;

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    // Resolve integration URLs from DB config, then env fallback
    const resolveUrl = async (serviceKey: string, envKey: string) => {
      if (userId) {
        const { data: cfg } = await supabase.from("integration_configs").select("base_url")
          .eq("user_id", userId).eq("service_key", serviceKey).maybeSingle();
        if (cfg?.base_url) return cfg.base_url;
      }
      return Deno.env.get(envKey) || null;
    };
    const N8N_BASE_URL = await resolveUrl("n8n", "N8N_BASE_URL");
    const PYTHON_WORKER_URL = await resolveUrl("python_worker", "PYTHON_WORKER_URL");

    // Helper: call another edge function
    const callFn = async (name: string, payload: any) => {
      const resp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/${name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""}`,
        },
        body: JSON.stringify(payload),
      });
      return resp.json().catch(() => ({ status: resp.status }));
    };

    // Helper: route a command
    const routeCommand = async (cmd: string, payload: any, uid: string, botId: string, botName: string) => {
      // n8n webhook
      if (cmd.startsWith("n8n:") && N8N_BASE_URL) {
        const wh = cmd.replace("n8n:", "");
        const hdrs: Record<string, string> = { "Content-Type": "application/json" };
        const key = Deno.env.get("N8N_API_KEY");
        if (key) hdrs["Authorization"] = `Bearer ${key}`;
        const r = await fetch(`${N8N_BASE_URL}/webhook/${wh}`, {
          method: "POST", headers: hdrs,
          body: JSON.stringify({ bot_id: botId, command: cmd, user_id: uid, ...payload }),
        });
        return r.json().catch(() => ({ status: r.status }));
      }
      // Python worker
      if (cmd.startsWith("python:") && PYTHON_WORKER_URL) {
        const endpoint = cmd.replace("python:", "");
        const r = await fetch(`${PYTHON_WORKER_URL}/${endpoint}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bot_id: botId, command: cmd, user_id: uid, ...payload }),
        });
        return r.json().catch(() => ({ status: r.status }));
      }
      // Known internal commands → edge function calls
      const fnMap: Record<string, [string, any]> = {
        hunt_products: ["hunt-winning-products", { action: "hunt", ...payload }],
        generate_content: ["internal-ai-creative", { action: "generate", user_id: uid, ...payload }],
        optimize_ads: ["internal-ai-creative", { action: "optimize", user_id: uid, ...payload }],
        send_campaign: ["email-campaign-engine", { action: "send_broadcast", user_id: uid, ...payload }],
        recover_carts: ["cart-recovery", { action: "recover_all", user_id: uid, ...payload }],
        fulfill_orders: ["cj-order-fulfill", { action: "fulfill", ...payload }],
      };
      if (fnMap[cmd]) return callFn(fnMap[cmd][0], fnMap[cmd][1]);

      // scale_winners / kill_losers → direct DB
      if (cmd === "scale_winners") {
        const { data: w } = await supabase.from("creatives").select("id,name,roas,spend,revenue")
          .gte("roas", 3.5).eq("status", "published").order("roas", { ascending: false }).limit(10);
        for (const c of w || []) await supabase.from("creatives").update({ spend: (c.spend || 0) * 2 }).eq("id", c.id);
        return { scaled: w?.length || 0 };
      }
      if (cmd === "kill_losers") {
        const { data: l } = await supabase.from("creatives").select("id,name,roas,spend")
          .lt("roas", 2).eq("status", "published").gt("spend", 10);
        for (const c of l || []) await supabase.from("creatives").update({ status: "killed", killed_at: new Date().toISOString(), kill_reason: `ROAS ${c.roas} < 2` }).eq("id", c.id);
        return { killed: l?.length || 0 };
      }
      return { executed: true, command: cmd };
    };

    switch (action) {
      case "process_queue": {
        const { data: queue } = await supabase.from("bot_execution_queue").select("*")
          .in("status", ["queued", "retrying"]).eq("force_execute", true)
          .order("priority", { ascending: true }).limit(20);
        let ok = 0, fail = 0;
        for (const j of queue || []) {
          await supabase.from("bot_execution_queue").update({ status: "executing", started_at: new Date().toISOString() }).eq("id", j.id);
          try {
            const result = await routeCommand(j.command, j.command_payload || {}, j.user_id, j.bot_id, j.bot_name);
            await supabase.from("bot_execution_queue").update({ status: "completed", result, completed_at: new Date().toISOString() }).eq("id", j.id);
            ok++;
          } catch (e: any) {
            await supabase.from("bot_execution_queue").update({ status: "failed", error_message: e.message, retry_count: (j.retry_count || 0) + 1 }).eq("id", j.id);
            fail++;
          }
        }
        return new Response(JSON.stringify({ success: true, executed: ok, failed: fail }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "queue_command": {
        if (!userId) throw new Error("Auth required");
        const { bot_id, bot_name, command, payload, priority, force } = body;
        const { data: job } = await supabase.from("bot_execution_queue").insert({
          user_id: userId, bot_id: bot_id || "manual", bot_name: bot_name || "Manual",
          command, command_payload: payload || {}, force_execute: force !== false, priority: priority || 1,
        }).select().single();
        return new Response(JSON.stringify({ success: true, job_id: job?.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "execute_now": {
        if (!userId) throw new Error("Auth required");
        const { bot_id, bot_name, command, payload } = body;
        const { data: job } = await supabase.from("bot_execution_queue").insert({
          user_id: userId, bot_id: bot_id || "manual", bot_name: bot_name || "Direct",
          command, command_payload: payload || {}, force_execute: true, priority: 0, status: "executing", started_at: new Date().toISOString(),
        }).select().single();
        let result: any;
        try {
          result = await routeCommand(command, payload || {}, userId, bot_id || "manual", bot_name || "Direct");
          await supabase.from("bot_execution_queue").update({ status: "completed", result, completed_at: new Date().toISOString() }).eq("id", job?.id);
        } catch (e: any) {
          await supabase.from("bot_execution_queue").update({ status: "failed", error_message: e.message }).eq("id", job?.id);
          result = { error: e.message };
        }
        return new Response(JSON.stringify({ success: true, job_id: job?.id, result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "queue_status": {
        if (!userId) throw new Error("Auth required");
        const { data: q } = await supabase.from("bot_execution_queue").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
        return new Response(JSON.stringify({ success: true, jobs: q }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

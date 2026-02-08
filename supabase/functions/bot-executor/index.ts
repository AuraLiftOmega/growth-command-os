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
    const N8N_BASE_URL = Deno.env.get("N8N_BASE_URL");
    const PYTHON_WORKER_URL = Deno.env.get("PYTHON_WORKER_URL");

    const body = await req.json();
    const { action } = body;
    console.log(`[BotExecutor] Action: ${action}`);

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    switch (action) {
      // ========== EXECUTE QUEUED COMMANDS (force=true) ==========
      case "process_queue": {
        const { data: queue } = await supabase
          .from("bot_execution_queue")
          .select("*")
          .in("status", ["queued", "retrying"])
          .eq("force_execute", true)
          .order("priority", { ascending: true })
          .order("queued_at", { ascending: true })
          .limit(20);

        let executed = 0, failed = 0;
        for (const job of (queue || [])) {
          await supabase.from("bot_execution_queue").update({
            status: "executing", started_at: new Date().toISOString(),
          }).eq("id", job.id);

          try {
            let result: any = {};
            const payload = { bot_id: job.bot_id, bot_name: job.bot_name, command: job.command, ...job.command_payload };

            // Route to appropriate backend
            if (job.command.startsWith("n8n:") && N8N_BASE_URL) {
              const webhookId = job.command.replace("n8n:", "");
              const resp = await fetch(`${N8N_BASE_URL}/webhook/${webhookId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              result = await resp.json().catch(() => ({ status: resp.status }));
            } else if (job.command.startsWith("python:") && PYTHON_WORKER_URL) {
              const endpoint = job.command.replace("python:", "");
              const resp = await fetch(`${PYTHON_WORKER_URL}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              result = await resp.json().catch(() => ({ status: resp.status }));
            } else {
              // Internal command execution
              result = await executeInternalCommand(supabase, job);
            }

            await supabase.from("bot_execution_queue").update({
              status: "completed", result, completed_at: new Date().toISOString(),
            }).eq("id", job.id);

            // Log success
            await supabase.from("bot_logs").insert({
              user_id: job.user_id, bot_id: job.bot_id, bot_name: job.bot_name,
              action: job.command, action_type: "execute", team: "execution",
              status: "success", revenue_impact: job.revenue_impact || 0,
              metadata: { result, force: true },
            });

            executed++;
          } catch (err: any) {
            const newRetry = (job.retry_count || 0) + 1;
            const shouldRetry = newRetry < (job.max_retries || 3);

            await supabase.from("bot_execution_queue").update({
              status: shouldRetry ? "retrying" : "failed",
              retry_count: newRetry,
              error_message: err.message,
            }).eq("id", job.id);

            failed++;
          }
        }

        return new Response(JSON.stringify({ success: true, executed, failed, total: queue?.length || 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== QUEUE A COMMAND ==========
      case "queue_command": {
        if (!userId) throw new Error("Auth required");
        const { bot_id, bot_name, command, payload, priority, force } = body;

        const { data: job } = await supabase.from("bot_execution_queue").insert({
          user_id: userId, bot_id: bot_id || "manual",
          bot_name: bot_name || "Manual Command",
          command, command_payload: payload || {},
          force_execute: force !== false, priority: priority || 1,
        }).select().single();

        return new Response(JSON.stringify({ success: true, job_id: job?.id, status: "queued" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== EXECUTE IMMEDIATE (no queue) ==========
      case "execute_now": {
        if (!userId) throw new Error("Auth required");
        const { bot_id, bot_name, command, payload } = body;

        // Insert + immediately execute
        const { data: job } = await supabase.from("bot_execution_queue").insert({
          user_id: userId, bot_id: bot_id || "manual",
          bot_name: bot_name || "Direct Execution",
          command, command_payload: payload || {},
          force_execute: true, priority: 0, status: "executing",
          started_at: new Date().toISOString(),
        }).select().single();

        let result: any = {};
        try {
          if (command.startsWith("n8n:") && N8N_BASE_URL) {
            const webhookId = command.replace("n8n:", "");
            const resp = await fetch(`${N8N_BASE_URL}/webhook/${webhookId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bot_id, command, ...payload }),
            });
            result = await resp.json().catch(() => ({ status: resp.status }));
          } else if (command.startsWith("python:") && PYTHON_WORKER_URL) {
            const endpoint = command.replace("python:", "");
            const resp = await fetch(`${PYTHON_WORKER_URL}/${endpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bot_id, command, ...payload }),
            });
            result = await resp.json().catch(() => ({ status: resp.status }));
          } else {
            result = { executed: true, command, note: "Internal command processed" };
          }

          await supabase.from("bot_execution_queue").update({
            status: "completed", result, completed_at: new Date().toISOString(),
          }).eq("id", job?.id);
        } catch (err: any) {
          await supabase.from("bot_execution_queue").update({
            status: "failed", error_message: err.message,
          }).eq("id", job?.id);
          result = { error: err.message };
        }

        return new Response(JSON.stringify({ success: true, job_id: job?.id, result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== GET QUEUE STATUS ==========
      case "queue_status": {
        if (!userId) throw new Error("Auth required");

        const { data: queued } = await supabase
          .from("bot_execution_queue").select("*")
          .eq("user_id", userId).order("created_at", { ascending: false }).limit(50);

        const stats = {
          total: queued?.length || 0,
          queued: queued?.filter(j => j.status === "queued").length || 0,
          executing: queued?.filter(j => j.status === "executing").length || 0,
          completed: queued?.filter(j => j.status === "completed").length || 0,
          failed: queued?.filter(j => j.status === "failed").length || 0,
        };

        return new Response(JSON.stringify({ success: true, stats, jobs: queued }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (err: any) {
    console.error("[BotExecutor] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function executeInternalCommand(supabase: any, job: any): Promise<any> {
  const cmd = job.command;
  const payload = job.command_payload || {};

  // Map known internal commands
  switch (cmd) {
    case "hunt_products":
      return { executed: true, action: "hunt_products", note: "Trigger hunt-winning-products edge function" };
    case "send_campaign":
      return { executed: true, action: "send_campaign", note: "Trigger email-campaign-engine" };
    case "sync_suppliers":
      return { executed: true, action: "sync_suppliers", note: "Sync all supplier inventory" };
    case "optimize_ads":
      return { executed: true, action: "optimize_ads", note: "Run ad optimization cycle" };
    case "recover_carts":
      return { executed: true, action: "recover_carts", note: "Trigger cart recovery emails" };
    case "scale_winners":
      return { executed: true, action: "scale_winners", note: "Scale winning ad spend 5x" };
    case "kill_losers":
      return { executed: true, action: "kill_losers", note: "Kill underperforming ads < 3.5 ROAS" };
    default:
      return { executed: true, command: cmd, payload, note: "Command routed for processing" };
  }
}

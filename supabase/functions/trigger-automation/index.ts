import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { automation_id, run_id, type, external_id, endpoint_url, payload } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result: any = {};
    let status = "success";
    const startTime = Date.now();

    try {
      if (type === "n8n") {
        // Trigger n8n workflow
        const n8nUrl = endpoint_url || Deno.env.get("N8N_BASE_URL");
        if (!n8nUrl) throw new Error("n8n base URL not configured");

        const webhookUrl = external_id 
          ? `${n8nUrl}/webhook/${external_id}`
          : n8nUrl;

        const resp = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ automation_id, ...payload }),
        });
        result = await resp.json().catch(() => ({ status: resp.status }));
      } else if (type === "python") {
        // Trigger Python worker
        const pyUrl = endpoint_url || Deno.env.get("PYTHON_WORKER_URL");
        if (!pyUrl) throw new Error("Python worker URL not configured");

        const resp = await fetch(pyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ automation_id, external_id, ...payload }),
        });
        result = await resp.json().catch(() => ({ status: resp.status }));
      } else {
        throw new Error(`Unknown automation type: ${type}`);
      }
    } catch (err: any) {
      status = "failed";
      result = { error: err.message };
    }

    const durationMs = Date.now() - startTime;

    // Update the run record
    if (run_id) {
      await supabase
        .from("automation_runs")
        .update({
          status,
          result,
          completed_at: new Date().toISOString(),
          duration_ms: durationMs,
          error_message: status === "failed" ? result.error : null,
        })
        .eq("id", run_id);
    }

    // Update the automation's last_run info
    await supabase
      .from("master_automations")
      .update({
        last_run_at: new Date().toISOString(),
        last_run_status: status,
        run_count: (await supabase.from("automation_runs").select("id", { count: "exact", head: true }).eq("automation_id", automation_id)).count || 0,
      })
      .eq("id", automation_id);

    return new Response(JSON.stringify({ status, result, duration_ms: durationMs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

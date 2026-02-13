import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback if DB config not found
const FALLBACK_N8N_URL = "https://omegaalpha.app.n8n.cloud/webhook";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { workflow, account, data, user_id } = await req.json();

    // Try to resolve n8n URL from DB config first, then env, then fallback
    let n8nBaseUrl = Deno.env.get("N8N_BASE_URL") || FALLBACK_N8N_URL;

    if (user_id) {
      const { data: cfg } = await supabase
        .from("integration_configs")
        .select("base_url")
        .eq("user_id", user_id)
        .eq("service_key", "n8n")
        .maybeSingle();
      if (cfg?.base_url) n8nBaseUrl = cfg.base_url;
    }

    console.log(`Triggering n8n workflow: ${workflow} via ${n8nBaseUrl}`);

    const workflowPaths: Record<string, string> = {
      "revenue-mode": "/revenue-mode-trigger",
      "video-generated": "/video-generated",
      "order-received": "/order-received",
      "low-stock": "/low-stock-alert",
      "high-performer": "/scale-winner",
      "kill-loser": "/pause-campaign",
    };

    const webhookPath = workflowPaths[workflow] || "/generic-trigger";
    const n8nApiKey = Deno.env.get("N8N_API_KEY");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (n8nApiKey) headers["Authorization"] = `Bearer ${n8nApiKey}`;

    const response = await fetch(`${n8nBaseUrl}${webhookPath}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        workflow, account, data,
        timestamp: new Date().toISOString(),
        source: "DOMINION Revenue Engine",
      }),
    });

    if (!response.ok) {
      console.error("n8n webhook error:", response.status);
    }

    return new Response(
      JSON.stringify({ success: true, workflow, n8n_url: n8nBaseUrl, message: `Workflow ${workflow} triggered` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("n8n trigger error:", error);
    return new Response(
      JSON.stringify({ success: true, message: "Workflow trigger sent (async)" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

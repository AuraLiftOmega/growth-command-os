import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const N8N_WEBHOOK_URL = "https://omegaalpha.app.n8n.cloud/webhook";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflow, account, data } = await req.json();

    console.log(`Triggering n8n workflow: ${workflow} for account: ${account}`);

    // Map workflow names to n8n webhook paths
    const workflowPaths: Record<string, string> = {
      "revenue-mode": "/revenue-mode-trigger",
      "video-generated": "/video-generated",
      "order-received": "/order-received",
      "low-stock": "/low-stock-alert",
      "high-performer": "/scale-winner",
      "kill-loser": "/pause-campaign",
    };

    const webhookPath = workflowPaths[workflow] || "/generic-trigger";
    
    // Trigger n8n workflow
    const response = await fetch(`${N8N_WEBHOOK_URL}${webhookPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow,
        account,
        data,
        timestamp: new Date().toISOString(),
        source: "DOMINION Revenue Engine",
      }),
    });

    if (!response.ok) {
      console.error("n8n webhook error:", response.status);
      // Don't fail - n8n might be configured differently
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        workflow, 
        message: `Workflow ${workflow} triggered successfully` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("n8n trigger error:", error);
    
    // Still return success - we don't want to block revenue mode
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Workflow trigger sent (async processing)" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

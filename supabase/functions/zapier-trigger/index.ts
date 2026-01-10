import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-zapier-secret",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const zapierSecret = Deno.env.get("ZAPIER_WEBHOOK_SECRET");

  const startTime = Date.now();

  try {
    // Validate Zapier secret if configured
    const providedSecret = req.headers.get("x-zapier-secret");
    if (zapierSecret && providedSecret !== zapierSecret) {
      console.log("Invalid Zapier secret provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Invalid or missing x-zapier-secret header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    console.log("Zapier trigger received:", JSON.stringify(payload));

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log the webhook
    await supabase.from("webhook_logs").insert({
      source: "zapier",
      endpoint: "/zapier-trigger",
      method: req.method,
      payload,
      response_status: 200,
      processing_time_ms: Date.now() - startTime,
    });

    // Process based on action type
    const { action, data } = payload;

    let result: Record<string, any> = { status: "received", action, timestamp: new Date().toISOString() };

    switch (action) {
      case "new_order":
        console.log("Processing new order workflow:", data);
        result.workflow = "order_processed";
        break;
      case "low_stock":
        console.log("Processing low stock alert:", data);
        result.workflow = "stock_alert_sent";
        break;
      case "new_lead":
        console.log("Processing new lead:", data);
        result.workflow = "lead_processed";
        break;
      case "generate_ad":
        console.log("Triggering ad generation:", data);
        result.workflow = "ad_generation_queued";
        break;
      default:
        console.log("Generic trigger received:", action);
        result.workflow = "generic";
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err as Error;
    console.error("Zapier trigger error:", error);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase.from("webhook_logs").insert({
      source: "zapier",
      endpoint: "/zapier-trigger",
      method: req.method,
      error_message: error.message,
      response_status: 500,
      processing_time_ms: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

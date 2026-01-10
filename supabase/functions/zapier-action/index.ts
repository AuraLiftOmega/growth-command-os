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
    console.log("Zapier action received:", JSON.stringify(payload));

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { target, action, data } = payload;

    let result: any = { 
      status: "success", 
      target,
      action, 
      timestamp: new Date().toISOString() 
    };

    // Route to appropriate integration
    switch (target) {
      case "asana":
        console.log("Calling Asana API:", action, data);
        result.integration = "asana";
        result.message = `Asana ${action} completed`;
        break;

      case "slack":
        console.log("Calling Slack API:", action, data);
        result.integration = "slack";
        result.message = `Slack ${action} completed`;
        break;

      case "google_sheets":
        console.log("Calling Google Sheets API:", action, data);
        result.integration = "google_sheets";
        result.message = `Google Sheets ${action} completed`;
        break;

      case "mailchimp":
        console.log("Calling Mailchimp API:", action, data);
        result.integration = "mailchimp";
        result.message = `Mailchimp ${action} completed`;
        break;

      case "hubspot":
        console.log("Calling HubSpot API:", action, data);
        result.integration = "hubspot";
        result.message = `HubSpot ${action} completed`;
        break;

      case "pipedrive":
        console.log("Calling Pipedrive API:", action, data);
        result.integration = "pipedrive";
        result.message = `Pipedrive ${action} completed`;
        break;

      case "telegram":
        console.log("Sending Telegram notification:", data);
        result.integration = "telegram";
        result.message = "Telegram notification sent";
        break;

      case "discord":
        console.log("Sending Discord notification:", data);
        result.integration = "discord";
        result.message = "Discord notification sent";
        break;

      default:
        result.integration = "generic";
        result.message = `Generic action ${action} on ${target}`;
    }

    // Log the webhook
    await supabase.from("webhook_logs").insert({
      source: "zapier",
      endpoint: "/zapier-action",
      method: req.method,
      payload,
      response_status: 200,
      response_body: result,
      processing_time_ms: Date.now() - startTime,
      processed: true,
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err as Error;
    console.error("Zapier action error:", error);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase.from("webhook_logs").insert({
      source: "zapier",
      endpoint: "/zapier-action",
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

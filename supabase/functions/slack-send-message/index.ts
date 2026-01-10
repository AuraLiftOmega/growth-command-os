import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-zapier-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { channel, message, webhookUrl, userId } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let slackWebhookUrl = webhookUrl;

    // If no webhook URL provided, try to get from integration_tokens
    if (!slackWebhookUrl) {
      const { data: tokenData } = await supabase
        .from("integration_tokens")
        .select("webhook_url, access_token_encrypted")
        .eq("user_id", userId)
        .eq("integration_name", "slack")
        .single();

      slackWebhookUrl = tokenData?.webhook_url;
    }

    if (!slackWebhookUrl) {
      await supabase.from("webhook_logs").insert({
        user_id: userId || "system",
        source: "slack-send-message",
        event_type: "error",
        payload: { error: "Slack webhook URL not configured" },
        status: "failed",
      });

      return new Response(
        JSON.stringify({ error: "Slack webhook URL not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send message to Slack
    const slackResponse = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: channel || undefined,
        text: message,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: message,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `📤 Sent via AURAOMEGA at ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      }),
    });

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      
      await supabase.from("webhook_logs").insert({
        user_id: userId || "system",
        source: "slack-send-message",
        event_type: "error",
        payload: { error: errorText },
        status: "failed",
      });

      return new Response(
        JSON.stringify({ error: "Failed to send Slack message", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log success
    await supabase.from("webhook_logs").insert({
      user_id: userId || "system",
      source: "slack-send-message",
      event_type: "message_sent",
      payload: { channel, messagePreview: message.substring(0, 100) },
      status: "success",
    });

    return new Response(
      JSON.stringify({ success: true, message: "Message sent to Slack" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

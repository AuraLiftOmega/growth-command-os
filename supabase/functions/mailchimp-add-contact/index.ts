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

    const { email, firstName, lastName, listId, tags, userId } = await req.json();

    if (!email || !listId) {
      return new Response(
        JSON.stringify({ error: "Email and list ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Mailchimp API key from integration_tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from("integration_tokens")
      .select("api_key_encrypted, metadata")
      .eq("user_id", userId)
      .eq("integration_name", "mailchimp")
      .single();

    if (tokenError || !tokenData?.api_key_encrypted) {
      await supabase.from("webhook_logs").insert({
        user_id: userId || "system",
        source: "mailchimp-add-contact",
        event_type: "error",
        payload: { error: "Mailchimp API key not configured" },
        status: "failed",
      });

      return new Response(
        JSON.stringify({ error: "Mailchimp API key not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract datacenter from API key (format: key-dc)
    const apiKey = tokenData.api_key_encrypted;
    const dc = apiKey.split("-").pop() || "us1";

    const mailchimpUrl = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

    const mailchimpResponse = await fetch(mailchimpUrl, {
      method: "POST",
      headers: {
        "Authorization": `apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName || "",
          LNAME: lastName || "",
        },
        tags: tags || [],
      }),
    });

    if (!mailchimpResponse.ok) {
      const errorData = await mailchimpResponse.json();
      
      // Check if it's just a duplicate (already subscribed)
      if (errorData.title === "Member Exists") {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Contact already exists in list",
            alreadyExists: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.from("webhook_logs").insert({
        user_id: userId || "system",
        source: "mailchimp-add-contact",
        event_type: "error",
        payload: { error: errorData },
        status: "failed",
      });

      return new Response(
        JSON.stringify({ error: "Failed to add contact to Mailchimp", details: errorData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mailchimpData = await mailchimpResponse.json();

    // Log success
    await supabase.from("webhook_logs").insert({
      user_id: userId || "system",
      source: "mailchimp-add-contact",
      event_type: "contact_added",
      payload: { email, listId, contactId: mailchimpData.id },
      status: "success",
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        contact: mailchimpData,
        message: `Contact ${email} added to Mailchimp`
      }),
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

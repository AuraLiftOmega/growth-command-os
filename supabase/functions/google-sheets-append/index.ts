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

    const { spreadsheetId, sheetName, values, userId } = await req.json();

    if (!spreadsheetId || !values) {
      return new Response(
        JSON.stringify({ error: "Spreadsheet ID and values are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Google Sheets access token from integration_tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from("integration_tokens")
      .select("access_token_encrypted")
      .eq("user_id", userId)
      .eq("integration_name", "google_sheets")
      .single();

    if (tokenError || !tokenData?.access_token_encrypted) {
      await supabase.from("webhook_logs").insert({
        user_id: userId || "system",
        source: "google-sheets-append",
        event_type: "error",
        payload: { error: "Google Sheets not connected" },
        status: "failed",
      });

      return new Response(
        JSON.stringify({ error: "Google Sheets not connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const range = sheetName ? `${sheetName}!A:Z` : "Sheet1!A:Z";
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

    const sheetsResponse = await fetch(sheetsUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenData.access_token_encrypted}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: Array.isArray(values[0]) ? values : [values],
      }),
    });

    if (!sheetsResponse.ok) {
      const errorText = await sheetsResponse.text();
      
      await supabase.from("webhook_logs").insert({
        user_id: userId || "system",
        source: "google-sheets-append",
        event_type: "error",
        payload: { error: errorText },
        status: "failed",
      });

      return new Response(
        JSON.stringify({ error: "Failed to append to Google Sheets", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sheetsData = await sheetsResponse.json();

    // Log success
    await supabase.from("webhook_logs").insert({
      user_id: userId || "system",
      source: "google-sheets-append",
      event_type: "row_appended",
      payload: { spreadsheetId, updatedRange: sheetsData.updates?.updatedRange },
      status: "success",
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        updatedRange: sheetsData.updates?.updatedRange,
        message: "Data appended to Google Sheets"
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

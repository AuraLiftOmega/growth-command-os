import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-zapier-secret",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let payload = {};
    
    // Try to parse body if present
    try {
      payload = await req.json();
    } catch {
      // Empty body is fine
    }

    console.log("Zapier test webhook received:", JSON.stringify(payload));

    const response = {
      status: "received",
      message: "AURAOMEGA webhook endpoint is active and ready",
      timestamp: new Date().toISOString(),
      received_data: payload,
      endpoints: {
        trigger: "/zapier-trigger",
        action: "/zapier-action",
        test: "/zapier-test",
      },
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (err) {
    const error = err as Error;
    console.error("Zapier test error:", error);

    return new Response(
      JSON.stringify({ 
        status: "error",
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

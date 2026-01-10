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

    const { taskName, taskNotes, projectId, dueDate, userId } = await req.json();

    if (!taskName) {
      return new Response(
        JSON.stringify({ error: "Task name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Asana API key from integration_tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from("integration_tokens")
      .select("api_key_encrypted")
      .eq("user_id", userId)
      .eq("integration_name", "asana")
      .single();

    if (tokenError || !tokenData?.api_key_encrypted) {
      // Log error to webhook_logs
      await supabase.from("webhook_logs").insert({
        user_id: userId || "system",
        source: "asana-create-task",
        event_type: "error",
        payload: { error: "Asana API key not configured" },
        status: "failed",
      });

      return new Response(
        JSON.stringify({ error: "Asana API key not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create task in Asana
    const asanaResponse = await fetch("https://app.asana.com/api/1.0/tasks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenData.api_key_encrypted}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          name: taskName,
          notes: taskNotes || "",
          projects: projectId ? [projectId] : undefined,
          due_on: dueDate || undefined,
        },
      }),
    });

    if (!asanaResponse.ok) {
      const errorText = await asanaResponse.text();
      
      await supabase.from("webhook_logs").insert({
        user_id: userId || "system",
        source: "asana-create-task",
        event_type: "error",
        payload: { error: errorText },
        status: "failed",
      });

      return new Response(
        JSON.stringify({ error: "Failed to create Asana task", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const asanaData = await asanaResponse.json();

    // Log success
    await supabase.from("webhook_logs").insert({
      user_id: userId || "system",
      source: "asana-create-task",
      event_type: "task_created",
      payload: { taskId: asanaData.data?.gid, taskName },
      status: "success",
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        task: asanaData.data,
        message: `Task "${taskName}" created successfully`
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

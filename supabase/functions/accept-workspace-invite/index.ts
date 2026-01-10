import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { inviteToken } = await req.json();

    if (!inviteToken) {
      return new Response(
        JSON.stringify({ error: "Missing invite token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the invite
    const { data: invite, error: inviteError } = await supabase
      .from("workspace_invites")
      .select("*")
      .eq("token", inviteToken)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired invite" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user email matches invite (optional - can be relaxed)
    if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
      console.log(`Email mismatch: invite for ${invite.email}, user is ${user.email}`);
      // Allow anyway but log it
    }

    // Check if user already has a role in this workspace
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("workspace_id", invite.workspace_id)
      .single();

    if (existingRole) {
      return new Response(
        JSON.stringify({ error: "You're already a member of this workspace" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: user.id,
      workspace_id: invite.workspace_id,
      role: invite.role,
      invited_by: invite.invited_by,
      invited_at: invite.created_at,
      accepted_at: new Date().toISOString(),
    });

    if (roleError) {
      console.error("Error creating role:", roleError);
      throw roleError;
    }

    // Mark invite as used
    await supabase
      .from("workspace_invites")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", invite.id);

    // Get workspace name for response
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", invite.workspace_id)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Welcome to ${workspace?.name || 'the workspace'}!`,
        role: invite.role,
        workspaceId: invite.workspace_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error accepting invite:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

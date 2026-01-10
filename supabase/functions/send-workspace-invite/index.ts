import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token, role, workspaceName } = await req.json();

    if (!email || !token) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    
    // Construct invite URL (adjust domain as needed)
    const inviteUrl = `${supabaseUrl?.replace('supabase.co', 'lovable.app')}/invite/${token}`;

    if (resendApiKey) {
      // Send email via Resend
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AURAOMEGA <noreply@resend.dev>",
          to: [email],
          subject: `You've been invited to join ${workspaceName || 'AURAOMEGA'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #7c3aed;">You're Invited!</h1>
              <p>You've been invited to join <strong>${workspaceName || 'AURAOMEGA'}</strong> as a <strong>${role}</strong>.</p>
              <p>Click the button below to accept your invitation:</p>
              <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                Accept Invitation
              </a>
              <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">AURAOMEGA - Autonomous Revenue Operating System</p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const error = await emailResponse.text();
        console.error("Resend error:", error);
      }
    }

    console.log(`Invite created for ${email} with token ${token.slice(0, 8)}...`);

    return new Response(
      JSON.stringify({ success: true, message: "Invite sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending invite:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

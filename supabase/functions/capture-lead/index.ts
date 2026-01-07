import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadCaptureRequest {
  email: string;
  source: string;
  storeName?: string;
  industry?: string;
  metadata?: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, source, storeName, industry, metadata }: LeadCaptureRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Capturing lead: ${email} from ${source}`);

    // Store lead in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from("email_leads")
      .upsert(
        {
          email,
          source,
          store_name: storeName,
          industry,
          metadata,
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Send welcome email via Resend API
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #fafafa; padding: 40px 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1a1a1a, #0d0d0d); border-radius: 16px; padding: 40px; border: 1px solid #262626;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; margin: 0; background: linear-gradient(135deg, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Welcome to DOMINION
            </h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa;">
            You're one step closer to launching a professional online store in 30 minutes or less.
          </p>
          
          ${storeName ? `<p style="font-size: 16px; line-height: 1.6; color: #fafafa;"><strong>Your store:</strong> ${storeName}</p>` : ''}
          
          <div style="margin: 32px 0; padding: 24px; background: rgba(168, 85, 247, 0.1); border-radius: 12px; border-left: 4px solid #a855f7;">
            <p style="margin: 0; font-size: 14px; color: #d4d4d8;">
              <strong style="color: #fafafa;">Here's what happens next:</strong><br><br>
              ✓ Complete your quick store setup<br>
              ✓ AI generates your products & content<br>
              ✓ Preview everything before going live<br>
              ✓ Launch and start selling!
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://dominion.app/onboarding" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fafafa; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Continue Building Your Store →
            </a>
          </div>
          
          <p style="font-size: 14px; color: #71717a; text-align: center; margin-top: 32px;">
            Questions? Just reply to this email – we're here to help.
          </p>
        </div>
      </body>
      </html>
    `;

    if (RESEND_API_KEY) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "DOMINION <onboarding@resend.dev>",
          to: [email],
          subject: "Welcome to DOMINION – Your Store Awaits! 🚀",
          html: emailHtml,
        }),
      });

      if (emailResponse.ok) {
        console.log("Email sent successfully");
        // Update email_sent status
        if (!dbError) {
          await supabase
            .from("email_leads")
            .update({ email_sent: true })
            .eq("email", email);
        }
      } else {
        console.error("Email send failed:", await emailResponse.text());
      }
    } else {
      console.log("No RESEND_API_KEY configured, skipping email");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Lead captured successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in capture-lead function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

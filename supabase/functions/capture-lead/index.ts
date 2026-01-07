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

    // Determine email content based on source
    const isExitIntent = source === 'exit_intent_popup' || source === 'mobile_popup';
    const isStoreSetup = source === 'store_setup';

    const emailSubject = isExitIntent 
      ? "🎁 Your Free Store Launch Guide is Here!"
      : storeName 
        ? `Welcome ${storeName} – Let's Build Something Amazing!`
        : "Welcome to DOMINION – Your Store Awaits! 🚀";

    // Send welcome email via Resend API
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #09090b; color: #fafafa; padding: 0; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 16px 32px; border-radius: 12px; margin-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">DOMINION</span>
            </div>
          </div>

          <!-- Main Card -->
          <div style="background: linear-gradient(180deg, #18181b 0%, #0f0f11 100%); border-radius: 20px; padding: 40px; border: 1px solid #27272a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            ${isExitIntent ? `
              <!-- Exit Intent Content -->
              <div style="text-align: center; margin-bottom: 32px;">
                <span style="font-size: 48px;">🎁</span>
              </div>
              <h1 style="font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 16px 0; color: #ffffff;">
                Your Free Guide is Ready!
              </h1>
              <p style="font-size: 16px; line-height: 1.7; color: #a1a1aa; text-align: center; margin: 0 0 32px 0;">
                Thanks for joining 1,200+ merchants who are building profitable online stores. Here's what you'll learn:
              </p>

              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid rgba(139, 92, 246, 0.2);">
                <div style="margin-bottom: 16px; display: flex; align-items: flex-start;">
                  <span style="color: #8b5cf6; margin-right: 12px; font-size: 18px;">✓</span>
                  <span style="color: #e4e4e7; font-size: 15px;">How to pick winning products that sell</span>
                </div>
                <div style="margin-bottom: 16px; display: flex; align-items: flex-start;">
                  <span style="color: #8b5cf6; margin-right: 12px; font-size: 18px;">✓</span>
                  <span style="color: #e4e4e7; font-size: 15px;">Setting up payments in under 10 minutes</span>
                </div>
                <div style="margin-bottom: 16px; display: flex; align-items: flex-start;">
                  <span style="color: #8b5cf6; margin-right: 12px; font-size: 18px;">✓</span>
                  <span style="color: #e4e4e7; font-size: 15px;">Launch checklist used by top stores</span>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #8b5cf6; margin-right: 12px; font-size: 18px;">✓</span>
                  <span style="color: #e4e4e7; font-size: 15px;">First 30 days marketing playbook</span>
                </div>
              </div>
            ` : `
              <!-- Store Setup Welcome Content -->
              <h1 style="font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 16px 0; color: #ffffff;">
                Welcome to DOMINION! 🚀
              </h1>
              ${storeName ? `<p style="font-size: 18px; text-align: center; color: #8b5cf6; margin: 0 0 24px 0; font-weight: 600;">${storeName}</p>` : ''}
              <p style="font-size: 16px; line-height: 1.7; color: #a1a1aa; text-align: center; margin: 0 0 32px 0;">
                You're one step closer to launching a professional online store in 30 minutes or less. Here's your roadmap:
              </p>

              <div style="background: #27272a; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <div style="display: flex; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #3f3f46;">
                  <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0;">
                    <span style="color: white; font-weight: 700;">1</span>
                  </div>
                  <div>
                    <div style="color: #ffffff; font-weight: 600; margin-bottom: 4px;">Complete Your Setup</div>
                    <div style="color: #71717a; font-size: 14px;">Add your products and customize your brand</div>
                  </div>
                </div>
                <div style="display: flex; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #3f3f46;">
                  <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0;">
                    <span style="color: white; font-weight: 700;">2</span>
                  </div>
                  <div>
                    <div style="color: #ffffff; font-weight: 600; margin-bottom: 4px;">AI Generates Everything</div>
                    <div style="color: #71717a; font-size: 14px;">Product descriptions, images, and content</div>
                  </div>
                </div>
                <div style="display: flex;">
                  <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0;">
                    <span style="color: white; font-weight: 700;">3</span>
                  </div>
                  <div>
                    <div style="color: #ffffff; font-weight: 600; margin-bottom: 4px;">Launch & Start Selling</div>
                    <div style="color: #71717a; font-size: 14px;">Go live with one click</div>
                  </div>
                </div>
              </div>
            `}

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://dominion.app/setup" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.4);">
                ${isExitIntent ? 'Start Building Your Store →' : 'Continue Setup →'}
              </a>
            </div>

            <p style="font-size: 13px; color: #52525b; text-align: center; margin: 0;">
              Questions? Just reply to this email – we read every message.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #27272a;">
            <p style="font-size: 12px; color: #52525b; margin: 0 0 8px 0;">
              © 2026 DOMINION. All rights reserved.
            </p>
            <p style="font-size: 11px; color: #3f3f46; margin: 0;">
              You're receiving this because you signed up at dominion.app
            </p>
          </div>
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
          subject: emailSubject,
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

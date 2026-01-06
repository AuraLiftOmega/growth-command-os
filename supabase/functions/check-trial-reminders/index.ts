import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Omega <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

const getTrialReminderHtml = (daysLeft: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 16px; margin-bottom: 20px;"></div>
      <h1 style="color: #ffffff; font-size: 28px; margin: 0;">${daysLeft === 1 ? 'Your Trial Ends Tomorrow!' : `Your Trial Ends in ${daysLeft} Days`}</h1>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(249, 115, 22, 0.1)); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hey there,
      </p>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Just a friendly reminder that your Omega free trial ends in <strong style="color: #fbbf24;">${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.
      </p>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0;">
        Upgrade now to keep access to all your AI-generated creatives, automations, and insights.
      </p>
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://omega-app.lovable.app/settings" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Upgrade Now
      </a>
    </div>

    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #27272a;">
      <p style="color: #52525b; font-size: 14px; margin: 0;">
        Questions about pricing? Reply to this email!
      </p>
      <p style="color: #3f3f46; font-size: 12px; margin: 16px 0 0 0;">
        2024 Omega. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("check-trial-reminders function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();

    // Get subscriptions that are trialing
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("user_id, trial_ends_at, plan")
      .eq("status", "trialing")
      .not("trial_ends_at", "is", null);

    if (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }

    console.log(`Found ${subscriptions?.length || 0} trial subscriptions`);

    const emailsSent = [];

    for (const sub of subscriptions || []) {
      if (!sub.trial_ends_at) continue;

      const trialEnds = new Date(sub.trial_ends_at);
      const daysLeft = Math.ceil((trialEnds.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      // Send reminders at 7 days, 3 days, and 1 day before trial ends
      if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
        // Get user email from profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", sub.user_id)
          .single();

        if (profile?.email) {
          console.log(`Sending ${daysLeft}-day reminder to ${profile.email}`);
          
          try {
            const subject = daysLeft === 1 
              ? "Your Omega trial ends tomorrow!" 
              : `Your Omega trial ends in ${daysLeft} days`;
            
            const emailResponse = await sendEmail(profile.email, subject, getTrialReminderHtml(daysLeft));
            
            emailsSent.push({ email: profile.email, daysLeft, response: emailResponse });
            console.log(`Email sent to ${profile.email}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${profile.email}:`, emailError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: emailsSent.length,
        details: emailsSent 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-trial-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

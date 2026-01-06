import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "welcome" | "trial_reminder" | "trial_ending" | "usage_alert";
  to: string;
  data?: Record<string, any>;
}

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

const getWelcomeEmailHtml = (brandName?: string) => `
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
      <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to Omega! 🚀</h1>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1)); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        ${brandName ? `Hey ${brandName} team,` : 'Hey there,'}
      </p>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        You are now part of 10,000+ brands using AI to scale their Shopify stores. Your 14-day free trial has started!
      </p>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0;">
        Here is what you can do right now:
      </p>
    </div>

    <div style="margin-bottom: 24px;">
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center;">
          <span style="color: #a855f7; font-size: 20px; margin-right: 12px;">🎬</span>
          <div>
            <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 4px 0;">Generate AI Videos</h3>
            <p style="color: #71717a; font-size: 14px; margin: 0;">Create scroll-stopping UGC ads in seconds</p>
          </div>
        </div>
      </div>
      
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center;">
          <span style="color: #ec4899; font-size: 20px; margin-right: 12px;">🏪</span>
          <div>
            <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 4px 0;">Connect Your Store</h3>
            <p style="color: #71717a; font-size: 14px; margin: 0;">Link your Shopify store to unlock product insights</p>
          </div>
        </div>
      </div>
      
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px;">
        <div style="display: flex; align-items: center;">
          <span style="color: #22c55e; font-size: 20px; margin-right: 12px;">🚀</span>
          <div>
            <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 4px 0;">Scale Mode</h3>
            <p style="color: #71717a; font-size: 14px; margin: 0;">Automate winning ads and kill losers automatically</p>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://omega-app.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Go to Dashboard
      </a>
    </div>

    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #27272a;">
      <p style="color: #52525b; font-size: 14px; margin: 0;">
        Questions? Reply to this email - we are here to help!
      </p>
      <p style="color: #3f3f46; font-size: 12px; margin: 16px 0 0 0;">
        2024 Omega. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

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
      <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Your Trial Ends in ${daysLeft} Days</h1>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(249, 115, 22, 0.1)); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hey there,
      </p>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Just a friendly reminder that your Omega free trial ends in <strong style="color: #fbbf24;">${daysLeft} days</strong>.
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

const getUsageAlertHtml = (resourceType: string, percentUsed: number) => `
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
      <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Usage Alert</h1>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(234, 179, 8, 0.1)); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        You have used <strong style="color: #f87171;">${percentUsed}%</strong> of your monthly ${resourceType}.
      </p>
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0;">
        Upgrade your plan to get more credits and keep scaling your store.
      </p>
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://omega-app.lovable.app/settings" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Upgrade Plan
      </a>
    </div>

    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #27272a;">
      <p style="color: #3f3f46; font-size: 12px; margin: 0;">
        2024 Omega. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("send-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();
    console.log(`Sending ${type} email to ${to}`);

    let subject = "";
    let html = "";

    switch (type) {
      case "welcome":
        subject = "Welcome to Omega! Your 14-day trial has started";
        html = getWelcomeEmailHtml(data?.brandName);
        break;
      case "trial_reminder":
        subject = `Your Omega trial ends in ${data?.daysLeft || 3} days`;
        html = getTrialReminderHtml(data?.daysLeft || 3);
        break;
      case "trial_ending":
        subject = "Your Omega trial ends tomorrow!";
        html = getTrialReminderHtml(1);
        break;
      case "usage_alert":
        subject = `You have used ${data?.percentUsed || 80}% of your ${data?.resourceType || "credits"}`;
        html = getUsageAlertHtml(data?.resourceType || "credits", data?.percentUsed || 80);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await sendEmail(to, subject, html);
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendDemoEmailRequest {
  to: string;
  recipientName?: string;
  demoId: string;
  sequenceId?: string;
  emailIndex?: number;
  customSubject?: string;
  customMessage?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: SendDemoEmailRequest = await req.json();

    if (!body.to || !body.demoId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, demoId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch demo video details
    const { data: demo, error: demoError } = await supabase
      .from('demo_videos')
      .select('*')
      .eq('id', body.demoId)
      .single();

    if (demoError || !demo) {
      return new Response(
        JSON.stringify({ error: "Demo not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile for branding
    const { data: profile } = await supabase
      .from('profiles')
      .select('brand_name, email')
      .eq('user_id', user.id)
      .single();

    const brandName = profile?.brand_name || 'DOMINION';
    const narrative = demo.narrative as Record<string, any>;
    
    // Generate demo viewing URL
    const demoUrl = `${supabaseUrl.replace('.supabase.co', '')}/demo/${body.demoId}`;
    const thumbnailUrl = demo.thumbnail_url || '';

    // Build email subject
    const subject = body.customSubject || getDefaultSubject(demo.variant, demo.industry, brandName);

    // Build email HTML
    const html = generateDemoEmailHtml({
      recipientName: body.recipientName,
      brandName,
      variant: demo.variant,
      industry: demo.industry,
      narrative,
      demoUrl,
      thumbnailUrl,
      customMessage: body.customMessage
    });

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${brandName} <onboarding@resend.dev>`,
        to: [body.to],
        subject,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const emailResult = await emailResponse.json();

    // Update sequence stats if part of a sequence
    if (body.sequenceId) {
      await supabase
        .from('email_sequences')
        .update({ 
          total_sent: supabase.rpc('increment', { row_id: body.sequenceId, field: 'total_sent' })
        })
        .eq('id', body.sequenceId);
    }

    // Log system event
    await supabase.from('system_events').insert({
      user_id: user.id,
      event_type: 'demo_email_sent',
      event_category: 'sales_automation',
      title: 'Demo email sent',
      description: `Sent ${demo.variant} demo to ${body.to}`,
      severity: 'info',
      metadata: {
        demo_id: body.demoId,
        recipient: body.to,
        sequence_id: body.sequenceId,
        email_id: emailResult.id
      }
    });

    console.log(`Demo email sent successfully to ${body.to}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResult.id,
        demo_id: body.demoId,
        recipient: body.to
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error sending demo email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getDefaultSubject(variant: string, industry: string, brandName: string): string {
  const subjects: Record<string, string> = {
    standard: `See How ${brandName} Transforms ${industry} Operations`,
    intimidation: `${brandName} - Revenue Infrastructure Demo`,
    enterprise: `${brandName} Enterprise Demo - Risk Reduction & Revenue Control`,
    silent: `${brandName} Platform Demo`
  };
  return subjects[variant] || subjects.standard;
}

function generateDemoEmailHtml(config: {
  recipientName?: string;
  brandName: string;
  variant: string;
  industry: string;
  narrative: Record<string, any>;
  demoUrl: string;
  thumbnailUrl: string;
  customMessage?: string;
}): string {
  const { recipientName, brandName, variant, industry, narrative, demoUrl, thumbnailUrl, customMessage } = config;

  const greeting = recipientName ? `${recipientName},` : '';
  
  const variantStyles: Record<string, { bg: string; accent: string; tone: string }> = {
    standard: { 
      bg: 'linear-gradient(135deg, #1a1a2e, #16213e)', 
      accent: '#a855f7',
      tone: 'professional'
    },
    intimidation: { 
      bg: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)', 
      accent: '#dc2626',
      tone: 'minimal'
    },
    enterprise: { 
      bg: 'linear-gradient(135deg, #0f172a, #1e293b)', 
      accent: '#3b82f6',
      tone: 'executive'
    },
    silent: { 
      bg: 'linear-gradient(135deg, #18181b, #27272a)', 
      accent: '#71717a',
      tone: 'visual'
    }
  };

  const style = variantStyles[variant] || variantStyles.standard;
  const problem = narrative?.problem || '';
  const revelation = narrative?.revelation || '';
  const outcome = narrative?.outcome || '';
  const close = narrative?.close || 'This is infrastructure, not software.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 48px; height: 48px; background: ${style.accent}; border-radius: 12px; margin-bottom: 16px;"></div>
      <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 600;">${brandName}</h1>
    </div>

    <!-- Greeting -->
    ${greeting ? `<p style="color: #e4e4e7; font-size: 18px; margin: 0 0 24px 0;">${greeting}</p>` : ''}

    <!-- Custom Message or Problem Statement -->
    <div style="background: ${style.bg}; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      ${customMessage ? `
        <p style="color: #e4e4e7; font-size: 16px; line-height: 1.7; margin: 0;">${customMessage}</p>
      ` : `
        ${problem ? `<p style="color: #a1a1aa; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">${problem}</p>` : ''}
        ${revelation ? `<p style="color: #e4e4e7; font-size: 16px; line-height: 1.7; margin: 0;">${revelation}</p>` : ''}
      `}
    </div>

    <!-- Demo Preview -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
      ${thumbnailUrl ? `
        <div style="position: relative;">
          <img src="${thumbnailUrl}" alt="Demo Preview" style="width: 100%; display: block;" />
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 64px; height: 64px; background: rgba(0,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <div style="width: 0; height: 0; border-left: 20px solid white; border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-left: 4px;"></div>
          </div>
        </div>
      ` : `
        <div style="height: 200px; background: linear-gradient(135deg, ${style.accent}22, ${style.accent}11); display: flex; align-items: center; justify-content: center;">
          <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <div style="width: 0; height: 0; border-left: 20px solid white; border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-left: 4px;"></div>
          </div>
        </div>
      `}
      <div style="padding: 20px;">
        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 8px 0;">${industry} Demo</h3>
        <p style="color: #71717a; font-size: 14px; margin: 0;">${variant === 'short' ? '60-90 second' : '3-5 minute'} walkthrough</p>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${demoUrl}" style="display: inline-block; background: ${style.accent}; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Watch Demo
      </a>
    </div>

    <!-- Outcome -->
    ${outcome ? `
      <div style="text-align: center; margin-bottom: 32px;">
        <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">${outcome}</p>
        <p style="color: ${style.accent}; font-size: 14px; font-weight: 500; margin: 0;">${close}</p>
      </div>
    ` : ''}

    <!-- Footer -->
    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #27272a;">
      <p style="color: #52525b; font-size: 12px; margin: 0;">
        ${brandName} • Revenue Infrastructure
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

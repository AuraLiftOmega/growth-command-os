import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { encode as hexEncode } from "https://deno.land/std@0.190.0/encoding/hex.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const CRM_WEBHOOK_SECRET = Deno.env.get("CRM_WEBHOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature",
};

interface CrmWebhookPayload {
  trigger_id?: string;
  event_type: 'deal_stage_changed' | 'deal_created' | 'contact_created' | 'meeting_booked' | 'custom';
  deal_id?: string;
  deal_size?: number;
  sales_stage?: string;
  industry?: string;
  contact_email?: string;
  contact_name?: string;
  company_name?: string;
  crm_source?: 'hubspot' | 'salesforce' | 'pipedrive' | 'zapier' | 'custom';
  custom_data?: Record<string, any>;
}

// Verify webhook signature using HMAC-SHA256
async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const expectedSignature = new TextDecoder().decode(hexEncode(new Uint8Array(signatureBytes)));
    
    // Constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) return false;
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    return result === 0;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify webhook secret is configured
  if (!CRM_WEBHOOK_SECRET) {
    console.error("CRM_WEBHOOK_SECRET not configured");
    return new Response(
      JSON.stringify({ error: "Webhook not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get the raw body for signature verification
  const rawBody = await req.text();
  
  // Verify signature from header
  const signature = req.headers.get("x-webhook-signature");
  if (!signature) {
    console.error("Missing X-Webhook-Signature header");
    return new Response(
      JSON.stringify({ error: "Missing signature" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const isValid = await verifyWebhookSignature(rawBody, signature, CRM_WEBHOOK_SECRET);
  if (!isValid) {
    console.error("Invalid webhook signature");
    return new Response(
      JSON.stringify({ error: "Invalid signature" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log("Webhook signature verified successfully");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const payload: CrmWebhookPayload = JSON.parse(rawBody);
    console.log("CRM webhook received:", JSON.stringify(payload));

    // Validate required fields
    if (!payload.event_type) {
      return new Response(
        JSON.stringify({ error: "Missing event_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find matching CRM triggers
    let query = supabase
      .from('crm_demo_triggers')
      .select('*, demo_videos(*)')
      .eq('status', 'active');

    // If specific trigger_id provided, use it
    if (payload.trigger_id) {
      query = query.eq('id', payload.trigger_id);
    } else {
      // Otherwise match by sales_stage
      if (payload.sales_stage) {
        query = query.eq('sales_stage', payload.sales_stage);
      }
    }

    const { data: triggers, error: triggersError } = await query;

    if (triggersError) {
      console.error("Error fetching triggers:", triggersError);
      throw triggersError;
    }

    if (!triggers || triggers.length === 0) {
      console.log("No matching triggers found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No matching triggers found",
          triggers_matched: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: any[] = [];

    for (const trigger of triggers) {
      // Check deal size constraints
      if (payload.deal_size !== undefined) {
        if (trigger.deal_size_min && payload.deal_size < trigger.deal_size_min) {
          console.log(`Deal size ${payload.deal_size} below minimum ${trigger.deal_size_min}`);
          continue;
        }
        if (trigger.deal_size_max && payload.deal_size > trigger.deal_size_max) {
          console.log(`Deal size ${payload.deal_size} above maximum ${trigger.deal_size_max}`);
          continue;
        }
      }

      // Check industry match
      if (trigger.industry_match && trigger.industry_match.length > 0 && payload.industry) {
        const matchedIndustry = trigger.industry_match.some(
          (ind: string) => ind.toLowerCase() === payload.industry?.toLowerCase()
        );
        if (!matchedIndustry) {
          console.log(`Industry ${payload.industry} not in allowed list`);
          continue;
        }
      }

      // Increment triggers_fired
      await supabase
        .from('crm_demo_triggers')
        .update({ 
          triggers_fired: (trigger.triggers_fired || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', trigger.id);

      // If auto_send is enabled and we have an email, send the demo
      if (trigger.auto_send && payload.contact_email) {
        // Apply delay if configured
        const delayMs = (trigger.send_delay_minutes || 0) * 60 * 1000;
        
        if (delayMs > 0) {
          console.log(`Scheduling demo send with ${trigger.send_delay_minutes}min delay`);
          // For now, we'll just note the delay - in production, use a job queue
        }

        const demo = trigger.demo_videos;
        if (demo) {
          // Fetch user profile for branding
          const { data: profile } = await supabase
            .from('profiles')
            .select('brand_name, email')
            .eq('user_id', trigger.user_id)
            .single();

          const brandName = profile?.brand_name || 'DOMINION';
          const demoUrl = `${supabaseUrl.replace('.supabase.co', '')}/embed/demo/${demo.id}`;

          // Send email via Resend
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: `${brandName} <onboarding@resend.dev>`,
              to: [payload.contact_email],
              subject: `${payload.contact_name || 'Hi'} - Your personalized ${demo.industry} demo is ready`,
              html: generateCrmDemoEmail({
                recipientName: payload.contact_name,
                companyName: payload.company_name,
                brandName,
                industry: demo.industry,
                variant: demo.variant,
                demoUrl,
                dealSize: payload.deal_size,
                salesStage: payload.sales_stage
              })
            }),
          });

          if (emailResponse.ok) {
            // Update demos_sent count
            await supabase
              .from('crm_demo_triggers')
              .update({ 
                demos_sent: (trigger.demos_sent || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', trigger.id);

            // Log system event
            await supabase.from('system_events').insert({
              user_id: trigger.user_id,
              event_type: 'crm_demo_sent',
              event_category: 'sales_automation',
              title: 'CRM-triggered demo sent',
              description: `Auto-sent ${demo.variant} demo to ${payload.contact_email}`,
              severity: 'info',
              metadata: {
                trigger_id: trigger.id,
                demo_id: demo.id,
                recipient: payload.contact_email,
                deal_size: payload.deal_size,
                sales_stage: payload.sales_stage,
                crm_source: payload.crm_source
              }
            });

            results.push({
              trigger_id: trigger.id,
              demo_id: demo.id,
              status: 'sent',
              recipient: payload.contact_email
            });
          } else {
            const errorText = await emailResponse.text();
            console.error("Email send failed:", errorText);
            results.push({
              trigger_id: trigger.id,
              demo_id: demo.id,
              status: 'failed',
              error: errorText
            });
          }
        }
      } else {
        // Just record the trigger without sending
        results.push({
          trigger_id: trigger.id,
          demo_id: trigger.demo_id,
          status: 'triggered',
          auto_send: false
        });
      }

      // Call external webhook if configured
      if (trigger.webhook_url) {
        try {
          await fetch(trigger.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: 'demo_triggered',
              trigger_id: trigger.id,
              demo_id: trigger.demo_id,
              payload,
              timestamp: new Date().toISOString()
            })
          });
        } catch (webhookError) {
          console.error("External webhook failed:", webhookError);
        }
      }
    }

    console.log(`Processed ${results.length} triggers`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        triggers_matched: triggers.length,
        triggers_processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("CRM webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateCrmDemoEmail(config: {
  recipientName?: string;
  companyName?: string;
  brandName: string;
  industry: string;
  variant: string;
  demoUrl: string;
  dealSize?: number;
  salesStage?: string;
}): string {
  const { recipientName, companyName, brandName, industry, variant, demoUrl, dealSize, salesStage } = config;

  const dealTier = dealSize ? (
    dealSize >= 100000 ? 'Enterprise' :
    dealSize >= 50000 ? 'Growth' :
    dealSize >= 10000 ? 'Professional' : 'Starter'
  ) : null;

  const variantAccent = variant === 'intimidation' ? '#dc2626' :
    variant === 'enterprise' ? '#3b82f6' : '#a855f7';

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
      <div style="display: inline-block; width: 48px; height: 48px; background: ${variantAccent}; border-radius: 12px; margin-bottom: 16px;"></div>
      <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 600;">${brandName}</h1>
    </div>

    <!-- Personalized Greeting -->
    <div style="margin-bottom: 24px;">
      <p style="color: #e4e4e7; font-size: 18px; margin: 0;">
        ${recipientName ? `${recipientName},` : 'Hi,'}
      </p>
    </div>

    <!-- Context -->
    <div style="background: linear-gradient(135deg, #18181b, #27272a); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <p style="color: #a1a1aa; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
        ${companyName ? `Based on ${companyName}'s current position` : 'Based on your current needs'}${salesStage ? ` in the ${salesStage} stage` : ''}, I've prepared a personalized demo that shows exactly how ${brandName} addresses ${industry} challenges.
      </p>
      ${dealTier ? `
      <div style="display: inline-block; background: ${variantAccent}22; padding: 8px 16px; border-radius: 8px;">
        <span style="color: ${variantAccent}; font-size: 14px; font-weight: 600;">${dealTier} Solution Demo</span>
      </div>
      ` : ''}
    </div>

    <!-- Demo Card -->
    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
      <div style="height: 180px; background: linear-gradient(135deg, ${variantAccent}22, ${variantAccent}11); display: flex; align-items: center; justify-content: center;">
        <div style="width: 72px; height: 72px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <div style="width: 0; height: 0; border-left: 24px solid white; border-top: 14px solid transparent; border-bottom: 14px solid transparent; margin-left: 6px;"></div>
        </div>
      </div>
      <div style="padding: 20px;">
        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 8px 0;">${industry} Revenue Infrastructure</h3>
        <p style="color: #71717a; font-size: 14px; margin: 0;">Personalized demo • ${variant === 'short' ? '60-90 seconds' : '3-5 minutes'}</p>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${demoUrl}" style="display: inline-block; background: ${variantAccent}; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Watch Your Demo
      </a>
    </div>

    <!-- Value Props -->
    <div style="margin-bottom: 32px;">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 8px; height: 8px; background: ${variantAccent}; border-radius: 50%; margin-right: 12px;"></div>
        <span style="color: #a1a1aa; font-size: 14px;">See actual revenue impact metrics</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 8px; height: 8px; background: ${variantAccent}; border-radius: 50%; margin-right: 12px;"></div>
        <span style="color: #a1a1aa; font-size: 14px;">Industry-specific implementation timeline</span>
      </div>
      <div style="display: flex; align-items: center;">
        <div style="width: 8px; height: 8px; background: ${variantAccent}; border-radius: 50%; margin-right: 12px;"></div>
        <span style="color: #a1a1aa; font-size: 14px;">Risk elimination framework</span>
      </div>
    </div>

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

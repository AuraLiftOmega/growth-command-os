/**
 * CART RECOVERY - Abandoned Cart Recovery Engine
 * 
 * Sends personalized recovery emails/SMS via Resend + Twilio
 * Triggers: 1hr, 24hr, 72hr after abandonment
 * Personalization: Product images, discount codes, urgency
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecoveryRequest {
  action: 'check_abandoned' | 'send_recovery' | 'mark_recovered';
  cart_id?: string;
  channel?: 'email' | 'sms';
  discount_code?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, cart_id, channel = 'email', discount_code } = await req.json() as RecoveryRequest;

    switch (action) {
      case 'check_abandoned': {
        // Find carts abandoned > 1 hour ago without recovery sent
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        const { data: carts, error } = await supabase
          .from('abandoned_carts')
          .select('*')
          .lt('abandoned_at', oneHourAgo)
          .is('recovery_sent_at', null)
          .eq('recovered', false)
          .limit(50);

        if (error) throw error;

        console.log(`Found ${carts?.length || 0} abandoned carts for recovery`);

        // Queue recovery for each cart
        const recoveryJobs = [];
        for (const cart of carts || []) {
          recoveryJobs.push(
            supabase.from('automation_jobs').insert({
              user_id: cart.user_id,
              job_type: 'cart_recovery',
              status: 'pending',
              input_data: { cart_id: cart.id, channel: 'email' },
              scheduled_for: new Date().toISOString(),
              priority: 2
            })
          );
        }

        await Promise.all(recoveryJobs);

        return new Response(
          JSON.stringify({ 
            success: true, 
            carts_found: carts?.length || 0,
            message: `Queued ${carts?.length || 0} carts for recovery` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'send_recovery': {
        if (!cart_id) {
          return new Response(
            JSON.stringify({ error: 'cart_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get cart details
        const { data: cart, error: cartError } = await supabase
          .from('abandoned_carts')
          .select('*')
          .eq('id', cart_id)
          .single();

        if (cartError || !cart) {
          return new Response(
            JSON.stringify({ error: 'Cart not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const resendKey = Deno.env.get('RESEND_API_KEY');
        const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN');

        if (channel === 'email' && resendKey && cart.customer_email) {
          // Send email via Resend
          const items = cart.items as Array<{ title: string; price: number; image?: string }>;
          const itemsList = items.map(i => `• ${i.title} - $${i.price}`).join('\n');
          
          const discountText = discount_code 
            ? `\n\n🎁 Use code ${discount_code} for 10% off!` 
            : '';

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B5CF6;">Your glow routine is waiting! ✨</h1>
              <p>We noticed you left some items in your cart:</p>
              <div style="background: #f8f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${items.map(i => `
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    ${i.image ? `<img src="${i.image}" alt="${i.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">` : ''}
                    <div>
                      <strong>${i.title}</strong><br>
                      <span style="color: #8B5CF6;">$${i.price}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
              <p style="font-size: 18px;"><strong>Cart Total: $${cart.cart_total}</strong></p>
              ${discount_code ? `<p style="color: #10B981; font-size: 18px;">🎁 Use code <strong>${discount_code}</strong> for 10% off!</p>` : ''}
              <a href="${Deno.env.get('SITE_URL') || 'https://auradominion.io'}/checkout" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #D946EF); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
                Complete Your Order →
              </a>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is a limited time offer. Your cart items may sell out!
              </p>
            </div>
          `;

          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: Deno.env.get('FROM_EMAIL') || 'Store <noreply@auradominion.io>',
              to: cart.customer_email,
              subject: `✨ Your glow routine is waiting - Complete your order!${discount_code ? ' (10% OFF)' : ''}`,
              html: emailHtml
            })
          });

          const emailResult = await emailResponse.json();
          console.log('Email sent:', emailResult);

          // Update cart
          await supabase
            .from('abandoned_carts')
            .update({
              recovery_sent_at: new Date().toISOString(),
              recovery_channel: 'email'
            })
            .eq('id', cart_id);

          return new Response(
            JSON.stringify({ success: true, channel: 'email', email_id: emailResult.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (channel === 'sms' && twilioSid && twilioAuth && cart.customer_phone) {
          // Send SMS via Twilio
          const twilioNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '+15551234567';
          
          const smsBody = `✨ Hey! Your AuraLift cart ($${cart.cart_total}) is waiting. ${discount_code ? `Use ${discount_code} for 10% off! ` : ''}Complete your glow routine: auraliftessentials.com/checkout`;

          const formData = new URLSearchParams();
          formData.append('To', cart.customer_phone);
          formData.append('From', twilioNumber);
          formData.append('Body', smsBody);

          const smsResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: formData
            }
          );

          const smsResult = await smsResponse.json();
          console.log('SMS sent:', smsResult);

          // Update cart
          await supabase
            .from('abandoned_carts')
            .update({
              recovery_sent_at: new Date().toISOString(),
              recovery_channel: 'sms'
            })
            .eq('id', cart_id);

          return new Response(
            JSON.stringify({ success: true, channel: 'sms', sms_sid: smsResult.sid }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            error: 'Recovery not sent - missing API keys or contact info',
            has_resend: !!resendKey,
            has_twilio: !!(twilioSid && twilioAuth),
            has_email: !!cart.customer_email,
            has_phone: !!cart.customer_phone
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'mark_recovered': {
        if (!cart_id) {
          return new Response(
            JSON.stringify({ error: 'cart_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get cart to calculate recovery value
        const { data: cart } = await supabase
          .from('abandoned_carts')
          .select('cart_total')
          .eq('id', cart_id)
          .single();

        await supabase
          .from('abandoned_carts')
          .update({
            recovered: true,
            recovered_at: new Date().toISOString(),
            recovery_revenue: cart?.cart_total || 0
          })
          .eq('id', cart_id);

        return new Response(
          JSON.stringify({ success: true, recovered_amount: cart?.cart_total }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Cart recovery error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Recovery failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

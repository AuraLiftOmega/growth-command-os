import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

interface EmailRequest {
  action: 'order_confirmation' | 'abandoned_cart' | 'welcome' | 'post_purchase' | 'custom';
  to: string;
  data: Record<string, any>;
}

function generateOrderConfirmationHtml(data: any): string {
  const items = data.items || [];
  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">$${item.price}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:linear-gradient(135deg,#8B6F4E,#6B4F2E);padding:40px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:300;letter-spacing:2px;">AURA LIFT</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">E S S E N T I A L S</p>
      </div>
      <div style="padding:40px;">
        <h2 style="color:#333;font-size:22px;font-weight:400;">Thank you for your order! ✨</h2>
        <p style="color:#666;line-height:1.6;">Hi ${data.customerName || 'there'}, your order #${data.orderId || ''} has been confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <thead><tr style="background:#F9F5F0;">
            <th style="padding:12px;text-align:left;color:#8B6F4E;">Item</th>
            <th style="padding:12px;text-align:center;color:#8B6F4E;">Qty</th>
            <th style="padding:12px;text-align:right;color:#8B6F4E;">Price</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot><tr>
            <td colspan="2" style="padding:12px;font-weight:bold;color:#333;">Total</td>
            <td style="padding:12px;text-align:right;font-weight:bold;color:#8B6F4E;">$${data.total || '0.00'}</td>
          </tr></tfoot>
        </table>
        <p style="color:#666;line-height:1.6;">We're preparing your order with love. You'll receive tracking info soon.</p>
        <a href="https://growth-command-os.lovable.app/store" style="display:inline-block;background:#8B6F4E;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;margin:16px 0;font-weight:500;">Continue Shopping</a>
      </div>
      <div style="background:#F9F5F0;padding:24px;text-align:center;">
        <p style="color:#8B6F4E;margin:0;font-size:13px;">Questions? Email us at ryan@auraliftessentials.com</p>
      </div>
    </div>
  `;
}

function generateAbandonedCartHtml(data: any): string {
  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:linear-gradient(135deg,#8B6F4E,#6B4F2E);padding:40px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:300;letter-spacing:2px;">AURA LIFT</h1>
      </div>
      <div style="padding:40px;">
        <h2 style="color:#333;font-size:22px;">You left something beautiful behind ✨</h2>
        <p style="color:#666;line-height:1.6;">Hi ${data.customerName || 'there'}, we noticed you didn't finish checking out. Your items are still waiting for you!</p>
        <div style="background:#F9F5F0;padding:20px;border-radius:12px;margin:24px 0;">
          <p style="color:#8B6F4E;font-weight:600;margin:0 0 8px;">Your cart (${data.itemCount || 1} item${(data.itemCount || 1) > 1 ? 's' : ''}):</p>
          <p style="color:#333;font-size:24px;font-weight:bold;margin:0;">$${data.cartTotal || '0.00'}</p>
        </div>
        <a href="https://growth-command-os.lovable.app/store" style="display:inline-block;background:#8B6F4E;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:500;">Complete Your Order</a>
        <p style="color:#999;font-size:13px;margin-top:24px;">Use code <strong>COMEBACK10</strong> for 10% off your order!</p>
      </div>
    </div>
  `;
}

function generateWelcomeHtml(data: any): string {
  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:linear-gradient(135deg,#8B6F4E,#6B4F2E);padding:50px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:32px;font-weight:300;letter-spacing:2px;">Welcome to</h1>
        <h1 style="color:#fff;margin:8px 0 0;font-size:36px;font-weight:600;">AURA LIFT ✨</h1>
      </div>
      <div style="padding:40px;">
        <h2 style="color:#333;font-size:22px;">Your glow-up starts now 💎</h2>
        <p style="color:#666;line-height:1.8;">Thanks for joining the Aura Lift family, ${data.name || 'gorgeous'}! Here's what you can expect:</p>
        <ul style="color:#666;line-height:2;">
          <li>🌿 Early access to new products</li>
          <li>💰 Exclusive member-only discounts</li>
          <li>📚 Expert skincare tips & routines</li>
          <li>🎁 Special birthday surprises</li>
        </ul>
        <a href="https://growth-command-os.lovable.app/store" style="display:inline-block;background:#8B6F4E;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;margin:16px 0;font-weight:500;">Start Shopping</a>
        <p style="color:#999;font-size:13px;margin-top:24px;">Use code <strong>WELCOME15</strong> for 15% off your first order!</p>
      </div>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, to, data } = await req.json() as EmailRequest;

    if (!to || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields: action, to' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || Deno.env.get('RESEND_API_KEY_1');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

    let subject = '';
    let html = '';

    switch (action) {
      case 'order_confirmation':
        subject = `Order Confirmed! #${data.orderId || ''} ✨`;
        html = generateOrderConfirmationHtml(data);
        break;
      case 'abandoned_cart':
        subject = "You left something behind... 💎";
        html = generateAbandonedCartHtml(data);
        break;
      case 'welcome':
        subject = "Welcome to Aura Lift Essentials ✨";
        html = generateWelcomeHtml(data);
        break;
      case 'post_purchase':
        subject = `How are you loving your ${data.productName || 'new products'}? 🌿`;
        html = `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px;">
          <h2>We'd love to hear from you!</h2>
          <p>Hi ${data.customerName || 'there'}, it's been a few days since your order arrived. How are you loving your new products?</p>
          <a href="https://growth-command-os.lovable.app/store" style="display:inline-block;background:#8B6F4E;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;">Shop More</a>
        </div>`;
        break;
      default:
        subject = data.subject || 'From Aura Lift Essentials';
        html = data.html || '<p>Hello from Aura Lift!</p>';
    }

    const emailResp = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Aura Lift Essentials <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    const result = await emailResp.json();

    return new Response(JSON.stringify({ success: emailResp.ok, ...result }), {
      status: emailResp.ok ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email automation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

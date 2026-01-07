/**
 * SHOPIFY WEBHOOK - Orders Paid
 * 
 * Receives Shopify order webhooks and creates revenue events.
 * Attributes revenue to products and creatives.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain',
};

interface ShopifyLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  email: string;
  total_price: string;
  currency: string;
  financial_status: string;
  line_items: ShopifyLineItem[];
  created_at: string;
  landing_site?: string;
  referring_site?: string;
  source_name?: string;
  note_attributes?: { name: string; value: string }[];
  tags?: string;
  customer?: {
    id: number;
    email: string;
  };
}

// Verify Shopify webhook signature
function verifyWebhookSignature(
  rawBody: string,
  hmacHeader: string,
  secret: string
): boolean {
  if (!secret || !hmacHeader) return false;
  
  const hash = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');
  
  return hash === hmacHeader;
}

// Extract attribution data from order
function extractAttribution(order: ShopifyOrder): {
  platform: string | null;
  creative_id: string | null;
  source: string | null;
} {
  let platform: string | null = null;
  let creative_id: string | null = null;
  let source: string | null = order.source_name || null;

  // Check landing site for UTM params
  if (order.landing_site) {
    try {
      const url = new URL(`https://example.com${order.landing_site}`);
      const utmSource = url.searchParams.get('utm_source');
      const utmContent = url.searchParams.get('utm_content');
      
      if (utmSource) {
        platform = utmSource.toLowerCase();
        if (platform.includes('tiktok')) platform = 'tiktok';
        if (platform.includes('instagram')) platform = 'instagram';
        if (platform.includes('facebook') || platform.includes('fb')) platform = 'facebook';
        if (platform.includes('youtube')) platform = 'youtube';
        if (platform.includes('pinterest')) platform = 'pinterest';
      }
      
      if (utmContent) {
        // UTM content often contains creative/ad ID
        creative_id = utmContent;
      }
    } catch (e) {
      console.log('Failed to parse landing site URL');
    }
  }

  // Check note attributes for tracking
  if (order.note_attributes) {
    for (const attr of order.note_attributes) {
      if (attr.name === 'creative_id') creative_id = attr.value;
      if (attr.name === 'platform') platform = attr.value;
    }
  }

  // Check tags for platform attribution
  if (order.tags) {
    const tags = order.tags.toLowerCase();
    if (tags.includes('tiktok')) platform = 'tiktok';
    if (tags.includes('instagram')) platform = 'instagram';
    if (tags.includes('facebook')) platform = 'facebook';
    if (tags.includes('youtube')) platform = 'youtube';
    if (tags.includes('pinterest')) platform = 'pinterest';
  }

  return { platform, creative_id, source };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256') || '';
    const topic = req.headers.get('x-shopify-topic') || '';
    const shopDomain = req.headers.get('x-shopify-shop-domain') || '';

    console.log('Received Shopify webhook:', { topic, shopDomain });

    // Verify webhook signature
    const webhookSecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
    if (webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, hmacHeader, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const order: ShopifyOrder = JSON.parse(rawBody);
    console.log('Processing order:', { id: order.id, total: order.total_price, items: order.line_items.length });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find user by shop domain (from platform_connections)
    const { data: connection } = await supabase
      .from('platform_connections')
      .select('user_id')
      .eq('platform', 'shopify')
      .eq('store_url', shopDomain)
      .single();

    // If no connection found, try to find by any Shopify connection
    let userId: string | null = connection?.user_id || null;
    
    if (!userId) {
      // Fallback: get first user with Shopify products
      const { data: anyProduct } = await supabase
        .from('shopify_products')
        .select('user_id')
        .limit(1)
        .single();
      userId = anyProduct?.user_id || null;
    }

    if (!userId) {
      console.error('No user found for shop:', shopDomain);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract attribution
    const attribution = extractAttribution(order);
    const eventsCreated: string[] = [];

    // Create revenue events for each line item
    for (const item of order.line_items) {
      const productShopifyId = `gid://shopify/Product/${item.product_id}`;
      
      // Find the product in our database
      const { data: product } = await supabase
        .from('shopify_products')
        .select('id')
        .eq('shopify_id', productShopifyId)
        .eq('user_id', userId)
        .single();

      const itemRevenue = parseFloat(item.price) * item.quantity;

      // Create revenue event
      const { data: event, error: eventError } = await supabase
        .from('revenue_events')
        .insert({
          user_id: userId,
          product_id: product?.id || null,
          creative_id: attribution.creative_id,
          event_type: 'purchase',
          amount: itemRevenue,
          platform: attribution.platform || 'shopify',
          source: attribution.source,
          metadata: {
            order_id: order.id,
            order_number: order.order_number,
            shopify_product_id: item.product_id,
            shopify_variant_id: item.variant_id,
            product_title: item.title,
            quantity: item.quantity,
            unit_price: item.price,
            currency: order.currency,
            customer_email: order.email,
          },
        })
        .select('id')
        .single();

      if (eventError) {
        console.error('Failed to create revenue event:', eventError);
      } else {
        eventsCreated.push(event.id);
        console.log('Created revenue event:', event.id);
      }

      // Update product automation metrics
      if (product?.id) {
        const { data: automation } = await supabase
          .from('product_automations')
          .select('id, conversions, revenue')
          .eq('product_id', product.id)
          .eq('user_id', userId)
          .single();

        if (automation) {
          await supabase
            .from('product_automations')
            .update({
              conversions: (automation.conversions || 0) + item.quantity,
              revenue: parseFloat(String(automation.revenue || 0)) + itemRevenue,
              last_action: 'Purchase recorded',
              last_action_at: new Date().toISOString(),
            })
            .eq('id', automation.id);
        }
      }

      // Update creative metrics if attributed
      if (attribution.creative_id) {
        const { data: creative } = await supabase
          .from('creatives')
          .select('id')
          .eq('id', attribution.creative_id)
          .single();

        if (creative) {
          await supabase
            .from('creative_metrics')
            .insert({
              user_id: userId,
              creative_id: creative.id,
              platform: attribution.platform || 'unknown',
              conversions: item.quantity,
              revenue: itemRevenue,
              observed_at: new Date().toISOString(),
            });
        }
      }
    }

    console.log('Webhook processed successfully:', { eventsCreated: eventsCreated.length });

    return new Response(
      JSON.stringify({
        success: true,
        events_created: eventsCreated.length,
        order_id: order.id,
        total_revenue: parseFloat(order.total_price),
        attribution,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

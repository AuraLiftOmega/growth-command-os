import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SHOPIFY_API_VERSION = '2025-07';

interface ContentRequest {
  action: 'generate_daily' | 'generate_single' | 'get_queue';
  platform?: 'tiktok' | 'instagram' | 'youtube' | 'all';
  productHandle?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, platform = 'all', productHandle } = await req.json() as ContentRequest;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const SHOPIFY_STOREFRONT_TOKEN = Deno.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
    const SHOPIFY_DOMAIN = 'lovable-project-7fb70.myshopify.com';

    // Fetch products from Shopify for content inspiration
    let products: any[] = [];
    if (SHOPIFY_STOREFRONT_TOKEN) {
      try {
        const shopifyResp = await fetch(
          `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
            },
            body: JSON.stringify({
              query: `{
                products(first: 20) {
                  edges {
                    node {
                      title
                      description
                      handle
                      productType
                      priceRange { minVariantPrice { amount currencyCode } }
                      images(first: 1) { edges { node { url } } }
                    }
                  }
                }
              }`,
            }),
          }
        );
        const shopData = await shopifyResp.json();
        products = shopData?.data?.products?.edges?.map((e: any) => e.node) || [];
      } catch (e) {
        console.error('Failed to fetch Shopify products:', e);
      }
    }

    if (action === 'generate_daily' || action === 'generate_single') {
      const platforms = platform === 'all' ? ['tiktok', 'instagram', 'youtube'] : [platform];
      const contentPieces: any[] = [];

      for (const plat of platforms) {
        const productList = products.map((p: any) => 
          `- ${p.title} ($${p.priceRange?.minVariantPrice?.amount}) — ${p.description?.slice(0, 80)}`
        ).join('\n');

        const prompt = `Generate 3 viral ${plat === 'tiktok' ? 'TikTok' : plat === 'instagram' ? 'Instagram Reel' : 'YouTube Short'} content ideas for Aura Lift Essentials, a premium beauty & skincare brand.

PRODUCTS:
${productList}

For each idea, provide:
1. HOOK (first 3 seconds — must stop the scroll)
2. SCRIPT (15-30 second script, conversational and viral)
3. CAPTION (with relevant hashtags)
4. CTA (drive to website or purchase)

Format as JSON array: [{"hook": "", "script": "", "caption": "", "cta": "", "product": "product name", "style": "trend/educational/testimonial"}]

Make it feel authentic, not salesy. Use current social media trends. Every piece must drive traffic to auraliftessentials.com`;

        const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'You are a viral social media content strategist for a premium beauty brand. Return ONLY valid JSON arrays.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 2000,
          }),
        });

        if (!aiResp.ok) {
          console.error(`AI error for ${plat}:`, aiResp.status);
          continue;
        }

        const aiData = await aiResp.json();
        const rawContent = aiData.choices?.[0]?.message?.content || '[]';
        
        try {
          const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const ideas = JSON.parse(cleaned);
          contentPieces.push({
            platform: plat,
            ideas,
            generatedAt: new Date().toISOString(),
          });
        } catch {
          console.error(`Failed to parse AI content for ${plat}`);
          contentPieces.push({
            platform: plat,
            ideas: [],
            error: 'Failed to parse generated content',
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        content: contentPieces,
        totalIdeas: contentPieces.reduce((sum, p) => sum + (p.ideas?.length || 0), 0),
        productsUsed: products.length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Content engine error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

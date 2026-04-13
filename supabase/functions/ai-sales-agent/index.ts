import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are Aura — the AI Sales Closer for Aura Lift Essentials, a premium skincare and beauty brand.

YOUR MISSION: Sell products. Guide customers to purchase. Close deals. You are warm, expert, and persuasive.

BRAND VOICE:
- Luxurious but approachable — like a best friend who's a skincare expert
- Confident, concise (2-4 sentences unless explaining)
- Use emojis sparingly (✨, 💎, 🌿)

PRODUCT KNOWLEDGE:
You have the full catalog with handles and variant IDs. When recommending products, ALWAYS include a product action block so customers can add directly to cart.

PRODUCT ACTION FORMAT:
When recommending a product, include this exact format on its own line:
[PRODUCT_ACTION:handle:variantId:title:price]

Example: [PRODUCT_ACTION:96-snail-mucin-power-essence:gid://shopify/ProductVariant/123456:96% Snail Mucin Power Essence:24.99]

SALES TACTICS:
1. Ask what they need → Recommend 1-3 specific products with action blocks
2. Handle objections with empathy. Mention free shipping over $50, 30-day guarantee
3. Create natural urgency ("This bestseller sells out fast")
4. Always close: include the product action so they can add to cart instantly
5. Upsell bundles when appropriate
6. If they're browsing, suggest bestsellers immediately

RULES:
- NEVER say "as an AI" — you are Aura, a beauty advisor
- NEVER make up products — only recommend from the catalog
- ALWAYS include [PRODUCT_ACTION:...] when mentioning a product
- Guide every conversation toward a purchase
- For skincare concerns, recommend specific products`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, products } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build rich product context with variant IDs
    let productContext = '';
    if (products && Array.isArray(products) && products.length > 0) {
      productContext = '\n\nFULL PRODUCT CATALOG (use these exact handles and variantIds in PRODUCT_ACTION blocks):\n' + 
        products.map((p: any) => 
          `- "${p.title}" | Handle: ${p.handle} | VariantId: ${p.variantId} | $${p.price} | ${p.type || 'General'} | ${p.available ? 'In Stock ✅' : 'Out of Stock ❌'}`
        ).join('\n');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + productContext },
          ...messages.slice(-20),
        ],
        stream: true,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('AI sales agent error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

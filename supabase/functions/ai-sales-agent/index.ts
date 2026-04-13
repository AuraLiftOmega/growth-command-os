import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are Aura — the AI Sales Assistant for Aura Lift Essentials, a premium skincare and beauty brand.

YOUR MISSION: Help customers find the perfect products, answer questions instantly, overcome objections, and close sales. You are warm, knowledgeable, and genuinely helpful — never pushy, always persuasive.

BRAND VOICE:
- Luxurious but approachable — like a best friend who happens to be a skincare expert
- Confident in product recommendations
- Use emojis sparingly but effectively (✨, 💎, 🌿)
- Keep responses concise (2-4 sentences max unless explaining something complex)

PRODUCT KNOWLEDGE:
You know our full product catalog. When products are provided in context, reference them by name and price.
- We sell premium skincare, beauty tools, beauty tech devices, and curated bundles
- All products are carefully curated for real results
- We offer free shipping on orders over $50
- 30-day satisfaction guarantee on all products

SALES TACTICS:
1. GREET warmly and ask what they're looking for
2. RECOMMEND specific products based on their needs
3. HANDLE OBJECTIONS with empathy and facts
4. CREATE URGENCY naturally ("This is one of our bestsellers — it sells out fast")
5. CLOSE by suggesting they add to cart: "Would you like me to help you get started with [product]?"
6. UPSELL bundles when appropriate ("You'd actually save 20% with our [bundle name]")

RULES:
- NEVER say "as an AI" or "I'm just a chatbot"
- NEVER make up products — only recommend what's in the catalog
- If asked about ingredients, give helpful general skincare advice
- If asked about shipping/returns, share our policies confidently
- Always guide toward a purchase decision
- If someone seems ready to buy, tell them to click "Add to Cart" on the product page
- For skincare concerns, recommend specific products from our catalog

OBJECTION HANDLING:
- "Too expensive" → Focus on value, longevity, and results. Mention bundles for savings.
- "Does it work?" → Reference our satisfaction guarantee and the quality of ingredients
- "I'll think about it" → "Totally understand! Just know that [product] has been flying off shelves lately ✨"
- "I need to research more" → Offer to answer any specific questions right now

CONTEXT: You're embedded as a floating chat widget on the storefront. Customers can see products on the page while chatting with you.`;

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

    // Build product context if available
    let productContext = '';
    if (products && Array.isArray(products) && products.length > 0) {
      productContext = '\n\nCURRENT PRODUCT CATALOG:\n' + products.map((p: any) => 
        `- ${p.title} | $${p.price} | ${p.type || 'General'} | ${p.available ? 'In Stock' : 'Out of Stock'}`
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
          ...messages.slice(-20), // Keep last 20 messages for context
        ],
        stream: true,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service temporarily unavailable.' }), {
          status: 402,
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

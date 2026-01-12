import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Aura Luxe product catalog for idea generation
const AURA_LUXE_PRODUCTS = [
  {
    id: 'mad-hippie-serum',
    name: 'Mad Hippie Advanced Skin Care Serum',
    hooks: ['Glass skin secret', 'Vitamin C glow bomb', 'Anti-aging miracle'],
    benefits: ['Brightens dull skin', 'Reduces dark spots', 'Fights free radicals'],
    price_range: '$30-40',
    viral_angles: ['Clean beauty must-have', 'Cruelty-free glow', 'Before/after transformation']
  },
  {
    id: 'ordinary-age-set',
    name: 'The Ordinary The Age Support Set',
    hooks: ['Botox in a bottle', 'Anti-aging bundle', 'Wrinkle eraser set'],
    benefits: ['Reduces fine lines', 'Boosts collagen', 'Full routine in one'],
    price_range: '$50-70',
    viral_angles: ['Affordable luxury', 'Derm-recommended', 'Age-reversing routine']
  },
  {
    id: 'glow-recipe-watermelon',
    name: 'Glow Recipe Watermelon Glow Dewy Skin Routine Gift Set',
    hooks: ['Watermelon glow secret', 'Dewy skin in days', 'K-beauty viral fave'],
    benefits: ['Intense hydration', 'Dewy glow', 'Plumps skin'],
    price_range: '$60-80',
    viral_angles: ['TikTok famous', 'K-beauty trend', 'Juicy skin aesthetic']
  },
  {
    id: 'ordinary-daily-set',
    name: 'The Ordinary The Daily Set',
    hooks: ['Everyday glow routine', 'Skincare basics done right', 'Simple but powerful'],
    benefits: ['Daily hydration', 'Basic skincare covered', 'Affordable essentials'],
    price_range: '$30-50',
    viral_angles: ['Minimalist skincare', 'Budget-friendly routine', 'Beginner-friendly']
  },
  {
    id: 'beauty-joseon-rice',
    name: 'Beauty of Joseon Glow Replenishing Rice Milk Toner',
    hooks: ['Korean glass skin secret', 'Rice water miracle', 'Toner that transforms'],
    benefits: ['Brightens complexion', 'Preps skin perfectly', 'Hydrates instantly'],
    price_range: '$15-25',
    viral_angles: ['K-beauty viral', 'Ancient Korean secret', 'Affordable luxury']
  },
  {
    id: 'peptide-serum',
    name: 'Peptide Anti-Aging Serum',
    hooks: ['Botox alternative', 'Peptide powerhouse', 'Wrinkle warrior'],
    benefits: ['Boosts collagen', 'Firms skin', 'Reduces wrinkles'],
    price_range: '$25-45',
    viral_angles: ['Science-backed', 'Injectable alternative', 'Clinical strength']
  },
  {
    id: 'retinol-cream',
    name: 'Gentle Retinol Night Cream',
    hooks: ['Retinol without the drama', 'Overnight transformation', 'Wake up younger'],
    benefits: ['Cell turnover', 'Smoother texture', 'Fade dark spots'],
    price_range: '$30-50',
    viral_angles: ['Beginner-friendly retinol', 'No purge formula', '7-day glow-up']
  }
];

// Viral hooks library
const VIRAL_HOOKS = [
  "I was skeptical but...",
  "Dull skin → Glass skin in 7 days",
  "POV: You found the skincare holy grail",
  "Why didn't anyone tell me about this sooner?",
  "The product my dermatologist begged me to try",
  "Tired of looking tired?",
  "My skin at 30 vs my skin at 40 👀",
  "The routine that changed everything",
  "Before you buy expensive skincare, try THIS",
  "This $30 product replaced my $300 routine",
  "My 7-day transformation 🔥",
  "The secret K-beauty brands don't want you to know",
  "Testing viral TikTok skincare so you don't have to",
  "Glass skin is NOT genetics — here's proof",
  "I tried it for 30 days and...",
  "The glow-up is REAL",
  "Botox who? I have THIS instead",
  "My skincare routine costs less than dinner",
  "Why your skincare isn't working (and what will)",
  "The sandwich method actually works"
];

// Visual styles library
const VISUAL_STYLES = [
  'before_after_split',
  'mirror_selfie_glow',
  'asmr_application',
  'product_close_up',
  'routine_speedrun',
  'transformation_timeline',
  'unboxing_reveal',
  'texture_closeup',
  'morning_routine',
  'night_routine',
  'ugc_style',
  'avatar_presentation'
];

// CTAs library
const CTAS = [
  "Shop now before it's gone! 🔥",
  "Limited stock — grab yours NOW!",
  "Link in bio — your glow awaits!",
  "Tap to transform your skin ✨",
  "Stock is flying — don't miss out!",
  "Get 20% off your first order!",
  "Free shipping ends tonight!",
  "Your glass skin journey starts NOW!",
  "Claim your glow-up bundle today!",
  "This is your sign to glow up!"
];

// Trending elements
const TRENDING_ELEMENTS = [
  'asmr_sounds',
  'trending_audio',
  'text_overlays',
  'split_screen',
  'speed_ramp',
  'mirror_selfie',
  'close_up_texture',
  'before_after_wipe',
  'countdown_timer',
  'product_zoom'
];

// Emotional triggers
const EMOTIONAL_TRIGGERS = [
  'fomo',
  'transformation',
  'self_improvement',
  'confidence_boost',
  'luxury_affordable',
  'secret_reveal',
  'validation',
  'aspiration',
  'curiosity',
  'urgency'
];

const HASHTAGS = [
  '#SkincareRoutine', '#GlassSkin', '#GlowUp', '#ViralSkincare',
  '#PeptideSerum', '#RetinolGlow', '#TikTokBeauty', '#KBeauty',
  '#CleanBeauty', '#AntiAging', '#DewySkin', '#SkincareAddict',
  '#SkincareTips', '#GlowRecipe', '#TheOrdinary', '#BeautyOfJoseon',
  '#SkincareHacks', '#MorningRoutine', '#NightRoutine', '#SkinTransformation'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { count = 20, mode = 'generate', auto_loop = false } = await req.json();
    
    console.log(`[generate-video-ideas] Generating ${count} viral video ideas...`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the mega prompt for viral video idea generation
    const systemPrompt = `You are the AURAOMEGA VIRAL VIDEO BRAIN — the most advanced AI content strategist for skincare e-commerce. Your mission: Generate unlimited high-converting 15-second video ad ideas that PRINT MONEY on TikTok, Instagram Reels, YouTube Shorts, and Facebook.

TARGET AUDIENCE:
- Age: 18-45 women
- Location: US, Canada
- Interests: Skincare routine, anti-aging, clean beauty, K-beauty, TikTok viral products
- Pain points: Dull skin, fine lines, uneven texture, dark spots, looking tired

VIRAL FORMULA FOR EACH IDEA:
1. HOOK (0-3s): Pain point + viral question that stops the scroll
2. VISUALS: Avatar (Monica energetic / Kristin professional), product shots, before/after
3. BODY (3-10s): Benefits, quick demo, transformation timeline
4. CTA (10-15s): Urgent call-to-action with scarcity

TRENDING ELEMENTS TO INCLUDE:
- ASMR application sounds
- Mirror selfies showing glow
- Split-screen before/after
- Text overlays ("Dull → Glass skin")
- Urgent CTAs ("Stock flying!")
- Transformation timelines (7 days, 2 weeks)

PRODUCTS TO FEATURE:
${AURA_LUXE_PRODUCTS.map(p => `- ${p.name}: ${p.hooks.join(', ')}`).join('\n')}

VIRAL HOOKS LIBRARY:
${VIRAL_HOOKS.slice(0, 10).join('\n')}

Generate exactly ${count} unique, high-virality video ad ideas. Each must be different and target different pain points/angles.

OUTPUT FORMAT (JSON array):
[
  {
    "idea_number": 1,
    "title": "Catchy idea title",
    "hook": "3-second hook text",
    "visuals": "Detailed visual description",
    "visual_style": "before_after_split | mirror_selfie_glow | asmr_application | etc",
    "product_focus": "Product name",
    "product_id": "product-id",
    "body_script": "3-10 second body script",
    "cta": "Urgent CTA text",
    "hashtags": ["#Hashtag1", "#Hashtag2"],
    "trending_elements": ["element1", "element2"],
    "emotional_trigger": "fomo | transformation | aspiration | etc",
    "virality_score": 1-10,
    "virality_reason": "Why this will go viral",
    "full_script": "Complete 15-second script for avatar to read"
  }
]

BE CREATIVE. BE VIRAL. PRINT MONEY. 🔥`;

    const userPrompt = `Generate ${count} unique viral video ad ideas for Aura Luxe skincare RIGHT NOW. 

Focus on:
1. Glass skin / dewy glow transformations
2. Before/after reveals (7-day, 2-week challenges)
3. "Botox in a bottle" hooks for Peptide Serum
4. "Retinol sandwich" method with Hyaluronic + Retinol
5. K-beauty viral dupes for Glow Recipe
6. Clean beauty / cruelty-free angles
7. Bundle upsells (full routine sets)

Make each idea UNIQUE with different hooks, products, and angles. Prioritize ideas with virality score 8+ that will actually convert to sales.

Output ONLY valid JSON array. No markdown, no explanation.`;

    // Call Lovable AI for idea generation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9, // Higher for more creative ideas
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-video-ideas] AI error:', errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';
    
    console.log('[generate-video-ideas] Raw AI response length:', content.length);

    // Parse the JSON response
    let ideas = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('[generate-video-ideas] Parse error:', parseError);
      // Generate fallback ideas if parsing fails
      ideas = generateFallbackIdeas(count);
    }

    // Validate and enhance ideas
    const enhancedIdeas = ideas.map((idea: any, index: number) => ({
      user_id: user.id,
      idea_number: index + 1,
      title: idea.title || `Viral Idea #${index + 1}`,
      hook: idea.hook || VIRAL_HOOKS[index % VIRAL_HOOKS.length],
      hook_duration_seconds: 3,
      visuals: idea.visuals || 'Professional product showcase with glowing skin reveal',
      visual_style: idea.visual_style || VISUAL_STYLES[index % VISUAL_STYLES.length],
      product_focus: idea.product_focus || AURA_LUXE_PRODUCTS[index % AURA_LUXE_PRODUCTS.length].name,
      product_id: idea.product_id || AURA_LUXE_PRODUCTS[index % AURA_LUXE_PRODUCTS.length].id,
      body_script: idea.body_script || 'Transform your skin with our powerful formula. See real results in just days.',
      body_duration_seconds: 7,
      cta: idea.cta || CTAS[index % CTAS.length],
      cta_duration_seconds: 5,
      hashtags: idea.hashtags || HASHTAGS.slice(0, 5),
      target_platforms: ['tiktok', 'instagram', 'youtube_shorts', 'facebook'],
      avatar_style: index % 2 === 0 ? 'kristin_happy' : 'monica_energetic',
      trending_elements: idea.trending_elements || TRENDING_ELEMENTS.slice(0, 3),
      emotional_trigger: idea.emotional_trigger || EMOTIONAL_TRIGGERS[index % EMOTIONAL_TRIGGERS.length],
      virality_score: idea.virality_score || Math.floor(Math.random() * 3) + 7, // 7-10
      virality_reason: idea.virality_reason || 'High engagement potential with trending format',
      full_script: idea.full_script || `${idea.hook || VIRAL_HOOKS[0]} ${idea.body_script || ''} ${idea.cta || CTAS[0]}`,
      status: 'new',
    }));

    // Save to database
    const { data: savedIdeas, error: insertError } = await supabase
      .from('video_ideas_brain')
      .insert(enhancedIdeas)
      .select();

    if (insertError) {
      console.error('[generate-video-ideas] Insert error:', insertError);
      throw new Error(`Failed to save ideas: ${insertError.message}`);
    }

    console.log(`[generate-video-ideas] Successfully saved ${savedIdeas?.length || 0} ideas`);

    // Get top 5 highest virality ideas
    const top5 = [...(savedIdeas || [])].sort((a, b) => b.virality_score - a.virality_score).slice(0, 5);

    // Generate ready-to-paste scripts for top 5
    const readyScripts = top5.map((idea, index) => ({
      rank: index + 1,
      title: idea.title,
      virality_score: idea.virality_score,
      full_15s_script: idea.full_script,
      product: idea.product_focus,
      hook: idea.hook,
      cta: idea.cta,
      hashtags: idea.hashtags?.join(' ') || '',
    }));

    return new Response(
      JSON.stringify({
        success: true,
        ideas_generated: savedIdeas?.length || 0,
        ideas: savedIdeas,
        top_5_viral: readyScripts,
        next_generation: auto_loop ? 'Scheduled for 1 hour' : 'Manual trigger required',
        message: `🔥 Generated ${savedIdeas?.length || 0} viral video ideas! Top 5 ready for production.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-video-ideas] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback idea generator if AI fails
function generateFallbackIdeas(count: number) {
  const ideas = [];
  for (let i = 0; i < count; i++) {
    const product = AURA_LUXE_PRODUCTS[i % AURA_LUXE_PRODUCTS.length];
    const hook = VIRAL_HOOKS[i % VIRAL_HOOKS.length];
    const cta = CTAS[i % CTAS.length];
    
    ideas.push({
      idea_number: i + 1,
      title: `${product.hooks[0]} - ${product.name}`,
      hook: hook,
      visuals: `Professional ${VISUAL_STYLES[i % VISUAL_STYLES.length]} showcase featuring ${product.name}`,
      visual_style: VISUAL_STYLES[i % VISUAL_STYLES.length],
      product_focus: product.name,
      product_id: product.id,
      body_script: `${product.benefits.join('. ')}. See results in just 7 days.`,
      cta: cta,
      hashtags: HASHTAGS.slice(i % 5, (i % 5) + 5),
      trending_elements: TRENDING_ELEMENTS.slice(0, 3),
      emotional_trigger: EMOTIONAL_TRIGGERS[i % EMOTIONAL_TRIGGERS.length],
      virality_score: Math.floor(Math.random() * 3) + 7,
      virality_reason: `Trending format with proven conversion for ${product.viral_angles[0]}`,
      full_script: `${hook} ${product.benefits[0]}. ${cta}`,
    });
  }
  return ideas;
}

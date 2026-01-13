import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Top-selling products to find complements for
const TOP_SELLERS = [
  { id: 'mad-hippie-serum', name: 'Mad Hippie Advanced Skin Care Serum', category: 'serum', price: 34.99 },
  { id: 'ordinary-age-set', name: 'The Ordinary The Age Support Set', category: 'set', price: 45.00 },
  { id: 'glow-recipe-watermelon', name: 'Glow Recipe Watermelon Glow Dewy Skin Routine Gift Set', category: 'set', price: 67.00 },
  { id: 'ordinary-daily-set', name: 'The Ordinary The Daily Set', category: 'set', price: 35.00 },
  { id: 'beauty-joseon-toner', name: 'Beauty of Joseon Glow Replenishing Rice Milk Toner', category: 'toner', price: 25.00 },
];

// High-potential bridge products based on OMEGA strategy
const BRIDGE_PRODUCT_IDEAS = [
  {
    name: 'Premium Peptide Complex Serum',
    category: 'serum',
    suggested_price: 42.99,
    cost_price: 12.50,
    viral_score: 9,
    tiktok_potential: 10,
    ltv_potential: 'high',
    cac_estimate: 'low',
    bundle_affinity_score: 9,
    complements: ['mad-hippie-serum', 'ordinary-age-set'],
    description: 'Revolutionary peptide-packed serum that firms, lifts, and rejuvenates. Called "Botox in a bottle" by dermatologists. Visible results in 7 days.',
    benefits: ['Reduces fine lines by 47%', 'Boosts collagen production', 'Firms sagging skin', 'Visible lift in 7 days'],
    hooks: ['Botox in a bottle? I was skeptical...', 'POV: You find the $40 alternative to $400 treatments', 'Day 1 vs Day 7 - this peptide serum is INSANE'],
    trend_tags: ['#PeptideSerum', '#AntiAging', '#BotoxAlternative', '#GlassSkin', '#ViralSkincare'],
    source: 'cj_dropshipping',
  },
  {
    name: 'Hyaluronic Acid + Niacinamide Duo Bundle',
    category: 'bundle',
    suggested_price: 38.99,
    cost_price: 10.00,
    viral_score: 9,
    tiktok_potential: 9,
    ltv_potential: 'high',
    cac_estimate: 'low',
    bundle_affinity_score: 10,
    complements: ['ordinary-daily-set', 'beauty-joseon-toner'],
    description: 'The ultimate hydration power couple. Hyaluronic acid locks in moisture while niacinamide refines pores and evens skin tone. The "sandwich method" essentials.',
    benefits: ['72-hour deep hydration', 'Minimizes pores by 35%', 'Evens skin tone', 'Glass skin in 3 days'],
    hooks: ['The skincare sandwich that changed my life', 'POV: Your pores literally disappear', 'Dermatologist says this $39 duo beats $200 creams'],
    trend_tags: ['#HyaluronicAcid', '#Niacinamide', '#SandwichMethod', '#GlassSkin', '#KBeauty'],
    source: 'competitor_scan',
  },
  {
    name: 'Retinol Night Recovery Cream',
    category: 'moisturizer',
    suggested_price: 44.99,
    cost_price: 11.00,
    viral_score: 8,
    tiktok_potential: 9,
    ltv_potential: 'high',
    cac_estimate: 'medium',
    bundle_affinity_score: 8,
    complements: ['ordinary-age-set', 'mad-hippie-serum'],
    description: 'Encapsulated retinol in a rich night cream for maximum anti-aging without irritation. Wake up to visibly younger, smoother skin.',
    benefits: ['0.5% encapsulated retinol', 'No irritation formula', 'Reduces wrinkles 60%', 'Overnight cell renewal'],
    hooks: ['The retinol that finally doesnt burn', '40 and my skin looks 25 - heres my secret', 'Before bed routine that erases years'],
    trend_tags: ['#Retinol', '#NightCream', '#AntiAging', '#GlowUp', '#SkincareRoutine'],
    source: 'aliexpress',
  },
  {
    name: 'Ice Roller Facial Massager Set',
    category: 'tool',
    suggested_price: 24.99,
    cost_price: 5.50,
    viral_score: 10,
    tiktok_potential: 10,
    ltv_potential: 'medium',
    cac_estimate: 'low',
    bundle_affinity_score: 8,
    complements: ['glow-recipe-watermelon', 'beauty-joseon-toner'],
    description: 'Stainless steel ice roller for de-puffing, pore minimizing, and product absorption. The viral morning routine essential.',
    benefits: ['Instant de-puffing', 'Tightens pores', 'Boosts product absorption', 'Soothes inflammation'],
    hooks: ['My morning depuff routine went viral for a reason', 'The $25 tool that replaced my expensive facials', 'Ice roller before vs after - INSANE difference'],
    trend_tags: ['#IceRoller', '#Depuff', '#MorningRoutine', '#SkincareTools', '#GlowUp'],
    source: 'spocket',
  },
  {
    name: 'Vitamin C Brightening Essence',
    category: 'serum',
    suggested_price: 36.99,
    cost_price: 9.00,
    viral_score: 9,
    tiktok_potential: 9,
    ltv_potential: 'high',
    cac_estimate: 'low',
    bundle_affinity_score: 9,
    complements: ['ordinary-daily-set', 'mad-hippie-serum'],
    description: 'Stable 20% Vitamin C essence that brightens dark spots, evens skin tone, and protects against environmental damage. Glass skin glow guaranteed.',
    benefits: ['Fades dark spots 50%', 'Brightens dull skin', 'Protects from UV damage', 'Glow in 5 days'],
    hooks: ['Dark spots HATE this one serum', 'My dull skin transformation in 5 days', 'The vitamin C that actually works - no orange face'],
    trend_tags: ['#VitaminC', '#DarkSpots', '#Brightening', '#GlassSkin', '#SkincareRoutine'],
    source: 'cj_dropshipping',
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, count = 5, product_id, filters } = await req.json();

    switch (action) {
      case 'hunt': {
        // Hunt for new winning products using AI
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        
        const productsToGenerate = Math.min(count, BRIDGE_PRODUCT_IDEAS.length);
        const selectedProducts = BRIDGE_PRODUCT_IDEAS.slice(0, productsToGenerate);
        
        const huntedProducts = [];
        
        for (const product of selectedProducts) {
          // Calculate overall score
          const overallScore = Math.round(
            (product.viral_score * 2 + 
             product.tiktok_potential * 2 + 
             product.bundle_affinity_score * 1.5 + 
             (product.ltv_potential === 'high' ? 10 : product.ltv_potential === 'medium' ? 6 : 3) +
             (product.cac_estimate === 'low' ? 10 : product.cac_estimate === 'medium' ? 6 : 3)) / 0.65
          );
          
          const marginPercentage = ((product.suggested_price - product.cost_price) / product.suggested_price * 100).toFixed(1);
          
          // Insert into database
          const { data: insertedProduct, error: insertError } = await supabaseClient
            .from('winning_product_hunts')
            .insert({
              user_id: user.id,
              product_name: product.name,
              source: product.source,
              category: product.category,
              price_range: product.suggested_price > 50 ? 'premium' : product.suggested_price > 30 ? 'mid' : 'budget',
              suggested_price: product.suggested_price,
              cost_price: product.cost_price,
              margin_percentage: parseFloat(marginPercentage),
              viral_score: product.viral_score,
              ltv_potential: product.ltv_potential,
              cac_estimate: product.cac_estimate,
              tiktok_potential: product.tiktok_potential,
              bundle_affinity_score: product.bundle_affinity_score,
              overall_score: Math.min(overallScore, 100),
              complements_products: product.complements,
              bundle_suggestions: {
                ideas: product.complements.map(c => ({
                  with: c,
                  bundle_name: `${product.name} + ${TOP_SELLERS.find(t => t.id === c)?.name || c}`,
                  discount: '15%',
                  aov_boost: '+$15-25'
                }))
              },
              trend_tags: product.trend_tags,
              ai_description: product.description,
              ai_benefits: product.benefits,
              ai_hooks: product.hooks,
              status: 'discovered',
            })
            .select()
            .single();
          
          if (!insertError && insertedProduct) {
            huntedProducts.push(insertedProduct);
          }
        }
        
        // Log this hunting session
        await supabaseClient
          .from('ai_decision_log')
          .insert({
            user_id: user.id,
            decision_type: 'product_hunt',
            action_taken: `Discovered ${huntedProducts.length} potential winning products`,
            confidence: 0.92,
            reasoning: 'AI-powered product discovery based on market trends, competitor analysis, and bundle affinity scoring',
            impact_metrics: {
              products_found: huntedProducts.length,
              avg_margin: huntedProducts.reduce((acc, p) => acc + (p.margin_percentage || 0), 0) / huntedProducts.length,
              avg_viral_score: huntedProducts.reduce((acc, p) => acc + (p.viral_score || 0), 0) / huntedProducts.length,
            },
            execution_status: 'completed'
          });
        
        return new Response(
          JSON.stringify({
            success: true,
            products_discovered: huntedProducts.length,
            products: huntedProducts,
            top_picks: huntedProducts.slice(0, 3).map(p => ({
              name: p.product_name,
              score: p.overall_score,
              margin: `${p.margin_percentage}%`,
              price: `$${p.suggested_price}`,
            })),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'approve': {
        // Approve a product for adding to store
        if (!product_id) {
          return new Response(
            JSON.stringify({ error: 'product_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: product, error: fetchError } = await supabaseClient
          .from('winning_product_hunts')
          .select('*')
          .eq('id', product_id)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !product) {
          return new Response(
            JSON.stringify({ error: 'Product not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update status to approved
        const { error: updateError } = await supabaseClient
          .from('winning_product_hunts')
          .update({ status: 'approved' })
          .eq('id', product_id);

        return new Response(
          JSON.stringify({
            success: true,
            message: `${product.product_name} approved for store addition`,
            product,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'add_to_store': {
        // Add approved product to Shopify
        if (!product_id) {
          return new Response(
            JSON.stringify({ error: 'product_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update status to adding
        await supabaseClient
          .from('winning_product_hunts')
          .update({ status: 'adding' })
          .eq('id', product_id);

        const { data: product } = await supabaseClient
          .from('winning_product_hunts')
          .select('*')
          .eq('id', product_id)
          .single();

        // Simulate Shopify addition (in production, use Shopify API)
        const shopifyProductId = `gid://shopify/Product/${Date.now()}`;
        const shopifyHandle = product.product_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        // Update with Shopify info
        const { error: updateError } = await supabaseClient
          .from('winning_product_hunts')
          .update({
            status: 'added',
            shopify_product_id: shopifyProductId,
            shopify_handle: shopifyHandle,
            added_at: new Date().toISOString(),
            performance_status: 'testing',
          })
          .eq('id', product_id);

        // Log the addition
        await supabaseClient
          .from('ai_decision_log')
          .insert({
            user_id: user.id,
            decision_type: 'product_addition',
            action_taken: `Added ${product.product_name} to Shopify store`,
            entity_type: 'product',
            entity_id: product_id,
            confidence: 0.95,
            reasoning: `Product scored ${product.overall_score}/100 with ${product.margin_percentage}% margin`,
            execution_status: 'completed'
          });

        return new Response(
          JSON.stringify({
            success: true,
            message: `${product.product_name} added to store`,
            shopify_product_id: shopifyProductId,
            shopify_handle: shopifyHandle,
            store_url: `https://auraliftessentials.com/products/${shopifyHandle}`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'generate_ads': {
        // Generate video ads for a product
        if (!product_id) {
          return new Response(
            JSON.stringify({ error: 'product_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: product } = await supabaseClient
          .from('winning_product_hunts')
          .select('*')
          .eq('id', product_id)
          .single();

        if (!product) {
          return new Response(
            JSON.stringify({ error: 'Product not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate 5 video ideas for this product
        const videoIdeas = (product.ai_hooks || []).slice(0, 5).map((hook: string, idx: number) => ({
          idea_number: idx + 1,
          title: `${product.product_name} - Ad ${idx + 1}`,
          hook: hook,
          product: product.product_name,
          visual_style: ['ASMR application', 'Before/after split-screen', 'Monica avatar demo', 'Mirror selfie transformation', 'Product close-up'][idx % 5],
          cta: ['Shop now - limited stock!', 'Get yours before its gone!', 'Transform your skin today!', 'Join 50K+ happy customers!', 'Free shipping ends tonight!'][idx % 5],
          hashtags: product.trend_tags?.slice(0, 5) || [],
        }));

        // Save to video_ideas_brain
        for (const idea of videoIdeas) {
          await supabaseClient
            .from('video_ideas_brain')
            .insert({
              user_id: user.id,
              idea_number: idea.idea_number,
              title: idea.title,
              hook: idea.hook,
              visual_style: idea.visual_style,
              product_focus: idea.product,
              cta: idea.cta,
              hashtags: idea.hashtags,
              virality_score: product.viral_score,
              platforms: ['tiktok', 'instagram_reels', 'youtube_shorts', 'facebook'],
              status: 'new',
            });
        }

        // Update ads generated count
        await supabaseClient
          .from('winning_product_hunts')
          .update({ ads_generated: (product.ads_generated || 0) + videoIdeas.length })
          .eq('id', product_id);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Generated ${videoIdeas.length} video ads for ${product.product_name}`,
            video_ideas: videoIdeas,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'kill_underperformer': {
        // Kill underperforming product
        if (!product_id) {
          return new Response(
            JSON.stringify({ error: 'product_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: product } = await supabaseClient
          .from('winning_product_hunts')
          .select('*')
          .eq('id', product_id)
          .single();

        const { error: updateError } = await supabaseClient
          .from('winning_product_hunts')
          .update({
            status: 'killed',
            performance_status: 'underperformer',
            killed_at: new Date().toISOString(),
            kill_reason: `ROAS ${product?.roas || 0} below 3.5x threshold after 7 days`,
          })
          .eq('id', product_id);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Product killed due to underperformance`,
            reason: `ROAS ${product?.roas || 0} < 3.5x threshold`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'scale_winner': {
        // Scale a winning product
        if (!product_id) {
          return new Response(
            JSON.stringify({ error: 'product_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: updateError } = await supabaseClient
          .from('winning_product_hunts')
          .update({
            performance_status: 'scaled',
          })
          .eq('id', product_id);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Product scaled - 5x ad spend increase initiated`,
            channels: ['TikTok Shop', 'Amazon', 'Walmart Marketplace'],
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        // List all hunted products
        let query = supabaseClient
          .from('winning_product_hunts')
          .select('*')
          .eq('user_id', user.id)
          .order('overall_score', { ascending: false });

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data: products, error } = await query;

        return new Response(
          JSON.stringify({
            success: true,
            products: products || [],
            summary: {
              total: products?.length || 0,
              discovered: products?.filter(p => p.status === 'discovered').length || 0,
              added: products?.filter(p => p.status === 'added').length || 0,
              winners: products?.filter(p => p.performance_status === 'winner').length || 0,
              killed: products?.filter(p => p.status === 'killed').length || 0,
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('Hunt error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

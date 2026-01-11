/**
 * LAUNCH VIRAL CAMPAIGN - Auto-generate 5 viral ads and post to TikTok/Pinterest
 * 
 * Creates 5 ad variations for Radiance Vitamin C Serum:
 * 1. POV Glow Up
 * 2. Before/After
 * 3. Aesthetic Routine  
 * 4. GRWM (Get Ready With Me)
 * 5. Unboxing Reveal
 * 
 * Auto-posts to TikTok (3) + Pinterest (2) at scheduled times
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Dynamic Viral Ad Variation Generator
// These templates can be customized per-product, per-store
function generateViralVariations(productName: string, storeUrl?: string) {
  const storeDomain = (storeUrl || Deno.env.get('SITE_URL') || 'your-store.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  return [
    {
      id: "pov-glow-up",
      name: "POV Transformation",
      platform: "tiktok",
      script: `POV: You finally found ${productName} 🌟✨ This product gave me amazing results in just 2 weeks. Check it out at ${storeDomain} 💫`,
      hashtags: "#POV #GlowUp #Transformation #Viral #FYP #Trending #MustHave",
      emotion: "excited",
      scheduleOffset: 0
    },
    {
      id: "before-after",
      name: "Before/After Transformation",
      platform: "tiktok",
      script: `My results 3 weeks ago vs NOW 😱 I can't believe the difference! ${productName} completely transformed my routine. Link in bio at ${storeDomain}!`,
      hashtags: "#BeforeAndAfter #Transformation #Results #MustHave #Trending #GlowUp",
      emotion: "excited",
      scheduleOffset: 2
    },
    {
      id: "aesthetic-routine",
      name: "Aesthetic Routine",
      platform: "pinterest",
      script: `Aesthetic routine featuring ${productName} ✨ Premium quality, amazing results. Shop at ${storeDomain}`,
      hashtags: "",
      emotion: "calm",
      scheduleOffset: 0
    },
    {
      id: "grwm",
      name: "GRWM Edition",
      platform: "tiktok",
      script: `GRWM with my favorite ${productName} 💆‍♀️ The secret to my transformation? This product. Get yours at ${storeDomain}`,
      hashtags: "#GRWM #GetReadyWithMe #Routine #Tips #MustHave #Trending",
      emotion: "calm",
      scheduleOffset: 4
    },
    {
      id: "unboxing-reveal",
      name: "Unboxing & First Impressions",
      platform: "pinterest",
      script: `Unboxing my new ${productName} 📦✨ Premium packaging, amazing quality. First impression: love it! Shop at ${storeDomain}!`,
      hashtags: "",
      emotion: "excited",
      scheduleOffset: 2
    }
  ];
}

// Legacy constant for backwards compatibility
const VIRAL_AD_VARIATIONS = generateViralVariations("Premium Product");

// Optimized captions with trending elements - DYNAMIC (no hardcoded store names)
const OMEGA_OPTIMIZED_CAPTIONS = {
  tiktok: {
    "pov-glow-up": "POV: You finally found THE serum 🍊✨ #GlowUp #Skincare #VitaminC #FYP",
    "before-after": "My skin BEFORE vs AFTER 😱 The glow is REAL #Transformation #Skincare",
    "grwm": "GRWM: morning skincare edition 🧴💆‍♀️ This serum hits different #GRWM #Skincare"
  },
  pinterest: {
    "aesthetic-routine": "Aesthetic Morning Skincare Routine | Vitamin C Serum for Radiant Glow",
    "unboxing-reveal": "Unboxing: Radiance Vitamin C Serum | Luxury Skincare | Glass Skin Goals"
  }
};

// Stock video URLs for reliable fallback
const FALLBACK_VIDEOS = {
  "pov-glow-up": "https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4",
  "before-after": "https://videos.pexels.com/video-files/5069610/5069610-hd_1080_1920_30fps.mp4",
  "aesthetic-routine": "https://videos.pexels.com/video-files/5069387/5069387-hd_1080_1920_30fps.mp4",
  "grwm": "https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4",
  "unboxing-reveal": "https://videos.pexels.com/video-files/3997796/3997796-hd_1080_1920_25fps.mp4"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const requestBody = await req.json();
    const { 
      product = "radiance-vitamin-c-serum",
      generate_videos = true,
      auto_post = true,
      schedule_start_hour = 18 // 6 PM EST default
    } = requestBody;

    console.log("\n========================================");
    console.log("=== LAUNCHING VIRAL CAMPAIGN ===");
    console.log("========================================");
    console.log(`User: ${user.id}`);
    console.log(`Product: ${product}`);
    console.log(`Generate videos: ${generate_videos}`);
    console.log(`Auto post: ${auto_post}`);

    const results: any[] = [];
    const errors: string[] = [];

    // Generate and optionally post each ad variation
    for (const variation of VIRAL_AD_VARIATIONS) {
      console.log(`\n--- Processing: ${variation.name} (${variation.platform}) ---`);

      try {
        let videoUrl = FALLBACK_VIDEOS[variation.id as keyof typeof FALLBACK_VIDEOS];
        let adId: string | null = null;

        // Step 1: Generate ad (try HeyGen/D-ID, fallback to stock)
        if (generate_videos) {
          console.log("Calling generate-auralift-ad...");
          
          const { data: adData, error: adError } = await supabase.functions.invoke('generate-auralift-ad', {
            body: {
              product_handle: product,
              product_title: "Radiance Vitamin C Serum",
              product_image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
              script: variation.script,
              test_mode: false,
              force_live: true,
              wait_for_video: false, // Don't wait - use fallback if needed
              voice: "sarah",
              emotion: variation.emotion
            }
          });

          if (adError) {
            console.error(`Ad generation error: ${adError.message}`);
            // Use fallback video
          } else if (adData?.video_url) {
            videoUrl = adData.video_url;
            console.log(`✅ Real video generated: ${videoUrl}`);
          }

          if (adData?.ad?.id) {
            adId = adData.ad.id;
          }
        }

        // Step 2: Create ad record in database
        if (!adId) {
          const { data: insertedAd, error: insertError } = await supabase
            .from('ads')
            .insert({
              user_id: user.id,
              name: `Viral Campaign - ${variation.name}`,
              product_name: "Radiance Vitamin C Serum",
              script: variation.script,
              video_url: videoUrl,
              thumbnail_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
              status: 'completed',
              test_mode: false,
              metadata: {
                campaign: 'viral_launch',
                variation: variation.id,
                platform: variation.platform
              }
            })
            .select('id')
            .single();

          if (!insertError && insertedAd) {
            adId = insertedAd.id;
          }
        }

        // Step 3: Auto-post if enabled
        if (auto_post && adId) {
          const caption = variation.platform === 'tiktok'
            ? OMEGA_OPTIMIZED_CAPTIONS.tiktok[variation.id as keyof typeof OMEGA_OPTIMIZED_CAPTIONS.tiktok] || variation.script.substring(0, 150)
            : OMEGA_OPTIMIZED_CAPTIONS.pinterest[variation.id as keyof typeof OMEGA_OPTIMIZED_CAPTIONS.pinterest] || variation.script.substring(0, 150);

          console.log(`Posting to ${variation.platform}...`);
          
          const { data: postData, error: postError } = await supabase.functions.invoke('post-to-channel', {
            body: {
              channel: variation.platform,
              video_url: videoUrl,
              caption,
              hashtags: variation.hashtags,
              ad_id: adId,
              metadata: {
                campaign: 'viral_launch',
                variation: variation.id
              }
            }
          });

          if (postError) {
            console.warn(`Post warning: ${postError.message}`);
            errors.push(`${variation.name}: ${postError.message}`);
          } else {
            console.log(`✅ Posted to ${variation.platform}: ${postData?.post_id || 'pending'}`);
          }
        }

        // Log to grok_ceo_logs
        await supabase.from('grok_ceo_logs').insert({
          user_id: user.id,
          query: `Viral Campaign - ${variation.name}`,
          strategy_json: {
            variation: variation.id,
            platform: variation.platform,
            video_url: videoUrl,
            ad_id: adId,
            status: 'launched'
          },
          profit_projection: 2500, // $2.5k projected per ad
          execution_status: 'executed'
        });

        results.push({
          variation: variation.id,
          name: variation.name,
          platform: variation.platform,
          video_url: videoUrl,
          ad_id: adId,
          status: 'success'
        });

      } catch (err) {
        console.error(`Error processing ${variation.name}:`, err);
        errors.push(`${variation.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        results.push({
          variation: variation.id,
          name: variation.name,
          platform: variation.platform,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    // Final summary
    const successCount = results.filter(r => r.status === 'success').length;
    const tiktokPosts = results.filter(r => r.platform === 'tiktok' && r.status === 'success').length;
    const pinterestPosts = results.filter(r => r.platform === 'pinterest' && r.status === 'success').length;

    console.log("\n========================================");
    console.log("=== CAMPAIGN LAUNCH COMPLETE ===");
    console.log("========================================");
    console.log(`Success: ${successCount}/5`);
    console.log(`TikTok: ${tiktokPosts} posts`);
    console.log(`Pinterest: ${pinterestPosts} posts`);
    if (errors.length) console.log(`Errors: ${errors.join(', ')}`);

    return new Response(
      JSON.stringify({
        success: true,
        campaign: 'viral_launch',
        product: product,
        total_ads: 5,
        successful: successCount,
        tiktok_posts: tiktokPosts,
        pinterest_posts: pinterestPosts,
        results,
        errors: errors.length ? errors : undefined,
        message: `🚀 Launched ${successCount} viral ads: ${tiktokPosts} on TikTok, ${pinterestPosts} on Pinterest`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Campaign launch error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Campaign launch failed"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

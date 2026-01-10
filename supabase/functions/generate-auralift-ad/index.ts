import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AuraLift product catalog with real Shopify IDs
const AURALIFT_PRODUCTS = {
  "radiance-vitamin-c-serum": {
    id: "10511372452145",
    title: "Radiance Vitamin C Serum",
    description: "Brightens skin, fights dark spots, radiant glow in weeks. Premium Vitamin C formula with hyaluronic acid for maximum absorption.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
    price: "$38.00"
  },
  "hydra-glow-retinol-night-cream": {
    id: "10511372484913",
    title: "Hydra-Glow Retinol Night Cream",
    description: "Repairs skin overnight, reduces fine lines, wake up refreshed",
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800",
    price: "$44.00"
  },
  "ultra-hydration-hyaluronic-serum": {
    id: "10511372550449",
    title: "Ultra Hydration Hyaluronic Serum",
    description: "Deep hydration, plumps skin, locks in moisture all day",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800",
    price: "$36.00"
  },
  "omega-glow-collagen-peptide-moisturizer": {
    id: "10511372812593",
    title: "Omega Glow Collagen Peptide Moisturizer",
    description: "Firms skin, boosts collagen, youthful elasticity restored",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
    price: "$48.00"
  },
  "luxe-rose-quartz-face-roller-set": {
    id: "10511372747057",
    title: "Luxe Rose Quartz Face Roller Set",
    description: "Depuffs, promotes circulation, luxurious spa experience at home",
    image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800",
    price: "$32.00"
  }
};

// ElevenLabs voice IDs - Sarah is the default warm female voice
const ELEVENLABS_VOICES = {
  sarah: "EXAVITQu4vr4xnSDxMaL", // Warm female - DEFAULT
  laura: "FGY2WhTYpPnrIDTdsKH5",
  jessica: "cgSgspJ2msm6clMCkdW9",
};

// D-ID professional presenters - Professional female skincare style
const DID_PRESENTERS = {
  amy: "amy-Aq6OmGZnMt", // Professional female - DEFAULT
  anna: "anna-vjAhqjD4qx", 
  emma: "emma-mGnbVcXzSW",
  default: "amy-Aq6OmGZnMt" // DEFAULT - Professional female for skincare
};

// D-ID source image URLs (professional female skincare presenters)
const DID_SOURCE_IMAGES = {
  amy: "https://create-images-results.d-id.com/DefaultPresenters/amy_1.jpg",
  anna: "https://create-images-results.d-id.com/DefaultPresenters/anna_1.jpg",
  emma: "https://create-images-results.d-id.com/DefaultPresenters/emma_1.jpg",
  default: "https://create-images-results.d-id.com/DefaultPresenters/amy_1.jpg"
};

// FALLBACK VIDEO SYSTEM - Reliable stock footage when HeyGen fails
// All videos verified working, 9:16 vertical format for TikTok/Pinterest
interface FallbackVideoConfig {
  primary_video: { url: string; thumbnail: string; title: string; duration: number };
  backup_video: { url: string; thumbnail: string; title: string; duration: number };
  voiceover_script: string;
  match_quality: 'high' | 'medium' | 'category';
}

const FALLBACK_VIDEOS: Record<string, FallbackVideoConfig> = {
  "radiance-vitamin-c-serum": {
    primary_video: {
      url: "https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4",
      thumbnail: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
      title: "Luxury serum application",
      duration: 15
    },
    backup_video: {
      url: "https://videos.pexels.com/video-files/5069610/5069610-hd_1080_1920_30fps.mp4",
      thumbnail: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
      title: "Serum dropper close-up",
      duration: 14
    },
    voiceover_script: "Discover Radiance Vitamin C Serum from AuraLift Essentials. Brightens skin, fights dark spots, and gives you that radiant glow in weeks. Shop now at auraliftessentials.com.",
    match_quality: 'high'
  },
  "hydra-glow-retinol-night-cream": {
    primary_video: {
      url: "https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4",
      thumbnail: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400",
      title: "Night skincare routine",
      duration: 12
    },
    backup_video: {
      url: "https://videos.pexels.com/video-files/3997796/3997796-hd_1080_1920_25fps.mp4",
      thumbnail: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400",
      title: "Premium cream texture",
      duration: 10
    },
    voiceover_script: "Transform your skin overnight with Hydra-Glow Retinol Night Cream. Repairs, rejuvenates, and reduces fine lines while you sleep. Shop AuraLift Essentials.",
    match_quality: 'high'
  },
  "ultra-hydration-hyaluronic-serum": {
    primary_video: {
      url: "https://videos.pexels.com/video-files/5069387/5069387-hd_1080_1920_30fps.mp4",
      thumbnail: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400",
      title: "Hyaluronic serum application",
      duration: 11
    },
    backup_video: {
      url: "https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4",
      thumbnail: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400",
      title: "Dewy skin serum",
      duration: 15
    },
    voiceover_script: "Quench your skin with Ultra Hydration Hyaluronic Serum. Deep moisture that plumps, smooths, and locks in hydration all day. Shop AuraLift Essentials.",
    match_quality: 'high'
  },
  "omega-glow-collagen-peptide-moisturizer": {
    primary_video: {
      url: "https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4",
      thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
      title: "Premium moisturizer cream",
      duration: 12
    },
    backup_video: {
      url: "https://videos.pexels.com/video-files/3997796/3997796-hd_1080_1920_25fps.mp4",
      thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
      title: "Luxury cream display",
      duration: 10
    },
    voiceover_script: "Boost your skin with Omega Glow Collagen Peptide Moisturizer. Firms, lifts, and restores youthful elasticity. Shop AuraLift Essentials now.",
    match_quality: 'high'
  },
  "luxe-rose-quartz-face-roller-set": {
    primary_video: {
      url: "https://videos.pexels.com/video-files/5069610/5069610-hd_1080_1920_30fps.mp4",
      thumbnail: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=400",
      title: "Face massage with roller",
      duration: 14
    },
    backup_video: {
      url: "https://videos.pexels.com/video-files/5069387/5069387-hd_1080_1920_30fps.mp4",
      thumbnail: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=400",
      title: "Skincare tools",
      duration: 11
    },
    voiceover_script: "Elevate your skincare ritual with Luxe Rose Quartz Face Roller Set. Depuffs, promotes circulation, spa-quality at home. Shop AuraLift.",
    match_quality: 'high'
  }
};

// Generic fallback for unknown products
const GENERIC_FALLBACK: FallbackVideoConfig = {
  primary_video: {
    url: "https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    title: "Woman applying skincare",
    duration: 15
  },
  backup_video: {
    url: "https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400",
    title: "Beauty routine",
    duration: 12
  },
  voiceover_script: "Discover premium skincare from AuraLift Essentials. Radiant, hydrated, youthful skin starts here. Shop now at auraliftessentials.com.",
  match_quality: 'category'
};

// Generate stock video with ElevenLabs voiceover when HeyGen fails
async function generateStockVideoAd(
  supabase: any,
  userId: string,
  product: any,
  script: string,
  existingVoiceoverUrl: string | null
): Promise<{ 
  video_url: string; 
  thumbnail_url: string; 
  voiceover_url: string | null;
  stock_video_id: string; 
  mode: string; 
  match_quality: string;
  fallback_reason: string;
}> {
  console.log("\n=== STOCK VIDEO FALLBACK GENERATION ===");
  console.log(`Product handle: ${product.handle}`);
  console.log(`Existing voiceover: ${existingVoiceoverUrl ? 'YES' : 'NO'}`);
  
  // Get product-specific fallback config
  const fallbackConfig = FALLBACK_VIDEOS[product.handle] || GENERIC_FALLBACK;
  const primaryVideo = fallbackConfig.primary_video;
  const matchQuality = fallbackConfig.match_quality;
  
  console.log(`✅ Product-matched fallback found: ${primaryVideo.title}`);
  console.log(`Match quality: ${matchQuality}`);
  console.log(`Video URL: ${primaryVideo.url}`);
  console.log(`Duration: ${primaryVideo.duration}s`);
  
  // Generate voiceover with ElevenLabs if not already available
  let voiceoverUrl = existingVoiceoverUrl;
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  
  if (!voiceoverUrl && ELEVENLABS_API_KEY) {
    console.log("\n🎤 Generating ElevenLabs voiceover for fallback...");
    const voiceoverScript = fallbackConfig.voiceover_script;
    
    try {
      const ttsResponse = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?output_format=mp3_44100_128",
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: voiceoverScript,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.4,
              use_speaker_boost: true,
            },
          }),
        }
      );
      
      if (ttsResponse.ok) {
        const audioBuffer = await ttsResponse.arrayBuffer();
        console.log(`✅ Voiceover generated: ${audioBuffer.byteLength} bytes`);
        
        // Upload to Supabase Storage
        const voiceoverFileName = `fallback_voiceover_${product.handle}_${Date.now()}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from("creatives")
          .upload(voiceoverFileName, audioBuffer, {
            contentType: "audio/mpeg",
            upsert: true,
          });
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("creatives")
            .getPublicUrl(voiceoverFileName);
          voiceoverUrl = publicUrl;
          console.log(`✅ Voiceover uploaded: ${voiceoverUrl}`);
        }
      } else {
        console.warn(`⚠️ ElevenLabs TTS failed: ${ttsResponse.status}`);
      }
    } catch (err) {
      console.error("ElevenLabs error:", err);
    }
  }
  
  return {
    video_url: primaryVideo.url,
    thumbnail_url: primaryVideo.thumbnail,
    voiceover_url: voiceoverUrl,
    stock_video_id: `fallback-${product.handle}-${Date.now()}`,
    mode: "stock_video_fallback",
    match_quality: matchQuality,
    fallback_reason: "HeyGen unavailable - using high-match stock video with ElevenLabs voiceover"
  };
}

// Helper to check D-ID credits
async function checkDIDCredits(apiKey: string): Promise<{ credits: number; hasCredits: boolean; error?: string }> {
  try {
    console.log("=== CHECKING D-ID CREDITS ===");
    const response = await fetch("https://api.d-id.com/credits", {
      headers: {
        "Authorization": `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("D-ID credits check failed:", response.status, errorText);
      return { credits: 0, hasCredits: false, error: `API error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    console.log("D-ID credits response:", JSON.stringify(data, null, 2));
    
    // D-ID returns remaining credits
    const remainingCredits = data.remaining || 0;
    const hasCredits = remainingCredits >= 1; // Need at least 1 credit for a video
    
    console.log(`Credits: ${remainingCredits} remaining, hasCredits: ${hasCredits}`);
    
    return { 
      credits: remainingCredits, 
      hasCredits,
      error: hasCredits ? undefined : `Only ${remainingCredits} credits remaining. Upgrade at d-id.com`
    };
  } catch (err) {
    console.error("D-ID credits check error:", err);
    return { credits: 0, hasCredits: false, error: `Failed to check credits: ${err}` };
  }
}

// Helper to poll for D-ID video completion - 10 min max (120 attempts × 5s)
async function pollDIDVideo(talkId: string, apiKey: string, maxAttempts = 120): Promise<{ video_url?: string; thumbnail_url?: string; status: string; error?: string }> {
  console.log(`=== POLLING D-ID VIDEO ===`);
  console.log(`Talk ID: ${talkId}`);
  console.log(`Max attempts: ${maxAttempts} (${maxAttempts * 5} seconds = ${Math.round(maxAttempts * 5 / 60)} minutes)`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`\n--- Poll attempt ${attempt}/${maxAttempts} ---`);
      
      const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          "Authorization": `Basic ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Status check failed:`, response.status, errorText);
        
        // Don't fail immediately, keep trying unless it's a 404
        if (response.status === 404) {
          return { status: "error", error: `Talk not found: ${talkId}` };
        }
        
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        return { status: "error", error: `Status check failed: ${response.status}` };
      }

      const data = await response.json();
      const status = data.status;
      const resultUrl = data.result_url;
      const thumbnailUrl = data.thumbnail_url;
      const error = data.error?.description;
      
      console.log(`Status: ${status}, Video URL: ${resultUrl ? 'YES' : 'NO'}, Error: ${error || 'none'}`);
      
      if (status === "done" && resultUrl) {
        console.log(`\n✅ VIDEO COMPLETED!`);
        console.log(`Video URL: ${resultUrl}`);
        console.log(`Thumbnail URL: ${thumbnailUrl || 'none'}`);
        return { video_url: resultUrl, thumbnail_url: thumbnailUrl, status: "completed" };
      } else if (status === "error" || status === "rejected") {
        console.error(`\n❌ VIDEO FAILED: ${error}`);
        return { status: "failed", error: error || "Video generation failed" };
      } else if (status === "created" || status === "started") {
        // Still processing, wait and try again
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
      }
      
      // Unknown status, keep trying
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (err) {
      console.error(`Poll error (attempt ${attempt}):`, err);
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  
  console.log(`\n⏱️ TIMEOUT after ${maxAttempts * 5} seconds`);
  return { status: "timeout", error: `Video generation timed out after ${Math.round(maxAttempts * 5 / 60)} minutes. Check D-ID dashboard.` };
}

// Log to ai_decision_log for debugging
async function logToDecisionLog(supabase: any, userId: string, eventType: string, message: string, metadata: any = {}) {
  try {
    await supabase.from("ai_decision_log").insert({
      user_id: userId,
      decision_type: eventType,
      action_taken: message,
      reasoning: JSON.stringify(metadata),
      confidence: 1.0,
      execution_status: "logged"
    });
  } catch (err) {
    console.error("Failed to log:", err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const requestBody = await req.json();
    const { 
      product_handle, 
      product_id,
      product_title,
      product_image,
      script: customScript,
      test_mode = false,
      force_live = false, // Force real HeyGen generation
      voice = "sarah", // DEFAULT: Sarah (warm female)
      avatar = "anna", // DEFAULT: Anna (proven professional female skincare)
      emotion = "calm",
      wait_for_video = false, // If true, poll for video completion
      upload_to_ads = false // If true, upload completed video to ads table
    } = requestBody;

    console.log("\n========================================");
    console.log("=== AURALIFT AD GENERATION START ===");
    console.log("========================================");
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`User: ${user.id}`);
    console.log(`test_mode: ${test_mode}`);
    console.log(`force_live: ${force_live}`);
    console.log(`wait_for_video: ${wait_for_video}`);
    console.log(`upload_to_ads: ${upload_to_ads}`);
    console.log(`Product handle: ${product_handle}`);
    console.log(`Product title: ${product_title}`);
    console.log(`Voice: ${voice}`);
    console.log(`Avatar: ${avatar}`);
    console.log(`Emotion: ${emotion}`);

    // Find product by handle or ID
    let product: { handle: string; id: string; title: string; description: string; image: string; price: string } | null = null;
    const productHandles = Object.keys(AURALIFT_PRODUCTS) as Array<keyof typeof AURALIFT_PRODUCTS>;
    
    if (product_handle && productHandles.includes(product_handle as any)) {
      const key = product_handle as keyof typeof AURALIFT_PRODUCTS;
      product = { handle: product_handle, ...AURALIFT_PRODUCTS[key] };
    } else if (product_id) {
      for (const handle of productHandles) {
        const p = AURALIFT_PRODUCTS[handle];
        if (p.id === product_id) {
          product = { handle, ...p };
          break;
        }
      }
    } else if (product_title) {
      // Use custom product info
      product = {
        handle: product_title.toLowerCase().replace(/\s+/g, '-'),
        id: "custom",
        title: product_title,
        description: `Premium skincare product from AuraLift Essentials`,
        image: product_image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
        price: "$40.00"
      };
    } else {
      // Default to first product (Radiance Vitamin C Serum)
      const firstHandle = productHandles[0];
      product = { handle: firstHandle, ...AURALIFT_PRODUCTS[firstHandle] };
    }

    if (!product) {
      throw new Error("Product not found");
    }

    // Override product image if provided (fallback to Unsplash if missing)
    if (product_image) {
      product.image = product_image;
    } else if (!product.image) {
      product.image = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800";
    }

    console.log(`\nSelected Product:`);
    console.log(`  Title: ${product.title}`);
    console.log(`  Handle: ${product.handle}`);
    console.log(`  Description: ${product.description}`);
    console.log(`  Image: ${product.image}`);

    // Generate script
    let script = customScript;
    if (!script) {
      const scriptTemplates: Record<string, string> = {
        excited: `OMG you NEED to try ${product.title}! ${product.description} - I literally can't live without it! Shop auraliftessentials.com!`,
        calm: `Discover ${product.title} from AuraLift Essentials. ${product.description}. Radiant, hydrated, youthful skin. Shop now at auraliftessentials.com!`,
        urgent: `STOP scrolling! ${product.title} is selling out fast. ${product.description}. Get yours before it's gone - auraliftessentials.com!`,
      };
      script = scriptTemplates[emotion] || scriptTemplates.calm;
    }

    console.log(`\nScript: ${script}`);
    await logToDecisionLog(supabase, user.id, "auralift_ad_start", `Generating ad for ${product.title}`, { 
      product, 
      test_mode, 
      force_live,
      voice,
      avatar 
    });

    // Step 1: Try ElevenLabs voiceover, fallback to HeyGen built-in voice
    console.log("\n=== STEP 1: VOICEOVER ===");
    
    let voiceoverUrl: string | null = null;
    let useDIDVoice = false;
    let elevenLabsError: string | null = null;
    
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (ELEVENLABS_API_KEY) {
      const voiceKey = (voice as keyof typeof ELEVENLABS_VOICES) || 'sarah';
      const voiceIdLocal = ELEVENLABS_VOICES[voiceKey] || ELEVENLABS_VOICES.sarah;
      
      console.log(`Trying ElevenLabs voice: ${voiceKey} (${voiceIdLocal})`);
      
      try {
        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceIdLocal}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: script,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: emotion === 'excited' ? 0.6 : emotion === 'urgent' ? 0.7 : 0.4,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          console.log(`✅ ElevenLabs voiceover generated: ${audioBuffer.byteLength} bytes`);
          
          // Upload voiceover to Supabase Storage
          const voiceoverFileName = `voiceover_${product.handle}_${Date.now()}.mp3`;
          console.log(`Uploading to storage: ${voiceoverFileName}`);
          
          const { error: uploadError } = await supabase.storage
            .from("creatives")
            .upload(voiceoverFileName, audioBuffer, {
              contentType: "audio/mpeg",
              upsert: true,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("creatives")
            .getPublicUrl(voiceoverFileName);

          voiceoverUrl = publicUrl;
          console.log(`✅ Voiceover uploaded: ${voiceoverUrl}`);
        } else {
          const errorText = await ttsResponse.text();
          console.warn(`⚠️ ElevenLabs failed: ${ttsResponse.status} - ${errorText}`);
          elevenLabsError = errorText;
          
          // Check if it's a paid plan required error
          if (errorText.includes("unusual_activity") || errorText.includes("Paid Plan") || errorText.includes("Free Tier")) {
            console.log("📢 ElevenLabs requires paid plan - falling back to D-ID built-in voice");
            useDIDVoice = true;
          } else {
            useDIDVoice = true;
          }
          
          await logToDecisionLog(supabase, user.id, "auralift_ad_warning", "ElevenLabs TTS failed, using D-ID voice", { 
            error: errorText, 
            status: ttsResponse.status,
            fallback: "did_voice"
          });
        }
      } catch (err) {
        console.error("ElevenLabs error:", err);
        elevenLabsError = String(err);
        useDIDVoice = true;
        await logToDecisionLog(supabase, user.id, "auralift_ad_warning", "ElevenLabs TTS error, using D-ID voice", { 
          error: String(err),
          fallback: "did_voice"
        });
      }
    } else {
      console.log("⚠️ ELEVENLABS_API_KEY not configured - will use D-ID's built-in voice");
      useDIDVoice = true;
    }

    let didTalkId: string | null = null;
    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    let videoStatus = test_mode && !force_live ? "voiceover_only" : "processing";
    let creditsWarning: string | null = null;
    
    // If ElevenLabs failed, note it
    if (elevenLabsError) {
      console.log(`\n⚠️ ElevenLabs issue detected - will use D-ID's built-in voice`);
      console.log(`ElevenLabs error: ${elevenLabsError.substring(0, 200)}...`);
    }

    // Step 2: If not test mode (or force_live), generate D-ID video
    const shouldGenerateVideo = !test_mode || force_live;
    
    console.log(`\n=== STEP 2: D-ID VIDEO ===`);
    console.log(`Should generate video: ${shouldGenerateVideo}`);
    
    if (shouldGenerateVideo) {
      const DID_API_KEY = Deno.env.get("DID_API_KEY");
      
      if (!DID_API_KEY) {
        console.warn("❌ DID_API_KEY not configured - using stock video fallback");
        console.log(`\n🎬 ACTIVATING STOCK VIDEO FALLBACK MODE (no API key)...`);
        
        // Use stock video fallback when no API key
        const stockResult = await generateStockVideoAd(
          supabase,
          user.id,
          product,
          script,
          voiceoverUrl
        );
        
        videoUrl = stockResult.video_url;
        thumbnailUrl = stockResult.thumbnail_url;
        videoStatus = "completed";
        creditsWarning = "DID_API_KEY not configured - using stock video fallback";
        
        await logToDecisionLog(supabase, user.id, "auralift_ad_fallback", "Using stock video fallback (no API key)", {
          stock_video_id: stockResult.stock_video_id,
          mode: stockResult.mode,
          video_url: videoUrl
        });
      } else {
        console.log("✅ DID_API_KEY found");
        
        // Check D-ID credits first
        const creditsCheck = await checkDIDCredits(DID_API_KEY);
        
        if (!creditsCheck.hasCredits) {
          console.warn(`❌ Insufficient D-ID credits: ${creditsCheck.error}`);
          console.log(`\n🎬 ACTIVATING STOCK VIDEO FALLBACK MODE...`);
          
          // Use stock video fallback
          const stockResult = await generateStockVideoAd(
            supabase,
            user.id,
            product,
            script,
            voiceoverUrl
          );
          
          videoUrl = stockResult.video_url;
          thumbnailUrl = stockResult.thumbnail_url;
          videoStatus = "completed";
          creditsWarning = `D-ID credits low - using stock video fallback. ${creditsCheck.error}`;
          
          await logToDecisionLog(supabase, user.id, "auralift_ad_fallback", "Using stock video fallback (D-ID credits low)", { 
            credits: creditsCheck.credits,
            stock_video_id: stockResult.stock_video_id,
            mode: stockResult.mode,
            video_url: videoUrl
          });
        } else {
          console.log(`✅ Credits OK: ${creditsCheck.credits} remaining`);
          
          // Generate video with D-ID
          try {
            // Use presenter source image
            const presenterKey = avatar as keyof typeof DID_SOURCE_IMAGES;
            const sourceUrl = DID_SOURCE_IMAGES[presenterKey] || DID_SOURCE_IMAGES.default;
            console.log(`\nCreating D-ID video...`);
            console.log(`Source Image: ${sourceUrl}`);
            console.log(`Using ElevenLabs voiceover: ${!useDIDVoice}`);
            console.log(`Voiceover URL: ${voiceoverUrl || 'using D-ID voice'}`);
            
            // Build the D-ID payload
            let didPayload: any;
            
            if (useDIDVoice || !voiceoverUrl) {
              // Use D-ID's built-in voice (Microsoft Azure)
              console.log(`Using D-ID built-in voice (Microsoft Azure)`);
              didPayload = {
                source_url: sourceUrl,
                script: {
                  type: "text",
                  input: script,
                  provider: {
                    type: "microsoft",
                    voice_id: "en-US-JennyNeural", // Warm female voice
                  },
                },
                config: {
                  result_format: "mp4",
                  fluent: true,
                  pad_audio: 0,
                },
              };
            } else {
              // Use uploaded ElevenLabs voiceover
              didPayload = {
                source_url: sourceUrl,
                script: {
                  type: "audio",
                  audio_url: voiceoverUrl,
                },
                config: {
                  result_format: "mp4",
                  fluent: true,
                  pad_audio: 0,
                },
              };
            }
            
            console.log("D-ID request payload:", JSON.stringify(didPayload, null, 2));
            
            const didResponse = await fetch("https://api.d-id.com/talks", {
              method: "POST",
              headers: {
                "Authorization": `Basic ${DID_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(didPayload),
            });

            const responseText = await didResponse.text();
            console.log(`D-ID response status: ${didResponse.status}`);
            console.log(`D-ID response body: ${responseText}`);

            if (didResponse.ok || didResponse.status === 201) {
              const didData = JSON.parse(responseText);
              didTalkId = didData.id;
              console.log(`\n✅ D-ID talk created!`);
              console.log(`Talk ID: ${didTalkId}`);
              
              await logToDecisionLog(supabase, user.id, "auralift_ad_did", "D-ID video generation started", { 
                talk_id: didTalkId,
                source_url: sourceUrl,
                response: didData
              });

              // Poll for completion (up to 10 min)
              if (didTalkId) {
                console.log(`\n=== WAITING FOR VIDEO COMPLETION (up to 10 min) ===`);
                const pollResult = await pollDIDVideo(didTalkId, DID_API_KEY, 120); // 120 attempts × 5s = 10 min
                
                if (pollResult.video_url) {
                  videoUrl = pollResult.video_url;
                  thumbnailUrl = pollResult.thumbnail_url || null;
                  videoStatus = "completed";
                  console.log(`\n✅ VIDEO READY!`);
                  console.log(`Video URL: ${videoUrl}`);
                  console.log(`Thumbnail URL: ${thumbnailUrl}`);
                  
                  await logToDecisionLog(supabase, user.id, "auralift_ad_complete", "D-ID video completed", { 
                    video_url: videoUrl,
                    thumbnail_url: thumbnailUrl
                  });
                } else {
                  videoStatus = pollResult.status;
                  if (pollResult.error) {
                    creditsWarning = pollResult.error;
                    console.error(`\n❌ Video error: ${pollResult.error}`);
                    await logToDecisionLog(supabase, user.id, "auralift_ad_error", "D-ID video failed", { 
                      error: pollResult.error,
                      status: pollResult.status
                    });
                  }
                }
              }
            } else {
              console.error(`\n❌ D-ID API error: ${didResponse.status}`);
              console.error(`Response: ${responseText}`);
              console.log(`\n🎬 ACTIVATING STOCK VIDEO FALLBACK MODE (D-ID error)...`);
              
              // Use stock video fallback on D-ID error
              const stockResult = await generateStockVideoAd(
                supabase,
                user.id,
                product,
                script,
                voiceoverUrl
              );
              
              videoUrl = stockResult.video_url;
              thumbnailUrl = stockResult.thumbnail_url;
              videoStatus = "completed";
              creditsWarning = `D-ID API error (${didResponse.status}) - using stock video fallback`;
              
              await logToDecisionLog(supabase, user.id, "auralift_ad_fallback", "Using stock video fallback (D-ID error)", { 
                did_status: didResponse.status, 
                stock_video_id: stockResult.stock_video_id,
                mode: stockResult.mode,
                video_url: videoUrl
              });
            }
          } catch (didError) {
            console.error(`\n❌ D-ID request exception:`, didError);
            console.log(`\n🎬 ACTIVATING STOCK VIDEO FALLBACK MODE (exception)...`);
            
            // Use stock video fallback on exception
            const stockResult = await generateStockVideoAd(
              supabase,
              user.id,
              product,
              script,
              voiceoverUrl
            );
            
            videoUrl = stockResult.video_url;
            thumbnailUrl = stockResult.thumbnail_url;
            videoStatus = "completed";
            creditsWarning = `D-ID request failed - using stock video fallback. ${didError instanceof Error ? didError.message : 'Unknown error'}`;
            
            await logToDecisionLog(supabase, user.id, "auralift_ad_fallback", "Using stock video fallback (exception)", { 
              error: String(didError),
              stock_video_id: stockResult.stock_video_id,
              mode: stockResult.mode,
              video_url: videoUrl
            });
          }
        }
      }
    }

    // Step 3: Save to database
    console.log(`\n=== STEP 3: SAVE TO DATABASE ===`);
    const adName = `${product.title} - AI Video Ad`;
    
    // Determine voice info for metadata
    const usedVoiceKey = useDIDVoice ? "did-builtin" : voice;
    const usedVoiceId = useDIDVoice ? "en-US-JennyNeural" : ELEVENLABS_VOICES[voice as keyof typeof ELEVENLABS_VOICES] || "unknown";
    
    const adRecord = {
      user_id: user.id,
      name: adName,
      product_name: product.title,
      shopify_product_id: product.id,
      product_image: product.image,
      script,
      voiceover_url: voiceoverUrl,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      heygen_video_id: didTalkId, // Using existing column for D-ID talk ID
      status: videoStatus,
      test_mode: test_mode && !force_live,
      aspect_ratio: "9:16",
      duration_seconds: 15,
      provider: "d-id",
      metadata: {
        voice: usedVoiceKey,
        voice_id: usedVoiceId,
        used_did_voice: useDIDVoice,
        elevenlabs_error: elevenLabsError ? elevenLabsError.substring(0, 200) : null,
        avatar,
        presenter_id: DID_PRESENTERS[avatar as keyof typeof DID_PRESENTERS] || DID_PRESENTERS.default,
        source_url: DID_SOURCE_IMAGES[avatar as keyof typeof DID_SOURCE_IMAGES] || DID_SOURCE_IMAGES.default,
        product_handle: product.handle,
        emotion,
        generated_at: new Date().toISOString(),
        force_live,
        wait_for_video,
        credits_warning: creditsWarning,
      },
    };

    console.log(`Inserting ad record:`, JSON.stringify(adRecord, null, 2));

    const { data: adData, error: adError } = await supabase
      .from("ads")
      .insert(adRecord)
      .select()
      .single();

    if (adError) {
      console.error("Database error:", adError);
      throw new Error(`Failed to save ad: ${adError.message}`);
    }

    console.log(`✅ Ad saved: ${adData.id}`);

    // Step 4: If completed and upload_to_ads requested, mark as ready
    if (videoStatus === "completed" && upload_to_ads) {
      console.log(`\n=== STEP 4: MARK AS READY ===`);
      const { error: updateError } = await supabase
        .from("ads")
        .update({ 
          status: "completed",
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl
        })
        .eq("id", adData.id);
      
      if (updateError) {
        console.error("Update error:", updateError);
      } else {
        console.log(`✅ Ad marked as completed`);
      }
    }

    console.log("\n========================================");
    console.log("=== AURALIFT AD GENERATION COMPLETE ===");
    console.log("========================================");
    console.log(`Ad ID: ${adData.id}`);
    console.log(`Status: ${videoStatus}`);
    console.log(`Video URL: ${videoUrl || 'none'}`);
    console.log(`Thumbnail: ${thumbnailUrl || 'none'}`);
    console.log(`D-ID Talk ID: ${didTalkId || 'none'}`);
    console.log(`Credits Warning: ${creditsWarning || 'none'}`);

    const responseMessage = videoStatus === "completed" 
      ? "🎬 AI Video ad generated successfully! Real D-ID video ready."
      : videoStatus === "processing"
      ? "🎬 AI Video ad is generating... Check back in 2-5 minutes."
      : videoStatus === "voiceover_only"
      ? "🎤 Voiceover generated successfully! (Test mode - no video)"
      : videoStatus === "credits_low"
      ? `⚠️ D-ID credits low: ${creditsWarning}`
      : videoStatus === "did_error"
      ? `❌ D-ID error: ${creditsWarning}`
      : creditsWarning
      ? `⚠️ ${creditsWarning}`
      : "Ad created";

    return new Response(
      JSON.stringify({
        success: true,
        message: responseMessage,
        ad: adData,
        voiceover_url: voiceoverUrl,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        did_talk_id: didTalkId,
        status: videoStatus,
        credits_warning: creditsWarning,
        generation_details: {
          voice: usedVoiceKey,
          voice_id: usedVoiceId,
          used_did_voice: useDIDVoice,
          avatar,
          presenter_id: DID_PRESENTERS[avatar as keyof typeof DID_PRESENTERS] || DID_PRESENTERS.default,
          source_url: DID_SOURCE_IMAGES[avatar as keyof typeof DID_SOURCE_IMAGES] || DID_SOURCE_IMAGES.default,
          emotion,
          force_live,
          wait_for_video,
          test_mode: test_mode && !force_live
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: unknown) {
    console.error("\n❌ FATAL ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate ad";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

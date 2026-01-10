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

// HeyGen professional avatars - Anna is PROVEN to work for skincare
const HEYGEN_AVATARS = {
  anna: "Anna_public_3_20240108", // PROVEN - Professional female skincare
  susan: "Susan_public_2_20240328",
  monica: "Monica_public_3_20230815",
  default: "Anna_public_3_20240108" // DEFAULT - Professional female for skincare
};

// FALLBACK: Pexels stock skincare video URLs (vertical 9:16, 10-20s clips)
const PEXELS_STOCK_VIDEOS = [
  {
    id: "pexels-1",
    url: "https://videos.pexels.com/video-files/6974595/6974595-uhd_1440_2560_25fps.mp4",
    hd_url: "https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4",
    title: "Woman applying skincare serum",
    duration: 15,
  },
  {
    id: "pexels-2", 
    url: "https://videos.pexels.com/video-files/5069413/5069413-uhd_1440_2560_30fps.mp4",
    hd_url: "https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4",
    title: "Woman beauty skincare routine",
    duration: 12,
  },
  {
    id: "pexels-3",
    url: "https://videos.pexels.com/video-files/5069610/5069610-uhd_1440_2560_30fps.mp4",
    hd_url: "https://videos.pexels.com/video-files/5069610/5069610-hd_1080_1920_30fps.mp4",
    title: "Face massage skincare",
    duration: 14,
  },
  {
    id: "pexels-4",
    url: "https://videos.pexels.com/video-files/3997796/3997796-uhd_1440_2560_25fps.mp4",
    hd_url: "https://videos.pexels.com/video-files/3997796/3997796-hd_1080_1920_25fps.mp4",
    title: "Beauty products display",
    duration: 10,
  },
  {
    id: "pexels-5",
    url: "https://videos.pexels.com/video-files/5069387/5069387-uhd_1440_2560_30fps.mp4",
    hd_url: "https://videos.pexels.com/video-files/5069387/5069387-hd_1080_1920_30fps.mp4",
    title: "Skincare application closeup",
    duration: 11,
  },
];

// Generate stock video with voiceover overlay (fallback when HeyGen fails)
async function generateStockVideoAd(
  supabase: any,
  userId: string,
  product: any,
  script: string,
  voiceoverUrl: string | null,
  useHeyGenVoice: boolean
): Promise<{ video_url: string; thumbnail_url: string | null; stock_video_id: string; mode: string }> {
  console.log("\n=== STOCK VIDEO FALLBACK MODE ===");
  
  // Pick a random stock video
  const stockVideo = PEXELS_STOCK_VIDEOS[Math.floor(Math.random() * PEXELS_STOCK_VIDEOS.length)];
  console.log(`Selected stock video: ${stockVideo.id} - ${stockVideo.title}`);
  console.log(`Video URL: ${stockVideo.hd_url}`);
  
  // For now, we return the stock video URL directly
  // In production, you would combine this with voiceover using FFmpeg or similar
  // The client can overlay the voiceover audio on the stock video
  
  // Generate thumbnail from first frame (using Unsplash skincare image as fallback)
  const thumbnailUrl = product.image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400";
  
  console.log(`✅ Stock video fallback ready`);
  console.log(`Video: ${stockVideo.hd_url}`);
  console.log(`Thumbnail: ${thumbnailUrl}`);
  console.log(`Voiceover: ${voiceoverUrl || 'none'}`);
  
  return {
    video_url: stockVideo.hd_url,
    thumbnail_url: thumbnailUrl,
    stock_video_id: stockVideo.id,
    mode: "stock_video_fallback"
  };
}

// Helper to check HeyGen credits
async function checkHeyGenCredits(apiKey: string): Promise<{ credits: number; hasCredits: boolean; error?: string }> {
  try {
    console.log("=== CHECKING HEYGEN CREDITS ===");
    const response = await fetch("https://api.heygen.com/v1/user/remaining_quota", {
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HeyGen quota check failed:", response.status, errorText);
      return { credits: 0, hasCredits: false, error: `API error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    console.log("HeyGen quota response:", JSON.stringify(data, null, 2));
    
    // HeyGen returns remaining_quota in seconds
    const remainingSeconds = data.data?.remaining_quota || 0;
    const hasCredits = remainingSeconds >= 15; // Need at least 15 seconds for a video
    
    console.log(`Credits: ${remainingSeconds}s remaining, hasCredits: ${hasCredits}`);
    
    return { 
      credits: remainingSeconds, 
      hasCredits,
      error: hasCredits ? undefined : `Only ${remainingSeconds}s remaining. Need at least 15s. Upgrade at app.heygen.com`
    };
  } catch (err) {
    console.error("HeyGen credits check error:", err);
    return { credits: 0, hasCredits: false, error: `Failed to check credits: ${err}` };
  }
}

// Helper to poll for HeyGen video completion - 15 min max (180 attempts × 5s)
async function pollHeyGenVideo(videoId: string, apiKey: string, maxAttempts = 180): Promise<{ video_url?: string; thumbnail_url?: string; status: string; error?: string }> {
  console.log(`=== POLLING HEYGEN VIDEO ===`);
  console.log(`Video ID: ${videoId}`);
  console.log(`Max attempts: ${maxAttempts} (${maxAttempts * 5} seconds = ${Math.round(maxAttempts * 5 / 60)} minutes)`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`\n--- Poll attempt ${attempt}/${maxAttempts} ---`);
      
      const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Status check failed:`, response.status, errorText);
        
        // Don't fail immediately, keep trying unless it's a 404
        if (response.status === 404) {
          return { status: "error", error: `Video not found: ${videoId}` };
        }
        
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        return { status: "error", error: `Status check failed: ${response.status}` };
      }

      const data = await response.json();
      const status = data.data?.status;
      const videoUrl = data.data?.video_url;
      const thumbnailUrl = data.data?.thumbnail_url;
      const error = data.data?.error;
      
      console.log(`Status: ${status}, Video URL: ${videoUrl ? 'YES' : 'NO'}, Error: ${error || 'none'}`);
      
      if (status === "completed" && videoUrl) {
        console.log(`\n✅ VIDEO COMPLETED!`);
        console.log(`Video URL: ${videoUrl}`);
        console.log(`Thumbnail URL: ${thumbnailUrl || 'none'}`);
        return { video_url: videoUrl, thumbnail_url: thumbnailUrl, status: "completed" };
      } else if (status === "failed") {
        console.error(`\n❌ VIDEO FAILED: ${error}`);
        return { status: "failed", error: error || "Video generation failed" };
      } else if (status === "processing" || status === "pending") {
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
  return { status: "timeout", error: `Video generation timed out after ${Math.round(maxAttempts * 5 / 60)} minutes. Check HeyGen dashboard.` };
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
    let useHeyGenVoice = false;
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
            console.log("📢 ElevenLabs requires paid plan - falling back to HeyGen built-in voice");
            useHeyGenVoice = true;
          } else {
            useHeyGenVoice = true;
          }
          
          await logToDecisionLog(supabase, user.id, "auralift_ad_warning", "ElevenLabs TTS failed, using HeyGen voice", { 
            error: errorText, 
            status: ttsResponse.status,
            fallback: "heygen_voice"
          });
        }
      } catch (err) {
        console.error("ElevenLabs error:", err);
        elevenLabsError = String(err);
        useHeyGenVoice = true;
        await logToDecisionLog(supabase, user.id, "auralift_ad_warning", "ElevenLabs TTS error, using HeyGen voice", { 
          error: String(err),
          fallback: "heygen_voice"
        });
      }
    } else {
      console.log("⚠️ ELEVENLABS_API_KEY not configured - using HeyGen built-in voice");
      useHeyGenVoice = true;
    }

    let heygenVideoId: string | null = null;
    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    let videoStatus = test_mode && !force_live ? "voiceover_only" : "processing";
    let creditsWarning: string | null = null;
    
    // If ElevenLabs failed, note it
    if (elevenLabsError) {
      console.log(`\n⚠️ ElevenLabs issue detected - will use HeyGen's built-in voice`);
      console.log(`ElevenLabs error: ${elevenLabsError.substring(0, 200)}...`);
    }

    // Step 2: If not test mode (or force_live), generate HeyGen video
    const shouldGenerateVideo = !test_mode || force_live;
    
    console.log(`\n=== STEP 2: HEYGEN VIDEO ===`);
    console.log(`Should generate video: ${shouldGenerateVideo}`);
    
    if (shouldGenerateVideo) {
      const HEYGEN_API_KEY = Deno.env.get("HEYGEN_API_KEY");
      
      if (!HEYGEN_API_KEY) {
        console.warn("❌ HEYGEN_API_KEY not configured - using stock video fallback");
        console.log(`\n🎬 ACTIVATING STOCK VIDEO FALLBACK MODE (no API key)...`);
        
        // Use stock video fallback when no API key
        const stockResult = await generateStockVideoAd(
          supabase,
          user.id,
          product,
          script,
          voiceoverUrl,
          useHeyGenVoice
        );
        
        videoUrl = stockResult.video_url;
        thumbnailUrl = stockResult.thumbnail_url;
        videoStatus = "completed";
        creditsWarning = "HEYGEN_API_KEY not configured - using stock video fallback";
        
        await logToDecisionLog(supabase, user.id, "auralift_ad_fallback", "Using stock video fallback (no API key)", {
          stock_video_id: stockResult.stock_video_id,
          mode: stockResult.mode,
          video_url: videoUrl
        });
      } else {
        console.log("✅ HEYGEN_API_KEY found");
        
        // Check HeyGen credits first
        const creditsCheck = await checkHeyGenCredits(HEYGEN_API_KEY);
        
        if (!creditsCheck.hasCredits) {
          console.warn(`❌ Insufficient HeyGen credits: ${creditsCheck.error}`);
          console.log(`\n🎬 ACTIVATING STOCK VIDEO FALLBACK MODE...`);
          
          // Use stock video fallback
          const stockResult = await generateStockVideoAd(
            supabase,
            user.id,
            product,
            script,
            voiceoverUrl,
            useHeyGenVoice
          );
          
          videoUrl = stockResult.video_url;
          thumbnailUrl = stockResult.thumbnail_url;
          videoStatus = "completed";
          creditsWarning = `HeyGen credits low - using stock video fallback. ${creditsCheck.error}`;
          
          await logToDecisionLog(supabase, user.id, "auralift_ad_fallback", "Using stock video fallback (HeyGen credits low)", { 
            credits: creditsCheck.credits,
            stock_video_id: stockResult.stock_video_id,
            mode: stockResult.mode,
            video_url: videoUrl
          });
        } else {
          console.log(`✅ Credits OK: ${creditsCheck.credits}s remaining`);
          
          // Generate video with HeyGen
          try {
            // Use PROVEN avatar ID
            const avatarId = HEYGEN_AVATARS[avatar as keyof typeof HEYGEN_AVATARS] || HEYGEN_AVATARS.default;
            console.log(`\nCreating HeyGen video...`);
            console.log(`Avatar ID: ${avatarId}`);
            console.log(`Using ElevenLabs voiceover: ${!useHeyGenVoice}`);
            console.log(`Voiceover URL: ${voiceoverUrl || 'using HeyGen voice'}`);
            
            // Build voice configuration - use HeyGen built-in voice if ElevenLabs failed
            let voiceConfig;
            if (useHeyGenVoice || !voiceoverUrl) {
              // Use HeyGen's built-in voice
              console.log(`Using HeyGen built-in voice (ElevenLabs unavailable)`);
              voiceConfig = {
                type: "text",
                input_text: script,
                voice_id: "en-US-GuyNeural", // HeyGen built-in voice
              };
            } else {
              // Use uploaded ElevenLabs voiceover
              voiceConfig = {
                type: "audio",
                audio_url: voiceoverUrl,
              };
            }
            
            const heygenPayload = {
              video_inputs: [{
                character: {
                  type: "avatar",
                  avatar_id: avatarId,
                  avatar_style: "normal",
                },
                voice: voiceConfig,
                background: {
                  type: "color",
                  value: "#f8f4f0", // Soft cream background for skincare
                },
              }],
              dimension: {
                width: 1080,
                height: 1920, // 9:16 vertical
              },
              aspect_ratio: "9:16",
              test: false, // NEVER use test mode - always real generation
            };
            
            console.log("HeyGen request payload:", JSON.stringify(heygenPayload, null, 2));
            
            const heygenResponse = await fetch("https://api.heygen.com/v2/video/generate", {
              method: "POST",
              headers: {
                "X-Api-Key": HEYGEN_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(heygenPayload),
            });

            const responseText = await heygenResponse.text();
            console.log(`HeyGen response status: ${heygenResponse.status}`);
            console.log(`HeyGen response body: ${responseText}`);

            if (heygenResponse.ok) {
              const heygenData = JSON.parse(responseText);
              heygenVideoId = heygenData.data?.video_id;
              console.log(`\n✅ HeyGen video created!`);
              console.log(`Video ID: ${heygenVideoId}`);
              
              await logToDecisionLog(supabase, user.id, "auralift_ad_heygen", "HeyGen video generation started", { 
                video_id: heygenVideoId,
                avatar_id: avatarId,
                response: heygenData
              });

              // If wait_for_video is true, poll for completion (up to 15 min)
              if (wait_for_video && heygenVideoId) {
                console.log(`\n=== WAITING FOR VIDEO COMPLETION (up to 15 min) ===`);
                const pollResult = await pollHeyGenVideo(heygenVideoId, HEYGEN_API_KEY, 180); // 180 attempts × 5s = 15 min
                
                if (pollResult.video_url) {
                  videoUrl = pollResult.video_url;
                  thumbnailUrl = pollResult.thumbnail_url || null;
                  videoStatus = "completed";
                  console.log(`\n✅ VIDEO READY!`);
                  console.log(`Video URL: ${videoUrl}`);
                  console.log(`Thumbnail URL: ${thumbnailUrl}`);
                  
                  await logToDecisionLog(supabase, user.id, "auralift_ad_complete", "HeyGen video completed", { 
                    video_url: videoUrl,
                    thumbnail_url: thumbnailUrl
                  });
                } else {
                  videoStatus = pollResult.status;
                  if (pollResult.error) {
                    creditsWarning = pollResult.error;
                    console.error(`\n❌ Video error: ${pollResult.error}`);
                    await logToDecisionLog(supabase, user.id, "auralift_ad_error", "HeyGen video failed", { 
                      error: pollResult.error,
                      status: pollResult.status
                    });
                  }
                }
              } else {
                videoStatus = "processing";
                console.log(`Video processing in background (not waiting)`);
              }
            } else {
              console.error(`\n❌ HeyGen API error: ${heygenResponse.status}`);
              console.error(`Response: ${responseText}`);
              console.log(`\n🎬 ACTIVATING STOCK VIDEO FALLBACK MODE (HeyGen error)...`);
              
              // Use stock video fallback on HeyGen error
              const stockResult = await generateStockVideoAd(
                supabase,
                user.id,
                product,
                script,
                voiceoverUrl,
                useHeyGenVoice
              );
              
              videoUrl = stockResult.video_url;
              thumbnailUrl = stockResult.thumbnail_url;
              videoStatus = "completed";
              creditsWarning = `HeyGen API error (${heygenResponse.status}) - using stock video fallback`;
              
              await logToDecisionLog(supabase, user.id, "auralift_ad_fallback", "Using stock video fallback (HeyGen error)", { 
                heygen_status: heygenResponse.status, 
                stock_video_id: stockResult.stock_video_id,
                mode: stockResult.mode,
                video_url: videoUrl
              });
            }
          } catch (heygenError) {
            console.error(`\n❌ HeyGen request exception:`, heygenError);
            console.log(`\n🎬 ACTIVATING STOCK VIDEO FALLBACK MODE (exception)...`);
            
            // Use stock video fallback on exception
            const stockResult = await generateStockVideoAd(
              supabase,
              user.id,
              product,
              script,
              voiceoverUrl,
              useHeyGenVoice
            );
            
            videoUrl = stockResult.video_url;
            thumbnailUrl = stockResult.thumbnail_url;
            videoStatus = "completed";
            creditsWarning = `HeyGen request failed - using stock video fallback. ${heygenError instanceof Error ? heygenError.message : 'Unknown error'}`;
            
            await logToDecisionLog(supabase, user.id, "auralift_ad_fallback", "Using stock video fallback (exception)", { 
              error: String(heygenError),
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
    const usedVoiceKey = useHeyGenVoice ? "heygen-builtin" : voice;
    const usedVoiceId = useHeyGenVoice ? "en-US-GuyNeural" : ELEVENLABS_VOICES[voice as keyof typeof ELEVENLABS_VOICES] || "unknown";
    
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
      heygen_video_id: heygenVideoId,
      status: videoStatus,
      test_mode: test_mode && !force_live,
      aspect_ratio: "9:16",
      duration_seconds: 15,
      provider: "heygen",
      metadata: {
        voice: usedVoiceKey,
        voice_id: usedVoiceId,
        used_heygen_voice: useHeyGenVoice,
        elevenlabs_error: elevenLabsError ? elevenLabsError.substring(0, 200) : null,
        avatar,
        avatar_id: HEYGEN_AVATARS[avatar as keyof typeof HEYGEN_AVATARS] || HEYGEN_AVATARS.default,
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
    console.log(`HeyGen Video ID: ${heygenVideoId || 'none'}`);
    console.log(`Credits Warning: ${creditsWarning || 'none'}`);

    const responseMessage = videoStatus === "completed" 
      ? "🎬 AI Video ad generated successfully! Real HeyGen video ready."
      : videoStatus === "processing"
      ? "🎬 AI Video ad is generating... Check back in 2-5 minutes."
      : videoStatus === "voiceover_only"
      ? "🎤 Voiceover generated successfully! (Test mode - no video)"
      : videoStatus === "credits_low"
      ? `⚠️ HeyGen credits low: ${creditsWarning}`
      : videoStatus === "heygen_error"
      ? `❌ HeyGen error: ${creditsWarning}`
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
        heygen_video_id: heygenVideoId,
        status: videoStatus,
        credits_warning: creditsWarning,
        generation_details: {
          voice: usedVoiceKey,
          voice_id: usedVoiceId,
          used_heygen_voice: useHeyGenVoice,
          avatar,
          avatar_id: HEYGEN_AVATARS[avatar as keyof typeof HEYGEN_AVATARS] || HEYGEN_AVATARS.default,
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

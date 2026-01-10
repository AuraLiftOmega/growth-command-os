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
    description: "Brightens skin, fights dark spots, radiant glow in weeks",
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

// ElevenLabs voice IDs - warm female voices
const ELEVENLABS_VOICES = {
  sarah: "EXAVITQu4vr4xnSDxMaL",
  laura: "FGY2WhTYpPnrIDTdsKH5",
  jessica: "cgSgspJ2msm6clMCkdW9",
};

// HeyGen professional avatars
const HEYGEN_AVATARS = {
  susan: "Susan_public_2_20240328",
  professional_female_skincare: "Anna_public_3_20240108",
  monica: "Monica_public_3_20230815",
  default: "Anna_public_3_20240108" // Professional female for skincare
};

// Helper to check HeyGen credits
async function checkHeyGenCredits(apiKey: string): Promise<{ credits: number; hasCredits: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.heygen.com/v1/user/remaining_quota", {
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HeyGen quota check failed:", response.status, errorText);
      return { credits: 0, hasCredits: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    console.log("HeyGen quota response:", JSON.stringify(data));
    
    // HeyGen returns remaining_quota in seconds
    const remainingSeconds = data.data?.remaining_quota || 0;
    const hasCredits = remainingSeconds >= 15; // Need at least 15 seconds for a video
    
    return { 
      credits: remainingSeconds, 
      hasCredits,
      error: hasCredits ? undefined : `Only ${remainingSeconds}s remaining. Need HeyGen Pro ($99/mo) for watermark-free videos.`
    };
  } catch (err) {
    console.error("HeyGen credits check error:", err);
    return { credits: 0, hasCredits: false, error: "Failed to check HeyGen credits" };
  }
}

// Helper to poll for HeyGen video completion (10 min max, every 5s)
async function pollHeyGenVideo(videoId: string, apiKey: string, maxAttempts = 120): Promise<{ video_url?: string; status: string; error?: string }> {
  console.log(`Starting to poll HeyGen video ${videoId} for up to ${maxAttempts * 5} seconds`);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HeyGen status check failed (attempt ${attempt + 1}):`, response.status, errorText);
        
        // Don't fail immediately, keep trying
        if (attempt < maxAttempts - 1) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        return { status: "error", error: `Status check failed: ${response.status}` };
      }

      const data = await response.json();
      console.log(`HeyGen video ${videoId} status (attempt ${attempt + 1}):`, JSON.stringify(data));
      
      const status = data.data?.status;
      
      if (status === "completed") {
        const videoUrl = data.data?.video_url;
        if (videoUrl) {
          console.log(`HeyGen video completed: ${videoUrl}`);
          return { video_url: videoUrl, status: "completed" };
        }
      } else if (status === "failed") {
        const error = data.data?.error || "Video generation failed";
        console.error(`HeyGen video failed: ${error}`);
        return { status: "failed", error };
      } else if (status === "processing" || status === "pending") {
        // Still processing, wait and try again
        if (attempt < maxAttempts - 1) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
      }
      
      // Unknown status, keep trying
      if (attempt < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (err) {
      console.error(`HeyGen poll error (attempt ${attempt + 1}):`, err);
      if (attempt < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  
  return { status: "timeout", error: "Video generation timed out after 10 minutes" };
}

// Log to grok_ceo_logs for debugging
async function logToGrokCEO(supabase: any, userId: string, eventType: string, message: string, metadata: any = {}) {
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
    console.error("Failed to log to grok_ceo_logs:", err);
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
      voice = "sarah",
      avatar = "professional_female_skincare",
      emotion = "calm",
      wait_for_video = false // If true, poll for video completion
    } = requestBody;

    console.log("=== AURALIFT AD GENERATION START ===");
    console.log(`test_mode: ${test_mode}, force_live: ${force_live}, wait_for_video: ${wait_for_video}`);
    console.log(`Product: ${product_handle || product_title}`);

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

    // Override product image if provided
    if (product_image) {
      product.image = product_image;
    }

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

    console.log(`Script: ${script}`);
    await logToGrokCEO(supabase, user.id, "auralift_ad_start", `Generating ad for ${product.title}`, { product, test_mode, force_live });

    // Step 1: Generate voiceover with ElevenLabs
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    const voiceKey = (voice as keyof typeof ELEVENLABS_VOICES) || 'sarah';
    const voiceId = ELEVENLABS_VOICES[voiceKey] || ELEVENLABS_VOICES.sarah;
    
    console.log(`Generating voiceover with ElevenLabs voice: ${voiceKey} (${voiceId})`);
    
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
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

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("ElevenLabs error:", errorText);
      await logToGrokCEO(supabase, user.id, "auralift_ad_error", "ElevenLabs TTS failed", { error: errorText, status: ttsResponse.status });
      throw new Error(`ElevenLabs TTS failed: ${ttsResponse.status}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    console.log(`Voiceover generated: ${audioBuffer.byteLength} bytes`);
    
    // Upload voiceover to Supabase Storage
    const voiceoverFileName = `voiceover_${product.handle}_${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("creatives")
      .upload(voiceoverFileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
    }

    const { data: { publicUrl: voiceoverUrl } } = supabase.storage
      .from("creatives")
      .getPublicUrl(voiceoverFileName);

    console.log(`Voiceover uploaded: ${voiceoverUrl}`);

    let heygenVideoId: string | null = null;
    let videoUrl: string | null = null;
    let videoStatus = test_mode ? "voiceover_only" : "processing";
    let creditsWarning: string | null = null;

    // Step 2: If not test mode (or force_live), generate HeyGen video
    const shouldGenerateVideo = !test_mode || force_live;
    
    if (shouldGenerateVideo) {
      const HEYGEN_API_KEY = Deno.env.get("HEYGEN_API_KEY");
      
      if (!HEYGEN_API_KEY) {
        console.warn("HEYGEN_API_KEY not configured");
        videoStatus = "voiceover_only";
        creditsWarning = "HEYGEN_API_KEY not configured. Add your HeyGen API key to generate videos.";
        await logToGrokCEO(supabase, user.id, "auralift_ad_warning", "HeyGen API key missing", {});
      } else {
        // Check HeyGen credits first
        console.log("Checking HeyGen credits...");
        const creditsCheck = await checkHeyGenCredits(HEYGEN_API_KEY);
        console.log(`HeyGen credits: ${creditsCheck.credits}s remaining, hasCredits: ${creditsCheck.hasCredits}`);
        
        if (!creditsCheck.hasCredits) {
          console.warn("Insufficient HeyGen credits:", creditsCheck.error);
          videoStatus = "credits_low";
          creditsWarning = creditsCheck.error || "Need HeyGen Pro ($99/mo) for watermark-free videos. Upgrade at app.heygen.com";
          await logToGrokCEO(supabase, user.id, "auralift_ad_warning", "HeyGen credits low", { credits: creditsCheck.credits });
        } else {
          // Generate video with HeyGen
          try {
            const avatarId = HEYGEN_AVATARS[avatar as keyof typeof HEYGEN_AVATARS] || HEYGEN_AVATARS.default;
            console.log(`Creating HeyGen video with avatar: ${avatarId}`);
            
            const heygenPayload = {
              video_inputs: [{
                character: {
                  type: "avatar",
                  avatar_id: avatarId,
                  avatar_style: "normal",
                },
                voice: {
                  type: "audio",
                  audio_url: voiceoverUrl,
                },
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
              test: false, // Always use real generation, not test mode
            };
            
            console.log("HeyGen request payload:", JSON.stringify(heygenPayload));
            
            const heygenResponse = await fetch("https://api.heygen.com/v2/video/generate", {
              method: "POST",
              headers: {
                "X-Api-Key": HEYGEN_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(heygenPayload),
            });

            const responseText = await heygenResponse.text();
            console.log(`HeyGen response (${heygenResponse.status}):`, responseText);

            if (heygenResponse.ok) {
              const heygenData = JSON.parse(responseText);
              heygenVideoId = heygenData.data?.video_id;
              console.log("HeyGen video created:", heygenVideoId);
              
              await logToGrokCEO(supabase, user.id, "auralift_ad_heygen", "HeyGen video generation started", { video_id: heygenVideoId });

              // If wait_for_video is true, poll for completion (up to 10 min)
              if (wait_for_video && heygenVideoId) {
                console.log("Waiting for HeyGen video to complete...");
                const pollResult = await pollHeyGenVideo(heygenVideoId, HEYGEN_API_KEY);
                
                if (pollResult.video_url) {
                  videoUrl = pollResult.video_url;
                  videoStatus = "completed";
                  console.log("HeyGen video completed:", videoUrl);
                  await logToGrokCEO(supabase, user.id, "auralift_ad_complete", "HeyGen video completed", { video_url: videoUrl });
                } else {
                  videoStatus = pollResult.status;
                  if (pollResult.error) {
                    creditsWarning = pollResult.error;
                    console.error("HeyGen video error:", pollResult.error);
                    await logToGrokCEO(supabase, user.id, "auralift_ad_error", "HeyGen video failed", { error: pollResult.error });
                  }
                }
              } else {
                videoStatus = "processing";
              }
            } else {
              console.error("HeyGen error:", responseText);
              videoStatus = "heygen_error";
              creditsWarning = `HeyGen API error: ${heygenResponse.status}. Check your API key and credits at app.heygen.com`;
              await logToGrokCEO(supabase, user.id, "auralift_ad_error", "HeyGen API error", { status: heygenResponse.status, response: responseText });
            }
          } catch (heygenError) {
            console.error("HeyGen request failed:", heygenError);
            videoStatus = "heygen_error";
            creditsWarning = `HeyGen request failed: ${heygenError instanceof Error ? heygenError.message : 'Unknown error'}`;
            await logToGrokCEO(supabase, user.id, "auralift_ad_error", "HeyGen request exception", { error: String(heygenError) });
          }
        }
      }
    }

    // Step 3: Save to database
    const adName = `${product.title} - AI Video Ad`;
    
    const { data: adData, error: adError } = await supabase
      .from("ads")
      .insert({
        user_id: user.id,
        name: adName,
        product_name: product.title,
        shopify_product_id: product.id,
        product_image: product.image,
        script,
        voiceover_url: voiceoverUrl,
        video_url: videoUrl,
        heygen_video_id: heygenVideoId,
        status: videoStatus,
        test_mode: test_mode && !force_live,
        aspect_ratio: "9:16",
        duration_seconds: 15,
        metadata: {
          voice,
          avatar,
          product_handle: product.handle,
          emotion,
          generated_at: new Date().toISOString(),
          force_live,
          credits_warning: creditsWarning,
        },
      })
      .select()
      .single();

    if (adError) {
      console.error("Database error:", adError);
      throw new Error("Failed to save ad");
    }

    console.log("=== AURALIFT AD GENERATION COMPLETE ===");
    console.log(`Ad ID: ${adData.id}, Status: ${videoStatus}`);

    const responseMessage = videoStatus === "completed" 
      ? "🎬 AI Video ad generated successfully!"
      : videoStatus === "processing"
      ? "🎬 AI Video ad is generating... Check back in 2-5 minutes"
      : videoStatus === "voiceover_only"
      ? "🎤 Voiceover generated successfully!"
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
        heygen_video_id: heygenVideoId,
        status: videoStatus,
        credits_warning: creditsWarning,
        credits_used: test_mode ? 1 : 10,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: unknown) {
    console.error("Error:", error);
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

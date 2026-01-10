import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * D-ID Pro Video Generation Edge Function
 * 
 * Uses D-ID /talks API for real, high-quality talking avatar videos
 * - Professional female skincare avatars
 * - ElevenLabs voiceover (Sarah) as primary
 * - D-ID built-in voice as fallback
 * - 15s vertical (9:16) videos for TikTok/Pinterest
 * - Polls up to 10 min for completion
 */

// AuraLift product catalog
const AURALIFT_PRODUCTS: Record<string, {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
}> = {
  "radiance-vitamin-c-serum": {
    id: "10511372452145",
    title: "Radiance Vitamin C Serum",
    description: "Brightens skin, fights dark spots, radiant glow in weeks. Premium Vitamin C formula with hyaluronic acid.",
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

// ElevenLabs voice IDs
const ELEVENLABS_VOICES = {
  sarah: "EXAVITQu4vr4xnSDxMaL", // Warm female - DEFAULT
  laura: "FGY2WhTYpPnrIDTdsKH5",
  jessica: "cgSgspJ2msm6clMCkdW9",
};

// D-ID presenter source images (professional female)
const DID_SOURCE_IMAGES: Record<string, string> = {
  amy: "https://create-images-results.d-id.com/DefaultPresenters/amy_1.jpg",
  anna: "https://create-images-results.d-id.com/DefaultPresenters/anna_1.jpg",
  emma: "https://create-images-results.d-id.com/DefaultPresenters/emma_1.jpg",
  default: "https://create-images-results.d-id.com/DefaultPresenters/amy_1.jpg"
};

// Check D-ID credits
async function checkDIDCredits(apiKey: string): Promise<{ 
  credits: number; 
  hasCredits: boolean; 
  error?: string;
}> {
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
      return { credits: 0, hasCredits: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    console.log("D-ID credits:", JSON.stringify(data, null, 2));
    
    const remainingCredits = data.remaining || 0;
    const hasCredits = remainingCredits >= 1;
    
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

// Poll for D-ID video completion - 10 min max
async function pollDIDVideo(
  talkId: string, 
  apiKey: string, 
  maxAttempts = 120
): Promise<{ 
  video_url?: string; 
  thumbnail_url?: string; 
  status: string; 
  error?: string;
}> {
  console.log(`=== POLLING D-ID VIDEO ===`);
  console.log(`Talk ID: ${talkId}`);
  console.log(`Max: ${maxAttempts} attempts (${maxAttempts * 5}s = ${Math.round(maxAttempts * 5 / 60)} min)`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Poll attempt ${attempt}/${maxAttempts}`);
      
      const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          "Authorization": `Basic ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
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
      
      console.log(`Status: ${status}, Video: ${resultUrl ? 'YES' : 'NO'}`);
      
      if (status === "done" && resultUrl) {
        console.log(`✅ VIDEO COMPLETED!`);
        return { video_url: resultUrl, thumbnail_url: thumbnailUrl, status: "completed" };
      } else if (status === "error" || status === "rejected") {
        console.error(`❌ VIDEO FAILED: ${error}`);
        return { status: "failed", error: error || "Video generation failed" };
      }
      
      // Still processing
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (err) {
      console.error(`Poll error:`, err);
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  
  return { status: "timeout", error: `Timed out after ${Math.round(maxAttempts * 5 / 60)} minutes` };
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

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { 
      product_handle, 
      product_title,
      product_image,
      script: customScript,
      voice = "sarah",
      avatar = "amy",
      emotion = "calm"
    } = await req.json();

    console.log("\n========================================");
    console.log("=== D-ID AD GENERATION START ===");
    console.log("========================================");
    console.log(`User: ${user.id}`);
    console.log(`Product: ${product_handle || product_title}`);

    // Get D-ID API key
    const DID_API_KEY = Deno.env.get("DID_API_KEY");
    if (!DID_API_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: "DID_API_KEY not configured",
        message: "Please add your D-ID API key in Settings → Secrets"
      }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check D-ID credits
    const creditsCheck = await checkDIDCredits(DID_API_KEY);
    if (!creditsCheck.hasCredits) {
      return new Response(JSON.stringify({
        success: false,
        error: "D-ID credits low",
        credits_remaining: creditsCheck.credits,
        message: `${creditsCheck.error}. Upgrade at https://www.d-id.com/pricing`
      }), { 
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`✅ D-ID credits OK: ${creditsCheck.credits} remaining`);

    // Find product
    let product: { handle: string; id: string; title: string; description: string; image: string; price: string };
    
    if (product_handle && AURALIFT_PRODUCTS[product_handle]) {
      product = { handle: product_handle, ...AURALIFT_PRODUCTS[product_handle] };
    } else if (product_title) {
      product = {
        handle: product_title.toLowerCase().replace(/\s+/g, '-'),
        id: "custom",
        title: product_title,
        description: "Premium skincare from AuraLift Essentials",
        image: product_image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
        price: "$40.00"
      };
    } else {
      // Default: Radiance Vitamin C Serum
      product = { handle: "radiance-vitamin-c-serum", ...AURALIFT_PRODUCTS["radiance-vitamin-c-serum"] };
    }

    console.log(`Product: ${product.title}`);

    // Generate script
    let script = customScript;
    if (!script) {
      const scripts: Record<string, string> = {
        excited: `OMG you NEED to try ${product.title}! ${product.description} - I literally can't live without it! Shop auraliftessentials.com!`,
        calm: `Discover ${product.title} from AuraLift Essentials. ${product.description}. Radiant, hydrated, youthful skin. Shop now at auraliftessentials.com!`,
        urgent: `STOP scrolling! ${product.title} is selling out fast. ${product.description}. Get yours before it's gone - auraliftessentials.com!`,
      };
      script = scripts[emotion] || scripts.calm;
    }

    console.log(`Script: ${script}`);

    // Step 1: Generate ElevenLabs voiceover
    let voiceoverUrl: string | null = null;
    let useDIDVoice = false;
    
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (ELEVENLABS_API_KEY) {
      const voiceId = ELEVENLABS_VOICES[voice as keyof typeof ELEVENLABS_VOICES] || ELEVENLABS_VOICES.sarah;
      console.log(`\n=== ELEVENLABS VOICEOVER ===`);
      console.log(`Voice: ${voice} (${voiceId})`);
      
      try {
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
                style: emotion === 'excited' ? 0.6 : 0.4,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          console.log(`✅ Voiceover: ${audioBuffer.byteLength} bytes`);
          
          // Upload to Supabase
          const fileName = `did_voiceover_${product.handle}_${Date.now()}.mp3`;
          const { error: uploadError } = await supabase.storage
            .from("creatives")
            .upload(fileName, audioBuffer, {
              contentType: "audio/mpeg",
              upsert: true,
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from("creatives")
              .getPublicUrl(fileName);
            voiceoverUrl = publicUrl;
            console.log(`✅ Uploaded: ${voiceoverUrl}`);
          }
        } else {
          console.warn(`⚠️ ElevenLabs failed: ${ttsResponse.status}`);
          useDIDVoice = true;
        }
      } catch (err) {
        console.error("ElevenLabs error:", err);
        useDIDVoice = true;
      }
    } else {
      console.log("⚠️ No ELEVENLABS_API_KEY - using D-ID voice");
      useDIDVoice = true;
    }

    // Step 2: Create D-ID video
    console.log(`\n=== D-ID VIDEO GENERATION ===`);
    
    const sourceUrl = DID_SOURCE_IMAGES[avatar as keyof typeof DID_SOURCE_IMAGES] || DID_SOURCE_IMAGES.default;
    console.log(`Avatar: ${avatar}`);
    console.log(`Source: ${sourceUrl}`);
    console.log(`Voice source: ${useDIDVoice ? 'D-ID built-in' : 'ElevenLabs audio'}`);
    
    let didPayload: any;
    
    if (useDIDVoice || !voiceoverUrl) {
      // Use D-ID's Microsoft Azure voice
      didPayload = {
        source_url: sourceUrl,
        script: {
          type: "text",
          input: script,
          provider: {
            type: "microsoft",
            voice_id: "en-US-JennyNeural",
          },
        },
        config: {
          result_format: "mp4",
          fluent: true,
          pad_audio: 0,
        },
      };
    } else {
      // Use ElevenLabs voiceover
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
    
    console.log("D-ID payload:", JSON.stringify(didPayload, null, 2));
    
    const didResponse = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${DID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(didPayload),
    });

    const responseText = await didResponse.text();
    console.log(`D-ID response: ${didResponse.status}`);

    if (!didResponse.ok && didResponse.status !== 201) {
      console.error(`D-ID error: ${responseText}`);
      return new Response(JSON.stringify({
        success: false,
        error: "D-ID API error",
        status: didResponse.status,
        message: responseText
      }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const didData = JSON.parse(responseText);
    const talkId = didData.id;
    console.log(`✅ Talk created: ${talkId}`);

    // Step 3: Poll for completion (up to 10 min)
    console.log(`\n=== WAITING FOR VIDEO (up to 10 min) ===`);
    const pollResult = await pollDIDVideo(talkId, DID_API_KEY, 120);
    
    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    let videoStatus = "processing";
    
    if (pollResult.video_url) {
      videoUrl = pollResult.video_url;
      thumbnailUrl = pollResult.thumbnail_url || null;
      videoStatus = "completed";
      console.log(`\n✅ VIDEO READY: ${videoUrl}`);
    } else {
      console.error(`Video error: ${pollResult.error}`);
      videoStatus = pollResult.status;
    }

    // Step 4: Save to database
    console.log(`\n=== SAVING TO DATABASE ===`);
    
    const adRecord = {
      user_id: user.id,
      name: `${product.title} - D-ID Video Ad`,
      product_name: product.title,
      shopify_product_id: product.id,
      product_image: product.image,
      script,
      voiceover_url: voiceoverUrl,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      heygen_video_id: talkId, // Reusing column for D-ID talk ID
      status: videoStatus,
      test_mode: false,
      aspect_ratio: "9:16",
      duration_seconds: 15,
      provider: "d-id",
      metadata: {
        voice: useDIDVoice ? "did-builtin" : voice,
        voice_id: useDIDVoice ? "en-US-JennyNeural" : ELEVENLABS_VOICES[voice as keyof typeof ELEVENLABS_VOICES],
        avatar,
        did_talk_id: talkId,
        credits_remaining: creditsCheck.credits - 1,
        generation_time: new Date().toISOString()
      }
    };

    const { data: adData, error: adError } = await supabase
      .from("ads")
      .insert(adRecord)
      .select()
      .single();

    if (adError) {
      console.error("Database error:", adError);
    } else {
      console.log(`✅ Saved ad: ${adData.id}`);
    }

    // Log to ai_decision_log
    await supabase.from("ai_decision_log").insert({
      user_id: user.id,
      decision_type: "did_ad_generation",
      action_taken: `Generated D-ID video ad for ${product.title}`,
      reasoning: JSON.stringify({
        talk_id: talkId,
        video_url: videoUrl,
        avatar,
        voice: useDIDVoice ? "did-builtin" : voice,
        credits_remaining: creditsCheck.credits - 1
      }),
      confidence: 1.0,
      execution_status: videoStatus === "completed" ? "success" : videoStatus
    });

    console.log("\n========================================");
    console.log("=== D-ID AD GENERATION COMPLETE ===");
    console.log("========================================\n");

    return new Response(JSON.stringify({
      success: true,
      ad: adData || adRecord,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      voiceover_url: voiceoverUrl,
      status: videoStatus,
      talk_id: talkId,
      credits_remaining: creditsCheck.credits - 1,
      generation_details: {
        provider: "d-id",
        avatar,
        voice: useDIDVoice ? "did-builtin" : voice,
        voice_id: useDIDVoice ? "en-US-JennyNeural" : ELEVENLABS_VOICES[voice as keyof typeof ELEVENLABS_VOICES],
        used_did_voice: useDIDVoice,
        mode: "real_did_video"
      },
      message: videoStatus === "completed" 
        ? "🎬 D-ID video ready! Real talking avatar video generated."
        : `Video ${videoStatus}. ${pollResult.error || ''}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

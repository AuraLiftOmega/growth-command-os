import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * FORCE D-ID Video Generation - No Credit Checks, No Fallbacks
 * 
 * Generates REAL D-ID video for Radiance Vitamin C Serum
 * Uses Amy/Anna/Emma avatars + ElevenLabs Sarah voice
 * Bypasses all credit checks - force generation
 */

// Premium skincare script
const RADIANCE_SCRIPT = `Your skin deserves to glow. Introducing Radiance Vitamin C Serum from AuraLift Essentials. 
Our premium formula brightens dark spots, fights aging, and leaves you with luminous, radiant skin in just weeks. 
Powered by pure Vitamin C and hyaluronic acid. Real results, real glow. 
Shop now at auraliftessentials.com. Your radiant transformation starts today!`;

// ElevenLabs voice - Sarah (warm female)
const SARAH_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

// D-ID presenter source images
const DID_AVATARS: Record<string, string> = {
  amy: "https://create-images-results.d-id.com/DefaultPresenters/amy_1.jpg",
  anna: "https://create-images-results.d-id.com/DefaultPresenters/anna_1.jpg", 
  emma: "https://create-images-results.d-id.com/DefaultPresenters/emma_1.jpg",
};

// Poll for video completion - up to 10 min
async function pollDIDVideo(
  talkId: string, 
  apiKey: string
): Promise<{ video_url?: string; thumbnail_url?: string; status: string; error?: string }> {
  console.log(`=== POLLING D-ID VIDEO: ${talkId} ===`);
  
  const maxAttempts = 120; // 10 minutes
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Poll ${attempt}/${maxAttempts}...`);
    
    try {
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
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      const data = await response.json();
      console.log(`Status: ${data.status}`);
      
      if (data.status === "done" && data.result_url) {
        console.log(`✅ VIDEO READY: ${data.result_url}`);
        return { 
          video_url: data.result_url, 
          thumbnail_url: data.thumbnail_url, 
          status: "completed" 
        };
      } else if (data.status === "error" || data.status === "rejected") {
        return { status: "failed", error: data.error?.description || "Generation failed" };
      }
      
      await new Promise(r => setTimeout(r, 5000));
    } catch (err) {
      console.error(`Poll error:`, err);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  
  return { status: "timeout", error: "Timed out after 10 minutes" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("\n" + "=".repeat(60));
  console.log("🚀 FORCE D-ID GENERATION - NO CREDIT CHECKS");
  console.log("=".repeat(60));

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

    const { avatar = "amy" } = await req.json();

    // Get API keys - REQUIRED
    const DID_API_KEY = Deno.env.get("DID_API_KEY");
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!DID_API_KEY) {
      throw new Error("DID_API_KEY not configured - cannot proceed");
    }

    console.log(`\n📦 Product: Radiance Vitamin C Serum`);
    console.log(`🎭 Avatar: ${avatar}`);
    console.log(`🎤 Voice: Sarah (ElevenLabs)`);

    // ===== STEP 1: Generate ElevenLabs Voiceover =====
    console.log(`\n=== STEP 1: ELEVENLABS VOICEOVER ===`);
    
    let voiceoverUrl: string | null = null;
    let useDIDVoice = false;

    if (ELEVENLABS_API_KEY) {
      try {
        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${SARAH_VOICE_ID}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: RADIANCE_SCRIPT,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.5,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          console.log(`✅ Voiceover generated: ${audioBuffer.byteLength} bytes`);
          
          // Upload to Supabase Storage
          const fileName = `force_did_voiceover_${Date.now()}.mp3`;
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
            console.log(`✅ Voiceover uploaded: ${voiceoverUrl}`);
          } else {
            console.error(`Upload failed:`, uploadError);
            useDIDVoice = true;
          }
        } else {
          console.warn(`ElevenLabs failed: ${ttsResponse.status}`);
          useDIDVoice = true;
        }
      } catch (err) {
        console.error(`ElevenLabs error:`, err);
        useDIDVoice = true;
      }
    } else {
      console.log(`⚠️ No ElevenLabs key - using D-ID voice`);
      useDIDVoice = true;
    }

    // ===== STEP 2: Create D-ID Video =====
    console.log(`\n=== STEP 2: D-ID VIDEO GENERATION ===`);
    
    const sourceUrl = DID_AVATARS[avatar] || DID_AVATARS.amy;
    console.log(`Source image: ${sourceUrl}`);
    console.log(`Voice source: ${useDIDVoice ? 'D-ID Microsoft' : 'ElevenLabs audio'}`);

    let didPayload: any;
    
    if (useDIDVoice || !voiceoverUrl) {
      didPayload = {
        source_url: sourceUrl,
        script: {
          type: "text",
          input: RADIANCE_SCRIPT,
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

    console.log(`D-ID payload:`, JSON.stringify(didPayload, null, 2));

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
    console.log(`Response: ${responseText}`);

    if (!didResponse.ok && didResponse.status !== 201) {
      throw new Error(`D-ID API error: ${didResponse.status} - ${responseText}`);
    }

    const didData = JSON.parse(responseText);
    const talkId = didData.id;
    console.log(`✅ Talk created: ${talkId}`);

    // ===== STEP 3: Poll for Completion =====
    console.log(`\n=== STEP 3: WAITING FOR VIDEO (up to 10 min) ===`);
    const pollResult = await pollDIDVideo(talkId, DID_API_KEY);

    if (!pollResult.video_url) {
      throw new Error(`Video generation failed: ${pollResult.error}`);
    }

    console.log(`\n🎬 VIDEO COMPLETED: ${pollResult.video_url}`);

    // ===== STEP 4: Save to Database =====
    console.log(`\n=== STEP 4: SAVING TO ADS TABLE ===`);
    
    const adRecord = {
      user_id: user.id,
      name: `Radiance Vitamin C Serum - D-ID Force Gen`,
      product_name: "Radiance Vitamin C Serum",
      shopify_product_id: "10511372452145",
      product_image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
      script: RADIANCE_SCRIPT,
      voiceover_url: voiceoverUrl,
      video_url: pollResult.video_url,
      thumbnail_url: pollResult.thumbnail_url,
      heygen_video_id: talkId,
      status: "completed",
      test_mode: false,
      aspect_ratio: "9:16",
      duration_seconds: 20,
      provider: "d-id",
      metadata: {
        voice: useDIDVoice ? "did-microsoft" : "elevenlabs-sarah",
        voice_id: useDIDVoice ? "en-US-JennyNeural" : SARAH_VOICE_ID,
        avatar,
        did_talk_id: talkId,
        force_generated: true,
        generation_time: new Date().toISOString()
      }
    };

    const { data: adData, error: adError } = await supabase
      .from("ads")
      .insert(adRecord)
      .select()
      .single();

    if (adError) {
      console.error(`Database error:`, adError);
      throw new Error(`Failed to save ad: ${adError.message}`);
    }

    console.log(`✅ Ad saved: ${adData.id}`);

    // Log decision
    await supabase.from("ai_decision_log").insert({
      user_id: user.id,
      decision_type: "force_did_generation",
      action_taken: `Force-generated D-ID video for Radiance Vitamin C Serum`,
      reasoning: JSON.stringify({
        talk_id: talkId,
        video_url: pollResult.video_url,
        avatar,
        voice: useDIDVoice ? "did-microsoft" : "elevenlabs-sarah",
      }),
      confidence: 1.0,
      execution_status: "success"
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ FORCE GENERATION COMPLETE");
    console.log("=".repeat(60));

    return new Response(JSON.stringify({
      success: true,
      ad_id: adData.id,
      video_url: pollResult.video_url,
      thumbnail_url: pollResult.thumbnail_url,
      talk_id: talkId,
      avatar,
      voice: useDIDVoice ? "did-microsoft" : "elevenlabs-sarah",
      product: "Radiance Vitamin C Serum"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Force generation failed";
    console.error("❌ FORCE GENERATION ERROR:", error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

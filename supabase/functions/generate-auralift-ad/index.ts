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

    const { 
      product_handle, 
      product_id,
      test_mode = false,
      voice = "sarah",
      avatar = "susan"
    } = await req.json();

    // Find product by handle or ID
    let product: { handle: string; id: string; title: string; description: string; image: string; price: string } | null = null;
    const productHandles = Object.keys(AURALIFT_PRODUCTS) as Array<keyof typeof AURALIFT_PRODUCTS>;
    
    if (product_handle && productHandles.includes(product_handle)) {
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
    } else {
      // Default to first product
      const firstHandle = productHandles[0];
      product = { handle: firstHandle, ...AURALIFT_PRODUCTS[firstHandle] };
    }

    if (!product) {
      throw new Error("Product not found");
    }

    // Generate the ad script
    const script = `Discover ${product.title} from AuraLift Essentials. ${product.description}. Radiant, hydrated, youthful skin. Shop now at auraliftessentials.com!`;

    console.log(`Generating ad for: ${product.title}, test_mode: ${test_mode}`);

    // Step 1: Generate voiceover with ElevenLabs
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    const voiceKey = (voice as keyof typeof ELEVENLABS_VOICES) || 'sarah';
    const voiceId = ELEVENLABS_VOICES[voiceKey] || ELEVENLABS_VOICES.sarah;
    
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
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("ElevenLabs error:", errorText);
      throw new Error(`ElevenLabs TTS failed: ${ttsResponse.status}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    
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

    let heygenVideoId = null;
    let videoStatus = test_mode ? "voiceover_only" : "processing";

    // Step 2: If not test mode, generate HeyGen video
    if (!test_mode) {
      const HEYGEN_API_KEY = Deno.env.get("HEYGEN_API_KEY");
      if (!HEYGEN_API_KEY) {
        console.warn("HEYGEN_API_KEY not configured, falling back to voiceover only");
        videoStatus = "voiceover_only";
      } else {
        try {
          const heygenResponse = await fetch("https://api.heygen.com/v2/video/generate", {
            method: "POST",
            headers: {
              "X-Api-Key": HEYGEN_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              video_inputs: [{
                character: {
                  type: "avatar",
                  avatar_id: "Susan_public_2_20240328", // Professional female avatar
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
              test: false,
            }),
          });

          if (heygenResponse.ok) {
            const heygenData = await heygenResponse.json();
            heygenVideoId = heygenData.data?.video_id;
            console.log("HeyGen video created:", heygenVideoId);
          } else {
            const errorText = await heygenResponse.text();
            console.error("HeyGen error:", errorText);
            videoStatus = "voiceover_only";
          }
        } catch (heygenError) {
          console.error("HeyGen request failed:", heygenError);
          videoStatus = "voiceover_only";
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
        heygen_video_id: heygenVideoId,
        status: videoStatus,
        test_mode,
        aspect_ratio: "9:16",
        duration_seconds: 15,
        metadata: {
          voice,
          avatar,
          product_handle: product.handle,
          generated_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (adError) {
      console.error("Database error:", adError);
      throw new Error("Failed to save ad");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: test_mode 
          ? "🎤 Voiceover generated successfully!" 
          : "🎬 AI Video ad is generating...",
        ad: adData,
        voiceover_url: voiceoverUrl,
        heygen_video_id: heygenVideoId,
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
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
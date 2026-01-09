/**
 * GENERATE AI AD - Full Video Ad Pipeline
 * 
 * Combines ElevenLabs voiceover + HeyGen avatar video
 * Saves to ads table with full metadata
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice options
const VOICE_IDS = {
  sarah: 'EXAVITQu4vr4xnSDxMaL',
  laura: 'FGY2WhTYpPnrIDTdsKH5',
  jessica: 'cgSgspJ2msm6clMCkdW9',
  lily: 'pFZP5JQG7iQjIQuC4Bku',
};

// Avatar options
const AVATARS = {
  kristin: 'Kristin_public_3_20240108',
  angela: 'Angela_public_4_20240125',
  susan: 'Susan_public_2_20240328',
  monica: 'Monica_public_2_20240108',
};

interface AdRequest {
  product_name: string;
  product_image?: string;
  script: string;
  voice?: 'sarah' | 'laura' | 'jessica' | 'lily';
  avatar?: 'kristin' | 'angela' | 'susan' | 'monica';
  aspect_ratio?: '9:16' | '16:9' | '1:1';
  duration?: number;
  test_mode?: boolean;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    const heygenKey = Deno.env.get('HEYGEN_API_KEY');

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) userId = user.id;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: AdRequest = await req.json();
    const { 
      product_name, 
      product_image, 
      script, 
      voice = 'sarah',
      avatar = 'susan',
      aspect_ratio = '9:16',
      duration = 15,
      test_mode = false
    } = body;

    if (!script || !product_name) {
      return new Response(
        JSON.stringify({ error: 'product_name and script are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎬 Generating AI Ad:', { product_name, voice, avatar, test_mode });

    // Step 1: Generate voiceover with ElevenLabs
    let voiceoverBase64: string | null = null;
    let voiceoverUrl: string | null = null;

    if (elevenLabsKey) {
      console.log('🎤 Generating ElevenLabs voiceover...');
      
      const voiceId = VOICE_IDS[voice] || VOICE_IDS.sarah;
      
      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': elevenLabsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: script,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true
            }
          }),
        }
      );

      if (ttsResponse.ok) {
        const audioBuffer = await ttsResponse.arrayBuffer();
        voiceoverBase64 = base64Encode(audioBuffer);
        voiceoverUrl = `data:audio/mpeg;base64,${voiceoverBase64}`;
        console.log('✅ Voiceover generated successfully');
      } else {
        console.error('ElevenLabs error:', await ttsResponse.text());
      }
    }

    // Step 2: Generate video with HeyGen
    let heygenVideoId: string | null = null;
    let videoStatus = 'pending';

    if (heygenKey && !test_mode) {
      console.log('🎥 Creating HeyGen avatar video...');
      
      const avatarId = AVATARS[avatar] || AVATARS.susan;
      
      const videoPayload = {
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: avatarId,
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: 'en-US-JennyNeural'
            },
            background: product_image 
              ? { type: 'image', url: product_image }
              : { type: 'color', value: '#f8f4ff' }
          }
        ],
        dimension: aspect_ratio === '9:16' 
          ? { width: 1080, height: 1920 }
          : aspect_ratio === '1:1'
            ? { width: 1080, height: 1080 }
            : { width: 1920, height: 1080 },
        test: false
      };

      const heygenResponse = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'X-Api-Key': heygenKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoPayload)
      });

      if (heygenResponse.ok) {
        const heygenData = await heygenResponse.json();
        heygenVideoId = heygenData.data?.video_id;
        videoStatus = 'processing';
        console.log('✅ HeyGen video started:', heygenVideoId);
      } else {
        console.error('HeyGen error:', await heygenResponse.text());
      }
    }

    // Step 3: Save to ads table
    const adName = `${product_name} - AI Ad`;
    
    const { data: ad, error: insertError } = await supabase
      .from('ads')
      .insert({
        user_id: userId,
        name: adName,
        product_name,
        product_image,
        script,
        voiceover_url: voiceoverUrl,
        avatar_id: AVATARS[avatar] || AVATARS.susan,
        voice_id: VOICE_IDS[voice] || VOICE_IDS.sarah,
        aspect_ratio,
        duration_seconds: duration,
        status: test_mode ? 'test' : videoStatus,
        provider: 'heygen',
        heygen_video_id: heygenVideoId,
        test_mode,
        metadata: {
          voice_name: voice,
          avatar_name: avatar,
          generated_at: new Date().toISOString(),
          has_voiceover: !!voiceoverBase64,
          has_video: !!heygenVideoId
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save ad');
    }

    // Log AI decision
    await supabase.from('ai_decision_log').insert({
      user_id: userId,
      decision_type: 'ai_ad_generation',
      action_taken: `Generated AI ad for ${product_name}`,
      reasoning: `ElevenLabs voiceover (${voice}) + HeyGen avatar (${avatar}) for 9:16 vertical video`,
      confidence: 0.95,
      execution_status: videoStatus === 'processing' ? 'in_progress' : 'completed',
      entity_type: 'ad',
      entity_id: ad.id
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        ad: {
          id: ad.id,
          name: adName,
          product_name,
          status: ad.status,
          heygen_video_id: heygenVideoId,
          has_voiceover: !!voiceoverBase64,
          voiceover_url: voiceoverUrl,
          test_mode
        },
        message: test_mode 
          ? '✅ Test ad created with voiceover preview'
          : heygenVideoId 
            ? '🎬 AI Ad generation started! Video ready in 2-5 minutes.'
            : '⚠️ Voiceover generated but HeyGen video failed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Ad generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Ad generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

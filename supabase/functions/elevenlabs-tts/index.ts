/**
 * ELEVENLABS TTS - Text-to-Speech Voice Generation
 * 
 * Generates high-quality voiceovers for video ads using ElevenLabs
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ElevenLabs voice IDs - warm female voices for skincare ads
const VOICE_IDS = {
  sarah: 'EXAVITQu4vr4xnSDxMaL', // Warm, engaging female
  laura: 'FGY2WhTYpPnrIDTdsKH5', // Professional female
  jessica: 'cgSgspJ2msm6clMCkdW9', // Friendly female
  lily: 'pFZP5JQG7iQjIQuC4Bku', // Soft, elegant female
  alice: 'Xb7hH8MSUJpSbSDYk0k2', // Clear, confident female
};

interface TTSRequest {
  action: 'generate' | 'list_voices';
  text?: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
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
    
    if (!elevenLabsKey) {
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key not configured',
          requires_key: true,
          secret_name: 'ELEVENLABS_API_KEY'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: TTSRequest = await req.json();
    const { action, text, voice_id, model_id, voice_settings } = body;

    switch (action) {
      case 'list_voices': {
        return new Response(
          JSON.stringify({ 
            success: true, 
            voices: Object.entries(VOICE_IDS).map(([name, id]) => ({
              id,
              name: name.charAt(0).toUpperCase() + name.slice(1),
              description: `${name.charAt(0).toUpperCase() + name.slice(1)} - Warm female voice`
            }))
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'generate': {
        if (!text) {
          return new Response(
            JSON.stringify({ error: 'Text is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Use Sarah as default warm female voice
        const selectedVoiceId = voice_id || VOICE_IDS.sarah;
        
        // Voice settings for smooth, professional sound
        const settings = {
          stability: voice_settings?.stability ?? 0.5,
          similarity_boost: voice_settings?.similarity_boost ?? 0.75,
          style: voice_settings?.style ?? 0.5,
          use_speaker_boost: voice_settings?.use_speaker_boost ?? true
        };

        console.log('🎤 Generating ElevenLabs TTS:', { 
          voiceId: selectedVoiceId, 
          textLength: text.length 
        });

        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': elevenLabsKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              model_id: model_id || 'eleven_multilingual_v2',
              voice_settings: settings
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('ElevenLabs error:', errorText);
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const base64Audio = base64Encode(audioBuffer);

        return new Response(
          JSON.stringify({ 
            success: true,
            audio_base64: base64Audio,
            content_type: 'audio/mpeg',
            voice_id: selectedVoiceId,
            duration_estimate: Math.ceil(text.length / 15) // ~15 chars per second
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'TTS failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

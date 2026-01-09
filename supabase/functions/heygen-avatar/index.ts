/**
 * HEYGEN AVATAR - AI Talking Avatar Video Generation
 * 
 * Creates realistic talking-head videos with product presentations
 * Uses HeyGen API for professional spokesperson videos
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HeyGenRequest {
  action: 'create_video' | 'check_status' | 'list_avatars';
  video_id?: string;
  script?: string;
  avatar_id?: string;
  voice_id?: string;
  product_name?: string;
  product_image?: string;
  background?: 'studio' | 'transparent' | 'custom';
  aspect_ratio?: '16:9' | '9:16' | '1:1';
}

const HEYGEN_API_BASE = 'https://api.heygen.com/v2';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const heygenKey = Deno.env.get('HEYGEN_API_KEY');
    
    if (!heygenKey) {
      return new Response(
        JSON.stringify({ 
          error: 'HeyGen API key not configured',
          requires_key: true,
          secret_name: 'HEYGEN_API_KEY'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: HeyGenRequest = await req.json();
    const { action, video_id, script, avatar_id, voice_id, product_name, product_image, background = 'studio', aspect_ratio = '9:16' } = body;

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) userId = user.id;
    }

    const headers = {
      'X-Api-Key': heygenKey,
      'Content-Type': 'application/json'
    };

    switch (action) {
      case 'list_avatars': {
        // Get available avatars
        const response = await fetch(`${HEYGEN_API_BASE}/avatars`, { headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to list avatars');
        }

        // Filter for best beauty/skincare presenters
        const recommendedAvatars = data.data?.avatars?.filter((a: any) => 
          a.gender === 'female' || a.tags?.includes('professional')
        ).slice(0, 10) || [];

        return new Response(
          JSON.stringify({ 
            success: true, 
            avatars: recommendedAvatars,
            total: data.data?.avatars?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_video': {
        if (!script) {
          return new Response(
            JSON.stringify({ error: 'Script is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Default to a professional female avatar if not specified
        const selectedAvatar = avatar_id || 'Kristin_public_3_20240108';
        const selectedVoice = voice_id || 'en-US-JennyNeural';

        // Build video request
        const videoPayload = {
          video_inputs: [
            {
              character: {
                type: 'avatar',
                avatar_id: selectedAvatar,
                avatar_style: 'normal'
              },
              voice: {
                type: 'text',
                input_text: script,
                voice_id: selectedVoice
              },
              background: background === 'transparent' 
                ? { type: 'transparent' }
                : background === 'custom' && product_image
                  ? { type: 'image', url: product_image }
                  : { type: 'color', value: '#f8f4ff' } // Soft purple studio
            }
          ],
          dimension: aspect_ratio === '9:16' 
            ? { width: 1080, height: 1920 }
            : aspect_ratio === '1:1'
              ? { width: 1080, height: 1080 }
              : { width: 1920, height: 1080 },
          aspect_ratio: null,
          test: false
        };

        console.log('🎬 Creating HeyGen video:', { avatar: selectedAvatar, scriptLength: script.length });

        const response = await fetch(`${HEYGEN_API_BASE}/video/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify(videoPayload)
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('HeyGen error:', data);
          throw new Error(data.message || 'Failed to create video');
        }

        const heygenVideoId = data.data?.video_id;

        // Store in creatives table
        if (userId && heygenVideoId) {
          await supabase.from('creatives').insert({
            user_id: userId,
            name: `HeyGen: ${product_name || 'Avatar Video'}`,
            platform: 'tiktok', // Default to TikTok for vertical
            status: 'generating',
            script,
            generation_provider: 'heygen',
            style: 'avatar',
            render_status: 'processing',
            render_progress: 10,
            prompt_spec: {
              heygen_video_id: heygenVideoId,
              avatar_id: selectedAvatar,
              voice_id: selectedVoice,
              product_name,
              product_image
            }
          });

          // Log decision
          await supabase.from('ai_decision_log').insert({
            user_id: userId,
            decision_type: 'heygen_generation',
            action_taken: `Creating HeyGen avatar video for ${product_name || 'product'}`,
            reasoning: 'AI talking avatar for 10x engagement on social platforms',
            confidence: 0.92,
            execution_status: 'in_progress',
            entity_type: 'heygen_video',
            entity_id: heygenVideoId
          });
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            video_id: heygenVideoId,
            status: 'processing',
            message: '🎬 HeyGen avatar video generation started. Check status in ~2-5 minutes.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_status': {
        if (!video_id) {
          return new Response(
            JSON.stringify({ error: 'video_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const response = await fetch(`${HEYGEN_API_BASE}/video_status.get?video_id=${video_id}`, { headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to check status');
        }

        const status = data.data?.status;
        const videoUrl = data.data?.video_url;
        const thumbnailUrl = data.data?.thumbnail_url;
        const duration = data.data?.duration;

        // If completed, update the creative
        if (status === 'completed' && videoUrl && userId) {
          await supabase
            .from('creatives')
            .update({
              video_url: videoUrl,
              thumbnail_url: thumbnailUrl,
              duration_seconds: duration,
              status: 'ready_to_publish',
              render_status: 'completed',
              render_progress: 100
            })
            .match({ 
              user_id: userId,
              generation_provider: 'heygen'
            })
            .order('created_at', { ascending: false })
            .limit(1);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            status,
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl,
            duration,
            progress: status === 'completed' ? 100 : status === 'processing' ? 50 : 10
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
    console.error('HeyGen error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'HeyGen failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

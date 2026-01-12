/**
 * POST TO CHANNEL - Upload videos to connected social channels
 * 
 * Supports: TikTok, Instagram, Facebook, YouTube, Pinterest, Twitter, LinkedIn
 * Uses stored OAuth tokens from social_tokens table
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Channel-specific API endpoints
const CHANNEL_APIS = {
  tiktok: {
    upload: 'https://open.tiktokapis.com/v2/post/publish/video/init/',
    status: 'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
  },
  instagram: {
    container: 'https://graph.facebook.com/v19.0/{ig-user-id}/media',
    publish: 'https://graph.facebook.com/v19.0/{ig-user-id}/media_publish',
  },
  facebook: {
    video: 'https://graph.facebook.com/v19.0/{page-id}/videos',
  },
  youtube: {
    upload: 'https://www.googleapis.com/upload/youtube/v3/videos',
    metadata: 'https://www.googleapis.com/youtube/v3/videos',
  },
  pinterest: {
    pin: 'https://api.pinterest.com/v5/pins',
  },
  twitter: {
    media: 'https://upload.twitter.com/1.1/media/upload.json',
    tweet: 'https://api.twitter.com/2/tweets',
  },
  linkedin: {
    ugc: 'https://api.linkedin.com/v2/ugcPosts',
    assets: 'https://api.linkedin.com/v2/assets',
  },
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      channel, 
      platform, // Support both 'channel' and 'platform' params
      video_url, 
      caption, 
      hashtags, 
      creative_id,
      ad_id,
      schedule_time,
      metadata 
    } = body;

    // Use channel or platform (support both naming conventions)
    const targetChannel = channel || platform;
    
    if (!targetChannel) {
      console.error('[post-to-channel] Missing channel/platform parameter:', JSON.stringify(body));
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: channel or platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[post-to-channel] Posting to ${targetChannel}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get stored token for channel (check both social_tokens and platform_accounts)
    const { data: tokenData, error: tokenError } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('channel', targetChannel)
      .eq('is_connected', true)
      .single();

    // Also check platform_accounts as fallback
    let platformData = null;
    if (tokenError || !tokenData) {
      const { data: pData } = await supabase
        .from('platform_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', targetChannel)
        .eq('is_connected', true)
        .single();
      platformData = pData;
    }

    if ((tokenError || !tokenData?.access_token_encrypted) && !platformData) {
      return new Response(
        JSON.stringify({ error: `Not connected to ${targetChannel}. Please connect your account first.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = tokenData?.access_token_encrypted || platformData?.access_token;
    const fullCaption = hashtags ? `${caption}\n\n${hashtags}` : caption;

    let postResult: any = { success: false };

    // Channel-specific posting logic
    switch (targetChannel) {
      case 'tiktok': {
        // TikTok Video Upload API
        const initResponse = await fetch(CHANNEL_APIS.tiktok.upload, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post_info: {
              title: caption.substring(0, 150),
              privacy_level: 'PUBLIC_TO_EVERYONE',
              disable_duet: false,
              disable_comment: false,
              disable_stitch: false,
            },
            source_info: {
              source: 'PULL_FROM_URL',
              video_url: video_url,
            },
          }),
        });

        const initData = await initResponse.json();
        
        if (initData.error?.code) {
          postResult = { success: false, error: initData.error.message };
        } else {
          postResult = { 
            success: true, 
            post_id: initData.data?.publish_id,
            status: 'processing'
          };
        }
        break;
      }

      case 'instagram': {
        // Instagram Reels upload (requires video < 60s for Reels)
        const igUserId = tokenData.account_id;
        
        // Step 1: Create media container
        const containerRes = await fetch(
          `https://graph.facebook.com/v19.0/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            media_type: 'REELS',
            video_url: video_url,
            caption: fullCaption,
            share_to_feed: true,
          }),
        });

        const containerData = await containerRes.json();
        
        if (containerData.error) {
          postResult = { success: false, error: containerData.error.message };
        } else {
          // Step 2: Publish (after processing)
          const publishRes = await fetch(
            `https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: accessToken,
              creation_id: containerData.id,
            }),
          });

          const publishData = await publishRes.json();
          postResult = { 
            success: !publishData.error, 
            post_id: publishData.id,
            error: publishData.error?.message
          };
        }
        break;
      }

      case 'facebook': {
        const pageId = tokenData.account_id;
        
        const videoRes = await fetch(
          `https://graph.facebook.com/v19.0/${pageId}/videos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            file_url: video_url,
            description: fullCaption,
          }),
        });

        const videoData = await videoRes.json();
        postResult = { 
          success: !videoData.error, 
          post_id: videoData.id,
          error: videoData.error?.message
        };
        break;
      }

      case 'youtube': {
        // YouTube requires resumable upload for videos
        // Initialize upload
        const uploadRes = await fetch(
          'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': 'video/*',
          },
          body: JSON.stringify({
            snippet: {
              title: caption.substring(0, 100) || 'Untitled',
              description: fullCaption,
              tags: hashtags?.split('#').filter(Boolean).map((t: string) => t.trim()),
              categoryId: '22', // People & Blogs
            },
            status: {
              privacyStatus: 'public',
              selfDeclaredMadeForKids: false,
            },
          }),
        });

        if (uploadRes.ok) {
          const uploadUrl = uploadRes.headers.get('location');
          postResult = { 
            success: true, 
            upload_url: uploadUrl,
            status: 'upload_initialized'
          };
        } else {
          const errorData = await uploadRes.json();
          postResult = { success: false, error: errorData.error?.message };
        }
        break;
      }

      case 'pinterest': {
        const pinRes = await fetch(CHANNEL_APIS.pinterest.pin, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            board_id: metadata?.board_id,
            media_source: {
              source_type: 'video_url',
              url: video_url,
            },
            title: caption.substring(0, 100),
            description: fullCaption,
          }),
        });

        const pinData = await pinRes.json();
        postResult = { 
          success: !pinData.code, 
          post_id: pinData.id,
          post_url: `https://pinterest.com/pin/${pinData.id}`,
          error: pinData.message
        };
        break;
      }

      case 'twitter': {
        // Twitter/X video upload is complex - requires chunked upload
        // For now, we'll just create a tweet with video URL
        const tweetRes = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: `${caption.substring(0, 250)}${hashtags ? ` ${hashtags}` : ''}`,
          }),
        });

        const tweetData = await tweetRes.json();
        postResult = { 
          success: !tweetData.errors, 
          post_id: tweetData.data?.id,
          post_url: `https://twitter.com/i/status/${tweetData.data?.id}`,
          error: tweetData.errors?.[0]?.message
        };
        break;
      }

      case 'linkedin': {
        // LinkedIn video post
        const personUrn = `urn:li:person:${tokenData.account_id}`;
        
        const ugcRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify({
            author: personUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: fullCaption },
                shareMediaCategory: 'ARTICLE',
                media: [{
                  status: 'READY',
                  originalUrl: video_url,
                }],
              },
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
          }),
        });

        const ugcData = await ugcRes.json();
        postResult = { 
          success: !ugcData.status || ugcData.status < 400, 
          post_id: ugcData.id,
          error: ugcData.message
        };
        break;
      }

      default:
        postResult = { success: false, error: 'Unsupported channel' };
    }

    // Save post record to database
    const { error: insertError } = await supabase.from('social_posts').insert({
      user_id: user.id,
      ad_id: ad_id || null,
      creative_id: creative_id || null,
      channel: targetChannel,
      post_id: postResult.post_id,
      post_url: postResult.post_url,
      status: postResult.success ? 'published' : 'failed',
      caption,
      hashtags: hashtags?.split('#').filter(Boolean).map((t: string) => t.trim().replace(/\s/g, '')),
      posted_at: postResult.success ? new Date().toISOString() : null,
      scheduled_at: schedule_time,
      error_message: postResult.error,
      metadata: { ...metadata, api_response: postResult },
    });

    if (insertError) {
      console.error('[post-to-channel] Failed to save post record:', insertError);
    }

    console.log(`[post-to-channel] ${targetChannel} post result:`, postResult.success ? 'SUCCESS' : 'FAILED');

    return new Response(
      JSON.stringify(postResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[post-to-channel] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Post failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

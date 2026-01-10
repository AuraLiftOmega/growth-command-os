/**
 * TIKTOK BUSINESS SUITE OAUTH - OAuth Handler for TikTok Business Center
 * 
 * Handles real OAuth flows for TikTok Business Suite:
 * - Authorization Code Flow with PKCE via business-api.tiktok.com
 * - Video posting, analytics, ad optimization
 * 
 * Actions: authorize, callback, refresh, revoke, post_video, get_analytics
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TikTok Business Suite OAuth Configuration
const TIKTOK_BUSINESS_CONFIG = {
  // Authorization endpoint for Business Suite
  authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
  // Token endpoint
  tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
  // API base
  apiBase: 'https://open.tiktokapis.com',
  // Required scopes for business operations
  scopes: [
    'user.info.basic',
    'video.list',
    'video.upload',
    'video.publish'
  ]
};

// Generate PKCE code verifier and challenge
function generatePKCE(): { verifier: string; challenge: string } {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  // For S256 challenge
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  
  return { verifier, challenge: verifier }; // Using plain for simplicity
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, redirect_uri, code, state, video_url, title, description, creative_id } = body;

    console.log(`[tiktok-business-oauth] Action: ${action}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    // Get TikTok Business credentials
    const clientKey = Deno.env.get('TIKTOK_BUSINESS_CLIENT_KEY') || Deno.env.get('TIKTOK_CLIENT_KEY');
    const clientSecret = Deno.env.get('TIKTOK_BUSINESS_CLIENT_SECRET') || Deno.env.get('TIKTOK_CLIENT_SECRET');

    switch (action) {
      case 'check_config': {
        return new Response(
          JSON.stringify({
            configured: !!(clientKey && clientSecret),
            missing: {
              clientKey: !clientKey,
              clientSecret: !clientSecret
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'authorize': {
        if (!clientKey || !clientSecret) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'TikTok Business OAuth not configured. Required: TIKTOK_BUSINESS_CLIENT_KEY, TIKTOK_BUSINESS_CLIENT_SECRET',
              requires_credentials: true
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!redirect_uri || !redirect_uri.startsWith('http')) {
          return new Response(
            JSON.stringify({ error: 'Invalid redirect_uri' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate state and PKCE
        const oauthState = crypto.randomUUID();
        const pkce = generatePKCE();
        
        // Store state + PKCE verifier in database
        if (userId) {
          await supabase.from('oauth_states').upsert({
            state: oauthState,
            user_id: userId,
            platform: 'tiktok_business',
            redirect_uri,
            code_verifier: pkce.verifier,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          }, { onConflict: 'state' });
        }

        // Build TikTok Business OAuth URL
        const params = new URLSearchParams({
          client_key: clientKey,
          scope: TIKTOK_BUSINESS_CONFIG.scopes.join(','),
          response_type: 'code',
          redirect_uri: redirect_uri,
          state: oauthState,
          code_challenge: pkce.challenge,
          code_challenge_method: 'plain'
        });

        const authUrl = `${TIKTOK_BUSINESS_CONFIG.authUrl}?${params.toString()}`;
        
        console.log(`[tiktok-business-oauth] Generated auth URL for TikTok Business Suite`);

        return new Response(
          JSON.stringify({ success: true, authUrl, channel: 'tiktok_business', state: oauthState }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'callback': {
        if (!code || !state) {
          return new Response(
            JSON.stringify({ error: 'Missing code or state parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify state and get PKCE verifier
        const { data: stateData, error: stateError } = await supabase
          .from('oauth_states')
          .select('*')
          .eq('state', state)
          .single();

        if (stateError || !stateData) {
          console.error('[tiktok-business-oauth] Invalid state:', stateError);
          return new Response(
            JSON.stringify({ error: 'Invalid or expired state parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Exchange code for access token
        const tokenBody = new URLSearchParams({
          client_key: clientKey!,
          client_secret: clientSecret!,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: stateData.redirect_uri,
          code_verifier: stateData.code_verifier || ''
        });

        console.log(`[tiktok-business-oauth] Exchanging code for tokens`);

        const tokenResponse = await fetch(TIKTOK_BUSINESS_CONFIG.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: tokenBody.toString()
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error || !tokenData.access_token) {
          console.error('[tiktok-business-oauth] Token error:', tokenData);
          return new Response(
            JSON.stringify({ 
              error: tokenData.error_description || tokenData.error || 'Token exchange failed'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch user info
        let userInfo = { id: tokenData.open_id, name: 'TikTok Business', avatar: null };
        try {
          const userResponse = await fetch(
            `${TIKTOK_BUSINESS_CONFIG.apiBase}/v2/user/info/?fields=open_id,display_name,avatar_url`,
            {
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
              }
            }
          );
          const userData = await userResponse.json();
          if (userData.data?.user) {
            userInfo = {
              id: userData.data.user.open_id,
              name: userData.data.user.display_name || 'TikTok Business',
              avatar: userData.data.user.avatar_url
            };
          }
        } catch (userErr) {
          console.warn('[tiktok-business-oauth] Failed to fetch user info:', userErr);
        }

        // Store tokens in social_tokens table with business_suite flag
        const { error: upsertError } = await supabase.from('social_tokens').upsert({
          user_id: stateData.user_id,
          channel: 'tiktok_business',
          access_token_encrypted: tokenData.access_token,
          refresh_token_encrypted: tokenData.refresh_token,
          expires_at: tokenData.expires_in 
            ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
            : null,
          scope: tokenData.scope || TIKTOK_BUSINESS_CONFIG.scopes.join(','),
          is_connected: true,
          account_id: userInfo.id,
          account_name: userInfo.name,
          account_avatar: userInfo.avatar,
          metadata: { 
            open_id: tokenData.open_id,
            token_type: 'tiktok_business',
            business_suite: true
          },
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,channel'
        });

        if (upsertError) {
          console.error('[tiktok-business-oauth] Failed to store tokens:', upsertError);
        }

        // Clean up state
        await supabase.from('oauth_states').delete().eq('state', state);

        console.log(`[tiktok-business-oauth] TikTok Business Suite connected for user ${stateData.user_id}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            channel: 'tiktok_business', 
            account: userInfo
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'refresh': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: tokenData } = await supabase
          .from('social_tokens')
          .select('*')
          .eq('user_id', userId)
          .eq('channel', 'tiktok_business')
          .single();

        if (!tokenData?.refresh_token_encrypted) {
          return new Response(
            JSON.stringify({ error: 'No refresh token available' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const refreshBody = new URLSearchParams({
          client_key: clientKey!,
          client_secret: clientSecret!,
          refresh_token: tokenData.refresh_token_encrypted,
          grant_type: 'refresh_token'
        });

        const refreshResponse = await fetch(TIKTOK_BUSINESS_CONFIG.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: refreshBody.toString()
        });

        const newTokens = await refreshResponse.json();

        if (newTokens.error || !newTokens.access_token) {
          await supabase
            .from('social_tokens')
            .update({ is_connected: false })
            .eq('user_id', userId)
            .eq('channel', 'tiktok_business');

          return new Response(
            JSON.stringify({ error: 'Token refresh failed', needs_reauth: true }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabase.from('social_tokens').update({
          access_token_encrypted: newTokens.access_token,
          refresh_token_encrypted: newTokens.refresh_token || tokenData.refresh_token_encrypted,
          expires_at: newTokens.expires_in 
            ? new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
            : null,
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('channel', 'tiktok_business');

        console.log(`[tiktok-business-oauth] TikTok Business tokens refreshed for user ${userId}`);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'post_video': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!video_url) {
          return new Response(
            JSON.stringify({ error: 'video_url required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: tokenData } = await supabase
          .from('social_tokens')
          .select('*')
          .eq('user_id', userId)
          .eq('channel', 'tiktok_business')
          .single();

        if (!tokenData?.access_token_encrypted || !tokenData.is_connected) {
          return new Response(
            JSON.stringify({ error: 'Not connected to TikTok Business Suite', needs_auth: true }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Step 1: Initialize video upload
        const initResponse = await fetch(
          `${TIKTOK_BUSINESS_CONFIG.apiBase}/v2/post/publish/video/init/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token_encrypted}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              post_info: {
                title: title || 'New video',
                privacy_level: 'PUBLIC_TO_EVERYONE',
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false
              },
              source_info: {
                source: 'PULL_FROM_URL',
                video_url: video_url
              }
            })
          }
        );

        const initData = await initResponse.json();

        if (initData.error?.code) {
          console.error('[tiktok-business-oauth] Video init error:', initData);
          return new Response(
            JSON.stringify({ 
              error: initData.error.message || 'Video upload failed',
              code: initData.error.code
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Log to social_posts
        await supabase.from('social_posts').insert({
          user_id: userId,
          channel: 'tiktok_business',
          creative_id: creative_id,
          post_url: null,
          external_post_id: initData.data?.publish_id,
          status: 'processing',
          caption: description || title,
          posted_at: new Date().toISOString()
        });

        // Log AI decision
        await supabase.from('ai_decision_log').insert({
          user_id: userId,
          decision_type: 'tiktok_business_post',
          action_taken: 'Initiated TikTok Business Suite video upload',
          entity_type: 'creative',
          entity_id: creative_id,
          reasoning: `Posted video to TikTok Business Suite: ${title}`,
          execution_status: 'pending'
        });

        console.log(`[tiktok-business-oauth] Video post initiated: ${initData.data?.publish_id}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            publish_id: initData.data?.publish_id,
            status: 'processing'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_analytics': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: tokenData } = await supabase
          .from('social_tokens')
          .select('*')
          .eq('user_id', userId)
          .eq('channel', 'tiktok_business')
          .single();

        if (!tokenData?.access_token_encrypted) {
          return new Response(
            JSON.stringify({ error: 'Not connected to TikTok Business Suite' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          // Get video list with analytics
          const videosResponse = await fetch(
            `${TIKTOK_BUSINESS_CONFIG.apiBase}/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,like_count,comment_count,share_count,view_count`,
            {
              headers: {
                'Authorization': `Bearer ${tokenData.access_token_encrypted}`
              }
            }
          );
          const videosData = await videosResponse.json();
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              videos: videosData.data?.videos || [],
              total_views: videosData.data?.videos?.reduce((sum: number, v: any) => sum + (v.view_count || 0), 0) || 0,
              total_likes: videosData.data?.videos?.reduce((sum: number, v: any) => sum + (v.like_count || 0), 0) || 0
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (err) {
          console.error('[tiktok-business-oauth] Analytics error:', err);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch analytics' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'revoke': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabase
          .from('social_tokens')
          .update({ 
            is_connected: false,
            access_token_encrypted: null,
            refresh_token_encrypted: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('channel', 'tiktok_business');

        console.log(`[tiktok-business-oauth] TikTok Business Suite disconnected for user ${userId}`);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (err: any) {
    console.error('[tiktok-business-oauth] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * YOUTUBE OAUTH - Data API v3 Authorization for DOMINION
 * 
 * OAuth 2.0 flow with scopes:
 * - youtube.upload: Upload videos
 * - youtube: Full account access (playlists, analytics, etc.)
 * - youtube.readonly: Read channel info
 * 
 * Supports Brand Accounts / channel selection
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID') ?? '';
const YOUTUBE_CLIENT_SECRET = Deno.env.get('YOUTUBE_CLIENT_SECRET') ?? '';

// Required scopes for full YouTube integration
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
].join(' ');

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Handle OAuth callback
    if (action === 'callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        console.error('YouTube OAuth error:', error);
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'${error}'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      if (!code || !state) {
        return new Response(
          JSON.stringify({ error: 'Missing code or state' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: YOUTUBE_CLIENT_ID,
          client_secret: YOUTUBE_CLIENT_SECRET,
          redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-oauth?action=callback`,
          grant_type: 'authorization_code'
        })
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokens);
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'Token exchange failed'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Get channel info
      const channelResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true',
        {
          headers: { 'Authorization': `Bearer ${tokens.access_token}` }
        }
      );

      const channelData = await channelResponse.json();
      const channel = channelData.items?.[0];

      if (!channel) {
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'No YouTube channel found'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Parse state to get user ID
      const { userId } = JSON.parse(atob(state));

      // Store credentials
      const credentials = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        channel_id: channel.id,
        channel_title: channel.snippet.title,
        channel_thumbnail: channel.snippet.thumbnails?.default?.url,
        subscriber_count: channel.statistics?.subscriberCount,
        video_count: channel.statistics?.videoCount,
        view_count: channel.statistics?.viewCount,
        uploads_playlist: channel.contentDetails?.relatedPlaylists?.uploads
      };

      // Upsert platform account
      await supabase.from('platform_accounts').upsert({
        user_id: userId,
        platform: 'youtube',
        is_connected: true,
        handle: `@${channel.snippet.customUrl || channel.id}`,
        credentials_encrypted: JSON.stringify(credentials),
        health_status: 'healthy',
        last_health_check: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform'
      });

      console.log('✅ YouTube connected:', channel.snippet.title);

      // Success - close popup
      return new Response(
        `<html><body><script>
          window.opener?.postMessage({
            type: 'youtube-oauth-success',
            channel: {
              id: '${channel.id}',
              title: '${channel.snippet.title}',
              thumbnail: '${channel.snippet.thumbnails?.default?.url || ''}',
              subscribers: ${channel.statistics?.subscriberCount || 0}
            }
          }, '*');
          window.close();
        </script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Start OAuth flow
    const body = await req.json().catch(() => ({}));
    const { redirect_uri, userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create state with user ID
    const state = btoa(JSON.stringify({ userId, timestamp: Date.now() }));

    // Build authorization URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', YOUTUBE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-oauth?action=callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    return new Response(
      JSON.stringify({ authUrl: authUrl.toString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('YouTube OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'OAuth failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

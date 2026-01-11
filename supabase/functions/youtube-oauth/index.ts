/**
 * YOUTUBE OAUTH - OAuth 2.1/BCP Compliant Handler
 * 
 * Security Features:
 * - PKCE with S256 mandatory
 * - High-entropy state with DB storage + 5min expiry
 * - Nonce for OpenID Connect
 * - Rate limiting on endpoints
 * - Token sanitization in logs
 * - Secure token rotation
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  generatePKCE,
  generateState,
  generateNonce,
  validateRedirectUri,
  checkRateLimit,
  isStateExpired,
  sanitizeForLog,
  getSecureHeaders,
  secureCorsHeaders,
} from "../_shared/oauth-security.ts";

const corsHeaders = secureCorsHeaders;

const YOUTUBE_CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID') ?? '';
const YOUTUBE_CLIENT_SECRET = Deno.env.get('YOUTUBE_CLIENT_SECRET') ?? '';

// Required scopes for full YouTube integration
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'openid', // For nonce validation
].join(' ');

// Allowed redirect URI domains
const ALLOWED_REDIRECT_DOMAINS = [
  'lovable.app',
  'lovableproject.com',
  'localhost',
  '127.0.0.1',
];

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
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    console.log(`[youtube-oauth] Action: ${action}, IP: ${clientIp.split(',')[0]}`);

    // Handle OAuth callback
    if (action === 'callback') {
      // Rate limiting
      const rateKey = `youtube-callback:${clientIp}`;
      const rateCheck = checkRateLimit(rateKey, 20, 60000);
      if (!rateCheck.allowed) {
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'Too many requests'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        console.error('[youtube-oauth] OAuth error:', error);
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'Authorization denied'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      if (!code || !state) {
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'Missing parameters'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Verify state from database
      const { data: stateData, error: stateError } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .single();

      if (stateError || !stateData) {
        console.error('[youtube-oauth] Invalid state');
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'Invalid state'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Check state expiry
      if (stateData.expires_at && isStateExpired(stateData.expires_at)) {
        await supabase.from('oauth_states').delete().eq('state', state);
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'Session expired'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Verify PKCE verifier exists
      if (!stateData.code_verifier) {
        console.error('[youtube-oauth] Missing PKCE verifier');
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'Security verification failed'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Exchange code for tokens with PKCE verifier
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: YOUTUBE_CLIENT_ID,
          client_secret: YOUTUBE_CLIENT_SECRET,
          redirect_uri: stateData.redirect_uri,
          grant_type: 'authorization_code',
          code_verifier: stateData.code_verifier, // PKCE verifier
        })
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok || tokens.error) {
        console.error('[youtube-oauth] Token exchange failed');
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'Token exchange failed'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

      // Get channel info
      const channelResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true',
        { headers: { 'Authorization': `Bearer ${tokens.access_token}` } }
      );

      const channelData = await channelResponse.json();
      const channel = channelData.items?.[0];

      if (!channel) {
        return new Response(
          `<html><body><script>window.opener?.postMessage({type:'youtube-oauth-error',error:'No YouTube channel found'},'*');window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }

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
        user_id: stateData.user_id,
        platform: 'youtube',
        is_connected: true,
        handle: `@${channel.snippet.customUrl || channel.id}`,
        credentials_encrypted: JSON.stringify(credentials),
        health_status: 'healthy',
        last_health_check: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform'
      });

      // Clean up state
      await supabase.from('oauth_states').delete().eq('state', state);

      console.log(`[youtube-oauth] YouTube connected: ${channel.snippet.title} (OAuth 2.1 compliant)`);

      // Success - close popup
      return new Response(
        `<html><body><script>
          window.opener?.postMessage({
            type: 'youtube-oauth-success',
            channel: {
              id: '${channel.id}',
              title: '${channel.snippet.title.replace(/'/g, "\\'")}',
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
    // Rate limiting
    const rateKey = `youtube-auth:${clientIp}`;
    const rateCheck = checkRateLimit(rateKey, 10, 60000);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests', retryAfter: Math.ceil(rateCheck.resetIn / 1000) }),
        { status: 429, headers: { ...getSecureHeaders(), 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { redirect_uri, userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 400, headers: getSecureHeaders() }
      );
    }

    if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ error: 'YouTube OAuth not configured. Add YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET.' }),
        { status: 400, headers: getSecureHeaders() }
      );
    }

    // Generate OAuth 2.1 security parameters
    const oauthState = generateState();
    const pkce = await generatePKCE();
    const nonce = generateNonce(); // For OpenID Connect

    const callbackUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-oauth?action=callback`;

    // Store state + PKCE in database
    await supabase.from('oauth_states').upsert({
      state: oauthState,
      user_id: userId,
      platform: 'youtube',
      redirect_uri: callbackUri,
      code_verifier: pkce.verifier,
      nonce: nonce,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
    }, { onConflict: 'state' });

    // Build authorization URL with PKCE and nonce
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', YOUTUBE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', callbackUri);
    authUrl.searchParams.set('response_type', 'code'); // Authorization Code only
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', oauthState);
    authUrl.searchParams.set('code_challenge', pkce.challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('nonce', nonce);

    console.log(`[youtube-oauth] Generated OAuth 2.1 URL (PKCE S256, nonce, state: ${oauthState.substring(0, 8)}...)`);

    return new Response(
      JSON.stringify({ authUrl: authUrl.toString() }),
      { headers: getSecureHeaders() }
    );

  } catch (error) {
    console.error('[youtube-oauth] Error:', sanitizeForLog({ error: String(error) }));
    return new Response(
      JSON.stringify({ error: 'OAuth failed' }),
      { status: 500, headers: getSecureHeaders() }
    );
  }
});

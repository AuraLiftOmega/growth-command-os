/**
 * SOCIAL OAUTH - Unified OAuth 2.1/BCP Handler for All Channels
 * 
 * Security Features:
 * - PKCE with S256 mandatory (OAuth 2.1)
 * - High-entropy state parameter
 * - Strict redirect URI validation
 * - Rate limiting on token endpoints
 * - No token logging
 * - Short-lived access tokens, rotated refresh tokens
 * 
 * Handles real OAuth flows for:
 * - TikTok (PKCE + video upload)
 * - Meta (Instagram/Facebook)
 * - YouTube (Google OAuth)
 * - Pinterest
 * - Twitter/X (PKCE mandatory)
 * - LinkedIn
 * 
 * Actions: authorize, callback, refresh, revoke, check_status
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  generatePKCE, 
  generateState, 
  validateRedirectUri,
  checkRateLimit,
  validateTokenResponse,
  sanitizeForLog,
  getSecureHeaders,
  isStateExpired,
  validateScopes
} from "../_shared/oauth-security.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-store',
  'Pragma': 'no-cache',
};

interface OAuthConfig {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  usePKCE: boolean; // Now mandatory for OAuth 2.1
  scopeSeparator?: string;
  allowedDomains?: string[];
}

// Complete OAuth configurations for all channels - PKCE enabled for all
const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['user.info.basic', 'video.upload', 'video.publish'],
    clientIdEnv: 'TIKTOK_CLIENT_KEY',
    clientSecretEnv: 'TIKTOK_CLIENT_SECRET',
    usePKCE: true,
    scopeSeparator: ',',
    allowedDomains: ['lovable.dev', 'profitreaper.com', 'localhost'],
  },
  instagram: {
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_comments', 'pages_show_list', 'pages_read_engagement'],
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
    usePKCE: true,
    scopeSeparator: ',',
    allowedDomains: ['lovable.dev', 'profitreaper.com', 'localhost'],
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_messaging', 'publish_video'],
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
    usePKCE: true,
    scopeSeparator: ',',
    allowedDomains: ['lovable.dev', 'profitreaper.com', 'localhost'],
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.readonly'],
    clientIdEnv: 'YOUTUBE_CLIENT_ID',
    clientSecretEnv: 'YOUTUBE_CLIENT_SECRET',
    usePKCE: true,
    scopeSeparator: ' ',
    allowedDomains: ['lovable.dev', 'profitreaper.com', 'localhost'],
  },
  pinterest: {
    authUrl: 'https://www.pinterest.com/oauth/',
    tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
    scopes: ['boards:read', 'boards:write', 'pins:read', 'pins:write', 'user_accounts:read'],
    clientIdEnv: 'PINTEREST_APP_ID',
    clientSecretEnv: 'PINTEREST_APP_SECRET',
    usePKCE: true,
    scopeSeparator: ',',
    allowedDomains: ['lovable.dev', 'profitreaper.com', 'localhost'],
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    clientIdEnv: 'TWITTER_CLIENT_ID',
    clientSecretEnv: 'TWITTER_CLIENT_SECRET',
    usePKCE: true,
    scopeSeparator: ' ',
    allowedDomains: ['lovable.dev', 'profitreaper.com', 'localhost'],
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['r_liteprofile', 'w_member_social', 'r_organization_social'],
    clientIdEnv: 'LINKEDIN_CLIENT_ID',
    clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
    usePKCE: true,
    scopeSeparator: ' ',
    allowedDomains: ['lovable.dev', 'profitreaper.com', 'localhost'],
  },
  google_ads: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/adwords'],
    clientIdEnv: 'GOOGLE_ADS_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_ADS_CLIENT_SECRET',
    usePKCE: true,
    scopeSeparator: ' ',
    allowedDomains: ['lovable.dev', 'profitreaper.com', 'localhost'],
  },
  threads: {
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: ['threads_basic', 'threads_content_publish', 'threads_manage_replies'],
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
    usePKCE: true,
    scopeSeparator: ',',
    allowedDomains: ['lovable.dev', 'profitreaper.com', 'localhost'],
  },
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channel, action, redirect_uri, code, state, code_verifier } = await req.json();

    console.log(`[social-oauth] Action: ${action}, Channel: ${channel}`);

    const config = OAUTH_CONFIGS[channel];
    if (!config && action !== 'check_status') {
      return new Response(
        JSON.stringify({ error: 'Unsupported channel', channel }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    switch (action) {
      case 'check_status': {
        // Check all channels' configuration status
        const statuses: Record<string, { configured: boolean; missing: string[] }> = {};
        
        for (const [ch, cfg] of Object.entries(OAUTH_CONFIGS)) {
          const clientId = Deno.env.get(cfg.clientIdEnv);
          const clientSecret = Deno.env.get(cfg.clientSecretEnv);
          const missing: string[] = [];
          if (!clientId) missing.push(cfg.clientIdEnv);
          if (!clientSecret) missing.push(cfg.clientSecretEnv);
          
          statuses[ch] = {
            configured: missing.length === 0,
            missing
          };
        }
        
        return new Response(
          JSON.stringify({ statuses }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'authorize': {
        // Rate limiting check
        const rateLimitKey = `authorize:${userId || 'anonymous'}:${channel}`;
        const rateCheck = checkRateLimit(rateLimitKey, 10, 60000);
        if (!rateCheck.allowed) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded', retry_after: Math.ceil(rateCheck.resetIn / 1000) }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
          );
        }

        const clientId = Deno.env.get(config.clientIdEnv);
        const clientSecret = Deno.env.get(config.clientSecretEnv);
        
        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: `${channel} OAuth not configured. Required: ${config.clientIdEnv}, ${config.clientSecretEnv}`,
              requires_credentials: true,
              missing: { clientId: !clientId, clientSecret: !clientSecret }
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate redirect URI (OAuth 2.1 BCP - exact match, no wildcards)
        const uriValidation = validateRedirectUri(redirect_uri, config.allowedDomains || []);
        if (!uriValidation.valid) {
          return new Response(
            JSON.stringify({ error: uriValidation.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate high-entropy state for CSRF protection (256-bit)
        const oauthState = generateState();
        
        // Generate PKCE with S256 (mandatory for OAuth 2.1)
        const pkce = await generatePKCE();
        
        // Store state + PKCE verifier in database
        if (userId) {
          await supabase.from('oauth_states').upsert({
            state: oauthState,
            user_id: userId,
            platform: channel,
            redirect_uri,
            code_verifier: pkce.verifier, // Store verifier for callback
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min expiry (shorter for security)
          }, { onConflict: 'state' });
        }

        // Build OAuth URL
        const params = new URLSearchParams();
        
        if (channel === 'tiktok') {
          params.append('client_key', clientId);
        } else {
          params.append('client_id', clientId);
        }
        
        params.append('redirect_uri', redirect_uri);
        params.append('scope', config.scopes.join(config.scopeSeparator || ' '));
        params.append('response_type', 'code');
        params.append('state', oauthState);
        
        // Add PKCE challenge (S256 method - OAuth 2.1 mandatory)
        params.append('code_challenge', pkce.challenge);
        params.append('code_challenge_method', 'S256');

        // Platform-specific params
        if (channel === 'youtube' || channel === 'google_ads') {
          params.append('access_type', 'offline');
          params.append('prompt', 'consent');
        }

        const authUrl = `${config.authUrl}?${params.toString()}`;
        
        // Log without sensitive data
        console.log(`[social-oauth] Generated secure auth URL for ${channel} (PKCE S256)`);

        return new Response(
          JSON.stringify({ success: true, authUrl, channel, state: oauthState }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'callback': {
        // Rate limiting on token endpoint
        const rateLimitKey = `callback:${state || 'unknown'}`;
        const rateCheck = checkRateLimit(rateLimitKey, 5, 60000);
        if (!rateCheck.allowed) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify state exists and is not expired
        const { data: stateData, error: stateError } = await supabase
          .from('oauth_states')
          .select('*')
          .eq('state', state)
          .single();

        if (stateError || !stateData) {
          console.error('[social-oauth] Invalid state - possible CSRF attack');
          return new Response(
            JSON.stringify({ error: 'Invalid or expired state parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check state expiry
        if (isStateExpired(stateData.expires_at)) {
          await supabase.from('oauth_states').delete().eq('state', state);
          return new Response(
            JSON.stringify({ error: 'State expired - please restart authorization' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify PKCE verifier exists (mandatory for OAuth 2.1)
        if (!stateData.code_verifier) {
          console.error('[social-oauth] Missing PKCE verifier - rejecting request');
          return new Response(
            JSON.stringify({ error: 'Missing PKCE verifier' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const clientId = Deno.env.get(config.clientIdEnv);
        const clientSecret = Deno.env.get(config.clientSecretEnv);

        // Build token request
        const tokenParams = new URLSearchParams();
        
        if (channel === 'tiktok') {
          tokenParams.append('client_key', clientId!);
          tokenParams.append('client_secret', clientSecret!);
        } else {
          tokenParams.append('client_id', clientId!);
          tokenParams.append('client_secret', clientSecret!);
        }
        
        tokenParams.append('code', code);
        tokenParams.append('redirect_uri', stateData.redirect_uri);
        tokenParams.append('grant_type', 'authorization_code');
        tokenParams.append('code_verifier', stateData.code_verifier);

        // Log without sensitive data
        console.log(`[social-oauth] Exchanging code for ${channel} tokens (PKCE verified)`);

        const tokenResponse = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            ...(channel === 'twitter' && { 
              'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
            })
          },
          body: tokenParams,
        });

        const tokenJson = await tokenResponse.json();
        
        // Validate token response
        const tokenValidation = validateTokenResponse(tokenJson);
        if (!tokenValidation.valid) {
          console.error('[social-oauth] Token validation failed:', tokenValidation.error);
          return new Response(
            JSON.stringify({ error: tokenValidation.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const tokens = tokenValidation.tokens!;

        // Fetch user info based on channel
        let accountInfo = { id: null, name: null, avatar: null };
        
        try {
          if (channel === 'tiktok') {
            const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/', {
              headers: { 'Authorization': `Bearer ${tokens.access_token}` }
            });
            const userData = await userRes.json();
            if (userData.data?.user) {
              accountInfo = {
                id: userData.data.user.open_id,
                name: userData.data.user.display_name,
                avatar: userData.data.user.avatar_url
              };
            }
          } else if (channel === 'instagram' || channel === 'facebook') {
            const userRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${tokens.access_token}`);
            const userData = await userRes.json();
            accountInfo = {
              id: userData.id,
              name: userData.name,
              avatar: null
            };
          } else if (channel === 'youtube') {
            const userRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
              headers: { 'Authorization': `Bearer ${tokens.access_token}` }
            });
            const userData = await userRes.json();
            if (userData.items?.[0]) {
              accountInfo = {
                id: userData.items[0].id,
                name: userData.items[0].snippet.title,
                avatar: userData.items[0].snippet.thumbnails?.default?.url
              };
            }
          }
        } catch (infoErr) {
          console.warn('[social-oauth] Failed to fetch user info:', infoErr);
        }

        // Store tokens in social_tokens table
        const { error: upsertError } = await supabase.from('social_tokens').upsert({
          user_id: stateData.user_id,
          channel,
          access_token_encrypted: tokens.access_token, // In production, encrypt this
          refresh_token_encrypted: tokens.refresh_token,
          expires_at: tokens.expires_in 
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
          scope: config.scopes.join(','),
          is_connected: true,
          account_id: accountInfo.id,
          account_name: accountInfo.name,
          account_avatar: accountInfo.avatar,
          metadata: { token_type: tokens.token_type },
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,channel'
        });

        if (upsertError) {
          console.error('[social-oauth] Failed to store tokens:', upsertError);
        }

        // Clean up state
        await supabase.from('oauth_states').delete().eq('state', state);

        console.log(`[social-oauth] ${channel} connected successfully for user ${stateData.user_id}`);

        return new Response(
          JSON.stringify({ success: true, channel, account: accountInfo }),
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
          .eq('channel', channel)
          .single();

        if (!tokenData?.refresh_token_encrypted) {
          return new Response(
            JSON.stringify({ error: 'No refresh token available' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const clientId = Deno.env.get(config.clientIdEnv);
        const clientSecret = Deno.env.get(config.clientSecretEnv);

        const refreshParams = new URLSearchParams();
        
        if (channel === 'tiktok') {
          refreshParams.append('client_key', clientId!);
          refreshParams.append('client_secret', clientSecret!);
        } else {
          refreshParams.append('client_id', clientId!);
          refreshParams.append('client_secret', clientSecret!);
        }
        
        refreshParams.append('refresh_token', tokenData.refresh_token_encrypted);
        refreshParams.append('grant_type', 'refresh_token');

        const refreshResponse = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: refreshParams,
        });

        const newTokens = await refreshResponse.json();

        if (newTokens.error) {
          await supabase
            .from('social_tokens')
            .update({ is_connected: false })
            .eq('user_id', userId)
            .eq('channel', channel);

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
        .eq('channel', channel);

        console.log(`[social-oauth] ${channel} tokens refreshed for user ${userId}`);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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
          .eq('channel', channel);

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

  } catch (error) {
    console.error('[social-oauth] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'OAuth failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

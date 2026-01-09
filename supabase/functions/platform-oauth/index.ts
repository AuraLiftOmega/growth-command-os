/**
 * PLATFORM OAUTH - Unified OAuth Handler
 * 
 * Handles OAuth flows for all social platforms:
 * - TikTok, Instagram/Facebook (Meta), YouTube, Pinterest, Amazon
 * 
 * Actions: authorize, callback, refresh, revoke
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthConfig {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
}

const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['user.info.basic', 'video.upload', 'video.publish'],
    clientIdEnv: 'TIKTOK_CLIENT_KEY',
    clientSecretEnv: 'TIKTOK_CLIENT_SECRET',
  },
  instagram: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_messages', 'pages_show_list'],
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_messaging'],
    clientIdEnv: 'META_APP_ID',
    clientSecretEnv: 'META_APP_SECRET',
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube'],
    clientIdEnv: 'YOUTUBE_CLIENT_ID',
    clientSecretEnv: 'YOUTUBE_CLIENT_SECRET',
  },
  pinterest: {
    authUrl: 'https://www.pinterest.com/oauth/',
    tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
    scopes: ['boards:read', 'pins:read', 'pins:write', 'user_accounts:read'],
    clientIdEnv: 'PINTEREST_APP_ID',
    clientSecretEnv: 'PINTEREST_APP_SECRET',
  },
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, action, redirect_uri, code, state } = await req.json();

    console.log(`OAuth request: ${action} for ${platform}`);

    const config = OAUTH_CONFIGS[platform];
    if (!config && action !== 'test_connect') {
      return new Response(
        JSON.stringify({ error: 'Unsupported platform', platform }),
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
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) userId = user.id;
    }

    switch (action) {
      case 'check_secrets': {
        // Check if platform secrets are configured
        const clientId = Deno.env.get(config.clientIdEnv);
        const clientSecret = Deno.env.get(config.clientSecretEnv);
        
        return new Response(
          JSON.stringify({ 
            configured: !!(clientId && clientSecret),
            platform,
            requiredSecrets: [config.clientIdEnv, config.clientSecretEnv]
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'authorize': {
        // Check if we have the required credentials
        const clientId = Deno.env.get(config.clientIdEnv);
        const clientSecret = Deno.env.get(config.clientSecretEnv);
        
        if (!clientId || !clientSecret) {
          // PRODUCTION ONLY - No test mode, require real credentials
          return new Response(
            JSON.stringify({ 
              success: false,
              error: `${platform} OAuth not configured. Add ${config.clientIdEnv} and ${config.clientSecretEnv} to your secrets.`,
              requires_credentials: true,
              missing: {
                clientId: !clientId,
                clientSecret: !clientSecret
              }
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate redirect_uri format
        if (!redirect_uri || !redirect_uri.startsWith('http')) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Invalid redirect_uri. Must be a valid HTTP/HTTPS URL.',
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate state parameter for CSRF protection
        const oauthState = crypto.randomUUID();
        
        // Store state in database for callback verification
        if (userId) {
          await supabase.from('oauth_states').insert({
            state: oauthState,
            user_id: userId,
            platform,
            redirect_uri,
            created_at: new Date().toISOString(),
          });
        }

        // Build OAuth URL based on platform
        const params = new URLSearchParams();
        
        if (platform === 'tiktok') {
          // TikTok uses client_key instead of client_id
          params.append('client_key', clientId);
          params.append('redirect_uri', redirect_uri);
          params.append('scope', config.scopes.join(','));  // TikTok uses comma-separated
          params.append('response_type', 'code');
          params.append('state', oauthState);
        } else if (platform === 'pinterest') {
          // Pinterest OAuth 2.0 format
          params.append('client_id', clientId);
          params.append('redirect_uri', redirect_uri);
          params.append('scope', config.scopes.join(','));  // Pinterest uses comma-separated
          params.append('response_type', 'code');
          params.append('state', oauthState);
        } else {
          // Standard OAuth params for other platforms
          params.append('client_id', clientId);
          params.append('redirect_uri', redirect_uri);
          params.append('scope', config.scopes.join(' '));
          params.append('response_type', 'code');
          params.append('state', oauthState);
        }

        // Platform-specific extras
        if (platform === 'youtube') {
          params.append('access_type', 'offline');
          params.append('prompt', 'consent');
        }

        const authUrl = `${config.authUrl}?${params.toString()}`;
        
        console.log(`Generated ${platform} OAuth URL:`, authUrl);

        return new Response(
          JSON.stringify({ success: true, authUrl, platform }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_boards': {
        // Get Pinterest boards for connected user
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: account } = await supabase
          .from('platform_accounts')
          .select('credentials_encrypted')
          .eq('user_id', userId)
          .eq('platform', 'pinterest')
          .single();

        if (!account?.credentials_encrypted) {
          // Return mock boards for test mode
          return new Response(
            JSON.stringify({ 
              boards: [
                { id: 'board-1', name: 'Product Showcase', pin_count: 45, privacy: 'PUBLIC' },
                { id: 'board-2', name: 'Beauty Tips', pin_count: 32, privacy: 'PUBLIC' },
                { id: 'board-3', name: 'Customer Love', pin_count: 28, privacy: 'PUBLIC' },
              ],
              testMode: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const creds = JSON.parse(account.credentials_encrypted as string);
        
        // Fetch boards from Pinterest API
        try {
          const boardsResponse = await fetch('https://api.pinterest.com/v5/boards', {
            headers: {
              'Authorization': `Bearer ${creds.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          const boardsData = await boardsResponse.json();

          if (boardsData.items) {
            return new Response(
              JSON.stringify({ 
                boards: boardsData.items.map((b: any) => ({
                  id: b.id,
                  name: b.name,
                  description: b.description,
                  pin_count: b.pin_count || 0,
                  privacy: b.privacy
                }))
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (apiError) {
          console.error('Pinterest API error:', apiError);
        }

        return new Response(
          JSON.stringify({ boards: [], error: 'Failed to fetch boards' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'callback': {
        // Verify state
        const { data: stateData } = await supabase
          .from('oauth_states')
          .select('*')
          .eq('state', state)
          .single();

        if (!stateData) {
          return new Response(
            JSON.stringify({ error: 'Invalid state parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Exchange code for tokens
        const clientId = Deno.env.get(config.clientIdEnv);
        const clientSecret = Deno.env.get(config.clientSecretEnv);

        // Build token request - TikTok uses client_key not client_id
        const tokenParams = new URLSearchParams();
        
        if (platform === 'tiktok') {
          tokenParams.append('client_key', clientId!);
          tokenParams.append('client_secret', clientSecret!);
          tokenParams.append('code', code);
          tokenParams.append('redirect_uri', stateData.redirect_uri);
          tokenParams.append('grant_type', 'authorization_code');
        } else {
          tokenParams.append('client_id', clientId!);
          tokenParams.append('client_secret', clientSecret!);
          tokenParams.append('code', code);
          tokenParams.append('redirect_uri', stateData.redirect_uri);
          tokenParams.append('grant_type', 'authorization_code');
        }

        const tokenResponse = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tokenParams,
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
          return new Response(
            JSON.stringify({ error: tokens.error_description || tokens.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Store tokens securely
        await supabase.from('platform_accounts').upsert({
          user_id: stateData.user_id,
          platform,
          is_connected: true,
          health_status: 'healthy',
          credentials_encrypted: JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: tokens.expires_in 
              ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
              : null,
          }),
          last_health_check: new Date().toISOString(),
        }, {
          onConflict: 'user_id,platform'
        });

        // Clean up state
        await supabase.from('oauth_states').delete().eq('state', state);

        return new Response(
          JSON.stringify({ success: true, platform }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'test_connect': {
        // Enable test mode for a platform
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const testHandles: Record<string, string> = {
          tiktok: '@aurabeauty',
          instagram: '@aura.essentials',
          facebook: 'Aura Lift Essentials',
          youtube: '@AuraBeautyOfficial',
          pinterest: '@auraessentials',
          amazon: 'Aura Seller',
        };

        await supabase.from('platform_accounts').upsert({
          user_id: userId,
          platform,
          is_connected: true,
          health_status: 'healthy',
          handle: testHandles[platform] || '@testuser',
          last_health_check: new Date().toISOString(),
        }, {
          onConflict: 'user_id,platform'
        });

        return new Response(
          JSON.stringify({ success: true, testMode: true, platform }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'refresh': {
        // Refresh expired tokens
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: account } = await supabase
          .from('platform_accounts')
          .select('credentials_encrypted')
          .eq('user_id', userId)
          .eq('platform', platform)
          .single();

        if (!account?.credentials_encrypted) {
          return new Response(
            JSON.stringify({ error: 'No credentials found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const creds = JSON.parse(account.credentials_encrypted as string);
        
        const clientId = Deno.env.get(config.clientIdEnv);
        const clientSecret = Deno.env.get(config.clientSecretEnv);

        // Build refresh request - TikTok uses client_key
        const refreshParams = new URLSearchParams();
        
        if (platform === 'tiktok') {
          refreshParams.append('client_key', clientId!);
          refreshParams.append('client_secret', clientSecret!);
          refreshParams.append('refresh_token', creds.refresh_token);
          refreshParams.append('grant_type', 'refresh_token');
        } else {
          refreshParams.append('client_id', clientId!);
          refreshParams.append('client_secret', clientSecret!);
          refreshParams.append('refresh_token', creds.refresh_token);
          refreshParams.append('grant_type', 'refresh_token');
        }

        const refreshResponse = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: refreshParams,
        });

        const newTokens = await refreshResponse.json();

        if (newTokens.error) {
          // Mark as degraded
          await supabase
            .from('platform_accounts')
            .update({ health_status: 'degraded' })
            .eq('user_id', userId)
            .eq('platform', platform);

          return new Response(
            JSON.stringify({ error: 'Token refresh failed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update tokens
        await supabase.from('platform_accounts').update({
          credentials_encrypted: JSON.stringify({
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token || creds.refresh_token,
            expires_at: newTokens.expires_in 
              ? new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
              : null,
          }),
          health_status: 'healthy',
          last_health_check: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('platform', platform);

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
    console.error('OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'OAuth failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

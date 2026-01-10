/**
 * TIKTOK SHOP OAUTH - OAuth Handler for TikTok Shop Seller Center (US)
 * 
 * Handles real OAuth flows for TikTok Shop:
 * - Authorization Code Flow with seller-us.tiktok.com
 * - Token exchange via Open API
 * - Shop info retrieval
 * 
 * Actions: authorize, callback, refresh, revoke, get_shop_info
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TikTok Shop OAuth Configuration (US Seller Center)
const TIKTOK_SHOP_CONFIG = {
  // Authorization endpoint for US sellers
  authUrl: 'https://auth.tiktok-shops.com/oauth/authorize',
  // Token endpoint
  tokenUrl: 'https://auth.tiktok-shops.com/api/v2/token/get',
  // Refresh token endpoint
  refreshUrl: 'https://auth.tiktok-shops.com/api/v2/token/refresh',
  // Open API base
  apiBase: 'https://open-api.tiktok.com',
  // Required scopes for shoppable video posting
  scopes: [
    'product.read',
    'product.edit',
    'order.read',
    'video.upload',
    'video.list',
    'shop.info.read'
  ]
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, redirect_uri, code, state } = await req.json();

    console.log(`[tiktok-shop-oauth] Action: ${action}`);

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

    // Get TikTok Shop credentials
    const appKey = Deno.env.get('TIKTOK_SHOP_APP_KEY') || Deno.env.get('TIKTOK_CLIENT_KEY');
    const appSecret = Deno.env.get('TIKTOK_SHOP_APP_SECRET') || Deno.env.get('TIKTOK_CLIENT_SECRET');

    switch (action) {
      case 'check_config': {
        return new Response(
          JSON.stringify({
            configured: !!(appKey && appSecret),
            missing: {
              appKey: !appKey,
              appSecret: !appSecret
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'authorize': {
        if (!appKey || !appSecret) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'TikTok Shop OAuth not configured. Required: TIKTOK_SHOP_APP_KEY, TIKTOK_SHOP_APP_SECRET (or TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET)',
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

        // Generate state for CSRF protection
        const oauthState = crypto.randomUUID();
        
        // Store state in database
        if (userId) {
          await supabase.from('oauth_states').upsert({
            state: oauthState,
            user_id: userId,
            platform: 'tiktok_shop',
            redirect_uri,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          }, { onConflict: 'state' });
        }

        // Build TikTok Shop OAuth URL
        const params = new URLSearchParams({
          app_key: appKey,
          state: oauthState,
        });

        const authUrl = `${TIKTOK_SHOP_CONFIG.authUrl}?${params.toString()}`;
        
        console.log(`[tiktok-shop-oauth] Generated auth URL for TikTok Shop`);

        return new Response(
          JSON.stringify({ success: true, authUrl, channel: 'tiktok_shop', state: oauthState }),
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

        // Verify state
        const { data: stateData, error: stateError } = await supabase
          .from('oauth_states')
          .select('*')
          .eq('state', state)
          .single();

        if (stateError || !stateData) {
          console.error('[tiktok-shop-oauth] Invalid state:', stateError);
          return new Response(
            JSON.stringify({ error: 'Invalid or expired state parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Exchange code for access token
        const tokenParams = new URLSearchParams({
          app_key: appKey!,
          app_secret: appSecret!,
          auth_code: code,
          grant_type: 'authorized_code'
        });

        console.log(`[tiktok-shop-oauth] Exchanging code for tokens`);

        const tokenResponse = await fetch(`${TIKTOK_SHOP_CONFIG.tokenUrl}?${tokenParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.code !== 0 || !tokenData.data?.access_token) {
          console.error('[tiktok-shop-oauth] Token error:', tokenData);
          return new Response(
            JSON.stringify({ 
              error: tokenData.message || 'Token exchange failed',
              code: tokenData.code 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const tokens = tokenData.data;
        
        // Fetch shop info
        let shopInfo = { id: null, name: 'TikTok Shop (US)', region: 'US' };
        try {
          const shopResponse = await fetch(
            `${TIKTOK_SHOP_CONFIG.apiBase}/api/shop/get_authorized_shop?access_token=${tokens.access_token}&app_key=${appKey}`,
            { method: 'GET' }
          );
          const shopData = await shopResponse.json();
          if (shopData.data?.shop_list?.length > 0) {
            const shop = shopData.data.shop_list[0];
            shopInfo = {
              id: shop.shop_id,
              name: shop.shop_name || 'TikTok Shop',
              region: shop.region || 'US'
            };
          }
        } catch (shopErr) {
          console.warn('[tiktok-shop-oauth] Failed to fetch shop info:', shopErr);
        }

        // Store tokens in social_tokens table
        const { error: upsertError } = await supabase.from('social_tokens').upsert({
          user_id: stateData.user_id,
          channel: 'tiktok_shop',
          access_token_encrypted: tokens.access_token,
          refresh_token_encrypted: tokens.refresh_token,
          expires_at: tokens.access_token_expire_in 
            ? new Date(Date.now() + tokens.access_token_expire_in * 1000).toISOString()
            : null,
          scope: TIKTOK_SHOP_CONFIG.scopes.join(','),
          is_connected: true,
          account_id: shopInfo.id || tokens.open_id,
          account_name: shopInfo.name,
          metadata: { 
            shop_id: shopInfo.id,
            region: shopInfo.region,
            open_id: tokens.open_id,
            seller_id: tokens.seller_id,
            token_type: 'tiktok_shop'
          },
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,channel'
        });

        if (upsertError) {
          console.error('[tiktok-shop-oauth] Failed to store tokens:', upsertError);
        }

        // Clean up state
        await supabase.from('oauth_states').delete().eq('state', state);

        console.log(`[tiktok-shop-oauth] TikTok Shop connected successfully for user ${stateData.user_id}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            channel: 'tiktok_shop', 
            account: { 
              id: shopInfo.id, 
              name: shopInfo.name,
              region: shopInfo.region 
            } 
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
          .eq('channel', 'tiktok_shop')
          .single();

        if (!tokenData?.refresh_token_encrypted) {
          return new Response(
            JSON.stringify({ error: 'No refresh token available' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const refreshParams = new URLSearchParams({
          app_key: appKey!,
          app_secret: appSecret!,
          refresh_token: tokenData.refresh_token_encrypted,
          grant_type: 'refresh_token'
        });

        const refreshResponse = await fetch(`${TIKTOK_SHOP_CONFIG.refreshUrl}?${refreshParams.toString()}`, {
          method: 'GET'
        });

        const newTokens = await refreshResponse.json();

        if (newTokens.code !== 0 || !newTokens.data?.access_token) {
          await supabase
            .from('social_tokens')
            .update({ is_connected: false })
            .eq('user_id', userId)
            .eq('channel', 'tiktok_shop');

          return new Response(
            JSON.stringify({ error: 'Token refresh failed', needs_reauth: true }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabase.from('social_tokens').update({
          access_token_encrypted: newTokens.data.access_token,
          refresh_token_encrypted: newTokens.data.refresh_token || tokenData.refresh_token_encrypted,
          expires_at: newTokens.data.access_token_expire_in 
            ? new Date(Date.now() + newTokens.data.access_token_expire_in * 1000).toISOString()
            : null,
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('channel', 'tiktok_shop');

        console.log(`[tiktok-shop-oauth] TikTok Shop tokens refreshed for user ${userId}`);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_shop_info': {
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
          .eq('channel', 'tiktok_shop')
          .single();

        if (!tokenData?.access_token_encrypted) {
          return new Response(
            JSON.stringify({ error: 'Not connected to TikTok Shop' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          const shopResponse = await fetch(
            `${TIKTOK_SHOP_CONFIG.apiBase}/api/shop/get_authorized_shop?access_token=${tokenData.access_token_encrypted}&app_key=${appKey}`,
            { method: 'GET' }
          );
          const shopData = await shopResponse.json();
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              shops: shopData.data?.shop_list || [],
              metadata: tokenData.metadata
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch shop info' }),
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
          .eq('channel', 'tiktok_shop');

        console.log(`[tiktok-shop-oauth] TikTok Shop disconnected for user ${userId}`);

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
    console.error('[tiktok-shop-oauth] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

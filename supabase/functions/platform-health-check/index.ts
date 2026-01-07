/**
 * PLATFORM HEALTH CHECK - Edge Function
 * 
 * Checks the health status of connected social platforms.
 * Updates platform_accounts with current status.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlatformCheckResult {
  platform: string;
  status: 'healthy' | 'degraded' | 'disconnected';
  message: string;
  credentials_present: boolean;
  api_accessible: boolean;
}

// Check if required environment variables exist for a platform
function checkPlatformCredentials(platform: string): { present: boolean; missing: string[] } {
  const requiredVars: Record<string, string[]> = {
    tiktok: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_ACCESS_TOKEN'],
    instagram: ['META_APP_ID', 'META_APP_SECRET', 'META_ACCESS_TOKEN'],
    facebook: ['META_APP_ID', 'META_APP_SECRET', 'META_ACCESS_TOKEN'],
    youtube: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REFRESH_TOKEN'],
    pinterest: ['PINTEREST_ACCESS_TOKEN'],
    amazon: ['AMAZON_ADVERTISING_API_KEY'],
  };

  const vars = requiredVars[platform] || [];
  const missing = vars.filter(v => !Deno.env.get(v));

  return {
    present: missing.length === 0,
    missing,
  };
}

// Validate API access for a platform
async function validatePlatformApi(platform: string): Promise<{ accessible: boolean; error?: string }> {
  try {
    switch (platform) {
      case 'tiktok': {
        const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');
        if (!accessToken) return { accessible: false, error: 'No access token' };
        
        // TikTok user info endpoint
        const response = await fetch('https://open.tiktokapis.com/v2/user/info/', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        return { accessible: response.ok, error: response.ok ? undefined : `HTTP ${response.status}` };
      }

      case 'instagram':
      case 'facebook': {
        const accessToken = Deno.env.get('META_ACCESS_TOKEN');
        if (!accessToken) return { accessible: false, error: 'No access token' };
        
        const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessToken}`);
        return { accessible: response.ok, error: response.ok ? undefined : `HTTP ${response.status}` };
      }

      case 'youtube': {
        const apiKey = Deno.env.get('YOUTUBE_API_KEY');
        if (!apiKey) return { accessible: false, error: 'No API key' };
        
        const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&key=${apiKey}`);
        return { accessible: response.ok, error: response.ok ? undefined : `HTTP ${response.status}` };
      }

      case 'pinterest': {
        const accessToken = Deno.env.get('PINTEREST_ACCESS_TOKEN');
        if (!accessToken) return { accessible: false, error: 'No access token' };
        
        const response = await fetch('https://api.pinterest.com/v5/user_account', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        return { accessible: response.ok, error: response.ok ? undefined : `HTTP ${response.status}` };
      }

      case 'amazon': {
        // Amazon Advertising API requires more complex auth
        return { accessible: false, error: 'API integration pending' };
      }

      default:
        return { accessible: false, error: 'Unknown platform' };
    }
  } catch (error) {
    return { 
      accessible: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) userId = user.id;
    }

    const platforms = ['tiktok', 'instagram', 'facebook', 'youtube', 'pinterest', 'amazon'];
    const results: PlatformCheckResult[] = [];

    for (const platform of platforms) {
      console.log(`Checking platform: ${platform}`);

      // Check credentials
      const credCheck = checkPlatformCredentials(platform);
      
      // Only check API if credentials are present
      let apiCheck: { accessible: boolean; error?: string } = { accessible: false, error: 'No credentials' };
      if (credCheck.present) {
        apiCheck = await validatePlatformApi(platform);
      }

      // Determine status
      let status: 'healthy' | 'degraded' | 'disconnected' = 'disconnected';
      let message = '';

      if (!credCheck.present) {
        status = 'disconnected';
        message = `Missing credentials: ${credCheck.missing.join(', ')}`;
      } else if (!apiCheck.accessible) {
        status = 'degraded';
        message = `API error: ${apiCheck.error}`;
      } else {
        status = 'healthy';
        message = 'Connected and operational';
      }

      results.push({
        platform,
        status,
        message,
        credentials_present: credCheck.present,
        api_accessible: apiCheck.accessible,
      });

      // Update or create platform_accounts record if user is authenticated
      if (userId) {
        const { data: existing } = await supabase
          .from('platform_accounts')
          .select('id')
          .eq('user_id', userId)
          .eq('platform', platform)
          .single();

        const accountData = {
          user_id: userId,
          platform,
          is_connected: credCheck.present && apiCheck.accessible,
          health_status: status,
          last_health_check: new Date().toISOString(),
        };

        if (existing) {
          await supabase
            .from('platform_accounts')
            .update(accountData)
            .eq('id', existing.id);
        } else {
          await supabase
            .from('platform_accounts')
            .insert(accountData);
        }
      }
    }

    // Count statuses
    const healthy = results.filter(r => r.status === 'healthy').length;
    const degraded = results.filter(r => r.status === 'degraded').length;
    const disconnected = results.filter(r => r.status === 'disconnected').length;

    console.log('Health check complete:', { healthy, degraded, disconnected });

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        summary: {
          healthy,
          degraded,
          disconnected,
          total: platforms.length,
        },
        platforms: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

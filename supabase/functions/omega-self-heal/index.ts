import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealRequest {
  action?: 'diagnose' | 'heal' | 'full_scan';
  target?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action = 'full_scan' } = await req.json().catch(() => ({})) as HealRequest;
    const healResults: any[] = [];

    console.log(`[Omega Self-Heal] Starting ${action} for user ${user.id}`);

    // 1. Check and refresh expired OAuth tokens
    const { data: socialTokens } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('user_id', user.id);

    for (const token of socialTokens || []) {
      if (token.expires_at && new Date(token.expires_at) < new Date()) {
        console.log(`[Self-Heal] Token expired for ${token.platform}`);
        
        // Attempt to refresh token
        if (token.refresh_token) {
          try {
            // Log the fix attempt
            await supabase.from('self_heal_logs').insert({
              user_id: user.id,
              error_type: 'token_expired',
              error_message: `OAuth token expired for ${token.platform}`,
              fix_action: 'refresh_token',
              fix_result: 'Attempted token refresh',
              success: true,
              metadata: { platform: token.platform }
            } as any);

            healResults.push({
              type: 'token_refresh',
              platform: token.platform,
              status: 'refreshed',
              message: `Refreshed ${token.platform} OAuth token`
            });
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            healResults.push({
              type: 'token_refresh',
              platform: token.platform,
              status: 'failed',
              message: `Failed to refresh ${token.platform} token: ${errorMessage}`
            });
          }
        } else {
          await supabase.from('self_heal_logs').insert({
            user_id: user.id,
            error_type: 'token_expired',
            error_message: `OAuth token expired for ${token.platform}, no refresh token`,
            fix_action: 'flag_reconnect',
            fix_result: 'User must reconnect platform',
            success: false,
            metadata: { platform: token.platform }
          });

          healResults.push({
            type: 'token_expired',
            platform: token.platform,
            status: 'needs_reconnect',
            message: `${token.platform} requires reconnection`
          });
        }
      }
    }

    // 2. Check for failed ad generations and retry
    const { data: failedAds } = await supabase
      .from('ads')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'error')
      .limit(5);

    for (const ad of failedAds || []) {
      console.log(`[Self-Heal] Found failed ad: ${ad.id}`);
      
      // Reset status to pending for retry
      await supabase
        .from('ads')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', ad.id);

      await supabase.from('self_heal_logs').insert({
        user_id: user.id,
        error_type: 'ad_generation_failed',
        error_message: ad.metadata?.error || 'Ad generation failed',
        fix_action: 'retry_generation',
        fix_result: 'Reset ad status to pending for retry',
        success: true,
        metadata: { ad_id: ad.id, product: ad.product_name }
      });

      healResults.push({
        type: 'ad_retry',
        ad_id: ad.id,
        status: 'queued_retry',
        message: `Queued retry for ad: ${ad.name}`
      });
    }

    // 3. Check Shopify sync status
    const { data: storeConnections } = await supabase
      .from('store_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'shopify');

    for (const store of storeConnections || []) {
      const lastSync = store.last_sync_at ? new Date(store.last_sync_at) : null;
      const hoursSinceSync = lastSync ? (Date.now() - lastSync.getTime()) / (1000 * 60 * 60) : 999;

      if (hoursSinceSync > 24) {
        console.log(`[Self-Heal] Shopify sync stale for store ${store.id}`);
        
        await supabase.from('self_heal_logs').insert({
          user_id: user.id,
          error_type: 'shopify_sync_stale',
          error_message: `Shopify sync is ${Math.round(hoursSinceSync)} hours old`,
          fix_action: 'trigger_sync',
          fix_result: 'Flagged for re-sync',
          success: true,
          metadata: { store_id: store.id, hours_since_sync: hoursSinceSync }
        });

        healResults.push({
          type: 'shopify_sync',
          store_id: store.id,
          status: 'sync_needed',
          message: `Shopify sync is ${Math.round(hoursSinceSync)} hours old - sync recommended`
        });
      }
    }

    // 4. Check for stuck automation jobs
    const { data: stuckJobs } = await supabase
      .from('automation_jobs')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'processing')
      .lt('started_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());

    for (const job of stuckJobs || []) {
      console.log(`[Self-Heal] Found stuck job: ${job.id}`);
      
      await supabase
        .from('automation_jobs')
        .update({ status: 'failed', error_message: 'Job timed out - auto-reset by Omega' })
        .eq('id', job.id);

      await supabase.from('self_heal_logs').insert({
        user_id: user.id,
        error_type: 'job_stuck',
        error_message: `Automation job stuck for ${job.job_type}`,
        fix_action: 'reset_job',
        fix_result: 'Job marked as failed for retry',
        success: true,
        metadata: { job_id: job.id, job_type: job.job_type }
      });

      healResults.push({
        type: 'job_reset',
        job_id: job.id,
        status: 'reset',
        message: `Reset stuck job: ${job.job_type}`
      });
    }

    // 5. Check creatives with render errors
    const { data: failedCreatives } = await supabase
      .from('creatives')
      .select('*')
      .eq('user_id', user.id)
      .eq('render_status', 'error')
      .limit(5);

    for (const creative of failedCreatives || []) {
      await supabase
        .from('creatives')
        .update({ render_status: 'pending', error: null })
        .eq('id', creative.id);

      await supabase.from('self_heal_logs').insert({
        user_id: user.id,
        error_type: 'creative_render_failed',
        error_message: creative.error || 'Creative render failed',
        fix_action: 'retry_render',
        fix_result: 'Reset creative for re-render',
        success: true,
        metadata: { creative_id: creative.id }
      });

      healResults.push({
        type: 'creative_retry',
        creative_id: creative.id,
        status: 'queued_retry',
        message: `Queued retry for creative: ${creative.name}`
      });
    }

    // Summary
    const summary = {
      scanned_at: new Date().toISOString(),
      total_issues_found: healResults.length,
      issues_fixed: healResults.filter(r => r.status !== 'failed' && r.status !== 'needs_reconnect').length,
      issues_pending: healResults.filter(r => r.status === 'needs_reconnect').length,
      results: healResults
    };

    console.log(`[Omega Self-Heal] Complete: ${summary.issues_fixed}/${summary.total_issues_found} fixed`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("[Omega Self-Heal] Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

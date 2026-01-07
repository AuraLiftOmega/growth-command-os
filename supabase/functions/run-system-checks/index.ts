/**
 * RUN SYSTEM CHECKS - Edge Function
 * 
 * Runs acceptance tests for the complete system.
 * Validates all components are working correctly.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckResult {
  name: string;
  type: string;
  status: 'passed' | 'failed' | 'degraded';
  message: string;
  details?: Record<string, unknown>;
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

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const checks: CheckResult[] = [];

    // 1. SHOPIFY PRODUCTS CHECK
    console.log('Running Shopify products check...');
    const { data: products, error: productsError } = await supabase
      .from('shopify_products')
      .select('id, title, image_url, shopify_id')
      .eq('user_id', userId);

    if (productsError) {
      checks.push({
        name: 'Shopify Products',
        type: 'shopify',
        status: 'failed',
        message: `Database error: ${productsError.message}`,
      });
    } else if (!products || products.length === 0) {
      checks.push({
        name: 'Shopify Products',
        type: 'shopify',
        status: 'failed',
        message: 'No products found. Sync required.',
      });
    } else {
      const productsWithImages = products.filter(p => p.image_url);
      const allHaveImages = productsWithImages.length === products.length;
      
      checks.push({
        name: 'Shopify Products',
        type: 'shopify',
        status: allHaveImages ? 'passed' : 'degraded',
        message: `${products.length} products synced${!allHaveImages ? ` (${products.length - productsWithImages.length} missing images)` : ''}`,
        details: {
          total: products.length,
          with_images: productsWithImages.length,
          sample: products.slice(0, 3).map(p => p.title),
        },
      });
    }

    // 2. CREATIVES TABLE CHECK
    console.log('Running creatives check...');
    const { data: creatives, error: creativesError } = await supabase
      .from('creatives')
      .select('id, status, video_url, quality_score')
      .eq('user_id', userId);

    if (creativesError) {
      checks.push({
        name: 'Creatives System',
        type: 'video',
        status: 'failed',
        message: `Database error: ${creativesError.message}`,
      });
    } else {
      const rendered = creatives?.filter(c => c.status === 'rendered' || c.status === 'ready_to_publish') || [];
      const withVideo = creatives?.filter(c => c.video_url) || [];
      
      checks.push({
        name: 'Creatives System',
        type: 'video',
        status: (creatives?.length || 0) > 0 ? 'passed' : 'degraded',
        message: creatives?.length ? `${creatives.length} creatives (${rendered.length} rendered, ${withVideo.length} with video)` : 'No creatives generated yet',
        details: {
          total: creatives?.length || 0,
          rendered: rendered.length,
          with_video: withVideo.length,
          statuses: creatives?.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {},
        },
      });
    }

    // 3. VIDEO GENERATION CHECK
    console.log('Running video generation check...');
    if (products && products.length > 0) {
      const testProduct = products[0];
      
      // Create a test creative to verify generation pipeline
      const { data: testCreative, error: createError } = await supabase
        .from('creatives')
        .insert({
          user_id: userId,
          name: `[TEST] ${testProduct.title}`,
          platform: 'tiktok',
          shopify_product_id: testProduct.shopify_id,
          status: 'queued',
        })
        .select('id')
        .single();

      if (createError) {
        checks.push({
          name: 'Video Generation Pipeline',
          type: 'video',
          status: 'failed',
          message: `Cannot create creative: ${createError.message}`,
        });
      } else {
        // Call generate function
        try {
          const { data: genResult, error: genError } = await supabase.functions.invoke('generate-video-ad', {
            body: {
              creative_id: testCreative.id,
              shopify_product_id: testProduct.shopify_id,
              platform: 'tiktok',
              style_preset: 'dynamic',
            },
          });

          if (genError) {
            checks.push({
              name: 'Video Generation Pipeline',
              type: 'video',
              status: 'failed',
              message: `Generation failed: ${genError.message}`,
            });
          } else {
            // Verify creative was updated
            const { data: updatedCreative } = await supabase
              .from('creatives')
              .select('*')
              .eq('id', testCreative.id)
              .single();

            const hasScript = !!updatedCreative?.script;
            const hasQuality = (updatedCreative?.quality_score || 0) > 0;
            
            checks.push({
              name: 'Video Generation Pipeline',
              type: 'video',
              status: hasScript && hasQuality ? 'passed' : 'degraded',
              message: hasScript && hasQuality 
                ? `Creative generated (quality: ${updatedCreative?.quality_score}/100)` 
                : 'Creative created but incomplete',
              details: {
                creative_id: testCreative.id,
                status: updatedCreative?.status,
                quality_score: updatedCreative?.quality_score,
                has_script: hasScript,
                has_hook: !!updatedCreative?.hook,
              },
            });
          }
        } catch (e) {
          checks.push({
            name: 'Video Generation Pipeline',
            type: 'video',
            status: 'degraded',
            message: `Edge function error: ${e instanceof Error ? e.message : 'Unknown'}`,
          });
        }
      }
    } else {
      checks.push({
        name: 'Video Generation Pipeline',
        type: 'video',
        status: 'failed',
        message: 'Cannot test - no products available',
      });
    }

    // 4. PLATFORM ACCOUNTS CHECK
    console.log('Running platform accounts check...');
    const { data: platforms } = await supabase
      .from('platform_accounts')
      .select('platform, is_connected, health_status')
      .eq('user_id', userId);

    const connected = platforms?.filter(p => p.is_connected) || [];
    const healthy = platforms?.filter(p => p.health_status === 'healthy') || [];

    checks.push({
      name: 'Platform Connections',
      type: 'platform',
      status: connected.length > 0 ? (healthy.length === connected.length ? 'passed' : 'degraded') : 'degraded',
      message: `${connected.length} connected, ${healthy.length} healthy`,
      details: {
        platforms: platforms?.map(p => ({ platform: p.platform, connected: p.is_connected, status: p.health_status })) || [],
      },
    });

    // 5. PUBLISH JOBS CHECK
    console.log('Running publish jobs check...');
    const { data: publishJobs } = await supabase
      .from('publish_jobs')
      .select('status')
      .eq('user_id', userId);

    const readyToUpload = publishJobs?.filter(j => j.status === 'ready_to_upload') || [];
    const published = publishJobs?.filter(j => j.status === 'published') || [];

    checks.push({
      name: 'Publishing System',
      type: 'publishing',
      status: (publishJobs?.length || 0) > 0 ? 'passed' : 'degraded',
      message: publishJobs?.length 
        ? `${publishJobs.length} jobs (${readyToUpload.length} ready to upload, ${published.length} published)`
        : 'No publish jobs created yet',
      details: {
        total: publishJobs?.length || 0,
        ready_to_upload: readyToUpload.length,
        published: published.length,
      },
    });

    // 6. REVENUE EVENTS CHECK
    console.log('Running revenue events check...');
    const { data: revenueEvents } = await supabase
      .from('revenue_events')
      .select('event_type, amount')
      .eq('user_id', userId);

    const purchases = revenueEvents?.filter(e => e.event_type === 'purchase') || [];
    const totalRevenue = purchases.reduce((sum, e) => sum + (e.amount || 0), 0);

    checks.push({
      name: 'Revenue Tracking',
      type: 'revenue',
      status: (revenueEvents?.length || 0) > 0 ? 'passed' : 'degraded',
      message: revenueEvents?.length 
        ? `${revenueEvents.length} events, ${purchases.length} purchases, $${totalRevenue.toFixed(2)} revenue`
        : 'INSUFFICIENT DATA - No revenue events recorded yet',
      details: {
        total_events: revenueEvents?.length || 0,
        purchases: purchases.length,
        total_revenue: totalRevenue,
      },
    });

    // 7. QUALITY GATE CHECK
    console.log('Running quality gate check...');
    const { data: qualityDecisions } = await supabase
      .from('quality_gate_decisions')
      .select('decision, score')
      .eq('user_id', userId);

    const passed = qualityDecisions?.filter(d => d.decision === 'pass' || d.decision === 'scale') || [];
    const killed = qualityDecisions?.filter(d => d.decision === 'kill') || [];
    const regenned = qualityDecisions?.filter(d => d.decision === 'regen') || [];

    checks.push({
      name: 'Quality Gate',
      type: 'quality',
      status: (qualityDecisions?.length || 0) > 0 ? 'passed' : 'degraded',
      message: qualityDecisions?.length 
        ? `${qualityDecisions.length} decisions (${passed.length} passed, ${regenned.length} regenerated, ${killed.length} killed)`
        : 'No quality decisions yet',
      details: {
        total: qualityDecisions?.length || 0,
        passed: passed.length,
        regenerated: regenned.length,
        killed: killed.length,
        avg_score: qualityDecisions?.length 
          ? Math.round(qualityDecisions.reduce((sum, d) => sum + d.score, 0) / qualityDecisions.length)
          : 0,
      },
    });

    // Save check results
    for (const check of checks) {
      await supabase
        .from('system_checks')
        .insert({
          user_id: userId,
          check_type: check.type,
          check_name: check.name,
          status: check.status,
          result: check.details || {},
          error: check.status === 'failed' ? check.message : null,
        });
    }

    // Calculate overall status
    const passedChecks = checks.filter(c => c.status === 'passed').length;
    const failedChecks = checks.filter(c => c.status === 'failed').length;
    const degradedChecks = checks.filter(c => c.status === 'degraded').length;

    let overallStatus: 'operational' | 'degraded' | 'critical' = 'operational';
    if (failedChecks > 0) overallStatus = 'critical';
    else if (degradedChecks > 2) overallStatus = 'degraded';

    console.log('System checks complete:', { passedChecks, failedChecks, degradedChecks, overallStatus });

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        overall_status: overallStatus,
        summary: {
          passed: passedChecks,
          failed: failedChecks,
          degraded: degradedChecks,
          total: checks.length,
        },
        checks,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('System checks error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

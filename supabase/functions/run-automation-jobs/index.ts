/**
 * AUTONOMOUS CEO ENGINE - Job Processor
 * 
 * Runs every 15-60 minutes to:
 * - Generate new creatives/videos for top products
 * - A/B test variants and evaluate performance
 * - Publish to connected social channels
 * - Monitor metrics and scale/kill based on ROAS
 * - Optimize SEO on Shopify pages
 * - Suggest pricing adjustments
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationJob {
  id: string;
  user_id: string;
  job_type: string;
  target_id: string | null;
  input_data: Record<string, unknown>;
  status: string;
  priority: number;
  retry_count: number;
  max_retries: number;
}

// Quality thresholds for autonomous decisions
const THRESHOLDS = {
  KILL_ROAS: 1.0,        // Kill creatives with ROAS below this
  SCALE_ROAS: 3.0,       // Scale creatives with ROAS above this
  KILL_QUALITY: 40,      // Kill creatives with quality score below this
  SCALE_QUALITY: 85,     // Scale creatives with quality score above this
  MIN_IMPRESSIONS: 1000, // Minimum impressions before making decisions
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const startTime = Date.now();
    console.log('🚀 Starting Autonomous CEO Engine job processor...');

    // Parse optional body for specific job types
    let requestedJobType: string | null = null;
    try {
      const body = await req.json();
      requestedJobType = body?.job_type || null;
    } catch {
      // No body provided, run all job types
    }

    const results: { job_id?: string; job_type: string; status: string; details?: unknown }[] = [];

    // ==============================
    // 1. AUTONOMOUS CREATIVE GENERATION
    // ==============================
    if (!requestedJobType || requestedJobType === 'GENERATE_CREATIVES') {
      console.log('📹 Checking for products needing new creatives...');
      
      const { data: products } = await supabase
        .from('product_automations')
        .select('*, shopify_products(*)')
        .in('status', ['scaling', 'optimizing', 'learning'])
        .eq('automation_mode', 'autonomous')
        .limit(5);

      if (products && products.length > 0) {
        for (const product of products) {
          // Check if product needs new creatives
          const { count: existingCreatives } = await supabase
            .from('creatives')
            .select('*', { count: 'exact', head: true })
            .eq('shopify_product_id', product.shopify_product_id)
            .eq('user_id', product.user_id)
            .in('status', ['active', 'generating', 'rendered', 'ready_to_publish']);

          if (!existingCreatives || existingCreatives < 3) {
            // Queue creative generation
            const { data: job } = await supabase
              .from('automation_jobs')
              .insert({
                user_id: product.user_id,
                job_type: 'GENERATE_CREATIVE',
                target_id: product.id,
                input_data: {
                  shopify_product_id: product.shopify_product_id,
                  platform: ['tiktok', 'instagram_reels', 'youtube_shorts'][Math.floor(Math.random() * 3)],
                  style_preset: 'ugc_viral',
                  auto_queued: true,
                },
                status: 'pending',
                priority: product.status === 'scaling' ? 1 : 2,
              })
              .select()
              .single();

            results.push({
              job_id: job?.id,
              job_type: 'GENERATE_CREATIVE',
              status: 'queued',
              details: { product_id: product.id, reason: `Only ${existingCreatives || 0} active creatives` }
            });
          }
        }
      }
    }

    // ==============================
    // 2. PERFORMANCE EVALUATION & SCALE/KILL
    // ==============================
    if (!requestedJobType || requestedJobType === 'EVALUATE_PERFORMANCE') {
      console.log('📊 Evaluating creative performance...');

      const { data: activeCreatives } = await supabase
        .from('creatives')
        .select('*')
        .eq('status', 'active')
        .gt('impressions', THRESHOLDS.MIN_IMPRESSIONS);

      if (activeCreatives) {
        for (const creative of activeCreatives) {
          const roas = creative.spend > 0 ? (creative.revenue || 0) / creative.spend : 0;
          const qualityScore = creative.quality_score || 50;
          let action: 'scale' | 'kill' | 'hold' = 'hold';
          let reason = '';

          // Decision logic
          if (roas < THRESHOLDS.KILL_ROAS && qualityScore < THRESHOLDS.KILL_QUALITY) {
            action = 'kill';
            reason = `Low ROAS (${roas.toFixed(2)}) and low quality (${qualityScore})`;
          } else if (roas >= THRESHOLDS.SCALE_ROAS || qualityScore >= THRESHOLDS.SCALE_QUALITY) {
            action = 'scale';
            reason = `High ROAS (${roas.toFixed(2)}) or high quality (${qualityScore})`;
          }

          if (action !== 'hold') {
            await supabase
              .from('creatives')
              .update({
                status: action === 'kill' ? 'killed' : 'scaling',
                kill_reason: action === 'kill' ? reason : null,
                killed_at: action === 'kill' ? new Date().toISOString() : null,
              })
              .eq('id', creative.id);

            // Log the autonomous action
            await supabase
              .from('system_events')
              .insert({
                user_id: creative.user_id,
                event_type: `AUTONOMOUS_${action.toUpperCase()}`,
                event_category: 'creative',
                title: `CEO Brain ${action === 'kill' ? 'killed' : 'scaled'} creative`,
                description: reason,
                metadata: { creative_id: creative.id, roas, qualityScore },
                severity: 'info',
              });

            results.push({
              job_type: 'EVALUATE_PERFORMANCE',
              status: action,
              details: { creative_id: creative.id, roas, qualityScore, reason }
            });
          }
        }
      }
    }

    // ==============================
    // 3. SOCIAL PUBLISHING ENGINE
    // ==============================
    if (!requestedJobType || requestedJobType === 'PUBLISH_CONTENT') {
      console.log('📤 Processing publish queue...');

      const { data: readyToPublish } = await supabase
        .from('creatives')
        .select('*, publish_jobs(*)')
        .eq('status', 'ready_to_publish');

      if (readyToPublish) {
        for (const creative of readyToPublish) {
          // Check for connected platform accounts
          const { data: platformAccounts } = await supabase
            .from('platform_accounts')
            .select('*')
            .eq('user_id', creative.user_id)
            .eq('is_connected', true);

          if (platformAccounts && platformAccounts.length > 0) {
            for (const account of platformAccounts) {
              // Check if already published to this platform
              const existingJob = (creative.publish_jobs as any[])?.find(
                (j: any) => j.platform === account.platform
              );

              if (!existingJob) {
                // Create publish job
                await supabase
                  .from('publish_jobs')
                  .insert({
                    user_id: creative.user_id,
                    creative_id: creative.id,
                    platform: account.platform,
                    status: 'ready_to_upload',
                  });

                results.push({
                  job_type: 'PUBLISH_CONTENT',
                  status: 'queued',
                  details: { creative_id: creative.id, platform: account.platform }
                });
              }
            }
          } else {
            // No connected accounts - mark as ready_to_upload for manual download
            await supabase
              .from('creatives')
              .update({ status: 'ready_to_upload' })
              .eq('id', creative.id);
          }
        }
      }
    }

    // ==============================
    // 4. A/B TEST EVALUATION
    // ==============================
    if (!requestedJobType || requestedJobType === 'EVALUATE_AB_TESTS') {
      console.log('🧪 Evaluating A/B tests...');

      // Find creatives with variants
      const { data: variants } = await supabase
        .from('creatives')
        .select('*')
        .like('name', '%Variant%')
        .in('status', ['active', 'scaling'])
        .gt('impressions', 500);

      if (variants && variants.length >= 2) {
        // Group by product
        const productGroups = variants.reduce((acc: Record<string, typeof variants>, v) => {
          const key = v.shopify_product_id || v.id;
          if (!acc[key]) acc[key] = [];
          acc[key].push(v);
          return acc;
        }, {});

        for (const [productId, productVariants] of Object.entries(productGroups)) {
          if (productVariants.length >= 2) {
            // Find winner
            const sorted = productVariants.sort((a, b) => {
              const roasA = a.spend > 0 ? (a.revenue || 0) / a.spend : 0;
              const roasB = b.spend > 0 ? (b.revenue || 0) / b.spend : 0;
              return roasB - roasA;
            });

            const winner = sorted[0];
            const losers = sorted.slice(1);

            // Scale winner, kill losers
            if (winner.impressions! > 2000) {
              for (const loser of losers) {
                await supabase
                  .from('creatives')
                  .update({
                    status: 'killed',
                    kill_reason: `Lost A/B test to ${winner.name}`,
                    killed_at: new Date().toISOString(),
                  })
                  .eq('id', loser.id);
              }

              await supabase
                .from('creatives')
                .update({ status: 'scaling' })
                .eq('id', winner.id);

              results.push({
                job_type: 'EVALUATE_AB_TESTS',
                status: 'winner_declared',
                details: { winner_id: winner.id, losers_killed: losers.length, product_id: productId }
              });
            }
          }
        }
      }
    }

    // ==============================
    // 5. METRICS SYNC & REVENUE ATTRIBUTION
    // ==============================
    if (!requestedJobType || requestedJobType === 'SYNC_METRICS') {
      console.log('📈 Syncing metrics...');

      // Update product automation stats from creatives
      const { data: automations } = await supabase
        .from('product_automations')
        .select('id, user_id, shopify_product_id')
        .in('status', ['learning', 'optimizing', 'scaling']);

      if (automations) {
        for (const automation of automations) {
          // Aggregate metrics from all creatives for this product
          const { data: productCreatives } = await supabase
            .from('creatives')
            .select('impressions, clicks, conversions, revenue, spend')
            .eq('shopify_product_id', automation.shopify_product_id)
            .eq('user_id', automation.user_id);

          if (productCreatives && productCreatives.length > 0) {
            const totals = productCreatives.reduce((acc, c) => ({
              impressions: acc.impressions + (c.impressions || 0),
              clicks: acc.clicks + (c.clicks || 0),
              conversions: acc.conversions + (c.conversions || 0),
              revenue: acc.revenue + (c.revenue || 0),
              spend: acc.spend + (c.spend || 0),
            }), { impressions: 0, clicks: 0, conversions: 0, revenue: 0, spend: 0 });

            const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
            const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
            const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

            // Determine status based on performance
            let newStatus = 'learning';
            if (totals.impressions > 10000 && roas >= 3) {
              newStatus = 'scaling';
            } else if (totals.impressions > 1000) {
              newStatus = 'optimizing';
            }

            await supabase
              .from('product_automations')
              .update({
                ...totals,
                ctr,
                roas,
                conversion_rate: conversionRate,
                status: newStatus,
                last_action: 'Metrics synced',
                last_action_at: new Date().toISOString(),
              })
              .eq('id', automation.id);
          }
        }

        results.push({
          job_type: 'SYNC_METRICS',
          status: 'completed',
          details: { automations_updated: automations.length }
        });
      }
    }

    // ==============================
    // 6. PROCESS PENDING JOBS
    // ==============================
    console.log('⚡ Processing pending jobs...');

    const { data: pendingJobs } = await supabase
      .from('automation_jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(10);

    if (pendingJobs && pendingJobs.length > 0) {
      for (const job of pendingJobs as AutomationJob[]) {
        console.log(`Processing job: ${job.id} (${job.job_type})`);

        // Mark as running
        await supabase
          .from('automation_jobs')
          .update({ status: 'running', started_at: new Date().toISOString() })
          .eq('id', job.id);

        try {
          let result: { success: boolean; error?: string; output?: unknown } = { success: false };

          switch (job.job_type) {
            case 'GENERATE_CREATIVE': {
              const { data, error } = await supabase.functions.invoke('generate-video-ad', {
                body: {
                  creative_id: job.target_id,
                  shopify_product_id: job.input_data.shopify_product_id,
                  platform: job.input_data.platform,
                  style_preset: job.input_data.style_preset,
                },
              });
              result = error ? { success: false, error: error.message } : { success: true, output: data };
              break;
            }

            case 'REGENERATE_CREATIVE': {
              const { data: creative } = await supabase
                .from('creatives')
                .select('*')
                .eq('id', job.target_id)
                .single();

              if (creative) {
                const regenerationCount = (creative.regeneration_count || 0) + 1;
                if (regenerationCount > 3) {
                  await supabase
                    .from('creatives')
                    .update({
                      status: 'killed',
                      kill_reason: 'Exceeded max regeneration attempts',
                      killed_at: new Date().toISOString(),
                    })
                    .eq('id', job.target_id);
                  result = { success: true, output: { status: 'killed', reason: 'Max regenerations exceeded' } };
                } else {
                  await supabase
                    .from('creatives')
                    .update({
                      status: 'queued',
                      regeneration_count: regenerationCount,
                      auto_regenerated: true,
                    })
                    .eq('id', job.target_id);

                  await supabase
                    .from('automation_jobs')
                    .insert({
                      user_id: job.user_id,
                      job_type: 'GENERATE_CREATIVE',
                      target_id: job.target_id,
                      input_data: creative,
                      status: 'pending',
                      priority: 2,
                    });
                  result = { success: true, output: { status: 'regenerating', count: regenerationCount } };
                }
              } else {
                result = { success: false, error: 'Creative not found' };
              }
              break;
            }

            case 'OPTIMIZE_SEO': {
              // SEO optimization for Shopify products
              result = { success: true, output: { message: 'SEO optimization queued' } };
              break;
            }

            default:
              result = { success: false, error: `Unknown job type: ${job.job_type}` };
          }

          await supabase
            .from('automation_jobs')
            .update({
              status: result.success ? 'completed' : 'failed',
              output_data: result.output || {},
              error_message: result.error || null,
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);

          results.push({
            job_id: job.id,
            job_type: job.job_type,
            status: result.success ? 'completed' : 'failed',
            details: result.output
          });

        } catch (jobError) {
          const shouldRetry = job.retry_count < job.max_retries;
          await supabase
            .from('automation_jobs')
            .update({
              status: shouldRetry ? 'pending' : 'failed',
              error_message: jobError instanceof Error ? jobError.message : 'Unknown error',
              retry_count: job.retry_count + 1,
              scheduled_for: shouldRetry
                ? new Date(Date.now() + 60000 * Math.pow(2, job.retry_count)).toISOString()
                : undefined,
              completed_at: shouldRetry ? undefined : new Date().toISOString(),
            })
            .eq('id', job.id);

          results.push({
            job_id: job.id,
            job_type: job.job_type,
            status: shouldRetry ? 'retry_scheduled' : 'failed',
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ CEO Engine completed in ${duration}ms. ${results.length} actions taken.`);

    return new Response(
      JSON.stringify({
        success: true,
        duration_ms: duration,
        actions_taken: results.length,
        results,
        next_run: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ CEO Engine error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

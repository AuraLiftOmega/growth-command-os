/**
 * RUN AUTOMATION JOBS - Edge Function
 * 
 * Processes queued automation jobs (video generation, publishing, etc.)
 * This runs as a scheduled function or can be triggered manually.
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

    console.log('Starting automation job runner...');

    // Fetch pending jobs ordered by priority and creation time
    const { data: jobs, error: fetchError } = await supabase
      .from('automation_jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      throw new Error(`Failed to fetch jobs: ${fetchError.message}`);
    }

    if (!jobs || jobs.length === 0) {
      console.log('No pending jobs found');
      return new Response(
        JSON.stringify({ success: true, jobs_processed: 0, message: 'No pending jobs' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${jobs.length} pending jobs`);
    const results: { job_id: string; status: string; error?: string }[] = [];

    for (const job of jobs as AutomationJob[]) {
      console.log(`Processing job: ${job.id} (${job.job_type})`);

      // Mark job as running
      await supabase
        .from('automation_jobs')
        .update({ 
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      try {
        let result: { success: boolean; error?: string; output?: unknown } = { success: false };

        switch (job.job_type) {
          case 'GENERATE_CREATIVE': {
            // Call the generate-video-ad function
            const { data, error } = await supabase.functions.invoke('generate-video-ad', {
              body: {
                creative_id: job.target_id,
                shopify_product_id: job.input_data.shopify_product_id,
                platform: job.input_data.platform,
                style_preset: job.input_data.style_preset,
              },
            });

            if (error) {
              result = { success: false, error: error.message };
            } else {
              result = { success: true, output: data };
            }
            break;
          }

          case 'QUALITY_EVALUATION': {
            // Evaluate creative quality
            const { data: creative } = await supabase
              .from('creatives')
              .select('*')
              .eq('id', job.target_id)
              .single();

            if (creative) {
              // Re-calculate quality score
              const qualityScore = creative.quality_score || 50;
              let newStatus = creative.status;

              // Apply quality gate rules
              if (qualityScore < 40) {
                newStatus = 'killed';
              } else if (qualityScore < 50 && creative.status !== 'killed') {
                newStatus = 'regen_queued';
              } else if (qualityScore >= 85 && creative.status === 'rendered') {
                newStatus = 'ready_to_publish';
              }

              await supabase
                .from('creatives')
                .update({ status: newStatus })
                .eq('id', job.target_id);

              result = { success: true, output: { qualityScore, newStatus } };
            } else {
              result = { success: false, error: 'Creative not found' };
            }
            break;
          }

          case 'PUBLISH_CREATIVE': {
            // Check platform credentials
            const { data: platformAccount } = await supabase
              .from('platform_accounts')
              .select('*')
              .eq('user_id', job.user_id)
              .eq('platform', job.input_data.platform)
              .eq('is_connected', true)
              .single();

            if (!platformAccount) {
              // No credentials - set to ready_to_upload
              await supabase
                .from('publish_jobs')
                .update({ status: 'ready_to_upload' })
                .eq('creative_id', job.target_id)
                .eq('platform', job.input_data.platform);

              result = { 
                success: true, 
                output: { status: 'ready_to_upload', reason: 'No platform credentials' } 
              };
            } else {
              // Would call platform API here
              // For now, mark as ready_to_upload since we don't have real API integration
              await supabase
                .from('publish_jobs')
                .update({ status: 'ready_to_upload' })
                .eq('creative_id', job.target_id)
                .eq('platform', job.input_data.platform);

              result = { 
                success: true, 
                output: { status: 'ready_to_upload', reason: 'Platform API integration pending' } 
              };
            }
            break;
          }

          case 'SYNC_METRICS': {
            // Would fetch metrics from platform APIs
            result = { 
              success: true, 
              output: { message: 'Metrics sync pending platform integration' } 
            };
            break;
          }

          case 'REGENERATE_CREATIVE': {
            // Trigger regeneration
            const { data: creative } = await supabase
              .from('creatives')
              .select('*')
              .eq('id', job.target_id)
              .single();

            if (creative) {
              // Increment regeneration count
              const regenerationCount = (creative.regeneration_count || 0) + 1;

              if (regenerationCount > 3) {
                // Too many regenerations - kill it
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
                // Queue new generation
                await supabase
                  .from('creatives')
                  .update({ 
                    status: 'queued',
                    regeneration_count: regenerationCount,
                    auto_regenerated: true,
                  })
                  .eq('id', job.target_id);

                // Create new generation job
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

          default:
            result = { success: false, error: `Unknown job type: ${job.job_type}` };
        }

        // Update job status
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
          status: result.success ? 'completed' : 'failed',
          error: result.error,
        });

      } catch (jobError) {
        console.error(`Job ${job.id} failed:`, jobError);

        const shouldRetry = job.retry_count < job.max_retries;

        await supabase
          .from('automation_jobs')
          .update({
            status: shouldRetry ? 'pending' : 'failed',
            error_message: jobError instanceof Error ? jobError.message : 'Unknown error',
            retry_count: job.retry_count + 1,
            scheduled_for: shouldRetry 
              ? new Date(Date.now() + 60000 * Math.pow(2, job.retry_count)).toISOString() // Exponential backoff
              : undefined,
            completed_at: shouldRetry ? undefined : new Date().toISOString(),
          })
          .eq('id', job.id);

        results.push({ 
          job_id: job.id, 
          status: shouldRetry ? 'retry_scheduled' : 'failed',
          error: jobError instanceof Error ? jobError.message : 'Unknown error',
        });
      }
    }

    console.log('Job runner completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        jobs_processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Job runner error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

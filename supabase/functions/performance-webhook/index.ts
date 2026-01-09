/**
 * PERFORMANCE WEBHOOK - Real-time Analytics Receiver
 * 
 * Receives webhooks from Pinterest/TikTok/Meta with impression/click data
 * Triggers RuthlessOptimizer for auto-scaling decisions
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  platform: 'pinterest' | 'tiktok' | 'meta' | 'youtube';
  event_type: 'impression' | 'click' | 'conversion' | 'video_view';
  external_id: string;
  user_id?: string;
  data: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    revenue?: number;
    video_views?: number;
    watch_time_seconds?: number;
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: WebhookPayload = await req.json();
    const { platform, event_type, external_id, user_id, data } = payload;

    console.log(`📊 Webhook received: ${platform} ${event_type} for ${external_id}`);

    // Find the creative by external platform ID
    const { data: creative } = await supabase
      .from('creatives')
      .select('id, user_id, impressions, clicks, conversions, revenue, status')
      .or(`video_url.ilike.%${external_id}%,thumbnail_url.ilike.%${external_id}%`)
      .single();

    const resolvedUserId = user_id || creative?.user_id;

    if (!resolvedUserId) {
      console.log('No user found for webhook, storing raw data');
    }

    // Store webhook data
    await supabase.from('content_performance_webhooks').insert({
      user_id: resolvedUserId || '00000000-0000-0000-0000-000000000000',
      platform,
      external_id,
      event_type,
      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
      conversions: data.conversions || 0,
      revenue: data.revenue || 0,
      raw_data: payload,
      creative_id: creative?.id
    });

    // If we found the creative, update its metrics
    if (creative) {
      const updatedMetrics = {
        impressions: (creative.impressions || 0) + (data.impressions || 0),
        clicks: (creative.clicks || 0) + (data.clicks || 0),
        conversions: (creative.conversions || 0) + (data.conversions || 0),
        revenue: (creative.revenue || 0) + (data.revenue || 0),
      };

      // Calculate CTR and ROAS
      const ctr = updatedMetrics.impressions > 0 
        ? (updatedMetrics.clicks / updatedMetrics.impressions) * 100 
        : 0;
      
      // Assume $0.10 per impression as spend (adjust based on actual)
      const estimatedSpend = updatedMetrics.impressions * 0.001; 
      const roas = estimatedSpend > 0 ? updatedMetrics.revenue / estimatedSpend : 0;

      await supabase
        .from('creatives')
        .update({
          ...updatedMetrics,
          ctr,
          roas,
          updated_at: new Date().toISOString()
        })
        .eq('id', creative.id);

      // RUTHLESS OPTIMIZER LOGIC
      // Auto-scale winners (ROAS > 2x), kill losers (ROAS < 0.5x after 1000+ impressions)
      if (updatedMetrics.impressions >= 1000) {
        let decision: string | null = null;
        let action: string | null = null;

        if (roas >= 2.0) {
          decision = 'scale';
          action = `Auto-scaling winner: ROAS ${roas.toFixed(2)}x. Creating 3 more variants.`;
          
          // Queue scaling job
          await supabase.from('automation_jobs').insert({
            user_id: creative.user_id,
            job_type: 'scale_creative',
            status: 'pending',
            input_data: { 
              creative_id: creative.id, 
              reason: 'High ROAS',
              roas,
              variants_to_create: 3
            },
            priority: 1
          });

          // Update creative status
          await supabase
            .from('creatives')
            .update({ status: 'scaling' })
            .eq('id', creative.id);

        } else if (roas < 0.5 && updatedMetrics.impressions >= 2000) {
          decision = 'kill';
          action = `Killing underperformer: ROAS ${roas.toFixed(2)}x after ${updatedMetrics.impressions} impressions.`;
          
          // Kill the creative
          await supabase
            .from('creatives')
            .update({ 
              status: 'killed',
              killed_at: new Date().toISOString(),
              kill_reason: `Low ROAS (${roas.toFixed(2)}x) after ${updatedMetrics.impressions} impressions`
            })
            .eq('id', creative.id);
        }

        if (decision) {
          // Log AI decision
          await supabase.from('ai_decision_log').insert({
            user_id: creative.user_id,
            decision_type: `ruthless_optimizer_${decision}`,
            action_taken: action,
            reasoning: `Automated performance-based decision. CTR: ${ctr.toFixed(2)}%, ROAS: ${roas.toFixed(2)}x, Impressions: ${updatedMetrics.impressions}`,
            entity_type: 'creative',
            entity_id: creative.id,
            confidence: 0.95,
            execution_status: 'completed',
            impact_metrics: updatedMetrics
          });

          console.log(`🎯 RuthlessOptimizer: ${decision} - ${action}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: true,
        creative_found: !!creative,
        message: `Webhook processed for ${platform}/${external_id}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Webhook failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

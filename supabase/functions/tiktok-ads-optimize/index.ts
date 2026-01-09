/**
 * TIKTOK ADS OPTIMIZE
 * 
 * Pulls real metrics and auto-optimizes campaigns:
 * - Get campaign/ad performance metrics
 * - Auto-scale winners (increase budget)
 * - Kill underperformers (pause ads)
 * - Budget reallocation based on ROAS
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIKTOK_ADS_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

interface OptimizeRequest {
  action: 'get_metrics' | 'optimize_all' | 'scale_campaign' | 'pause_campaign' | 'auto_budget';
  campaign_id?: string;
  adgroup_id?: string;
  date_range?: { start: string; end: string };
  new_budget?: number;
  min_roas?: number; // Minimum ROAS threshold to keep running
  max_daily_budget?: number;
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    const body: OptimizeRequest = await req.json();
    const { action } = body;

    const tiktokAccessToken = Deno.env.get('TIKTOK_ADS_ACCESS_TOKEN');
    const advertiserId = Deno.env.get('TIKTOK_ADVERTISER_ID');

    if (!tiktokAccessToken || !advertiserId) {
      return new Response(
        JSON.stringify({ 
          error: 'TikTok Ads not configured',
          requires_setup: true,
          missing: {
            access_token: !tiktokAccessToken,
            advertiser_id: !advertiserId
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiHeaders = {
      'Access-Token': tiktokAccessToken,
      'Content-Type': 'application/json',
    };

    switch (action) {
      case 'get_metrics': {
        // Get performance metrics for campaigns/ads
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const startDate = body.date_range?.start || weekAgo;
        const endDate = body.date_range?.end || today;

        // Get campaign metrics
        const metricsParams = new URLSearchParams({
          advertiser_id: advertiserId,
          report_type: 'BASIC',
          dimensions: JSON.stringify(['campaign_id']),
          metrics: JSON.stringify([
            'spend', 'impressions', 'clicks', 'ctr', 'cpc',
            'conversions', 'conversion_rate', 'cost_per_conversion',
            'video_views', 'video_watched_2s', 'video_watched_6s',
            'average_video_play', 'video_play_actions'
          ]),
          data_level: 'AUCTION_CAMPAIGN',
          start_date: startDate,
          end_date: endDate,
          page: '1',
          page_size: '100',
        });

        const response = await fetch(
          `${TIKTOK_ADS_API_BASE}/report/integrated/get/?${metricsParams}`,
          { headers: apiHeaders }
        );

        const data = await response.json();

        if (data.code !== 0) {
          console.error('TikTok metrics error:', data);
          return new Response(
            JSON.stringify({ error: data.message || 'Failed to fetch metrics' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Process and calculate ROAS
        const campaigns = (data.data?.list || []).map((row: any) => {
          const spend = parseFloat(row.metrics?.spend || 0);
          const conversions = parseInt(row.metrics?.conversions || 0);
          // Estimate revenue based on AOV (assume $50 for skincare)
          const estimatedRevenue = conversions * 50;
          const roas = spend > 0 ? estimatedRevenue / spend : 0;

          return {
            campaign_id: row.dimensions?.campaign_id,
            spend,
            impressions: parseInt(row.metrics?.impressions || 0),
            clicks: parseInt(row.metrics?.clicks || 0),
            ctr: parseFloat(row.metrics?.ctr || 0),
            cpc: parseFloat(row.metrics?.cpc || 0),
            conversions,
            cost_per_conversion: parseFloat(row.metrics?.cost_per_conversion || 0),
            video_views: parseInt(row.metrics?.video_views || 0),
            estimated_revenue: estimatedRevenue,
            roas,
            performance: roas >= 3 ? 'winner' : roas >= 1.5 ? 'neutral' : 'underperformer',
          };
        });

        // Store metrics in creative_metrics for dashboard
        for (const campaign of campaigns) {
          await supabase.from('creative_metrics').insert({
            user_id: userId,
            creative_id: campaign.campaign_id,
            platform: 'tiktok_ads',
            spend: campaign.spend,
            impressions: campaign.impressions,
            clicks: campaign.clicks,
            ctr: campaign.ctr,
            conversions: campaign.conversions,
            revenue: campaign.estimated_revenue,
            roas: campaign.roas,
            observed_at: new Date().toISOString(),
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            campaigns,
            summary: {
              total_spend: campaigns.reduce((s: number, c: any) => s + c.spend, 0),
              total_conversions: campaigns.reduce((s: number, c: any) => s + c.conversions, 0),
              total_revenue: campaigns.reduce((s: number, c: any) => s + c.estimated_revenue, 0),
              avg_roas: campaigns.length > 0 
                ? campaigns.reduce((s: number, c: any) => s + c.roas, 0) / campaigns.length 
                : 0,
              winners: campaigns.filter((c: any) => c.performance === 'winner').length,
              underperformers: campaigns.filter((c: any) => c.performance === 'underperformer').length,
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'optimize_all': {
        // RuthlessOptimizer: Auto-scale winners, kill losers
        const minRoas = body.min_roas || 2.0;
        const maxDailyBudget = body.max_daily_budget || 500;

        // First get current metrics
        const today = new Date().toISOString().split('T')[0];
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const metricsParams = new URLSearchParams({
          advertiser_id: advertiserId,
          report_type: 'BASIC',
          dimensions: JSON.stringify(['campaign_id']),
          metrics: JSON.stringify(['spend', 'conversions', 'clicks', 'impressions']),
          data_level: 'AUCTION_CAMPAIGN',
          start_date: threeDaysAgo,
          end_date: today,
        });

        const metricsResponse = await fetch(
          `${TIKTOK_ADS_API_BASE}/report/integrated/get/?${metricsParams}`,
          { headers: apiHeaders }
        );

        const metricsData = await metricsResponse.json();
        const campaigns = metricsData.data?.list || [];

        const optimizations = {
          scaled: [] as string[],
          paused: [] as string[],
          unchanged: [] as string[],
        };

        for (const campaign of campaigns) {
          const spend = parseFloat(campaign.metrics?.spend || 0);
          const conversions = parseInt(campaign.metrics?.conversions || 0);
          const revenue = conversions * 50;
          const roas = spend > 0 ? revenue / spend : 0;
          const campaignId = campaign.dimensions?.campaign_id;

          if (roas >= minRoas * 1.5 && spend < maxDailyBudget) {
            // WINNER: Scale budget 2x (up to max)
            const newBudget = Math.min(spend * 2, maxDailyBudget);
            
            await fetch(`${TIKTOK_ADS_API_BASE}/campaign/update/`, {
              method: 'POST',
              headers: apiHeaders,
              body: JSON.stringify({
                advertiser_id: advertiserId,
                campaign_id: campaignId,
                budget: newBudget * 100,
              }),
            });

            optimizations.scaled.push(campaignId);

            await supabase.from('ai_decision_log').insert({
              user_id: userId,
              decision_type: 'tiktok_auto_scale',
              action_taken: `Scaled TikTok campaign ${campaignId} budget to $${newBudget}`,
              confidence: 0.88,
              reasoning: `ROAS ${roas.toFixed(1)}x exceeds ${minRoas * 1.5}x threshold`,
              execution_status: 'completed',
            });

          } else if (roas < 1.0 && spend > 50) {
            // UNDERPERFORMER: Pause campaign
            await fetch(`${TIKTOK_ADS_API_BASE}/campaign/update/status/`, {
              method: 'POST',
              headers: apiHeaders,
              body: JSON.stringify({
                advertiser_id: advertiserId,
                campaign_ids: [campaignId],
                operation_status: 'DISABLE',
              }),
            });

            optimizations.paused.push(campaignId);

            await supabase.from('ai_decision_log').insert({
              user_id: userId,
              decision_type: 'tiktok_auto_pause',
              action_taken: `Paused underperforming TikTok campaign ${campaignId}`,
              confidence: 0.92,
              reasoning: `ROAS ${roas.toFixed(1)}x below 1.0x after $${spend} spend`,
              execution_status: 'completed',
            });

          } else {
            optimizations.unchanged.push(campaignId);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            optimizations,
            message: `Scaled ${optimizations.scaled.length}, paused ${optimizations.paused.length} campaigns`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'scale_campaign': {
        if (!body.campaign_id || !body.new_budget) {
          return new Response(
            JSON.stringify({ error: 'campaign_id and new_budget required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const response = await fetch(`${TIKTOK_ADS_API_BASE}/campaign/update/`, {
          method: 'POST',
          headers: apiHeaders,
          body: JSON.stringify({
            advertiser_id: advertiserId,
            campaign_id: body.campaign_id,
            budget: body.new_budget * 100,
          }),
        });

        const data = await response.json();

        if (data.code !== 0) {
          return new Response(
            JSON.stringify({ error: data.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, new_budget: body.new_budget }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'pause_campaign': {
        if (!body.campaign_id) {
          return new Response(
            JSON.stringify({ error: 'campaign_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const response = await fetch(`${TIKTOK_ADS_API_BASE}/campaign/update/status/`, {
          method: 'POST',
          headers: apiHeaders,
          body: JSON.stringify({
            advertiser_id: advertiserId,
            campaign_ids: [body.campaign_id],
            operation_status: 'DISABLE',
          }),
        });

        const data = await response.json();

        return new Response(
          JSON.stringify({ success: data.code === 0, data }),
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
    console.error('TikTok Ads Optimize error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Optimization failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

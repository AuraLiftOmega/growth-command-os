/**
 * TIKTOK ADS REPORT
 * 
 * Syncs TikTok Ads metrics to Analytics Panel:
 * - Daily spend/revenue/ROAS reports
 * - Campaign performance breakdown
 * - Audience insights
 * - Sync to dashboard tables
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIKTOK_ADS_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

interface ReportRequest {
  action: 'daily_summary' | 'campaign_breakdown' | 'audience_insights' | 'sync_to_dashboard';
  date_range?: { start: string; end: string };
  granularity?: 'DAY' | 'HOUR';
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
    const body: ReportRequest = await req.json();
    const { action } = body;

    const tiktokAccessToken = Deno.env.get('TIKTOK_ADS_ACCESS_TOKEN');
    const advertiserId = Deno.env.get('TIKTOK_ADVERTISER_ID');

    if (!tiktokAccessToken || !advertiserId) {
      return new Response(
        JSON.stringify({ 
          error: 'TikTok Ads not configured',
          requires_setup: true
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiHeaders = {
      'Access-Token': tiktokAccessToken,
      'Content-Type': 'application/json',
    };

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const startDate = body.date_range?.start || thirtyDaysAgo;
    const endDate = body.date_range?.end || today;

    switch (action) {
      case 'daily_summary': {
        const params = new URLSearchParams({
          advertiser_id: advertiserId,
          report_type: 'BASIC',
          dimensions: JSON.stringify(['stat_time_day']),
          metrics: JSON.stringify([
            'spend', 'impressions', 'clicks', 'ctr', 'cpc',
            'conversions', 'conversion_rate', 'cost_per_conversion',
            'video_views', 'reach'
          ]),
          data_level: 'AUCTION_ADVERTISER',
          start_date: startDate,
          end_date: endDate,
        });

        const response = await fetch(
          `${TIKTOK_ADS_API_BASE}/report/integrated/get/?${params}`,
          { headers: apiHeaders }
        );

        const data = await response.json();

        if (data.code !== 0) {
          return new Response(
            JSON.stringify({ error: data.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const dailyData = (data.data?.list || []).map((row: any) => {
          const spend = parseFloat(row.metrics?.spend || 0);
          const conversions = parseInt(row.metrics?.conversions || 0);
          const revenue = conversions * 50; // Assume $50 AOV

          return {
            date: row.dimensions?.stat_time_day,
            spend,
            impressions: parseInt(row.metrics?.impressions || 0),
            clicks: parseInt(row.metrics?.clicks || 0),
            ctr: parseFloat(row.metrics?.ctr || 0),
            conversions,
            revenue,
            roas: spend > 0 ? revenue / spend : 0,
            reach: parseInt(row.metrics?.reach || 0),
          };
        });

        const totals = dailyData.reduce((acc: any, day: any) => ({
          spend: acc.spend + day.spend,
          impressions: acc.impressions + day.impressions,
          clicks: acc.clicks + day.clicks,
          conversions: acc.conversions + day.conversions,
          revenue: acc.revenue + day.revenue,
          reach: acc.reach + day.reach,
        }), { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, reach: 0 });

        return new Response(
          JSON.stringify({
            success: true,
            daily: dailyData,
            totals: {
              ...totals,
              roas: totals.spend > 0 ? totals.revenue / totals.spend : 0,
              ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
              cpa: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
            },
            period: { start: startDate, end: endDate },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'campaign_breakdown': {
        const params = new URLSearchParams({
          advertiser_id: advertiserId,
          report_type: 'BASIC',
          dimensions: JSON.stringify(['campaign_id', 'campaign_name']),
          metrics: JSON.stringify([
            'spend', 'impressions', 'clicks', 'ctr',
            'conversions', 'cost_per_conversion', 'video_views'
          ]),
          data_level: 'AUCTION_CAMPAIGN',
          start_date: startDate,
          end_date: endDate,
        });

        const response = await fetch(
          `${TIKTOK_ADS_API_BASE}/report/integrated/get/?${params}`,
          { headers: apiHeaders }
        );

        const data = await response.json();

        const campaigns = (data.data?.list || []).map((row: any) => {
          const spend = parseFloat(row.metrics?.spend || 0);
          const conversions = parseInt(row.metrics?.conversions || 0);
          const revenue = conversions * 50;

          return {
            campaign_id: row.dimensions?.campaign_id,
            campaign_name: row.dimensions?.campaign_name,
            spend,
            impressions: parseInt(row.metrics?.impressions || 0),
            clicks: parseInt(row.metrics?.clicks || 0),
            ctr: parseFloat(row.metrics?.ctr || 0),
            conversions,
            cpa: parseFloat(row.metrics?.cost_per_conversion || 0),
            video_views: parseInt(row.metrics?.video_views || 0),
            revenue,
            roas: spend > 0 ? revenue / spend : 0,
            status: spend > 0 && (revenue / spend) >= 2 ? 'performing' : 'needs_attention',
          };
        });

        // Sort by ROAS descending
        campaigns.sort((a: any, b: any) => b.roas - a.roas);

        return new Response(
          JSON.stringify({
            success: true,
            campaigns,
            top_performers: campaigns.slice(0, 3),
            underperformers: campaigns.filter((c: any) => c.roas < 1.5).slice(0, 3),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'audience_insights': {
        // Get audience demographics
        const params = new URLSearchParams({
          advertiser_id: advertiserId,
          report_type: 'AUDIENCE',
          dimensions: JSON.stringify(['age', 'gender']),
          metrics: JSON.stringify(['impressions', 'clicks', 'conversions', 'spend']),
          data_level: 'AUCTION_ADVERTISER',
          start_date: startDate,
          end_date: endDate,
        });

        const response = await fetch(
          `${TIKTOK_ADS_API_BASE}/report/integrated/get/?${params}`,
          { headers: apiHeaders }
        );

        const data = await response.json();

        const insights = (data.data?.list || []).map((row: any) => ({
          age: row.dimensions?.age,
          gender: row.dimensions?.gender,
          impressions: parseInt(row.metrics?.impressions || 0),
          clicks: parseInt(row.metrics?.clicks || 0),
          conversions: parseInt(row.metrics?.conversions || 0),
          spend: parseFloat(row.metrics?.spend || 0),
        }));

        // Find best performing segments
        const sorted = [...insights].sort((a, b) => b.conversions - a.conversions);

        return new Response(
          JSON.stringify({
            success: true,
            demographics: insights,
            top_segments: sorted.slice(0, 5),
            recommendation: sorted[0] 
              ? `Best performing: ${sorted[0].gender} ${sorted[0].age} - consider increasing budget for this segment`
              : 'Not enough data for recommendations',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync_to_dashboard': {
        // Pull all data and sync to dashboard tables
        const [dailySummary, campaignBreakdown] = await Promise.all([
          fetch(`${TIKTOK_ADS_API_BASE}/report/integrated/get/?${new URLSearchParams({
            advertiser_id: advertiserId,
            report_type: 'BASIC',
            dimensions: JSON.stringify(['stat_time_day']),
            metrics: JSON.stringify(['spend', 'conversions', 'clicks', 'impressions']),
            data_level: 'AUCTION_ADVERTISER',
            start_date: startDate,
            end_date: endDate,
          })}`, { headers: apiHeaders }).then(r => r.json()),
          
          fetch(`${TIKTOK_ADS_API_BASE}/report/integrated/get/?${new URLSearchParams({
            advertiser_id: advertiserId,
            report_type: 'BASIC',
            dimensions: JSON.stringify(['campaign_id']),
            metrics: JSON.stringify(['spend', 'conversions', 'clicks', 'impressions']),
            data_level: 'AUCTION_CAMPAIGN',
            start_date: startDate,
            end_date: endDate,
          })}`, { headers: apiHeaders }).then(r => r.json()),
        ]);

        // Sync campaign metrics to creative_metrics
        const campaigns = campaignBreakdown.data?.list || [];
        for (const campaign of campaigns) {
          const spend = parseFloat(campaign.metrics?.spend || 0);
          const conversions = parseInt(campaign.metrics?.conversions || 0);
          const revenue = conversions * 50;

          await supabase.from('creative_metrics').upsert({
            user_id: userId,
            creative_id: campaign.dimensions?.campaign_id,
            platform: 'tiktok_ads',
            spend,
            impressions: parseInt(campaign.metrics?.impressions || 0),
            clicks: parseInt(campaign.metrics?.clicks || 0),
            ctr: parseInt(campaign.metrics?.impressions || 0) > 0 
              ? (parseInt(campaign.metrics?.clicks || 0) / parseInt(campaign.metrics?.impressions || 0)) * 100 
              : 0,
            conversions,
            revenue,
            roas: spend > 0 ? revenue / spend : 0,
            observed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,creative_id,platform,observed_at'
          });
        }

        // Calculate totals
        const totalSpend = campaigns.reduce((s: number, c: any) => s + parseFloat(c.metrics?.spend || 0), 0);
        const totalConversions = campaigns.reduce((s: number, c: any) => s + parseInt(c.metrics?.conversions || 0), 0);
        const totalRevenue = totalConversions * 50;

        return new Response(
          JSON.stringify({
            success: true,
            synced: {
              campaigns: campaigns.length,
              total_spend: totalSpend,
              total_revenue: totalRevenue,
              total_roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
            },
            last_sync: new Date().toISOString(),
          }),
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
    console.error('TikTok Ads Report error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Report failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

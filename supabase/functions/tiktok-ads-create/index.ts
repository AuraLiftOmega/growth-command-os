/**
 * TIKTOK ADS CREATE
 * 
 * Creates TikTok ad campaigns from swarm videos using Marketing API v2.
 * - Campaign creation with budget
 * - Ad group targeting (demographics, interests)
 * - Ad creative from video URL
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIKTOK_ADS_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

interface TikTokAdsRequest {
  action: 'create_campaign' | 'create_adgroup' | 'create_ad' | 'create_full_campaign' | 'get_advertiser_id';
  advertiser_id?: string;
  campaign_name?: string;
  budget?: number;
  budget_mode?: 'BUDGET_MODE_TOTAL' | 'BUDGET_MODE_DAY';
  objective?: 'CONVERSIONS' | 'TRAFFIC' | 'REACH' | 'VIDEO_VIEWS';
  video_url?: string;
  video_id?: string;
  product_name?: string;
  target_url?: string;
  targeting?: {
    age_groups?: string[];
    gender?: 'GENDER_FEMALE' | 'GENDER_MALE' | 'GENDER_UNLIMITED';
    interests?: string[];
    locations?: string[];
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

    // Authenticate user
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
    const body: TikTokAdsRequest = await req.json();
    const { action } = body;

    // Get TikTok Ads access token from platform_accounts
    const { data: account } = await supabase
      .from('platform_accounts')
      .select('credentials_encrypted')
      .eq('user_id', userId)
      .eq('platform', 'tiktok')
      .single();

    // For Marketing API, we need separate Business Center credentials
    const tiktokAccessToken = Deno.env.get('TIKTOK_ADS_ACCESS_TOKEN');
    const advertiserId = body.advertiser_id || Deno.env.get('TIKTOK_ADVERTISER_ID');

    if (!tiktokAccessToken) {
      return new Response(
        JSON.stringify({ 
          error: 'TikTok Ads not configured',
          message: 'Add TIKTOK_ADS_ACCESS_TOKEN to secrets. Get it from TikTok Business Center.',
          requires_setup: true
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiHeaders = {
      'Access-Token': tiktokAccessToken,
      'Content-Type': 'application/json',
    };

    switch (action) {
      case 'get_advertiser_id': {
        // Get list of authorized advertiser accounts
        const response = await fetch(`${TIKTOK_ADS_API_BASE}/oauth2/advertiser/get/`, {
          method: 'GET',
          headers: apiHeaders,
        });

        const data = await response.json();
        
        if (data.code !== 0) {
          console.error('TikTok API error:', data);
          return new Response(
            JSON.stringify({ error: data.message || 'Failed to get advertiser accounts' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            advertisers: data.data?.list || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_campaign': {
        if (!advertiserId) {
          return new Response(
            JSON.stringify({ error: 'advertiser_id required. Add TIKTOK_ADVERTISER_ID to secrets.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const campaignPayload = {
          advertiser_id: advertiserId,
          campaign_name: body.campaign_name || `DOMINION Campaign ${new Date().toISOString().split('T')[0]}`,
          objective_type: body.objective || 'TRAFFIC',
          budget_mode: body.budget_mode || 'BUDGET_MODE_DAY',
          budget: (body.budget || 100) * 100, // TikTok uses cents
        };

        const response = await fetch(`${TIKTOK_ADS_API_BASE}/campaign/create/`, {
          method: 'POST',
          headers: apiHeaders,
          body: JSON.stringify(campaignPayload),
        });

        const data = await response.json();

        if (data.code !== 0) {
          console.error('TikTok campaign create error:', data);
          return new Response(
            JSON.stringify({ error: data.message || 'Campaign creation failed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Log to ai_decision_log
        await supabase.from('ai_decision_log').insert({
          user_id: userId,
          decision_type: 'tiktok_campaign_create',
          action_taken: `Created TikTok campaign: ${campaignPayload.campaign_name}`,
          confidence: 0.95,
          execution_status: 'completed',
          impact_metrics: { budget: body.budget, objective: campaignPayload.objective_type }
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            campaign_id: data.data?.campaign_id,
            campaign_name: campaignPayload.campaign_name
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_full_campaign': {
        // Full flow: Create campaign → ad group → ad
        if (!advertiserId) {
          return new Response(
            JSON.stringify({ error: 'advertiser_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const dailyBudget = body.budget || 50;
        const campaignName = body.campaign_name || `${body.product_name || 'Product'} - Auto Campaign`;

        // Step 1: Create Campaign
        const campaignResponse = await fetch(`${TIKTOK_ADS_API_BASE}/campaign/create/`, {
          method: 'POST',
          headers: apiHeaders,
          body: JSON.stringify({
            advertiser_id: advertiserId,
            campaign_name: campaignName,
            objective_type: body.objective || 'TRAFFIC',
            budget_mode: 'BUDGET_MODE_DAY',
            budget: dailyBudget * 100,
          }),
        });

        const campaignData = await campaignResponse.json();
        if (campaignData.code !== 0) {
          return new Response(
            JSON.stringify({ error: `Campaign creation failed: ${campaignData.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const campaignId = campaignData.data?.campaign_id;

        // Step 2: Create Ad Group with targeting
        const targeting = body.targeting || {};
        const adGroupPayload = {
          advertiser_id: advertiserId,
          campaign_id: campaignId,
          adgroup_name: `${campaignName} - AdGroup`,
          placement_type: 'PLACEMENT_TYPE_AUTOMATIC',
          budget_mode: 'BUDGET_MODE_DAY',
          budget: dailyBudget * 100,
          schedule_type: 'SCHEDULE_FROM_NOW',
          billing_event: 'CPC',
          bid_type: 'BID_TYPE_NO_BID',
          optimization_goal: 'CLICK',
          pacing: 'PACING_MODE_SMOOTH',
          // Targeting
          age_groups: targeting.age_groups || ['AGE_25_34', 'AGE_35_44'],
          gender: targeting.gender || 'GENDER_FEMALE',
          interest_category_ids: targeting.interests || [],
          location_ids: targeting.locations || [],
        };

        const adGroupResponse = await fetch(`${TIKTOK_ADS_API_BASE}/adgroup/create/`, {
          method: 'POST',
          headers: apiHeaders,
          body: JSON.stringify(adGroupPayload),
        });

        const adGroupData = await adGroupResponse.json();
        if (adGroupData.code !== 0) {
          console.error('Ad group creation failed:', adGroupData);
          // Continue anyway, log warning
        }

        const adGroupId = adGroupData.data?.adgroup_id;

        // Step 3: Upload video (if URL provided) or use existing video_id
        let videoId = body.video_id;
        
        if (body.video_url && !videoId) {
          // Upload video from URL
          const uploadResponse = await fetch(`${TIKTOK_ADS_API_BASE}/file/video/ad/upload/`, {
            method: 'POST',
            headers: apiHeaders,
            body: JSON.stringify({
              advertiser_id: advertiserId,
              video_url: body.video_url,
              upload_type: 'UPLOAD_BY_URL',
            }),
          });

          const uploadData = await uploadResponse.json();
          if (uploadData.code === 0) {
            videoId = uploadData.data?.video_id;
          }
        }

        // Step 4: Create Ad with the video
        let adId = null;
        if (adGroupId && videoId) {
          const adPayload = {
            advertiser_id: advertiserId,
            adgroup_id: adGroupId,
            creatives: [{
              ad_name: `${body.product_name || 'Product'} Ad`,
              ad_format: 'SINGLE_VIDEO',
              video_id: videoId,
              ad_text: body.product_name ? `Discover ${body.product_name} ✨` : 'Discover now ✨',
              call_to_action: 'SHOP_NOW',
              landing_page_url: body.target_url || 'https://auraliftessentials.com',
            }],
          };

          const adResponse = await fetch(`${TIKTOK_ADS_API_BASE}/ad/create/`, {
            method: 'POST',
            headers: apiHeaders,
            body: JSON.stringify(adPayload),
          });

          const adData = await adResponse.json();
          if (adData.code === 0) {
            adId = adData.data?.ad_ids?.[0];
          }
        }

        // Log full campaign creation
        await supabase.from('ai_decision_log').insert({
          user_id: userId,
          decision_type: 'tiktok_full_campaign',
          action_taken: `Created full TikTok campaign: ${campaignName}`,
          confidence: 0.92,
          execution_status: 'completed',
          impact_metrics: {
            campaign_id: campaignId,
            adgroup_id: adGroupId,
            ad_id: adId,
            budget: dailyBudget,
            targeting: targeting
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            campaign_id: campaignId,
            adgroup_id: adGroupId,
            ad_id: adId,
            campaign_name: campaignName,
            daily_budget: dailyBudget
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
    console.error('TikTok Ads error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'TikTok Ads API failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

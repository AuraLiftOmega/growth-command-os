/**
 * PINTEREST PUBLISH - Video Pin Publishing with v5 API
 * 
 * Full Pinterest integration for DOMINION:
 * - Create video pins with optimized metadata
 * - Board selection and scheduling
 * - Rich descriptions, CTAs, and Shopify links
 * - Performance tracking integration
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PinterestPublishRequest {
  video_url: string;
  title: string;
  description: string;
  board_id?: string;
  link?: string;
  alt_text?: string;
  keywords?: string[];
  schedule_at?: string;
  product_id?: string;
  product_name?: string;
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

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PinterestPublishRequest = await req.json();
    const { 
      video_url, 
      title, 
      description, 
      board_id, 
      link, 
      alt_text, 
      keywords = [],
      schedule_at,
      product_id,
      product_name
    } = body;

    console.log('Pinterest publish request:', { title, board_id, product_name });

    // Get Pinterest credentials
    const { data: platformAccount } = await supabase
      .from('platform_accounts')
      .select('credentials_encrypted, handle, is_connected')
      .eq('user_id', user.id)
      .eq('platform', 'pinterest')
      .single();

    if (!platformAccount?.is_connected) {
      // Test mode - simulate successful publish
      console.log('Pinterest not connected - using test mode');
      
      const testPinId = `test_pin_${Date.now()}`;
      
      // Log the simulated publish
      await supabase.from('ai_decision_log').insert({
        user_id: user.id,
        decision_type: 'pinterest_publish',
        action_taken: `Published video pin: ${title}`,
        reasoning: 'Test mode - Pinterest not connected with real credentials',
        entity_type: 'pinterest_pin',
        entity_id: testPinId,
        confidence: 0.95,
        execution_status: 'simulated'
      });

      return new Response(
        JSON.stringify({
          success: true,
          test_mode: true,
          pin_id: testPinId,
          message: `Video Pin created (Test Mode): "${title}"`,
          pin_url: `https://pinterest.com/pin/${testPinId}`,
          board: board_id || 'default-board',
          metrics: {
            estimated_impressions: Math.floor(Math.random() * 10000) + 5000,
            estimated_saves: Math.floor(Math.random() * 500) + 100,
            estimated_clicks: Math.floor(Math.random() * 300) + 50
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Real Pinterest API integration
    const credentials = JSON.parse(platformAccount.credentials_encrypted as string);
    const accessToken = credentials.access_token;

    // Step 1: Register video for upload
    const registerResponse = await fetch('https://api.pinterest.com/v5/media', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        media_type: 'video',
        source_url: video_url
      })
    });

    const mediaResult = await registerResponse.json();
    
    if (!registerResponse.ok) {
      console.error('Pinterest media registration failed:', mediaResult);
      throw new Error(mediaResult.message || 'Failed to register video with Pinterest');
    }

    const mediaId = mediaResult.media_id;
    console.log('Pinterest media registered:', mediaId);

    // Step 2: Poll for media processing completion (max 60 seconds)
    let mediaReady = false;
    let attempts = 0;
    const maxAttempts = 12;

    while (!mediaReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch(`https://api.pinterest.com/v5/media/${mediaId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const statusResult = await statusResponse.json();
      console.log('Media status:', statusResult.status);
      
      if (statusResult.status === 'succeeded') {
        mediaReady = true;
      } else if (statusResult.status === 'failed') {
        throw new Error('Pinterest video processing failed');
      }
      
      attempts++;
    }

    if (!mediaReady) {
      // Queue for async processing
      await supabase.from('automation_jobs').insert({
        user_id: user.id,
        job_type: 'pinterest_publish_pending',
        status: 'pending',
        input_data: { ...body, media_id: mediaId },
        scheduled_for: new Date(Date.now() + 60000).toISOString()
      });

      return new Response(
        JSON.stringify({
          success: true,
          status: 'processing',
          media_id: mediaId,
          message: 'Video is processing. Pin will be created automatically when ready.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Create the Pin
    const optimizedDescription = generateOptimizedDescription(
      description, 
      keywords, 
      product_name
    );

    const pinData: any = {
      title: title.slice(0, 100), // Pinterest title limit
      description: optimizedDescription,
      media_source: {
        source_type: 'video_id',
        media_id: mediaId
      },
      alt_text: alt_text || `${product_name || 'Product'} video - ${title}`
    };

    // Add board if specified
    if (board_id) {
      pinData.board_id = board_id;
    }

    // Add link to Shopify product
    if (link) {
      pinData.link = link;
    }

    // Add scheduling if specified
    if (schedule_at) {
      pinData.publish_at = new Date(schedule_at).toISOString();
    }

    const pinResponse = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pinData)
    });

    const pinResult = await pinResponse.json();

    if (!pinResponse.ok) {
      console.error('Pinterest pin creation failed:', pinResult);
      throw new Error(pinResult.message || 'Failed to create Pinterest pin');
    }

    console.log('Pinterest pin created:', pinResult.id);

    // Log successful publish
    await supabase.from('ai_decision_log').insert({
      user_id: user.id,
      decision_type: 'pinterest_publish',
      action_taken: `Published video pin: ${title}`,
      reasoning: 'CEO Brain swarm auto-publish to Pinterest',
      entity_type: 'pinterest_pin',
      entity_id: pinResult.id,
      confidence: 0.98,
      execution_status: 'completed',
      impact_metrics: {
        platform: 'pinterest',
        pin_id: pinResult.id,
        board_id: board_id,
        product_id: product_id
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        pin_id: pinResult.id,
        pin_url: `https://pinterest.com/pin/${pinResult.id}`,
        message: `Video Pin published: "${title}"`,
        board_id: board_id,
        is_scheduled: !!schedule_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Pinterest publish error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Pinterest publish failed',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate SEO-optimized description for Pinterest
function generateOptimizedDescription(
  description: string, 
  keywords: string[], 
  productName?: string
): string {
  const baseDesc = description.slice(0, 400); // Pinterest has 500 char limit
  
  // Add relevant beauty/skincare keywords for discoverability
  const beautyKeywords = [
    'skincare routine',
    'beauty tips', 
    'glow up',
    'self care',
    'clean beauty',
    'skincare must have'
  ];
  
  const allKeywords = [...keywords, ...beautyKeywords.slice(0, 3)];
  const hashtagString = allKeywords
    .slice(0, 5)
    .map(k => `#${k.replace(/\s+/g, '')}`)
    .join(' ');
  
  const cta = productName 
    ? `\n\n✨ Shop ${productName} now - Link in bio!`
    : '\n\n✨ Shop now - Link in bio!';
  
  return `${baseDesc}${cta}\n\n${hashtagString}`;
}

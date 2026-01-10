/**
 * OMEGA OPTIMIZE CONTENT - AI-powered content optimization per channel
 * 
 * Uses Lovable AI to tailor captions, hashtags, and language for each platform:
 * - TikTok: Punchy, Gen-Z, hook-driven
 * - Instagram: Polished, aesthetic, story-driven  
 * - Twitter/X: Concise, witty, engagement-focused
 * - YouTube: Engaging, informative, clickable
 * - LinkedIn: Professional, thought-leadership
 * - Pinterest: Inspirational, searchable, solution-focused
 * - Facebook: Friendly, conversational, shareable
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHANNEL_PROMPTS: Record<string, { tone: string; style: string; maxLen: number; hashtagCount: number; examples: string }> = {
  tiktok: {
    tone: 'punchy and viral',
    style: 'Gen-Z casual, trendy, hook-driven opening, create curiosity',
    maxLen: 150,
    hashtagCount: 5,
    examples: 'POV: you finally... | Wait for it... | The way this changed everything 👀 | NOT the [product] doing [benefit] | if u know u know'
  },
  instagram: {
    tone: 'polished and aspirational',
    style: 'Aesthetic, story-driven, lifestyle-focused, uses strategic emojis',
    maxLen: 300,
    hashtagCount: 15,
    examples: '✨ Your glow-up journey starts here | Living for this [benefit] | The secret to [desire] | Tag someone who needs this'
  },
  twitter: {
    tone: 'concise and witty',
    style: 'Sharp, clever, engagement-focused, lowercase preferred, no fluff',
    maxLen: 280,
    hashtagCount: 2,
    examples: 'this hits different. | the [product] that actually works | if u know u know | not me [action] 👀'
  },
  youtube: {
    tone: 'engaging and informative',
    style: 'Clickable titles, detailed descriptions, SEO-optimized, creates anticipation',
    maxLen: 500,
    hashtagCount: 8,
    examples: 'The Truth About [Product] | I Tried [Product] for 30 Days | FINALLY! A [category] That Works | [Product] Review: Worth the Hype?'
  },
  linkedin: {
    tone: 'professional and thought-provoking',
    style: 'Business-casual, value-driven, establishes expertise, uses line breaks for readability',
    maxLen: 400,
    hashtagCount: 5,
    examples: "Here's what I learned about [topic]... | Unpopular opinion: [statement] | After [X] years in [industry], I realized... | The [number] things that changed my [outcome]"
  },
  pinterest: {
    tone: 'inspirational and searchable',
    style: 'Solution-focused, aspirational, keyword-rich for discovery, actionable',
    maxLen: 300,
    hashtagCount: 10,
    examples: 'Ultimate Guide to [Goal] | Best [Product] for [Benefit] | Transform Your [Area] | [Number] [Product] Tips That Work'
  },
  facebook: {
    tone: 'friendly and conversational',
    style: 'Community-focused, shareable, asks questions, encourages comments',
    maxLen: 250,
    hashtagCount: 3,
    examples: 'Have you ever tried...? | Tag a friend who needs this! | Comment below if you... | Share this with someone who...'
  }
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      channel, 
      product_name, 
      product_description, 
      video_hook,
      original_caption,
      target_audience,
      brand_voice 
    } = await req.json();

    console.log(`[omega-optimize] Optimizing content for ${channel}`);

    const channelConfig = CHANNEL_PROMPTS[channel];
    if (!channelConfig) {
      return new Response(
        JSON.stringify({ error: 'Unsupported channel' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      // Fallback to template-based optimization
      return new Response(
        JSON.stringify(generateTemplateContent(channel, product_name, video_hook)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI for intelligent optimization
    const prompt = `You are Omega, an elite social media content strategist. Optimize the following content for ${channel.toUpperCase()}.

CHANNEL REQUIREMENTS:
- Tone: ${channelConfig.tone}
- Style: ${channelConfig.style}
- Max Caption Length: ${channelConfig.maxLen} characters
- Hashtag Count: ${channelConfig.hashtagCount}
- Example patterns: ${channelConfig.examples}

PRODUCT INFO:
- Name: ${product_name || 'Skincare Product'}
- Description: ${product_description || 'Premium beauty product'}
- Video Hook: ${video_hook || 'Problem/Solution format'}
${original_caption ? `- Original Caption: ${original_caption}` : ''}
${target_audience ? `- Target Audience: ${target_audience}` : ''}
${brand_voice ? `- Brand Voice: ${brand_voice}` : ''}

Generate an optimized caption and hashtags for ${channel}. The content must:
1. Follow the exact tone and style for this platform
2. Hook attention in the first 3 words
3. Stay under the max character limit
4. Use the exact number of hashtags specified
5. Feel native to the platform (not like an ad)

Respond in JSON format:
{
  "caption": "the optimized caption here",
  "hashtags": "#hashtag1 #hashtag2 ...",
  "hook_words": ["first", "three", "words"],
  "cta": "call to action phrase",
  "confidence_score": 0.95
}`;

    const aiResponse = await fetch('https://api.lovable.dev/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      console.warn('[omega-optimize] AI API failed, using template');
      return new Response(
        JSON.stringify(generateTemplateContent(channel, product_name, video_hook)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    // Parse AI response
    let optimized;
    try {
      // Extract JSON from response (may have markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimized = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseErr) {
      console.warn('[omega-optimize] Failed to parse AI response, using template');
      optimized = generateTemplateContent(channel, product_name, video_hook);
    }

    console.log(`[omega-optimize] Generated optimized content for ${channel}`);

    return new Response(
      JSON.stringify({
        channel,
        ...optimized,
        tone: channelConfig.tone,
        style: channelConfig.style,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[omega-optimize] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Optimization failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback template-based content generation
function generateTemplateContent(channel: string, productName?: string, videoHook?: string) {
  const product = productName || 'this product';
  
  const templates: Record<string, { caption: string; hashtags: string }> = {
    tiktok: {
      caption: `POV: you finally found the ${product} that actually WORKS 💫 link in bio for 20% off!`,
      hashtags: '#skincare #glowup #skintok #beautytok #fyp'
    },
    instagram: {
      caption: `Your glow-up journey starts here ✨ ${product} delivers results you can see in just 7 days. Tap to shop now!`,
      hashtags: '#skincare #beauty #selfcare #glowingskin #skincareproducts #skincarelover #beautyessentials #glowup #skincaretips #radiantskin #beautyroutine #skincareobsessed #skingoals #naturalbeauty #beautygram'
    },
    twitter: {
      caption: `the ${product} that changed everything 👀 if u know u know`,
      hashtags: '#skincare #beauty'
    },
    youtube: {
      caption: `The Truth About ${product} | Full Review & 30-Day Results\n\nI tested ${product} for an entire month to see if it actually lives up to the hype. Here are my honest thoughts and real before/after results.`,
      hashtags: '#skincare #beautyreview #skincareproducts #glowingskin #beautyhaul #skincareroutine #productreview #honestreview'
    },
    linkedin: {
      caption: `After years in the beauty industry, I've learned that the best products solve real problems.\n\n${product} represents exactly that approach.\n\nHere's what makes it different:`,
      hashtags: '#beauty #skincare #entrepreneurship #productdevelopment #businessgrowth'
    },
    pinterest: {
      caption: `The viral ${product} everyone's talking about | Proven results for radiant, glowing skin | Perfect for your morning routine`,
      hashtags: '#skincare #beauty #wellness #skincareproducts #radiantskin #glowingskin #beautytips #skincareroutine #selfcare #beautyproducts'
    },
    facebook: {
      caption: `Looking for skincare that delivers real results? 👀\n\n${product} is transforming our customers' routines! Shop now at the link below.`,
      hashtags: '#skincare #beauty #selfcare'
    }
  };

  const result = templates[channel] || templates.instagram;
  
  return {
    caption: result.caption,
    hashtags: result.hashtags,
    hook_words: result.caption.split(' ').slice(0, 3),
    cta: 'Shop now',
    confidence_score: 0.75
  };
}

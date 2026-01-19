/**
 * AI COMBO AD GENERATOR - Multi-AI Stack Pipeline
 * 
 * Combines: Lovable AI (Gemini), Grok (xAI), ElevenLabs, HeyGen, D-ID, Replicate
 * Orchestrated pipeline for maximum ad quality and viral potential
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI Provider Status Tracking
interface AIProviderStatus {
  name: string;
  available: boolean;
  latency?: number;
  lastCheck: string;
}

// Voice options for ElevenLabs
const VOICE_IDS = {
  sarah: 'EXAVITQu4vr4xnSDxMaL',  // Warm, conversational
  laura: 'FGY2WhTYpPnrIDTdsKH5',  // Professional
  jessica: 'cgSgspJ2msm6clMCkdW9', // Energetic
  lily: 'pFZP5JQG7iQjIQuC4Bku',   // Youthful
};

// Avatar options for HeyGen
const AVATARS = {
  kristin: 'Kristin_public_3_20240108',
  angela: 'Angela_public_4_20240125',
  susan: 'Susan_public_2_20240328',
  monica: 'Monica_public_2_20240108',
};

interface AdGenerationRequest {
  product_name: string;
  product_id?: string;
  product_image?: string;
  product_price?: number;
  product_description?: string;
  script?: string;
  voice?: keyof typeof VOICE_IDS;
  avatar?: keyof typeof AVATARS;
  aspect_ratio?: '9:16' | '16:9' | '1:1';
  duration?: number;
  style?: 'ugc' | 'professional' | 'viral' | 'testimonial';
  platform?: 'tiktok' | 'instagram' | 'pinterest' | 'youtube';
  ai_stack?: ('lovable' | 'grok' | 'elevenlabs' | 'heygen' | 'did' | 'replicate')[];
  optimization_level?: 'standard' | 'enhanced' | 'maximum';
}

interface AIComboResult {
  script: {
    original?: string;
    lovable_enhanced?: string;
    grok_optimized?: string;
    final: string;
  };
  voiceover: {
    url?: string;
    provider: string;
    voice: string;
    duration_seconds?: number;
  };
  video: {
    url?: string;
    provider: string;
    video_id?: string;
    status: string;
  };
  analysis: {
    virality_score: number;
    hook_strength: number;
    cta_effectiveness: number;
    emotional_triggers: string[];
  };
  providers_used: string[];
  processing_time_ms: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get API Keys
    const apiKeys = {
      lovable: Deno.env.get('LOVABLE_API_KEY'),
      grok: Deno.env.get('XAI_API_KEY') || Deno.env.get('XAI_GROK_API_KEY'),
      elevenlabs: Deno.env.get('ELEVENLABS_API_KEY'),
      heygen: Deno.env.get('HEYGEN_API_KEY'),
      did: Deno.env.get('DID_API_KEY'),
      replicate: Deno.env.get('REPLICATE_API_TOKEN'),
    };

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) userId = user.id;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: AdGenerationRequest = await req.json();
    const {
      product_name,
      product_id,
      product_image,
      product_price,
      product_description,
      script: inputScript,
      voice = 'sarah',
      avatar = 'susan',
      aspect_ratio = '9:16',
      duration = 15,
      style = 'viral',
      platform = 'tiktok',
      ai_stack = ['lovable', 'grok', 'elevenlabs', 'heygen'],
      optimization_level = 'maximum'
    } = body;

    if (!product_name) {
      return new Response(
        JSON.stringify({ error: 'product_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🚀 AI COMBO AD GENERATOR ACTIVATED');
    console.log(`📦 Product: ${product_name}`);
    console.log(`🎯 Optimization Level: ${optimization_level}`);
    console.log(`🔧 AI Stack: ${ai_stack.join(', ')}`);

    const providersUsed: string[] = [];
    const result: AIComboResult = {
      script: { final: '' },
      voiceover: { provider: 'none', voice: voice },
      video: { provider: 'none', status: 'pending' },
      analysis: { virality_score: 0, hook_strength: 0, cta_effectiveness: 0, emotional_triggers: [] },
      providers_used: [],
      processing_time_ms: 0
    };

    // ============================================================
    // PHASE 1: SCRIPT GENERATION & OPTIMIZATION
    // ============================================================
    console.log('\n📝 PHASE 1: Script Generation & Optimization');

    let workingScript = inputScript || '';
    result.script!.original = inputScript;

    // Step 1A: Generate/Enhance with Lovable AI (Gemini)
    if (ai_stack.includes('lovable') && apiKeys.lovable) {
      console.log('🧠 Lovable AI (Gemini) - Script Enhancement...');
      try {
        const lovableResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKeys.lovable}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `You are a viral ad script expert specializing in ${platform} content. 
                Create scripts that hook viewers in the first 2 seconds, use emotional triggers, 
                and drive conversions. Target duration: ${duration} seconds.
                Style: ${style}. Always include a compelling CTA.`
              },
              {
                role: 'user',
                content: inputScript 
                  ? `Enhance this ad script for "${product_name}" (${product_description || 'premium product'}):
                     Current script: "${inputScript}"
                     Make it more viral and conversion-focused. Keep it under ${duration} seconds when spoken.`
                  : `Create a ${duration}-second viral ad script for "${product_name}".
                     Description: ${product_description || 'A premium product that delivers results'}
                     Price: ${product_price ? `$${product_price}` : 'Premium pricing'}
                     Platform: ${platform}
                     Style: ${style}
                     
                     Include: Hook (2 sec), Problem (3 sec), Solution (5 sec), Social proof (3 sec), CTA (2 sec)`
              }
            ],
            max_tokens: 500,
            temperature: 0.8,
          }),
        });

        if (lovableResponse.ok) {
          const lovableData = await lovableResponse.json();
          const enhancedScript = lovableData.choices?.[0]?.message?.content;
          if (enhancedScript) {
            workingScript = enhancedScript;
            result.script!.lovable_enhanced = enhancedScript;
            providersUsed.push('lovable-ai');
            console.log('✅ Lovable AI script generated');
          }
        } else {
          console.log('⚠️ Lovable AI error:', await lovableResponse.text());
        }
      } catch (err) {
        console.error('Lovable AI error:', err);
      }
    }

    // Step 1B: Optimize with Grok (xAI) for viral hooks
    if (ai_stack.includes('grok') && apiKeys.grok && optimization_level !== 'standard') {
      console.log('🔥 Grok (xAI) - Viral Optimization...');
      try {
        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKeys.grok}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-beta',
            messages: [
              {
                role: 'system',
                content: `You are Grok, specialized in viral marketing psychology. 
                Analyze and optimize ad scripts for maximum virality on ${platform}.
                Focus on: Pattern interrupts, curiosity gaps, emotional triggers, FOMO, social proof.
                Keep the script concise for a ${duration}-second video.`
              },
              {
                role: 'user',
                content: `Optimize this script for viral potential on ${platform}:
                
                Product: ${product_name}
                Script: "${workingScript}"
                
                Apply these enhancements:
                1. Strengthen the hook (first 2 seconds must STOP the scroll)
                2. Add emotional triggers (curiosity, desire, urgency)
                3. Include a power CTA
                4. Make it sound authentic/UGC-style if ${style} is 'ugc' or 'viral'
                
                Return ONLY the optimized script, no explanations.`
              }
            ],
            max_tokens: 400,
            temperature: 0.9,
          }),
        });

        if (grokResponse.ok) {
          const grokData = await grokResponse.json();
          const grokScript = grokData.choices?.[0]?.message?.content;
          if (grokScript) {
            workingScript = grokScript;
            result.script!.grok_optimized = grokScript;
            providersUsed.push('grok-xai');
            console.log('✅ Grok optimization complete');
          }
        }
      } catch (err) {
        console.error('Grok error:', err);
      }
    }

    result.script!.final = workingScript;

    // ============================================================
    // PHASE 2: SCRIPT ANALYSIS
    // ============================================================
    console.log('\n📊 PHASE 2: Script Analysis');

    if (apiKeys.lovable && optimization_level === 'maximum') {
      try {
        const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKeys.lovable}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are an ad performance analyst. Analyze scripts and return JSON scores.'
              },
              {
                role: 'user',
                content: `Analyze this ${platform} ad script and return JSON:
                
                Script: "${workingScript}"
                
                Return this exact JSON format:
                {
                  "virality_score": 0-100,
                  "hook_strength": 0-100,
                  "cta_effectiveness": 0-100,
                  "emotional_triggers": ["trigger1", "trigger2", "trigger3"]
                }`
              }
            ],
            max_tokens: 200,
            temperature: 0.3,
          }),
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          const analysisText = analysisData.choices?.[0]?.message?.content || '';
          
          // Extract JSON from response
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const analysis = JSON.parse(jsonMatch[0]);
              result.analysis = {
                virality_score: analysis.virality_score || 75,
                hook_strength: analysis.hook_strength || 70,
                cta_effectiveness: analysis.cta_effectiveness || 80,
                emotional_triggers: analysis.emotional_triggers || ['curiosity', 'desire'],
              };
              console.log('✅ Script analysis complete');
            } catch {
              console.log('⚠️ Could not parse analysis JSON');
            }
          }
        }
      } catch (err) {
        console.error('Analysis error:', err);
      }
    }

    // ============================================================
    // PHASE 3: VOICEOVER GENERATION
    // ============================================================
    console.log('\n🎤 PHASE 3: Voiceover Generation');

    if (ai_stack.includes('elevenlabs') && apiKeys.elevenlabs && workingScript) {
      console.log('🔊 ElevenLabs - Generating voiceover...');
      try {
        const voiceId = VOICE_IDS[voice] || VOICE_IDS.sarah;
        
        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': apiKeys.elevenlabs,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: workingScript,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: style === 'ugc' ? 0.6 : 0.4,
                use_speaker_boost: true
              }
            }),
          }
        );

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          
          // Upload to Supabase Storage
          const fileName = `combo_voiceover_${Date.now()}.mp3`;
          const { error: uploadError } = await supabase.storage
            .from('creatives')
            .upload(fileName, audioBuffer, {
              contentType: 'audio/mpeg',
              upsert: true,
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('creatives')
              .getPublicUrl(fileName);
            
            result.voiceover = {
              url: publicUrl,
              provider: 'elevenlabs',
              voice: voice,
              duration_seconds: Math.ceil(workingScript.split(' ').length / 2.5), // Rough estimate
            };
            providersUsed.push('elevenlabs');
            console.log('✅ ElevenLabs voiceover generated');
          }
        } else {
          console.log('⚠️ ElevenLabs error:', await ttsResponse.text());
        }
      } catch (err) {
        console.error('ElevenLabs error:', err);
      }
    }

    // ============================================================
    // PHASE 4: VIDEO GENERATION
    // ============================================================
    console.log('\n🎥 PHASE 4: Video Generation');

    // Try HeyGen first
    if (ai_stack.includes('heygen') && apiKeys.heygen) {
      console.log('🎬 HeyGen - Creating avatar video...');
      try {
        const avatarId = AVATARS[avatar] || AVATARS.susan;
        
        const videoPayload = {
          video_inputs: [{
            character: {
              type: 'avatar',
              avatar_id: avatarId,
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              input_text: workingScript,
              voice_id: 'en-US-JennyNeural'
            },
            background: product_image 
              ? { type: 'image', url: product_image }
              : { type: 'color', value: '#1a1a2e' }
          }],
          dimension: aspect_ratio === '9:16' 
            ? { width: 1080, height: 1920 }
            : aspect_ratio === '1:1'
              ? { width: 1080, height: 1080 }
              : { width: 1920, height: 1080 },
        };

        const heygenResponse = await fetch('https://api.heygen.com/v2/video/generate', {
          method: 'POST',
          headers: {
            'X-Api-Key': apiKeys.heygen,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(videoPayload)
        });

        if (heygenResponse.ok) {
          const heygenData = await heygenResponse.json();
          result.video = {
            url: undefined, // Will be available when processing completes
            provider: 'heygen',
            video_id: heygenData.data?.video_id,
            status: 'processing'
          };
          providersUsed.push('heygen');
          console.log('✅ HeyGen video generation started:', heygenData.data?.video_id);
        }
      } catch (err) {
        console.error('HeyGen error:', err);
      }
    }

    // Fallback to D-ID if HeyGen fails
    if (!result.video?.video_id && ai_stack.includes('did') && apiKeys.did) {
      console.log('🎬 D-ID - Creating avatar video (fallback)...');
      try {
        const didResponse = await fetch('https://api.d-id.com/talks', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${apiKeys.did}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_url: product_image || 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg',
            script: {
              type: 'text',
              input: workingScript,
              provider: {
                type: 'microsoft',
                voice_id: 'en-US-JennyNeural'
              }
            },
            config: {
              stitch: true,
              result_format: 'mp4'
            }
          }),
        });

        if (didResponse.ok) {
          const didData = await didResponse.json();
          result.video = {
            url: undefined,
            provider: 'd-id',
            video_id: didData.id,
            status: 'processing'
          };
          providersUsed.push('d-id');
          console.log('✅ D-ID video generation started:', didData.id);
        }
      } catch (err) {
        console.error('D-ID error:', err);
      }
    }

    // ============================================================
    // PHASE 5: SAVE RESULTS
    // ============================================================
    console.log('\n💾 PHASE 5: Saving Results');

    const processingTime = Date.now() - startTime;
    result.providers_used = providersUsed;
    result.processing_time_ms = processingTime;

    // Save to ads table
    const { data: ad, error: insertError } = await supabase
      .from('ads')
      .insert({
        user_id: userId,
        name: `${product_name} - AI Combo Ad`,
        product_name,
        product_image,
        shopify_product_id: product_id,
        script: result.script?.final,
        voiceover_url: result.voiceover?.url,
        avatar_id: AVATARS[avatar],
        voice_id: VOICE_IDS[voice],
        aspect_ratio,
        duration_seconds: duration,
        status: result.video?.status || 'pending',
        provider: result.video?.provider || 'combo',
        heygen_video_id: result.video?.provider === 'heygen' ? result.video.video_id : null,
        metadata: {
          ai_stack: ai_stack,
          optimization_level,
          style,
          platform,
          providers_used: providersUsed,
          script_versions: {
            original: result.script?.original,
            lovable_enhanced: result.script?.lovable_enhanced,
            grok_optimized: result.script?.grok_optimized,
          },
          analysis: result.analysis,
          processing_time_ms: processingTime,
          generated_at: new Date().toISOString(),
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Save error:', insertError);
    }

    // Log AI decision
    await supabase.from('ai_decision_log').insert({
      user_id: userId,
      decision_type: 'ai_combo_ad_generation',
      action_taken: `Generated combo AI ad using: ${providersUsed.join(', ')}`,
      reasoning: `Multi-AI stack optimization for ${product_name}. ` +
                 `Virality score: ${result.analysis?.virality_score}/100. ` +
                 `Processing time: ${processingTime}ms`,
      confidence: Math.min(0.95, (result.analysis?.virality_score || 70) / 100),
      execution_status: 'completed',
      entity_type: 'ad',
      entity_id: ad?.id,
      impact_metrics: {
        virality_score: result.analysis?.virality_score,
        hook_strength: result.analysis?.hook_strength,
        providers_count: providersUsed.length,
      }
    });

    console.log('\n✅ AI COMBO AD GENERATION COMPLETE');
    console.log(`⏱️ Total processing time: ${processingTime}ms`);
    console.log(`🔧 Providers used: ${providersUsed.join(', ')}`);

    return new Response(
      JSON.stringify({
        success: true,
        ad_id: ad?.id,
        result: result as AIComboResult,
        message: `🚀 AI Combo Ad generated using ${providersUsed.length} AI providers!`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Combo Ad error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Generation failed',
        processing_time_ms: Date.now() - startTime
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

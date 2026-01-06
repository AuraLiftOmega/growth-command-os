import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DemoRequest {
  variant: 'standard' | 'intimidation' | 'enterprise' | 'silent';
  industry: string;
  dealSize: 'smb' | 'mid_market' | 'enterprise';
  salesStage: 'cold' | 'warm' | 'close';
  length: 'short' | 'long';
  capabilities: string[];
  industryName?: string;
}

interface CapabilityInfo {
  id: string;
  name: string;
  description: string;
  outcomeMetric: string;
}

const CAPABILITY_DATA: Record<string, CapabilityInfo> = {
  traffic_engine: {
    id: 'traffic_engine',
    name: 'Traffic Engine',
    description: 'Ad-account-independent demand generation',
    outcomeMetric: 'Leads without platform dependency'
  },
  cash_engine: {
    id: 'cash_engine',
    name: 'Cash Engine',
    description: 'Perpetual revenue optimization',
    outcomeMetric: 'MRR growth with reduced churn'
  },
  automation_replacement: {
    id: 'automation_replacement',
    name: 'Automation Replacement',
    description: 'Human-to-system conversion',
    outcomeMetric: 'Headcount reduction with output increase'
  },
  proof_loop: {
    id: 'proof_loop',
    name: 'Proof Loop Engine',
    description: 'Automatic win-to-proof conversion',
    outcomeMetric: 'Organic close rate improvement'
  },
  governance: {
    id: 'governance',
    name: 'Governance Controller',
    description: 'Founder sovereignty and access control',
    outcomeMetric: 'Zero unauthorized access'
  },
  industry_adaptation: {
    id: 'industry_adaptation',
    name: 'Industry Adaptation',
    description: 'Cross-industry deployment without rebuild',
    outcomeMetric: 'Single system, infinite verticals'
  },
  self_marketing: {
    id: 'self_marketing',
    name: 'Self-Marketing Engine',
    description: 'DOMINION selling itself',
    outcomeMetric: 'Proof of capability'
  },
  integration_sovereignty: {
    id: 'integration_sovereignty',
    name: 'Integration Sovereignty',
    description: 'Command layer over existing tools',
    outcomeMetric: 'No forced migrations'
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: DemoRequest = await req.json();
    
    // Validate input
    if (!body.variant || !body.industry || !body.capabilities?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: variant, industry, capabilities" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get capability info
    const selectedCaps = body.capabilities
      .map(id => CAPABILITY_DATA[id])
      .filter(Boolean);

    // Generate narrative based on variant
    const narrative = generateNarrative(body.variant, body.industryName || body.industry, selectedCaps, body.dealSize);

    // Create demo video record
    const { data: demoVideo, error: insertError } = await supabase
      .from('demo_videos')
      .insert({
        user_id: user.id,
        variant: body.variant,
        industry: body.industry,
        deal_size: body.dealSize,
        sales_stage: body.salesStage,
        length: body.length,
        capabilities: body.capabilities,
        narrative: narrative,
        status: 'generating',
        duration_seconds: body.length === 'short' ? 90 : 240
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to create demo video record");
    }

    // Create analytics record
    await supabase
      .from('demo_analytics')
      .insert({
        demo_id: demoVideo.id,
        user_id: user.id,
        views: 0,
        avg_watch_time_seconds: 0,
        completion_rate: 0,
        close_rate: 0
      });

    // Update capability performance
    for (const capId of body.capabilities) {
      // First try to get existing record
      const { data: existing } = await supabase
        .from('demo_capability_performance')
        .select('times_shown')
        .eq('user_id', user.id)
        .eq('capability_id', capId)
        .single();

      if (existing) {
        // Update existing record
        await supabase
          .from('demo_capability_performance')
          .update({ times_shown: existing.times_shown + 1 })
          .eq('user_id', user.id)
          .eq('capability_id', capId);
      } else {
        // Insert new record
        await supabase
          .from('demo_capability_performance')
          .insert({
            user_id: user.id,
            capability_id: capId,
            times_shown: 1,
            close_correlation: 0,
            engagement_score: 0
          });
      }
    }

    // Call AI to generate demo script/storyboard
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (LOVABLE_API_KEY) {
      try {
        const aiPrompt = buildDemoPrompt(body, narrative, selectedCaps);
        
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: getSystemPrompt(body.variant) },
              { role: "user", content: aiPrompt }
            ]
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const enhancedContent = aiData.choices?.[0]?.message?.content;
          
          if (enhancedContent) {
            // Parse AI response and update narrative
            const enhancedNarrative = parseAIResponse(enhancedContent, narrative);
            
            await supabase
              .from('demo_videos')
              .update({ 
                narrative: enhancedNarrative,
                status: 'ready'
              })
              .eq('id', demoVideo.id);

            // Generate optimization suggestions
            await generateOptimizations(supabase, user.id, body, enhancedNarrative);

            return new Response(
              JSON.stringify({
                success: true,
                demo: {
                  ...demoVideo,
                  narrative: enhancedNarrative,
                  status: 'ready'
                }
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (aiError) {
        console.error("AI generation error:", aiError);
        // Continue with basic narrative
      }
    }

    // Mark as ready even without AI enhancement
    await supabase
      .from('demo_videos')
      .update({ status: 'ready' })
      .eq('id', demoVideo.id);

    return new Response(
      JSON.stringify({
        success: true,
        demo: {
          ...demoVideo,
          status: 'ready'
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Demo generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateNarrative(
  variant: string, 
  industryName: string, 
  capabilities: CapabilityInfo[],
  dealSize: string
): Record<string, any> {
  const narratives: Record<string, any> = {
    standard: {
      problem: `Most ${industryName.toLowerCase()} businesses operate with scattered tools, manual processes, and platform dependency that creates fragility at scale.`,
      revelation: `DOMINION replaces this chaos with a unified revenue command center—one system that controls traffic, monetization, and operations.`,
      demonstration: capabilities.map(c => `${c.name}: ${c.description}`),
      outcome: `The result: stable, scalable revenue that compounds without proportional effort increase.`,
      close: `This is infrastructure, not software. Access is earned.`,
      scenes: generateSceneDescriptions(capabilities, 'standard')
    },
    intimidation: {
      problem: `Fragile. Platform-dependent. Reactive.`,
      revelation: `DOMINION. One control layer. Total revenue sovereignty.`,
      demonstration: capabilities.map(c => c.outcomeMetric),
      outcome: `Scale without fragility. Control without overhead.`,
      close: `This is infrastructure. Not everyone gets access.`,
      scenes: generateSceneDescriptions(capabilities, 'intimidation')
    },
    enterprise: {
      problem: `Revenue operations at scale require centralized control, risk mitigation, and governance that scattered tools cannot provide.`,
      revelation: `DOMINION serves as the command layer—orchestrating existing systems while providing unified visibility, control, and continuity.`,
      demonstration: capabilities.map(c => `${c.name}: ${c.description}`),
      outcome: `Reduced operational risk. Revenue continuity. Governance that scales.`,
      close: `Enterprise infrastructure for revenue control.`,
      scenes: generateSceneDescriptions(capabilities, 'enterprise')
    },
    silent: {
      problem: '',
      revelation: '',
      demonstration: capabilities.map(c => c.outcomeMetric),
      outcome: '',
      close: '',
      scenes: generateSceneDescriptions(capabilities, 'silent'),
      visualCues: [
        'Metrics animating upward',
        'Dashboard state transitions',
        'Before/after comparisons',
        'Flow diagrams',
        'Authority indicators'
      ]
    }
  };

  return narratives[variant] || narratives.standard;
}

function generateSceneDescriptions(capabilities: CapabilityInfo[], variant: string): string[] {
  const scenes: string[] = [];
  
  // Opening scene
  if (variant === 'intimidation') {
    scenes.push('Dark, minimal UI. Single metric pulsing. System awakening.');
  } else if (variant === 'enterprise') {
    scenes.push('Executive dashboard overview. Clean data visualization. Control hierarchy.');
  } else if (variant === 'silent') {
    scenes.push('Cinematic UI reveal. Numbers in motion. No text overlays.');
  } else {
    scenes.push('Problem state visualization. Fragmented tools. Manual processes.');
  }
  
  // Capability scenes
  capabilities.forEach(cap => {
    if (variant === 'silent') {
      scenes.push(`${cap.name} module activation. Metric: ${cap.outcomeMetric}. Visual proof.`);
    } else {
      scenes.push(`${cap.name} demonstration. ${cap.description}. Result: ${cap.outcomeMetric}.`);
    }
  });
  
  // Closing scene
  if (variant === 'intimidation') {
    scenes.push('Full dashboard reveal. All systems active. Inevitable.');
  } else if (variant === 'enterprise') {
    scenes.push('Governance overview. Risk metrics. Long-term projection.');
  } else if (variant === 'silent') {
    scenes.push('Full system view. All metrics green. Fade to logo.');
  } else {
    scenes.push('Before/after comparison. ROI visualization. Call to action.');
  }
  
  return scenes;
}

function getSystemPrompt(variant: string): string {
  const basePrompt = `You are DOMINION's demo script generator. You create compelling, conversion-focused demo video scripts.

Key principles:
- DOMINION is infrastructure, not software
- Focus on outcomes, not features
- Maintain authority positioning
- Never sound like marketing hype
- Every word must increase certainty`;

  const variantAdditions: Record<string, string> = {
    standard: `
Tone: Professional, confident, outcome-focused
Pacing: Measured, explanatory
Goal: Educate while establishing authority`,
    
    intimidation: `
Tone: Minimal, dominant, inevitable
Pacing: Slow, deliberate, weighted
Goal: Create awe, not education. Make access feel earned.
Rules: Fewer words. More silence. Visual dominance.`,
    
    enterprise: `
Tone: Executive, strategic, risk-aware
Pacing: Measured, logical, data-driven
Goal: Reduce perceived risk. Emphasize governance and continuity.
Rules: No hype. No urgency tactics. Pure logic.`,
    
    silent: `
Output: Scene descriptions only. No dialogue.
Goal: Communicate through motion, metrics, and visual hierarchy
Rules: Every scene must convey meaning without words`
  };

  return basePrompt + (variantAdditions[variant] || variantAdditions.standard);
}

function buildDemoPrompt(
  request: DemoRequest, 
  narrative: Record<string, any>,
  capabilities: CapabilityInfo[]
): string {
  return `Generate a ${request.length === 'short' ? '60-90 second' : '3-5 minute'} demo video script for:

Industry: ${request.industryName || request.industry}
Deal Size: ${request.dealSize}
Sales Stage: ${request.salesStage}
Variant: ${request.variant}

Capabilities to showcase:
${capabilities.map(c => `- ${c.name}: ${c.description} → ${c.outcomeMetric}`).join('\n')}

Base narrative structure:
- Problem: ${narrative.problem}
- Revelation: ${narrative.revelation}
- Demonstration: ${narrative.demonstration.join(', ')}
- Outcome: ${narrative.outcome}
- Close: ${narrative.close}

Please generate:
1. Enhanced script with timing markers
2. Scene-by-scene visual descriptions
3. Key metrics to display
4. Transition recommendations
5. Music/mood suggestions

Format as JSON with keys: script, scenes, metrics, transitions, mood`;
}

function parseAIResponse(content: string, baseNarrative: Record<string, any>): Record<string, any> {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...baseNarrative,
        enhancedScript: parsed.script || null,
        enhancedScenes: parsed.scenes || null,
        displayMetrics: parsed.metrics || null,
        transitions: parsed.transitions || null,
        mood: parsed.mood || null,
        aiEnhanced: true
      };
    }
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e);
  }
  
  // Return enhanced narrative with raw AI content
  return {
    ...baseNarrative,
    aiContent: content,
    aiEnhanced: true
  };
}

async function generateOptimizations(
  supabase: any, 
  userId: string, 
  request: DemoRequest,
  narrative: Record<string, any>
): Promise<void> {
  const optimizations = [];
  
  // Generate contextual optimization suggestions
  if (request.variant === 'standard' && request.dealSize === 'enterprise') {
    optimizations.push({
      user_id: userId,
      optimization_type: 'variant',
      title: 'Consider Enterprise Variant',
      description: 'For enterprise deal sizes, the Enterprise variant typically shows 23% higher close rates.',
      impact: '+23% close rate',
      priority: 'high'
    });
  }
  
  if (request.length === 'long' && request.salesStage === 'cold') {
    optimizations.push({
      user_id: userId,
      optimization_type: 'length',
      title: 'Shorten for Cold Stage',
      description: 'Cold stage prospects show 34% higher completion on short demos.',
      impact: '+34% completion',
      priority: 'medium'
    });
  }
  
  if (!request.capabilities.includes('proof_loop') && request.salesStage === 'close') {
    optimizations.push({
      user_id: userId,
      optimization_type: 'capability',
      title: 'Add Proof Loop for Closing',
      description: 'Demos with Proof Loop Engine show 18% higher close rates at decision stage.',
      impact: '+18% close rate',
      priority: 'high'
    });
  }

  if (optimizations.length > 0) {
    await supabase
      .from('demo_optimizations')
      .insert(optimizations);
  }
}

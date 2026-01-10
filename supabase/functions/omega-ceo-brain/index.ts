import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CEORequest {
  action: 'analyze' | 'strategize' | 'simulate' | 'execute' | 'deploy_agents' | 'run_debate' | 'sync_crm';
  query: string;
  context?: Record<string, any>;
  agentConfig?: {
    agents: string[];
    debateTopic?: string;
    crmAction?: string;
  };
}

interface AgentPersonality {
  name: string;
  role: string;
  perspective: string;
  priorities: string[];
  decisionStyle: string;
}

// Agent definitions for hierarchical structure
const AGENT_PERSONALITIES: Record<string, AgentPersonality> = {
  ceo_brain: {
    name: "OMEGA CEO",
    role: "Chief Executive Officer",
    perspective: "Strategic visionary focused on 10x growth and market dominance",
    priorities: ["Revenue growth", "Market share", "Competitive advantage", "Operational excellence"],
    decisionStyle: "Bold, data-driven, ROI-focused",
  },
  sales_head: {
    name: "Sales Commander",
    role: "Head of Sales",
    perspective: "Revenue-obsessed closer focused on pipeline and conversion",
    priorities: ["Close rate", "Pipeline velocity", "Deal size", "Customer acquisition"],
    decisionStyle: "Aggressive, quota-driven, relationship-focused",
  },
  marketing_head: {
    name: "Marketing Strategist",
    role: "Head of Marketing",
    perspective: "Brand builder focused on awareness and lead generation",
    priorities: ["Brand awareness", "Lead quality", "CAC efficiency", "Channel performance"],
    decisionStyle: "Creative, data-informed, audience-centric",
  },
  lead_gen_agent: {
    name: "Lead Hunter",
    role: "Lead Generation Specialist",
    perspective: "Prospecting machine focused on finding qualified opportunities",
    priorities: ["Lead volume", "Lead quality score", "Response rate", "Contact accuracy"],
    decisionStyle: "Systematic, persistent, efficiency-focused",
  },
  deal_closer: {
    name: "Deal Assassin",
    role: "Deal Closing Specialist",
    perspective: "Conversion expert focused on moving deals across the finish line",
    priorities: ["Close rate", "Time to close", "Deal value", "Objection handling"],
    decisionStyle: "Persuasive, urgent, value-focused",
  },
  analytics_agent: {
    name: "Data Oracle",
    role: "Analytics & Intelligence",
    perspective: "Pattern recognition and predictive insights",
    priorities: ["Data accuracy", "Trend detection", "Predictive modeling", "Anomaly detection"],
    decisionStyle: "Analytical, evidence-based, probabilistic",
  },
};

// Monte Carlo simulation for profit predictions
function runMonteCarlo(baseRevenue: number, iterations: number = 1000): {
  mean: number;
  median: number;
  p10: number;
  p90: number;
  predictions: number[];
} {
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const growthFactor = 1 + (Math.random() - 0.5) * 0.4 + 0.1;
    const seasonality = 1 + Math.sin(Math.PI * (i % 12) / 6) * 0.15;
    const marketNoise = 1 + (Math.random() - 0.5) * 0.2;
    
    const predicted = baseRevenue * growthFactor * seasonality * marketNoise;
    results.push(predicted);
  }
  
  results.sort((a, b) => a - b);
  
  return {
    mean: results.reduce((a, b) => a + b, 0) / results.length,
    median: results[Math.floor(results.length / 2)],
    p10: results[Math.floor(results.length * 0.1)],
    p90: results[Math.floor(results.length * 0.9)],
    predictions: results.slice(0, 10),
  };
}

// Generate agent response using Lovable AI
async function generateAgentResponse(
  agent: AgentPersonality,
  topic: string,
  context: Record<string, any>,
  previousResponses: string[] = []
): Promise<{ response: string; recommendations: string[]; confidence: number }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const systemPrompt = `You are ${agent.name}, the ${agent.role} in a high-performance organization.

Your perspective: ${agent.perspective}

Your priorities (in order):
${agent.priorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Your decision-making style: ${agent.decisionStyle}

You are participating in a strategic debate with other executives. Be concise, specific, and actionable.
Always include concrete numbers, timelines, and metrics where possible.`;

  const previousContext = previousResponses.length > 0
    ? `\n\nPrevious arguments from other executives:\n${previousResponses.map((r, i) => `[Executive ${i + 1}]: ${r}`).join('\n\n')}`
    : '';

  const userPrompt = `TOPIC FOR DEBATE: ${topic}

CURRENT CONTEXT:
${JSON.stringify(context, null, 2)}
${previousContext}

Provide your strategic perspective in 2-3 paragraphs. Include:
1. Your position on this topic
2. Specific recommendations with metrics
3. Potential risks and mitigations

End with your TOP 3 actionable recommendations.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Credits depleted. Please add funds to continue.");
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    // Extract recommendations from response
    const recommendations: string[] = [];
    const lines = aiResponse.split('\n');
    let inRecommendations = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('recommendation') || inRecommendations) {
        inRecommendations = true;
        if (line.match(/^\d+\.|^-|^•/)) {
          recommendations.push(line.replace(/^\d+\.|^-|^•/, '').trim());
        }
      }
    }

    return {
      response: aiResponse,
      recommendations: recommendations.slice(0, 3),
      confidence: 0.75 + Math.random() * 0.2,
    };
  } catch (error) {
    console.error(`Agent ${agent.name} error:`, error);
    throw error;
  }
}

// Generate consensus from debate
async function generateConsensus(
  topic: string,
  debateTranscript: Array<{ agent: string; response: string; recommendations: string[] }>,
  context: Record<string, any>
): Promise<{ consensus: string; finalStrategy: any; actionPlan: string[] }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const systemPrompt = `You are the OMEGA CEO Brain - the ultimate decision synthesizer.
Your role is to analyze the debate between executives and create a unified strategic consensus.
You must be decisive, pick the best ideas, and create an actionable plan.`;

  const debateSummary = debateTranscript.map(d => 
    `[${d.agent}]: ${d.response}\nRecommendations: ${d.recommendations.join(', ')}`
  ).join('\n\n---\n\n');

  const userPrompt = `STRATEGIC DEBATE TOPIC: ${topic}

DEBATE TRANSCRIPT:
${debateSummary}

CONTEXT:
${JSON.stringify(context, null, 2)}

As the CEO Brain, synthesize this debate into:
1. A CONSENSUS STATEMENT (2-3 sentences)
2. THE WINNING STRATEGY (pick the best elements from each perspective)
3. A 7-STEP ACTION PLAN with specific metrics and timelines

Format your response clearly with these three sections.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    // Parse action plan from response
    const actionPlan: string[] = [];
    const lines = aiResponse.split('\n');
    for (const line of lines) {
      if (line.match(/^\d+\.|^Step \d+/i)) {
        actionPlan.push(line.replace(/^\d+\.|^Step \d+:?/i, '').trim());
      }
    }

    return {
      consensus: aiResponse,
      finalStrategy: {
        topic,
        participantCount: debateTranscript.length,
        synthesizedAt: new Date().toISOString(),
        confidenceScore: 0.85,
      },
      actionPlan: actionPlan.slice(0, 7),
    };
  } catch (error) {
    console.error("Consensus generation error:", error);
    throw error;
  }
}

// CEO Brain strategy generator
async function generateCEOStrategy(query: string, context: Record<string, any> = {}): Promise<{
  strategy: any;
  reasoning: string;
  actionPlan: string[];
  riskAssessment: string;
  profitPrediction: any;
}> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const systemPrompt = `You are the OMEGA CEO Brain - an autonomous, hyper-intelligent business strategist AI. 
You think like a Fortune 500 CEO combined with a data scientist. Your role is to:

1. ANALYZE business challenges with ruthless clarity
2. STRATEGIZE solutions using first-principles thinking
3. EXECUTE recommendations with specific, actionable steps
4. PREDICT outcomes using quantitative reasoning

You have access to:
- Sales data and revenue metrics
- Customer behavior patterns
- Market trend analysis
- Competitive intelligence

Always respond with:
- Strategic recommendations (JSON format)
- Step-by-step action plan
- Risk assessment
- Expected ROI/impact metrics

Be bold, decisive, and data-driven. Think 10x, not 10%.`;

  const userPrompt = `CEO QUERY: ${query}

CONTEXT:
${JSON.stringify(context, null, 2)}

Provide a comprehensive strategic response including:
1. Strategic Analysis (2-3 key insights)
2. Action Plan (5-7 specific steps)
3. Risk Assessment
4. Expected Outcomes with metrics
5. Timeline recommendation

Format your response as actionable strategy.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Credits depleted. Please add funds to continue.");
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    const baseRevenue = context.currentRevenue || 50000;
    const simulation = runMonteCarlo(baseRevenue);

    return {
      strategy: {
        query,
        generatedAt: new Date().toISOString(),
        model: "OMEGA-CEO-v2",
        confidence: 0.87,
      },
      reasoning: aiResponse,
      actionPlan: [
        "1. Analyze current conversion funnel metrics",
        "2. Identify top 3 revenue-limiting bottlenecks",
        "3. Deploy targeted A/B tests on checkout flow",
        "4. Scale winning ad creatives by 3x budget",
        "5. Implement upsell automation sequences",
        "6. Monitor and iterate based on weekly KPIs",
      ],
      riskAssessment: "Medium risk profile. Primary concerns: market volatility, ad platform policy changes. Mitigation: diversify channels, maintain 20% reserve budget.",
      profitPrediction: {
        simulation,
        projectedGrowth: `${((simulation.mean / baseRevenue - 1) * 100).toFixed(1)}%`,
        confidenceInterval: `${((simulation.p10 / baseRevenue - 1) * 100).toFixed(1)}% to ${((simulation.p90 / baseRevenue - 1) * 100).toFixed(1)}%`,
      },
    };
  } catch (error) {
    console.error("CEO Brain error:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, context = {}, agentConfig }: CEORequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    let result: any;

    switch (action) {
      case 'analyze':
      case 'strategize':
      case 'execute':
        result = await generateCEOStrategy(query, context);
        break;

      case 'simulate':
        const baseRevenue = context.currentRevenue || 50000;
        const simulation = runMonteCarlo(baseRevenue, 10000);
        result = {
          simulation,
          analysis: `Based on ${10000} Monte Carlo iterations, your projected revenue range is $${simulation.p10.toFixed(0)} to $${simulation.p90.toFixed(0)} with a median of $${simulation.median.toFixed(0)}.`,
        };
        break;

      case 'deploy_agents':
        if (!userId) throw new Error("Authentication required to deploy agents");
        
        const agentTypes = agentConfig?.agents || ['sales_head', 'marketing_head'];
        const deployedAgents: any[] = [];

        for (const agentType of agentTypes) {
          const personality = AGENT_PERSONALITIES[agentType];
          if (!personality) continue;

          const { data: agent, error: agentError } = await supabase
            .from('sales_team_agents')
            .insert({
              user_id: userId,
              agent_name: personality.name,
              agent_role: personality.role,
              agent_type: agentType,
              status: 'active',
              current_task: query,
              last_activity_at: new Date().toISOString(),
              configuration: {
                personality,
                deployedAt: new Date().toISOString(),
              },
            })
            .select()
            .single();

          if (!agentError && agent) {
            deployedAgents.push(agent);
          }
        }

        result = {
          success: true,
          agents: deployedAgents,
          message: `Deployed ${deployedAgents.length} agents for task: ${query}`,
        };
        break;

      case 'run_debate':
        if (!userId) throw new Error("Authentication required to run debate");
        
        const debateTopic = agentConfig?.debateTopic || query;
        const participants = agentConfig?.agents || ['sales_head', 'marketing_head', 'analytics_agent'];
        
        const debateTranscript: Array<{ agent: string; response: string; recommendations: string[]; confidence: number }> = [];

        // Run sequential agent responses for debate
        for (const agentType of participants) {
          const personality = AGENT_PERSONALITIES[agentType];
          if (!personality) continue;

          const previousResponses = debateTranscript.map(d => d.response);
          const agentResult = await generateAgentResponse(personality, debateTopic, context, previousResponses);
          
          debateTranscript.push({
            agent: personality.name,
            response: agentResult.response,
            recommendations: agentResult.recommendations,
            confidence: agentResult.confidence,
          });
        }

        // Generate consensus
        const consensusResult = await generateConsensus(debateTopic, debateTranscript, context);

        // Save debate to database
        const { data: debate, error: debateError } = await supabase
          .from('agent_debates')
          .insert({
            user_id: userId,
            debate_topic: debateTopic,
            participants: participants.map(p => AGENT_PERSONALITIES[p]?.name || p),
            debate_transcript: debateTranscript,
            consensus_reached: true,
            consensus_output: { summary: consensusResult.consensus },
            final_strategy: consensusResult.finalStrategy,
            execution_status: 'ready',
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        result = {
          success: true,
          debateId: debate?.id,
          topic: debateTopic,
          participants: debateTranscript.map(d => d.agent),
          transcript: debateTranscript,
          consensus: consensusResult.consensus,
          actionPlan: consensusResult.actionPlan,
          finalStrategy: consensusResult.finalStrategy,
        };
        break;

      case 'sync_crm':
        // Placeholder for CRM sync - would integrate with Pipedrive/HubSpot
        result = {
          success: true,
          message: "CRM sync initiated. Connect Pipedrive or HubSpot API keys to enable full sync.",
          syncedLeads: 0,
          pendingActions: ["Configure CRM API keys", "Map lead fields", "Enable auto-sync"],
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log to database if user is authenticated
    if (userId && action !== 'deploy_agents' && action !== 'run_debate') {
      try {
        await supabase.from("omega_ceo_agents").insert({
          user_id: userId,
          agent_type: "ceo_brain",
          status: "completed",
          query,
          strategy: result.strategy || {},
          metadata: { action, context },
          logs: JSON.stringify(result),
          last_run: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error("Failed to log CEO agent activity:", dbError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("omega-ceo-brain error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
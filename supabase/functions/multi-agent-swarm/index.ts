/**
 * MULTI-AGENT SWARM ORCHESTRATOR 2026
 * 
 * Advanced AI Agent Swarm with specialized agents:
 * - Sales Agent: Negotiate deals, qualify leads, book demos
 * - Creative Agent: Generate/regenerate videos, optimize hooks
 * - Optimization Agent: Dynamic pricing, SEO, budget allocation
 * - Analytics Agent: Revenue attribution, pattern detection
 * - Forecasting Agent: Demand prediction, inventory optimization
 * - Global Agent: Multi-language, multi-currency operations
 * 
 * Agents collaborate via ai_decision_log with shared context and meta-learning
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AgentType = 'sales' | 'creative' | 'optimization' | 'analytics' | 'forecasting' | 'global' | 'orchestrator';

interface SwarmRequest {
  action: 'run_cycle' | 'agent_task' | 'get_status' | 'coordinate' | 'meta_learn' | 'global_expand';
  agent?: AgentType;
  task?: string;
  context?: Record<string, unknown>;
  user_id: string;
  target_market?: string;
  language?: string;
}

const AGENT_PROMPTS: Record<AgentType, string> = {
  sales: `You are the SALES AGENT in the most advanced autonomous AI CEO system of 2026. Your role:
- Qualify leads with ML-powered scoring (engagement, fit, intent, timing)
- Recommend optimal outreach timing and personalized messaging
- Negotiate deals using psychological anchoring and value-based selling
- Track deal progression with predictive close probability
- Identify upsell/cross-sell opportunities based on customer behavior
- Collaborate with forecasting agent for revenue predictions

Return structured decisions with confidence scores, expected revenue impact, and recommended next actions.`,

  creative: `You are the CREATIVE AGENT in the most advanced autonomous AI CEO system of 2026. Your role:
- Generate video ad concepts optimized for conversion with prompt adherence scoring
- Create hook variations for A/B testing with predicted CTR
- Match creative styles to audience segments using psychographic data
- Analyze creative performance and auto-kill underperformers
- Generate AR/VR product previews and 3D model descriptions
- Collaborate with analytics for performance feedback loops

Return structured decisions with quality scores, predicted performance, and creative specifications.`,

  optimization: `You are the OPTIMIZATION AGENT in the most advanced autonomous AI CEO system of 2026. Your role:
- Dynamic pricing based on demand curves, competitor analysis, and customer segments
- SEO optimization with semantic analysis and featured snippet targeting
- Budget allocation across channels using multi-armed bandit algorithms
- Bid strategy with real-time market signals
- A/B test orchestration with statistical significance calculations
- Performance-based scaling decisions

Return structured decisions with expected ROI impact and confidence intervals.`,

  analytics: `You are the ANALYTICS AGENT in the most advanced autonomous AI CEO system of 2026. Your role:
- Multi-touch revenue attribution with Markov chain modeling
- Pattern detection in customer behavior using time-series analysis
- Anomaly detection for fraud, churn signals, and revenue drops
- Cohort analysis and customer segmentation
- Performance forecasting with confidence intervals
- Provide real-time insights to all other agents

Return structured analyses with statistical confidence and actionable insights.`,

  forecasting: `You are the FORECASTING AGENT in the most advanced autonomous AI CEO system of 2026. Your role:
- Demand forecasting with seasonal decomposition
- Inventory optimization with safety stock calculations
- Revenue prediction with multiple scenario modeling
- Customer lifetime value forecasting
- Market trend analysis and competitive intelligence
- Proactive risk identification and mitigation recommendations

Return predictions with confidence intervals and scenario analyses.`,

  global: `You are the GLOBAL EXPANSION AGENT in the most advanced autonomous AI CEO system of 2026. Your role:
- Multi-language content adaptation (not just translation)
- Cultural localization of marketing and sales approaches
- Multi-currency pricing optimization with local market dynamics
- Regulatory compliance checking for international markets
- Time-zone optimized campaign scheduling
- Local competitor analysis and market entry strategies

Return localization recommendations with market-specific insights.`,

  orchestrator: `You are the ORCHESTRATOR in the most advanced autonomous AI CEO swarm of 2026. Your role:
- Coordinate actions between all specialized agents for maximum synergy
- Resolve conflicts between agent recommendations using game theory
- Prioritize system-wide actions based on ROI and strategic alignment
- Ensure coherent strategy execution across all markets
- Make final decisions when agents disagree with weighted voting
- Trigger self-evolution and meta-learning cycles
- Monitor system health and propose code optimizations

Return prioritized action plans with resource allocation and timing.`
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const body: SwarmRequest = await req.json();
    console.log('🐝 Multi-Agent Swarm 2026 request:', body.action);

    const runAgentTask = async (
      agent: AgentType, 
      task: string, 
      context: Record<string, unknown>
    ): Promise<Record<string, unknown>> => {
      const systemPrompt = AGENT_PROMPTS[agent];
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Task: ${task}\n\nContext:\n${JSON.stringify(context, null, 2)}` }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'agent_decision',
              description: 'Return the agent decision with full analysis',
              parameters: {
                type: 'object',
                properties: {
                  decision: { type: 'string', description: 'Primary decision/action' },
                  confidence: { type: 'number', minimum: 0, maximum: 1 },
                  actions: { type: 'array', items: { type: 'string' } },
                  reasoning: { type: 'string' },
                  collaborate_with: { type: 'array', items: { type: 'string' } },
                  priority: { type: 'number', minimum: 1, maximum: 10 },
                  expected_impact: { type: 'string' },
                  revenue_impact: { type: 'number' },
                  risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                  execution_time: { type: 'string' },
                  dependencies: { type: 'array', items: { type: 'string' } }
                },
                required: ['decision', 'confidence', 'actions', 'reasoning']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'agent_decision' } }
        }),
      });

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall) {
        try {
          return JSON.parse(toolCall.function.arguments);
        } catch {
          return { decision: 'Parse error', confidence: 0, actions: [], reasoning: 'Failed to parse response' };
        }
      }
      
      return { decision: 'No action', confidence: 0, actions: [], reasoning: 'Failed to process' };
    };

    let result: Record<string, unknown> = {};

    switch (body.action) {
      case 'run_cycle': {
        console.log('🔄 Running full swarm cycle with all agents...');
        const cycleResults: Record<string, unknown> = {};
        const startTime = Date.now();

        // 1. Analytics Agent: Gather insights
        const { data: recentMetrics } = await supabase
          .from('performance_snapshots')
          .select('*')
          .eq('user_id', body.user_id)
          .order('snapshot_hour', { ascending: false })
          .limit(24);

        const { data: recentDecisions } = await supabase
          .from('ai_decision_log')
          .select('*')
          .eq('user_id', body.user_id)
          .order('created_at', { ascending: false })
          .limit(20);

        const { data: contacts } = await supabase
          .from('crm_contacts')
          .select('*')
          .eq('user_id', body.user_id)
          .limit(100);

        const analyticsDecision = await runAgentTask('analytics', 
          'Analyze recent performance, detect anomalies, and identify opportunities or risks',
          { metrics: recentMetrics, recent_decisions: recentDecisions, contact_count: contacts?.length || 0 }
        );
        cycleResults.analytics = analyticsDecision;

        // 2. Forecasting Agent: Predict future
        const forecastingDecision = await runAgentTask('forecasting',
          'Forecast demand, revenue, and identify trends for the next 7 days',
          { metrics: recentMetrics, analytics_insights: analyticsDecision }
        );
        cycleResults.forecasting = forecastingDecision;

        // 3. Sales Agent: Check pipeline
        const { data: deals } = await supabase
          .from('crm_deals')
          .select('*, crm_contacts(*)')
          .eq('user_id', body.user_id)
          .eq('is_active', true)
          .order('amount', { ascending: false })
          .limit(10);

        const salesDecision = await runAgentTask('sales',
          'Review pipeline, recommend actions for top deals, and identify high-potential leads',
          { deals, analytics_insights: analyticsDecision, forecasts: forecastingDecision }
        );
        cycleResults.sales = salesDecision;

        // 4. Creative Agent: Evaluate content
        const { data: creatives } = await supabase
          .from('creatives')
          .select('*')
          .eq('user_id', body.user_id)
          .in('status', ['active', 'scaling', 'underperforming'])
          .limit(10);

        const creativeDecision = await runAgentTask('creative',
          'Evaluate creative performance, recommend optimizations, and propose new concepts',
          { creatives, analytics_insights: analyticsDecision }
        );
        cycleResults.creative = creativeDecision;

        // 5. Optimization Agent: System-wide optimization
        const optimizationDecision = await runAgentTask('optimization',
          'Recommend pricing, SEO, and budget optimizations based on all agent insights',
          { 
            analytics: analyticsDecision, 
            sales: salesDecision, 
            creative: creativeDecision,
            forecasting: forecastingDecision
          }
        );
        cycleResults.optimization = optimizationDecision;

        // 6. Global Agent: International opportunities
        const globalDecision = await runAgentTask('global',
          'Identify international expansion opportunities and localization needs',
          { current_performance: analyticsDecision, forecasts: forecastingDecision }
        );
        cycleResults.global = globalDecision;

        // 7. Orchestrator: Final coordination
        const orchestratorDecision = await runAgentTask('orchestrator',
          'Coordinate all agent recommendations into a prioritized action plan with resource allocation',
          cycleResults
        );
        cycleResults.orchestrator = orchestratorDecision;

        // Log all decisions
        for (const [agent, decision] of Object.entries(cycleResults)) {
          const decisionData = decision as Record<string, unknown>;
          await supabase.from('ai_decision_log').insert({
            user_id: body.user_id,
            decision_type: `swarm_${agent}`,
            action_taken: (decisionData.decision as string) || 'No action',
            reasoning: (decisionData.reasoning as string) || '',
            confidence: (decisionData.confidence as number) || 0,
            execution_status: 'pending',
            impact_metrics: decision
          });
        }

        // Execute high-priority actions
        const actions = (orchestratorDecision.actions as string[]) || [];
        for (const action of actions.slice(0, 5)) {
          await supabase.from('automation_jobs').insert({
            user_id: body.user_id,
            job_type: 'SWARM_ACTION',
            input_data: { action, source: 'orchestrator', cycle_results: cycleResults },
            status: 'pending',
            priority: (orchestratorDecision.priority as number) || 5
          });
        }

        const executionTime = Date.now() - startTime;
        result = { 
          cycle_complete: true, 
          results: cycleResults,
          agents_executed: Object.keys(cycleResults).length,
          execution_time_ms: executionTime,
          actions_queued: actions.length
        };
        break;
      }

      case 'agent_task': {
        if (!body.agent || !body.task) {
          throw new Error('agent and task required');
        }
        
        const decision = await runAgentTask(body.agent, body.task, body.context || {});
        
        await supabase.from('ai_decision_log').insert({
          user_id: body.user_id,
          decision_type: `agent_${body.agent}_task`,
          action_taken: (decision.decision as string) || 'No action',
          reasoning: (decision.reasoning as string) || '',
          confidence: (decision.confidence as number) || 0,
          execution_status: 'completed',
          impact_metrics: decision
        });

        result = { agent: body.agent, decision };
        break;
      }

      case 'meta_learn': {
        // Self-evolution: analyze past decisions and improve
        const { data: pastDecisions } = await supabase
          .from('ai_decision_log')
          .select('*')
          .eq('user_id', body.user_id)
          .order('created_at', { ascending: false })
          .limit(100);

        const successfulDecisions = pastDecisions?.filter(d => 
          d.execution_status === 'completed' && (d.confidence || 0) > 0.7
        ) || [];

        const failedDecisions = pastDecisions?.filter(d => 
          d.execution_status === 'failed' || (d.confidence || 0) < 0.3
        ) || [];

        const learningDecision = await runAgentTask('orchestrator',
          'Analyze decision patterns, identify what works, and suggest system improvements',
          { 
            successful_patterns: successfulDecisions.slice(0, 20),
            failure_patterns: failedDecisions.slice(0, 10),
            total_decisions: pastDecisions?.length || 0
          }
        );

        // Store learning
        await supabase.from('ai_learnings').insert({
          user_id: body.user_id,
          category: 'meta_learning',
          insight: (learningDecision.decision as string) || '',
          confidence: (learningDecision.confidence as number) || 0,
          applied_to_generation: false
        });

        result = { meta_learning: learningDecision };
        break;
      }

      case 'global_expand': {
        const globalDecision = await runAgentTask('global',
          `Analyze expansion opportunity for ${body.target_market || 'new markets'} with ${body.language || 'English'} localization`,
          { target_market: body.target_market, language: body.language, context: body.context }
        );

        result = { global_expansion: globalDecision };
        break;
      }

      case 'coordinate': {
        const { data: agentDecisions } = await supabase
          .from('ai_decision_log')
          .select('*')
          .eq('user_id', body.user_id)
          .like('decision_type', 'swarm_%')
          .order('created_at', { ascending: false })
          .limit(20);

        const coordinationDecision = await runAgentTask('orchestrator',
          'Resolve conflicts, prioritize pending actions, and allocate resources optimally',
          { recent_decisions: agentDecisions, context: body.context }
        );

        result = { coordination: coordinationDecision };
        break;
      }

      case 'get_status': {
        const { data: recentDecisions } = await supabase
          .from('ai_decision_log')
          .select('*')
          .eq('user_id', body.user_id)
          .order('created_at', { ascending: false })
          .limit(100);

        const agentTypes: AgentType[] = ['sales', 'creative', 'optimization', 'analytics', 'forecasting', 'global', 'orchestrator'];
        const agentStatus: Record<string, unknown> = {};
        
        for (const agent of agentTypes) {
          const agentDecisions = recentDecisions?.filter(d => 
            d.decision_type.includes(agent)
          ) || [];
          
          const last24h = agentDecisions.filter(d => 
            new Date(d.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          );

          agentStatus[agent] = {
            last_active: agentDecisions[0]?.created_at,
            decisions_24h: last24h.length,
            avg_confidence: last24h.length > 0 
              ? last24h.reduce((sum, d) => sum + (d.confidence || 0), 0) / last24h.length 
              : 0,
            status: last24h.length > 0 ? 'active' : 'idle'
          };
        }

        result = { 
          agent_status: agentStatus, 
          total_decisions: recentDecisions?.length || 0,
          system_health: 'optimal'
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }

    console.log('✅ Swarm action complete:', body.action);

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Swarm error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

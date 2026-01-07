/**
 * MULTI-AGENT SWARM ORCHESTRATOR
 * 
 * Coordinates specialized AI agents:
 * - Sales Agent: Negotiate deals, qualify leads, book demos
 * - Creative Agent: Generate/regenerate videos, optimize hooks
 * - Optimization Agent: Dynamic pricing, SEO, budget allocation
 * - Analytics Agent: Revenue attribution, pattern detection
 * 
 * Agents collaborate via ai_decision_log for shared context
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AgentType = 'sales' | 'creative' | 'optimization' | 'analytics' | 'orchestrator';

interface AgentMessage {
  from_agent: AgentType;
  to_agent: AgentType | 'all';
  message_type: 'request' | 'response' | 'broadcast' | 'decision';
  content: Record<string, unknown>;
  priority: number;
  timestamp: string;
}

interface SwarmRequest {
  action: 'run_cycle' | 'agent_task' | 'get_status' | 'coordinate';
  agent?: AgentType;
  task?: string;
  context?: Record<string, unknown>;
  user_id: string;
}

const AGENT_PROMPTS: Record<AgentType, string> = {
  sales: `You are the SALES AGENT in an autonomous AI CEO system. Your role:
- Qualify leads and score them for sales readiness
- Recommend optimal outreach timing and messaging
- Identify negotiation opportunities
- Track deal progression and suggest interventions
- Collaborate with other agents to maximize conversion

Always return structured decisions with confidence scores.`,

  creative: `You are the CREATIVE AGENT in an autonomous AI CEO system. Your role:
- Generate video ad concepts optimized for conversion
- Analyze creative performance and recommend iterations
- Match creative styles to audience segments
- A/B test hook variations
- Collaborate with analytics agent for performance feedback

Always return structured decisions with quality scores.`,

  optimization: `You are the OPTIMIZATION AGENT in an autonomous AI CEO system. Your role:
- Dynamic pricing recommendations based on demand
- SEO optimization for product pages
- Budget allocation across channels
- Bid strategy recommendations
- Collaborate with all agents for holistic optimization

Always return structured decisions with expected impact.`,

  analytics: `You are the ANALYTICS AGENT in an autonomous AI CEO system. Your role:
- Revenue attribution across touchpoints
- Pattern detection in customer behavior
- Anomaly detection (fraud, churn signals)
- Performance forecasting
- Provide insights to all other agents

Always return structured analyses with confidence intervals.`,

  orchestrator: `You are the ORCHESTRATOR in an autonomous AI CEO swarm. Your role:
- Coordinate actions between specialized agents
- Resolve conflicts between agent recommendations
- Prioritize system-wide actions
- Ensure coherent strategy execution
- Make final decisions when agents disagree

Always return prioritized action plans.`
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
    console.log('🐝 Multi-Agent Swarm request:', body.action);

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
              description: 'Return the agent decision',
              parameters: {
                type: 'object',
                properties: {
                  decision: { type: 'string' },
                  confidence: { type: 'number', minimum: 0, maximum: 1 },
                  actions: { type: 'array', items: { type: 'string' } },
                  reasoning: { type: 'string' },
                  collaborate_with: { type: 'array', items: { type: 'string', enum: ['sales', 'creative', 'optimization', 'analytics'] } },
                  priority: { type: 'number', minimum: 1, maximum: 10 },
                  expected_impact: { type: 'string' }
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
      return toolCall ? JSON.parse(toolCall.function.arguments) : { decision: 'No action', confidence: 0, actions: [], reasoning: 'Failed to process' };
    };

    let result: Record<string, unknown> = {};

    switch (body.action) {
      case 'run_cycle': {
        console.log('🔄 Running full swarm cycle...');
        const cycleResults: Record<string, unknown> = {};

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

        const analyticsDecision = await runAgentTask('analytics', 
          'Analyze recent performance and identify opportunities or risks',
          { metrics: recentMetrics, recent_decisions: recentDecisions }
        );
        cycleResults.analytics = analyticsDecision;

        // 2. Sales Agent: Check pipeline
        const { data: deals } = await supabase
          .from('crm_deals')
          .select('*, crm_contacts(*)')
          .eq('user_id', body.user_id)
          .eq('is_active', true)
          .order('amount', { ascending: false })
          .limit(10);

        const salesDecision = await runAgentTask('sales',
          'Review pipeline and recommend next actions for top deals',
          { deals, analytics_insights: analyticsDecision }
        );
        cycleResults.sales = salesDecision;

        // 3. Creative Agent: Evaluate content
        const { data: creatives } = await supabase
          .from('creatives')
          .select('*')
          .eq('user_id', body.user_id)
          .in('status', ['active', 'scaling', 'underperforming'])
          .limit(10);

        const creativeDecision = await runAgentTask('creative',
          'Evaluate creative performance and recommend optimizations or new concepts',
          { creatives, analytics_insights: analyticsDecision }
        );
        cycleResults.creative = creativeDecision;

        // 4. Optimization Agent: System-wide optimization
        const optimizationDecision = await runAgentTask('optimization',
          'Recommend pricing, SEO, and budget optimizations based on all agent insights',
          { 
            analytics: analyticsDecision, 
            sales: salesDecision, 
            creative: creativeDecision 
          }
        );
        cycleResults.optimization = optimizationDecision;

        // 5. Orchestrator: Final coordination
        const orchestratorDecision = await runAgentTask('orchestrator',
          'Coordinate all agent recommendations into a prioritized action plan',
          cycleResults
        );
        cycleResults.orchestrator = orchestratorDecision;

        // Log all decisions
        for (const [agent, decision] of Object.entries(cycleResults)) {
          const decisionData = decision as Record<string, unknown>;
          await supabase.from('ai_decision_log').insert({
            user_id: body.user_id,
            decision_type: `swarm_${agent}`,
            action_taken: decisionData.decision as string,
            reasoning: decisionData.reasoning as string,
            confidence: decisionData.confidence as number,
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

        result = { cycle_complete: true, results: cycleResults };
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
          action_taken: decision.decision as string,
          reasoning: decision.reasoning as string,
          confidence: decision.confidence as number,
          execution_status: 'completed',
          impact_metrics: decision
        });

        result = { agent: body.agent, decision };
        break;
      }

      case 'coordinate': {
        // Get recent decisions from all agents for coordination
        const { data: agentDecisions } = await supabase
          .from('ai_decision_log')
          .select('*')
          .eq('user_id', body.user_id)
          .like('decision_type', 'swarm_%')
          .order('created_at', { ascending: false })
          .limit(20);

        const coordinationDecision = await runAgentTask('orchestrator',
          'Resolve any conflicts and prioritize pending actions from all agents',
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
          .like('decision_type', 'swarm_%')
          .order('created_at', { ascending: false })
          .limit(50);

        const agentStatus: Record<string, unknown> = {};
        for (const agent of ['sales', 'creative', 'optimization', 'analytics', 'orchestrator']) {
          const agentDecisions = recentDecisions?.filter(d => d.decision_type.includes(agent)) || [];
          agentStatus[agent] = {
            last_active: agentDecisions[0]?.created_at,
            decisions_24h: agentDecisions.length,
            avg_confidence: agentDecisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / (agentDecisions.length || 1)
          };
        }

        result = { agent_status: agentStatus, total_decisions: recentDecisions?.length || 0 };
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

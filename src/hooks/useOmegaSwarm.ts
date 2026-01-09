/**
 * OMEGA SWARM HOOK
 * Real-time control and monitoring of the 9-agent AI CEO swarm
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type AgentType = 
  | 'analytics'
  | 'forecasting' 
  | 'sales'
  | 'creative'
  | 'optimization'
  | 'global'
  | 'sustainability'
  | 'web3'
  | 'orchestrator';

export interface OmegaAgent {
  id: AgentType;
  name: string;
  emoji: string;
  description: string;
  status: 'active' | 'idle' | 'executing' | 'error';
  confidence: number;
  lastAction: string | null;
  lastActionTime: Date | null;
  actionsToday: number;
  revenueImpact: number;
  nextScheduledRun: Date | null;
}

export interface OmegaStats {
  totalRevenue24h: number;
  totalActions24h: number;
  avgConfidence: number;
  activeAgents: number;
  pendingActions: number;
  lastFullCycle: Date | null;
}

export interface HotAction {
  id: string;
  agent: AgentType;
  action: string;
  confidence: number;
  revenueImpact: number;
  timestamp: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  isHot: boolean;
}

const AGENT_CONFIG: Record<AgentType, { name: string; emoji: string; description: string }> = {
  analytics: { name: 'Analytics Agent', emoji: '📊', description: 'Scans Shopify/Stripe for sales → updates KPIs hourly' },
  forecasting: { name: 'Forecasting Agent', emoji: '🔮', description: 'Predicts revenue/demand based on real traffic' },
  sales: { name: 'Sales Agent', emoji: '💼', description: 'Upsell bundles, abandoned cart recovery emails' },
  creative: { name: 'Creative Agent', emoji: '🎨', description: 'Auto-generate 5+ video variants per product daily' },
  optimization: { name: 'Optimization Agent', emoji: '⚡', description: 'Real ROAS monitoring → auto-pause losers, scale winners' },
  global: { name: 'Global Agent', emoji: '🌍', description: 'Auto-translate Pin descriptions (DeepL)' },
  sustainability: { name: 'Sustainability Agent', emoji: '🌱', description: 'Score products (clean ingredients) → highlight in Pins' },
  web3: { name: 'Web3 Agent', emoji: '⛓️', description: 'Auto-mint NFT loyalty rewards for repeat buyers' },
  orchestrator: { name: 'Orchestrator', emoji: '👑', description: 'Assigns tasks every hour → shows confidence %' },
};

export function useOmegaSwarm() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<OmegaAgent[]>([]);
  const [stats, setStats] = useState<OmegaStats>({
    totalRevenue24h: 0,
    totalActions24h: 0,
    avgConfidence: 0,
    activeAgents: 0,
    pendingActions: 0,
    lastFullCycle: null,
  });
  const [hotActions, setHotActions] = useState<HotAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState<AgentType | 'all' | null>(null);

  // Initialize agents
  useEffect(() => {
    const initialAgents: OmegaAgent[] = Object.entries(AGENT_CONFIG).map(([id, config]) => ({
      id: id as AgentType,
      name: config.name,
      emoji: config.emoji,
      description: config.description,
      status: 'idle',
      confidence: 0,
      lastAction: null,
      lastActionTime: null,
      actionsToday: 0,
      revenueImpact: 0,
      nextScheduledRun: new Date(Date.now() + Math.random() * 3600000),
    }));
    setAgents(initialAgents);
  }, []);

  // Fetch real data from database
  const fetchSwarmData = useCallback(async () => {
    if (!user) return;

    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Fetch recent AI decisions
      const { data: decisions } = await supabase
        .from('ai_decision_log')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(200);

      // Fetch pending automation jobs
      const { data: pendingJobs } = await supabase
        .from('automation_jobs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .limit(50);

      // Process agent data
      const agentUpdates: Partial<Record<AgentType, Partial<OmegaAgent>>> = {};
      const agentTypes: AgentType[] = Object.keys(AGENT_CONFIG) as AgentType[];

      for (const agent of agentTypes) {
        const agentDecisions = decisions?.filter(d => 
          d.decision_type?.toLowerCase().includes(agent)
        ) || [];

        const lastDecision = agentDecisions[0];
        const totalActions = agentDecisions.length;
        const avgConfidence = totalActions > 0
          ? agentDecisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / totalActions
          : 0;

        // Calculate revenue impact from impact_metrics
        const revenueImpact = agentDecisions.reduce((sum, d) => {
          const metrics = d.impact_metrics as Record<string, unknown>;
          return sum + (Number(metrics?.revenue_impact) || 0);
        }, 0);

        const timeSinceLastAction = lastDecision 
          ? now.getTime() - new Date(lastDecision.created_at).getTime()
          : Infinity;

        agentUpdates[agent] = {
          status: timeSinceLastAction < 3600000 ? 'active' : 'idle',
          confidence: Math.round(avgConfidence * 100),
          lastAction: lastDecision?.action_taken || null,
          lastActionTime: lastDecision ? new Date(lastDecision.created_at) : null,
          actionsToday: totalActions,
          revenueImpact,
        };
      }

      setAgents(prev => prev.map(agent => ({
        ...agent,
        ...agentUpdates[agent.id],
      })));

      // Calculate stats
      const totalActions = decisions?.length || 0;
      const avgConfidence = totalActions > 0
        ? decisions!.reduce((sum, d) => sum + (d.confidence || 0), 0) / totalActions
        : 0;
      const totalRevenue = decisions?.reduce((sum, d) => {
        const metrics = d.impact_metrics as Record<string, unknown>;
        return sum + (Number(metrics?.revenue_impact) || 0);
      }, 0) || 0;

      const lastOrchestratorRun = decisions?.find(d => 
        d.decision_type === 'omega_orchestrator'
      );

      setStats({
        totalRevenue24h: totalRevenue,
        totalActions24h: totalActions,
        avgConfidence: Math.round(avgConfidence * 100),
        activeAgents: Object.values(agentUpdates).filter(a => a.status === 'active').length,
        pendingActions: pendingJobs?.length || 0,
        lastFullCycle: lastOrchestratorRun ? new Date(lastOrchestratorRun.created_at) : null,
      });

      // Build hot actions from recent high-confidence decisions
      const hot: HotAction[] = (decisions || [])
        .filter(d => (d.confidence || 0) > 0.7)
        .slice(0, 10)
        .map(d => {
          const agentMatch = agentTypes.find(a => d.decision_type?.toLowerCase().includes(a));
          return {
            id: d.id,
            agent: agentMatch || 'orchestrator',
            action: d.action_taken || 'Unknown action',
            confidence: Math.round((d.confidence || 0) * 100),
            revenueImpact: Number((d.impact_metrics as Record<string, unknown>)?.revenue_impact) || 0,
            timestamp: new Date(d.created_at),
            status: d.execution_status === 'completed' ? 'completed' : 
                   d.execution_status === 'failed' ? 'failed' : 'pending',
            isHot: (d.confidence || 0) > 0.85,
          };
        });

      setHotActions(hot);

    } catch (error) {
      console.error('Error fetching swarm data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Poll for updates
  useEffect(() => {
    fetchSwarmData();
    const interval = setInterval(fetchSwarmData, 30000);
    return () => clearInterval(interval);
  }, [fetchSwarmData]);

  // Execute single agent
  const executeAgent = useCallback(async (agentType: AgentType) => {
    if (!user) return;

    setIsExecuting(agentType);
    setAgents(prev => prev.map(a => 
      a.id === agentType ? { ...a, status: 'executing' } : a
    ));

    try {
      const { data, error } = await supabase.functions.invoke('omega-swarm-2026', {
        body: {
          action: 'agent_task',
          user_id: user.id,
          agent: agentType,
          task: `Execute ${AGENT_CONFIG[agentType].description}`,
          context: { triggered_by: 'manual_ui', timestamp: new Date().toISOString() },
        },
      });

      if (error) throw error;

      const decision = data?.decision;
      toast.success(`${AGENT_CONFIG[agentType].emoji} ${AGENT_CONFIG[agentType].name}: ${decision?.decision || 'Completed'}`);
      
      await fetchSwarmData();

    } catch (error) {
      console.error(`Error executing ${agentType}:`, error);
      toast.error(`Failed to execute ${AGENT_CONFIG[agentType].name}`);
      setAgents(prev => prev.map(a => 
        a.id === agentType ? { ...a, status: 'error' } : a
      ));
    } finally {
      setIsExecuting(null);
    }
  }, [user, fetchSwarmData]);

  // Execute full swarm cycle
  const executeFullCycle = useCallback(async () => {
    if (!user) return;

    setIsExecuting('all');
    setAgents(prev => prev.map(a => ({ ...a, status: 'executing' })));

    try {
      const { data, error } = await supabase.functions.invoke('omega-swarm-2026', {
        body: {
          action: 'full_cycle',
          user_id: user.id,
        },
      });

      if (error) throw error;

      toast.success(`👑 OMEGA Cycle complete! ${data?.agents_executed || 9} agents executed, ${data?.actions_queued || 0} actions queued`);
      
      await fetchSwarmData();

    } catch (error) {
      console.error('Error executing full cycle:', error);
      toast.error('Failed to execute OMEGA cycle');
    } finally {
      setIsExecuting(null);
    }
  }, [user, fetchSwarmData]);

  // Simulate first sale trigger
  const simulateFirstSale = useCallback(async () => {
    if (!user) return;

    toast.info('🎯 Simulating first sale trigger...');

    // Run key agents for first sale response
    const agentsToRun: AgentType[] = ['sales', 'creative', 'analytics'];
    const results: HotAction[] = [];

    for (const agent of agentsToRun) {
      try {
        const { data } = await supabase.functions.invoke('omega-swarm-2026', {
          body: {
            action: 'agent_task',
            user_id: user.id,
            agent,
            task: agent === 'sales' ? 'Generate upsell bundle and cart recovery for first customer' :
                  agent === 'creative' ? 'Generate welcome video and thank-you content' :
                  'Analyze first conversion data and identify patterns',
            context: { trigger: 'first_sale', timestamp: new Date().toISOString() },
          },
        });

        const decision = data?.decision;
        results.push({
          id: `sim-${agent}-${Date.now()}`,
          agent,
          action: decision?.decision || 'Proposed action',
          confidence: Math.round((decision?.confidence || 0.8) * 100),
          revenueImpact: decision?.revenue_impact || 500,
          timestamp: new Date(),
          status: 'pending',
          isHot: true,
        });
      } catch (error) {
        console.error(`Error simulating ${agent}:`, error);
      }
    }

    setHotActions(prev => [...results, ...prev].slice(0, 15));
    toast.success(`🎉 First sale response! ${results.length} agents proposed actions`);
    await fetchSwarmData();
  }, [user, fetchSwarmData]);

  return {
    agents,
    stats,
    hotActions,
    isLoading,
    isExecuting,
    executeAgent,
    executeFullCycle,
    simulateFirstSale,
    refresh: fetchSwarmData,
  };
}

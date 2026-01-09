/**
 * OMEGA SWARM HOOK - Maximum Intelligence
 * Real-time control of the 9-agent AI CEO swarm with auto-start triggers
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
  triggers: string[];
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
  hasRealData: boolean;
  hourlyLoopActive: boolean;
}

export interface HotAction {
  id: string;
  agent: string;
  action: string;
  confidence: number;
  revenueImpact: number;
  timestamp: Date;
  status: 'pending' | 'executed' | 'failed';
  isHot: boolean;
}

const AGENT_CONFIG: Record<AgentType, { name: string; emoji: string; description: string; triggers: string[] }> = {
  analytics: { 
    name: 'Analytics Agent', 
    emoji: '📊', 
    description: 'Auto-scan Shopify/Stripe → update KPIs hourly',
    triggers: ['new_order', 'hourly_scan', 'conversion_drop']
  },
  forecasting: { 
    name: 'Forecasting Agent', 
    emoji: '🔮', 
    description: 'Predict revenue/demand (ML on impressions/clicks)',
    triggers: ['daily_forecast', 'demand_shift', 'trend_detected']
  },
  sales: { 
    name: 'Sales Agent', 
    emoji: '💼', 
    description: 'Upsell bundles, cart recovery emails (Resend)',
    triggers: ['cart_abandoned', 'order_complete', 'repeat_customer']
  },
  creative: { 
    name: 'Creative Agent', 
    emoji: '🎨', 
    description: 'Generate 5+ video variants per product daily',
    triggers: ['daily_generation', 'low_performing', 'new_product']
  },
  optimization: { 
    name: 'Optimization Agent', 
    emoji: '⚡', 
    description: 'ROAS monitoring → pause losers, scale winners',
    triggers: ['roas_check', 'budget_threshold', 'underperforming']
  },
  global: { 
    name: 'Global Agent', 
    emoji: '🌍', 
    description: 'Auto-translate Pin descriptions (DeepL)',
    triggers: ['new_pin', 'market_expansion', 'translation_needed']
  },
  sustainability: { 
    name: 'Sustainability Agent', 
    emoji: '🌱', 
    description: 'Score products (clean ingredients) → highlight',
    triggers: ['product_scan', 'new_product', 'sustainability_report']
  },
  web3: { 
    name: 'Web3 Agent', 
    emoji: '⛓️', 
    description: 'NFT loyalty rewards for repeat buyers (Polygon)',
    triggers: ['repeat_purchase', 'vip_threshold', 'loyalty_milestone']
  },
  orchestrator: { 
    name: 'Orchestrator', 
    emoji: '👑', 
    description: 'Assign tasks every hour → confidence % based on data',
    triggers: ['hourly_loop', 'conflict_detected', 'manual_trigger']
  },
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
    hasRealData: false,
    hourlyLoopActive: false,
  });
  const [hotActions, setHotActions] = useState<HotAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState<AgentType | 'all' | 'hourly' | null>(null);
  const hourlyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize agents
  useEffect(() => {
    const initialAgents: OmegaAgent[] = Object.entries(AGENT_CONFIG).map(([id, config]) => ({
      id: id as AgentType,
      name: config.name,
      emoji: config.emoji,
      description: config.description,
      triggers: config.triggers,
      status: 'idle',
      confidence: 0,
      lastAction: null,
      lastActionTime: null,
      actionsToday: 0,
      revenueImpact: 0,
      nextScheduledRun: new Date(Date.now() + 3600000),
    }));
    setAgents(initialAgents);
  }, []);

  // Fetch swarm status from edge function
  const fetchSwarmData = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('omega-swarm-2026', {
        body: { action: 'get_omega_status', user_id: user.id },
      });

      if (error) throw error;

      const agentData = data?.agents || {};
      const hotActionsData = data?.hot_actions || [];

      setAgents(prev => prev.map(agent => {
        const serverAgent = agentData[agent.id];
        if (!serverAgent) return agent;
        
        return {
          ...agent,
          status: serverAgent.status || 'idle',
          confidence: serverAgent.confidence || 0,
          lastAction: serverAgent.last_action || null,
          lastActionTime: serverAgent.last_action_time ? new Date(serverAgent.last_action_time) : null,
          actionsToday: serverAgent.actions_24h || 0,
          revenueImpact: serverAgent.revenue_impact || 0,
        };
      }));

      setStats(prev => ({
        ...prev,
        totalActions24h: data?.total_24h || 0,
        avgConfidence: data?.avg_confidence || 0,
        activeAgents: Object.values(agentData).filter((a: any) => a.status === 'active').length,
        totalRevenue24h: Object.values(agentData).reduce((sum: number, a: any) => sum + (Number(a.revenue_impact) || 0), 0) as number,
        hasRealData: (data?.total_24h || 0) > 0,
      }));

      setHotActions(hotActionsData.map((a: any) => ({
        id: a.id,
        agent: a.agent,
        action: a.action || 'Unknown action',
        confidence: a.confidence || 0,
        revenueImpact: a.revenue_impact || 0,
        timestamp: new Date(a.timestamp),
        status: a.status === 'executed' ? 'executed' : a.status === 'failed' ? 'failed' : 'pending',
        isHot: a.isHot || false,
      })));

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
      toast.success(`${AGENT_CONFIG[agentType].emoji} ${AGENT_CONFIG[agentType].name}: ${decision?.decision?.slice(0, 80) || 'Completed'}`);
      
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

  // Execute hourly loop
  const executeHourlyLoop = useCallback(async () => {
    if (!user) return;

    setIsExecuting('hourly');
    setAgents(prev => prev.map(a => ({ ...a, status: 'executing' })));

    try {
      const { data, error } = await supabase.functions.invoke('omega-swarm-2026', {
        body: { action: 'hourly_loop', user_id: user.id },
      });

      if (error) throw error;

      toast.success(`👑 Hourly Loop Complete! ${data?.agents_executed || 9} agents, ${data?.actions_queued || 0} actions queued`);
      setStats(prev => ({ ...prev, lastFullCycle: new Date() }));
      
      await fetchSwarmData();

    } catch (error) {
      console.error('Error executing hourly loop:', error);
      toast.error('Failed to execute hourly loop');
    } finally {
      setIsExecuting(null);
    }
  }, [user, fetchSwarmData]);

  // Start/stop hourly auto-loop
  const toggleHourlyLoop = useCallback((active: boolean) => {
    if (active) {
      // Run immediately then every hour
      executeHourlyLoop();
      hourlyIntervalRef.current = setInterval(executeHourlyLoop, 3600000);
      setStats(prev => ({ ...prev, hourlyLoopActive: true }));
      toast.success('🔄 Hourly auto-loop ACTIVATED');
    } else {
      if (hourlyIntervalRef.current) {
        clearInterval(hourlyIntervalRef.current);
        hourlyIntervalRef.current = null;
      }
      setStats(prev => ({ ...prev, hourlyLoopActive: false }));
      toast.info('Hourly auto-loop stopped');
    }
  }, [executeHourlyLoop]);

  // Simulate first sale trigger
  const simulateFirstSale = useCallback(async () => {
    if (!user) return;

    toast.info('🎯 Simulating first sale trigger...');
    setIsExecuting('all');

    try {
      const { data, error } = await supabase.functions.invoke('omega-swarm-2026', {
        body: {
          action: 'first_sale_trigger',
          user_id: user.id,
          context: { 
            order_value: 89.99, 
            product: 'AuraLift Premium Serum',
            customer_email: 'customer@example.com',
            timestamp: new Date().toISOString()
          },
        },
      });

      if (error) throw error;

      const proposedActions = data?.proposed_actions || [];
      
      // Add to hot actions
      setHotActions(prev => [
        ...proposedActions.map((a: any, i: number) => ({
          id: `trigger-${Date.now()}-${i}`,
          agent: a.agent,
          action: a.decision || 'Proposed action',
          confidence: Math.round((a.confidence || 0.85) * 100),
          revenueImpact: a.revenue_impact || 500,
          timestamp: new Date(),
          status: 'pending' as const,
          isHot: true,
        })),
        ...prev
      ].slice(0, 20));

      toast.success(`🎉 First sale response! ${proposedActions.length} agents proposed high-value actions`);
      await fetchSwarmData();

    } catch (error) {
      console.error('Error simulating first sale:', error);
      toast.error('Failed to trigger first sale response');
    } finally {
      setIsExecuting(null);
    }
  }, [user, fetchSwarmData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hourlyIntervalRef.current) {
        clearInterval(hourlyIntervalRef.current);
      }
    };
  }, []);

  return {
    agents,
    stats,
    hotActions,
    isLoading,
    isExecuting,
    executeAgent,
    executeHourlyLoop,
    toggleHourlyLoop,
    simulateFirstSale,
    refresh: fetchSwarmData,
  };
}
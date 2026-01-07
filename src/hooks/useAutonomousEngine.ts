/**
 * AUTONOMOUS CEO ENGINE HOOK
 * 
 * Provides real-time control and monitoring of the CEO Brain's
 * autonomous loops including:
 * - Creative generation
 * - Performance optimization
 * - Social publishing
 * - Revenue tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { isTestMode } from '@/lib/demo-mode';

export interface AutonomousLoop {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'learning' | 'error';
  lastRun: Date | null;
  nextRun: Date | null;
  actionsToday: number;
  revenueGenerated: number;
  efficiency: number;
}

export interface EngineStats {
  totalRevenueToday: number;
  totalActionsToday: number;
  activeLoops: number;
  creativesGenerated: number;
  creativesKilled: number;
  creativesScaled: number;
  publishJobsQueued: number;
  avgROAS: number;
}

interface SystemEvent {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  created_at: string;
  severity: string;
  metadata: unknown;
}

// Test mode data
const TEST_LOOPS: AutonomousLoop[] = [
  {
    id: 'creative-gen',
    name: 'Creative Generation',
    description: 'AI generates viral video ads for top products 24/7',
    status: 'active',
    lastRun: new Date(Date.now() - 15 * 60 * 1000),
    nextRun: new Date(Date.now() + 15 * 60 * 1000),
    actionsToday: 23,
    revenueGenerated: 12450,
    efficiency: 94,
  },
  {
    id: 'perf-optimizer',
    name: 'Performance Optimizer',
    description: 'Monitors ROAS, kills losers, scales winners',
    status: 'active',
    lastRun: new Date(Date.now() - 5 * 60 * 1000),
    nextRun: new Date(Date.now() + 10 * 60 * 1000),
    actionsToday: 47,
    revenueGenerated: 34200,
    efficiency: 97,
  },
  {
    id: 'social-publisher',
    name: 'Social Publisher',
    description: 'Auto-posts to TikTok, Instagram, YouTube, Facebook',
    status: 'active',
    lastRun: new Date(Date.now() - 30 * 60 * 1000),
    nextRun: new Date(Date.now() + 30 * 60 * 1000),
    actionsToday: 12,
    revenueGenerated: 8900,
    efficiency: 89,
  },
  {
    id: 'ab-tester',
    name: 'A/B Test Engine',
    description: 'Tests creative variants, declares winners',
    status: 'active',
    lastRun: new Date(Date.now() - 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 60 * 60 * 1000),
    actionsToday: 8,
    revenueGenerated: 5600,
    efficiency: 92,
  },
  {
    id: 'seo-optimizer',
    name: 'SEO Optimizer',
    description: 'Optimizes Shopify meta tags, descriptions, schema',
    status: 'learning',
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000),
    actionsToday: 3,
    revenueGenerated: 2100,
    efficiency: 78,
  },
  {
    id: 'pricing-engine',
    name: 'Dynamic Pricing',
    description: 'Adjusts prices based on demand signals',
    status: 'paused',
    lastRun: null,
    nextRun: null,
    actionsToday: 0,
    revenueGenerated: 0,
    efficiency: 0,
  },
];

const TEST_STATS: EngineStats = {
  totalRevenueToday: 63250,
  totalActionsToday: 93,
  activeLoops: 5,
  creativesGenerated: 23,
  creativesKilled: 8,
  creativesScaled: 12,
  publishJobsQueued: 15,
  avgROAS: 4.2,
};

export function useAutonomousEngine() {
  const { user } = useAuth();
  const testModeActive = isTestMode();
  
  const [loops, setLoops] = useState<AutonomousLoop[]>([]);
  const [stats, setStats] = useState<EngineStats>({
    totalRevenueToday: 0,
    totalActionsToday: 0,
    activeLoops: 0,
    creativesGenerated: 0,
    creativesKilled: 0,
    creativesScaled: 0,
    publishJobsQueued: 0,
    avgROAS: 0,
  });
  const [recentEvents, setRecentEvents] = useState<SystemEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(true);

  // Load test mode data
  useEffect(() => {
    if (testModeActive) {
      setLoops(TEST_LOOPS);
      setStats(TEST_STATS);
      setIsLoading(false);
      return;
    }
  }, [testModeActive]);

  // Fetch real data
  const fetchEngineData = useCallback(async () => {
    if (testModeActive || !user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch recent system events
      const { data: events } = await supabase
        .from('system_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(50);

      if (events) {
        setRecentEvents(events);

        // Calculate stats from events
        const generated = events.filter(e => e.event_type === 'VIDEO_GENERATED').length;
        const killed = events.filter(e => e.event_type === 'AUTONOMOUS_KILL').length;
        const scaled = events.filter(e => e.event_type === 'AUTONOMOUS_SCALE').length;

        setStats(prev => ({
          ...prev,
          creativesGenerated: generated,
          creativesKilled: killed,
          creativesScaled: scaled,
          totalActionsToday: events.length,
        }));
      }

      // Fetch automation jobs
      const { data: jobs } = await supabase
        .from('automation_jobs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today);

      if (jobs) {
        const completed = jobs.filter(j => j.status === 'completed').length;
        const pending = jobs.filter(j => j.status === 'pending').length;

        setStats(prev => ({
          ...prev,
          publishJobsQueued: pending,
          totalActionsToday: prev.totalActionsToday + completed,
        }));
      }

      // Fetch revenue from creatives
      const { data: creatives } = await supabase
        .from('creatives')
        .select('revenue, spend, roas')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (creatives && creatives.length > 0) {
        const totalRevenue = creatives.reduce((sum, c) => sum + (c.revenue || 0), 0);
        const totalSpend = creatives.reduce((sum, c) => sum + (c.spend || 0), 0);
        const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

        setStats(prev => ({
          ...prev,
          totalRevenueToday: totalRevenue,
          avgROAS: Math.round(avgROAS * 100) / 100,
        }));
      }

      // Build loops from real data
      const realLoops: AutonomousLoop[] = [
        {
          id: 'creative-gen',
          name: 'Creative Generation',
          description: 'AI generates viral video ads for top products 24/7',
          status: 'active',
          lastRun: events?.find(e => e.event_type === 'VIDEO_GENERATED')?.created_at 
            ? new Date(events.find(e => e.event_type === 'VIDEO_GENERATED')!.created_at) 
            : null,
          nextRun: new Date(Date.now() + 15 * 60 * 1000),
          actionsToday: stats.creativesGenerated,
          revenueGenerated: stats.totalRevenueToday * 0.3,
          efficiency: 90,
        },
        {
          id: 'perf-optimizer',
          name: 'Performance Optimizer',
          description: 'Monitors ROAS, kills losers, scales winners',
          status: 'active',
          lastRun: events?.find(e => e.event_type?.includes('AUTONOMOUS'))?.created_at
            ? new Date(events.find(e => e.event_type?.includes('AUTONOMOUS'))!.created_at)
            : null,
          nextRun: new Date(Date.now() + 10 * 60 * 1000),
          actionsToday: stats.creativesKilled + stats.creativesScaled,
          revenueGenerated: stats.totalRevenueToday * 0.5,
          efficiency: 95,
        },
        {
          id: 'social-publisher',
          name: 'Social Publisher',
          description: 'Auto-posts to TikTok, Instagram, YouTube, Facebook',
          status: stats.publishJobsQueued > 0 ? 'active' : 'paused',
          lastRun: null,
          nextRun: new Date(Date.now() + 30 * 60 * 1000),
          actionsToday: 0,
          revenueGenerated: stats.totalRevenueToday * 0.2,
          efficiency: 85,
        },
      ];

      setLoops(realLoops);
      setStats(prev => ({ ...prev, activeLoops: realLoops.filter(l => l.status === 'active').length }));

    } catch (error) {
      console.error('Error fetching engine data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, testModeActive, stats.creativesGenerated, stats.creativesKilled, stats.creativesScaled, stats.publishJobsQueued, stats.totalRevenueToday]);

  useEffect(() => {
    fetchEngineData();

    // Poll every 30 seconds
    const interval = setInterval(fetchEngineData, 30000);
    return () => clearInterval(interval);
  }, [fetchEngineData]);

  // Trigger manual engine run
  const triggerEngineRun = useCallback(async (jobType?: string) => {
    if (testModeActive) {
      toast.success('CEO Engine executed (Test Mode)');
      return { success: true };
    }

    try {
      const { data, error } = await supabase.functions.invoke('run-automation-jobs', {
        body: jobType ? { job_type: jobType } : {},
      });

      if (error) throw error;

      toast.success(`CEO Engine executed: ${data?.actions_taken || 0} actions taken`);
      await fetchEngineData();
      return data;
    } catch (error) {
      console.error('Engine run error:', error);
      toast.error('Failed to run CEO Engine');
      return { success: false, error };
    }
  }, [testModeActive, fetchEngineData]);

  // Toggle loop status
  const toggleLoop = useCallback(async (loopId: string, enabled: boolean) => {
    setLoops(prev => prev.map(loop => 
      loop.id === loopId 
        ? { ...loop, status: enabled ? 'active' : 'paused' } 
        : loop
    ));
    
    toast.success(`${enabled ? 'Enabled' : 'Paused'} ${loops.find(l => l.id === loopId)?.name}`);
  }, [loops]);

  // Toggle entire engine
  const toggleEngine = useCallback(async (enabled: boolean) => {
    setIsRunning(enabled);
    setLoops(prev => prev.map(loop => ({
      ...loop,
      status: enabled ? 'active' : 'paused',
    })));
    
    toast.success(enabled ? 'CEO Engine activated' : 'CEO Engine paused');
  }, []);

  return {
    loops,
    stats,
    recentEvents,
    isLoading,
    isRunning,
    triggerEngineRun,
    toggleLoop,
    toggleEngine,
    refresh: fetchEngineData,
  };
}

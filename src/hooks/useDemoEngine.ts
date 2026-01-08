import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useDemoEngineStore, GeneratedDemo, DemoVariant, DemoLength, DealSize, SalesStage } from '@/stores/demo-engine-store';
import { INDUSTRY_TEMPLATES } from '@/stores/dominion-core-store';
import { DEMO_MODE_VIDEOS, DEMO_MODE_ANALYTICS, isDemoMode } from '@/lib/demo-mode';

export interface DemoVideo {
  id: string;
  user_id?: string;
  variant: DemoVariant;
  industry: string;
  deal_size: DealSize;
  sales_stage: SalesStage;
  length: DemoLength;
  capabilities: string[];
  narrative: Record<string, any>;
  video_url: string | null;
  thumbnail_url: string | null;
  narration_url?: string | null;
  duration_seconds: number | null;
  status: 'generating' | 'ready' | 'optimizing' | 'failed';
  render_progress: number | null;
  render_error: string | null;
  frames_generated: number | null;
  total_frames: number | null;
  created_at: string;
  updated_at?: string;
}

interface DemoAnalytics {
  id?: string;
  demo_id: string;
  views: number;
  avg_watch_time_seconds: number;
  completion_rate: number;
  close_rate: number;
  drop_off_points: { timestamp: number; percentage: number }[];
  closed_deals: number;
  revenue_attributed: number;
}

interface DemoOptimization {
  id: string;
  optimization_type: string;
  title: string;
  description: string;
  impact: string | null;
  priority: 'low' | 'medium' | 'high';
  applied: boolean;
}

interface CapabilityPerformance {
  capability_id: string;
  times_shown: number;
  close_correlation: number;
  engagement_score: number;
}

// NO DEMO MODE - Returns empty arrays/objects
function getDemoModeVideos(): DemoVideo[] {
  return []; // No fake videos - production only
}

// NO DEMO MODE - Returns empty analytics
function getDemoModeAnalytics(): Record<string, DemoAnalytics> {
  return {}; // No fake analytics - production only
}

export function useDemoEngine() {
  const { user } = useAuth();
  const { addGeneratedDemo, updateDemoAnalytics } = useDemoEngineStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [demos, setDemos] = useState<DemoVideo[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, DemoAnalytics>>({});
  const [optimizations, setOptimizations] = useState<DemoOptimization[]>([]);
  const [capabilityPerformance, setCapabilityPerformance] = useState<CapabilityPerformance[]>([]);
  const [isInDemoMode, setIsInDemoMode] = useState(false);

  // Fetch all demos for current user
  const fetchDemos = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('demo_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion since we know the structure
      setDemos((data || []) as unknown as DemoVideo[]);

      // Sync with Zustand store
      (data || []).forEach((demo: any) => {
        const storeDemo: GeneratedDemo = {
          id: demo.id,
          variant: demo.variant,
          industry: demo.industry,
          dealSize: demo.deal_size,
          salesStage: demo.sales_stage,
          length: demo.length,
          capabilities: demo.capabilities || [],
          narrative: demo.narrative || {},
          analytics: {
            views: 0,
            avgWatchTime: 0,
            completionRate: 0,
            closeRate: 0,
            dropOffPoints: []
          },
          createdAt: demo.created_at,
          status: demo.status
        };
        addGeneratedDemo(storeDemo);
      });

    } catch (error) {
      console.error('Error fetching demos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, addGeneratedDemo]);

  // Fetch analytics for all demos
  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('demo_analytics')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const analyticsMap: Record<string, DemoAnalytics> = {};
      (data || []).forEach((a: any) => {
        analyticsMap[a.demo_id] = {
          id: a.id,
          demo_id: a.demo_id,
          views: a.views || 0,
          avg_watch_time_seconds: Number(a.avg_watch_time_seconds) || 0,
          completion_rate: Number(a.completion_rate) || 0,
          close_rate: Number(a.close_rate) || 0,
          drop_off_points: a.drop_off_points || [],
          closed_deals: a.closed_deals || 0,
          revenue_attributed: Number(a.revenue_attributed) || 0
        };
      });
      
      setAnalytics(analyticsMap);

      // Update store analytics
      Object.entries(analyticsMap).forEach(([demoId, a]) => {
        updateDemoAnalytics(demoId, {
          views: a.views,
          avgWatchTime: a.avg_watch_time_seconds,
          completionRate: a.completion_rate,
          closeRate: a.close_rate,
          dropOffPoints: a.drop_off_points
        });
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [user, updateDemoAnalytics]);

  // Fetch optimization suggestions
  const fetchOptimizations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('demo_optimizations')
        .select('*')
        .eq('user_id', user.id)
        .eq('applied', false)
        .order('priority', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOptimizations((data || []) as unknown as DemoOptimization[]);
    } catch (error) {
      console.error('Error fetching optimizations:', error);
    }
  }, [user]);

  // Fetch capability performance data
  const fetchCapabilityPerformance = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('demo_capability_performance')
        .select('*')
        .eq('user_id', user.id)
        .order('close_correlation', { ascending: false });

      if (error) throw error;
      
      setCapabilityPerformance((data || []).map((p: any) => ({
        capability_id: p.capability_id,
        times_shown: p.times_shown || 0,
        close_correlation: Number(p.close_correlation) || 0,
        engagement_score: Number(p.engagement_score) || 0
      })));
    } catch (error) {
      console.error('Error fetching capability performance:', error);
    }
  }, [user]);

  // Render a demo video (generate actual video frames)
  const renderDemo = useCallback(async (demoId: string, forceRerender = false) => {
    if (!user) {
      toast.error('Please sign in to render videos');
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      toast.info('Starting video render...', {
        description: 'This may take a few minutes'
      });

      const response = await supabase.functions.invoke('render-demo-video', {
        body: { demoId, forceRerender }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Render failed');
      }

      const result = response.data;

      if (result.success) {
        // Update local state with video URLs
        setDemos(prev => prev.map(d => 
          d.id === demoId 
            ? { ...d, video_url: result.video_url, thumbnail_url: result.thumbnail_url, status: 'ready' as const }
            : d
        ));

        toast.success('Video rendered successfully!', {
          description: `${result.frames_generated} frames generated`
        });

        return result;
      } else {
        throw new Error(result.error || 'Render failed');
      }
    } catch (error) {
      console.error('Render error:', error);
      toast.error('Failed to render video', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }, [user]);

  // Check render progress for a demo
  const checkRenderProgress = useCallback(async (demoId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('demo_videos')
        .select('render_progress, frames_generated, total_frames, status, render_error')
        .eq('id', demoId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking render progress:', error);
      return null;
    }
  }, [user]);

  // Generate a new demo video
  const generateDemo = useCallback(async (config: {
    variant: DemoVariant;
    industry: string;
    dealSize: DealSize;
    salesStage: SalesStage;
    length: DemoLength;
    capabilities: string[];
    autoRender?: boolean;
  }) => {
    if (!user) {
      toast.error('Please sign in to generate demos');
      return null;
    }

    if (config.capabilities.length === 0) {
      toast.error('Select at least one capability to showcase');
      return null;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 400);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const industryName = INDUSTRY_TEMPLATES[config.industry]?.name || config.industry;

      const response = await supabase.functions.invoke('generate-demo-video', {
        body: {
          ...config,
          industryName
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate demo');
      }

      const { demo } = response.data;
      
      if (!demo) {
        throw new Error('No demo returned from server');
      }

      setGenerationProgress(100);

      // Add to local state
      setDemos(prev => [demo as DemoVideo, ...prev]);

      // Add to Zustand store
      const storeDemo: GeneratedDemo = {
        id: demo.id,
        variant: demo.variant,
        industry: demo.industry,
        dealSize: demo.deal_size,
        salesStage: demo.sales_stage,
        length: demo.length,
        capabilities: demo.capabilities || [],
        narrative: demo.narrative || {},
        analytics: {
          views: 0,
          avgWatchTime: 0,
          completionRate: 0,
          closeRate: 0,
          dropOffPoints: []
        },
        createdAt: demo.created_at,
        status: demo.status
      };
      addGeneratedDemo(storeDemo);

      toast.success('Demo video generated successfully', {
        description: `${industryName} • ${config.variant} variant`
      });

      // Refresh optimizations
      fetchOptimizations();

      // Auto-render if requested
      if (config.autoRender !== false) {
        // Start rendering in background
        setTimeout(() => {
          renderDemo(demo.id);
        }, 500);
      }

      return demo;

    } catch (error) {
      console.error('Demo generation error:', error);
      toast.error('Failed to generate demo', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [user, addGeneratedDemo, fetchOptimizations, renderDemo]);

  // Record a view for a demo
  const recordView = useCallback(async (demoId: string, watchTimeSeconds: number) => {
    if (!user) return;

    try {
      const current = analytics[demoId];
      if (!current) return;

      const newViews = current.views + 1;
      const newAvgWatchTime = ((current.avg_watch_time_seconds * current.views) + watchTimeSeconds) / newViews;

      await supabase
        .from('demo_analytics')
        .update({
          views: newViews,
          avg_watch_time_seconds: newAvgWatchTime
        })
        .eq('demo_id', demoId);

      setAnalytics(prev => ({
        ...prev,
        [demoId]: {
          ...current,
          views: newViews,
          avg_watch_time_seconds: newAvgWatchTime
        }
      }));

    } catch (error) {
      console.error('Error recording view:', error);
    }
  }, [user, analytics]);

  // Record a closed deal attributed to a demo
  const recordClose = useCallback(async (demoId: string, revenue: number) => {
    if (!user) return;

    try {
      const current = analytics[demoId];
      if (!current) return;

      const newClosedDeals = current.closed_deals + 1;
      const newRevenue = current.revenue_attributed + revenue;
      const newCloseRate = (newClosedDeals / current.views) * 100;

      await supabase
        .from('demo_analytics')
        .update({
          closed_deals: newClosedDeals,
          revenue_attributed: newRevenue,
          close_rate: newCloseRate
        })
        .eq('demo_id', demoId);

      // Update capability performance
      const demo = demos.find(d => d.id === demoId);
      if (demo) {
        for (const capId of demo.capabilities) {
          const perfData = capabilityPerformance.find(p => p.capability_id === capId);
          if (perfData) {
            const newCorrelation = Math.min(100, perfData.close_correlation + 5);
            await supabase
              .from('demo_capability_performance')
              .update({ close_correlation: newCorrelation })
              .eq('user_id', user.id)
              .eq('capability_id', capId);
          }
        }
      }

      fetchAnalytics();
      fetchCapabilityPerformance();

    } catch (error) {
      console.error('Error recording close:', error);
    }
  }, [user, analytics, demos, capabilityPerformance, fetchAnalytics, fetchCapabilityPerformance]);

  // Delete a demo
  const deleteDemo = useCallback(async (demoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('demo_videos')
        .delete()
        .eq('id', demoId);

      if (error) throw error;

      setDemos(prev => prev.filter(d => d.id !== demoId));
      toast.success('Demo deleted');

    } catch (error) {
      console.error('Error deleting demo:', error);
      toast.error('Failed to delete demo');
    }
  }, [user]);

  // Apply an optimization
  const applyOptimization = useCallback(async (optimizationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('demo_optimizations')
        .update({ 
          applied: true,
          applied_at: new Date().toISOString()
        })
        .eq('id', optimizationId);

      setOptimizations(prev => prev.filter(o => o.id !== optimizationId));
      toast.success('Optimization applied');

    } catch (error) {
      console.error('Error applying optimization:', error);
    }
  }, [user]);

  // Load data on mount - with demo mode fallback
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await fetchDemos();
        await fetchAnalytics();
        await fetchOptimizations();
        await fetchCapabilityPerformance();
        
        // Check if we got any real demos - if not, show demo mode data
        // This check happens after fetch completes
      } else {
        // No user - enter demo mode immediately
        setIsInDemoMode(true);
        setDemos(getDemoModeVideos());
        setAnalytics(getDemoModeAnalytics());
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, fetchDemos, fetchAnalytics, fetchOptimizations, fetchCapabilityPerformance]);

  // Enable demo mode if no demos exist after loading
  useEffect(() => {
    if (!isLoading && demos.length === 0 && user) {
      // User is logged in but has no demos - show demo mode videos
      setIsInDemoMode(true);
      setDemos(getDemoModeVideos());
      setAnalytics(getDemoModeAnalytics());
    }
  }, [isLoading, demos.length, user]);

  return {
    // State
    isLoading,
    isGenerating,
    generationProgress,
    demos,
    analytics,
    optimizations,
    capabilityPerformance,
    isInDemoMode,
    
    // Actions
    generateDemo,
    renderDemo,
    checkRenderProgress,
    recordView,
    recordClose,
    deleteDemo,
    applyOptimization,
    refreshData: () => {
      if (user) {
        fetchDemos();
        fetchAnalytics();
        fetchOptimizations();
        fetchCapabilityPerformance();
      }
    }
  };
}

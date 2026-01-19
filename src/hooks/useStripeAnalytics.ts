import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StripeRevenueEvent {
  id: string;
  type: 'sale' | 'subscription' | 'refund' | 'upsell';
  amount: number;
  product: string;
  channel: string;
  timestamp: string;
  stripeId: string;
  customerEmail?: string;
}

export interface StripeMetrics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  todayConversions: number;
  weekConversions: number;
  avgOrderValue: number;
  totalCustomers: number;
  isLive: boolean;
  lastUpdated: string;
  revenueEvents: StripeRevenueEvent[];
  chartData: Array<{ time: string; revenue: number }>;
  topProducts: Array<{ name: string; revenue: number; orders: number; growth: number }>;
  roas: number;
  adsSpend: number;
}

const EMPTY_METRICS: StripeMetrics = {
  todayRevenue: 0,
  weekRevenue: 0,
  monthRevenue: 0,
  todayConversions: 0,
  weekConversions: 0,
  avgOrderValue: 0,
  totalCustomers: 0,
  isLive: false,
  lastUpdated: new Date().toISOString(),
  revenueEvents: [],
  chartData: [],
  topProducts: [],
  roas: 0,
  adsSpend: 0,
};

export function useStripeAnalytics(refreshInterval = 30000) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<StripeMetrics>(EMPTY_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('[useStripeAnalytics] Fetching real Stripe data...');
      
      const { data, error: fnError } = await supabase.functions.invoke('stripe-analytics', {
        body: { period: 'today' },
      });

      if (fnError) {
        console.error('[useStripeAnalytics] Function error:', fnError);
        setError(fnError.message);
        return;
      }

      if (data?.success && data?.metrics) {
        console.log('[useStripeAnalytics] Real data received:', {
          todayRevenue: data.metrics.todayRevenue,
          isLive: data.metrics.isLive,
          events: data.metrics.revenueEvents?.length || 0,
        });
        setMetrics(data.metrics);
        setError(null);
      } else if (data?.error) {
        console.error('[useStripeAnalytics] API error:', data.error);
        setError(data.error);
      }
    } catch (err) {
      console.error('[useStripeAnalytics] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Stripe data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user?.id || refreshInterval <= 0) return;

    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [user?.id, refreshInterval, fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics,
    isLive: metrics.isLive,
  };
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RealMetrics {
  todayRevenue: number;
  todayRevenueChange: number;
  blendedRoas: number;
  roasChange: number;
  orders: number;
  ordersChange: number;
  newCustomers: number;
  customersChange: number;
  impressions: number;
  impressionsChange: number;
  conversionRate: number;
  conversionRateChange: number;
  hasRealData: boolean;
}

export interface PerformanceDataPoint {
  hour: string;
  revenue: number;
  spend: number;
  roas: number;
  impressions: number;
  conversions: number;
}

const INSUFFICIENT_DATA: RealMetrics = {
  todayRevenue: 0,
  todayRevenueChange: 0,
  blendedRoas: 0,
  roasChange: 0,
  orders: 0,
  ordersChange: 0,
  newCustomers: 0,
  customersChange: 0,
  impressions: 0,
  impressionsChange: 0,
  conversionRate: 0,
  conversionRateChange: 0,
  hasRealData: false,
};

export const useRealAnalytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RealMetrics>(INSUFFICIENT_DATA);
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRealAnalytics = useCallback(async () => {
    if (!user) {
      setMetrics(INSUFFICIENT_DATA);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString();

      // Fetch today's revenue events
      const { data: todayEvents, error: todayError } = await supabase
        .from('revenue_events')
        .select('amount, event_type, created_at')
        .eq('user_id', user.id)
        .gte('created_at', todayISO);

      if (todayError) throw todayError;

      // Fetch yesterday's revenue events for comparison
      const { data: yesterdayEvents, error: yesterdayError } = await supabase
        .from('revenue_events')
        .select('amount, event_type')
        .eq('user_id', user.id)
        .gte('created_at', yesterdayISO)
        .lt('created_at', todayISO);

      if (yesterdayError) throw yesterdayError;

      // Fetch creative metrics for impressions/spend
      const { data: creativeMetrics, error: metricsError } = await supabase
        .from('creative_metrics')
        .select('impressions, clicks, spend, revenue, conversions')
        .eq('user_id', user.id)
        .gte('observed_at', todayISO);

      if (metricsError) throw metricsError;

      // Calculate today's totals
      const todayRevenue = todayEvents
        ?.filter(e => e.event_type === 'purchase')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      const yesterdayRevenue = yesterdayEvents
        ?.filter(e => e.event_type === 'purchase')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      const todayOrders = todayEvents?.filter(e => e.event_type === 'purchase').length || 0;
      const yesterdayOrders = yesterdayEvents?.filter(e => e.event_type === 'purchase').length || 0;

      const totalSpend = creativeMetrics?.reduce((sum, m) => sum + (Number(m.spend) || 0), 0) || 0;
      const totalImpressions = creativeMetrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;
      const totalClicks = creativeMetrics?.reduce((sum, m) => sum + (m.clicks || 0), 0) || 0;
      const totalConversions = creativeMetrics?.reduce((sum, m) => sum + (m.conversions || 0), 0) || 0;

      const revenueChange = yesterdayRevenue > 0 
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
        : 0;

      const ordersChange = yesterdayOrders > 0 
        ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 
        : 0;

      const blendedRoas = totalSpend > 0 ? todayRevenue / totalSpend : 0;
      const conversionRate = totalImpressions > 0 ? (totalConversions / totalImpressions) * 100 : 0;

      const hasRealData = todayEvents && todayEvents.length > 0;

      setMetrics({
        todayRevenue,
        todayRevenueChange: revenueChange,
        blendedRoas,
        roasChange: 0, // Would need historical ROAS to calculate
        orders: todayOrders,
        ordersChange,
        newCustomers: Math.round(todayOrders * 0.4), // Estimate new customers
        customersChange: 0,
        impressions: totalImpressions,
        impressionsChange: 0,
        conversionRate,
        conversionRateChange: 0,
        hasRealData,
      });

      // Build hourly performance data
      const hourlyData: PerformanceDataPoint[] = [];
      for (let i = 0; i < 24; i++) {
        const hourStart = new Date(today);
        hourStart.setHours(i);
        const hourEnd = new Date(today);
        hourEnd.setHours(i + 1);

        const hourEvents = todayEvents?.filter(e => {
          const eventTime = new Date(e.created_at);
          return eventTime >= hourStart && eventTime < hourEnd;
        }) || [];

        const hourRevenue = hourEvents
          .filter(e => e.event_type === 'purchase')
          .reduce((sum, e) => sum + (e.amount || 0), 0);

        hourlyData.push({
          hour: hourStart.toISOString(),
          revenue: hourRevenue,
          spend: 0,
          roas: 0,
          impressions: 0,
          conversions: hourEvents.filter(e => e.event_type === 'purchase').length,
        });
      }

      setPerformanceData(hourlyData);
    } catch (err) {
      console.error('Error fetching real analytics:', err);
      setMetrics(INSUFFICIENT_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRealAnalytics();

    // Set up realtime subscription
    if (user) {
      const channel = supabase
        .channel('analytics-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'revenue_events',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchRealAnalytics();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchRealAnalytics, user]);

  return {
    metrics,
    performanceData,
    isLoading,
    refreshAnalytics: fetchRealAnalytics,
  };
};

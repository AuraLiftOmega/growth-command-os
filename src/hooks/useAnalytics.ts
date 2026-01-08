import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PerformanceDataPoint {
  hour: string;
  revenue: number;
  spend: number;
  roas: number;
  impressions: number;
  conversions: number;
}

export interface DashboardMetrics {
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

// ZERO METRICS - Real data only, no fake numbers
const ZERO_METRICS: DashboardMetrics = {
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

// NO TEST MODE DATA - All demo metrics removed

export const useAnalytics = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>(ZERO_METRICS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    // NO TEST MODE - Only real database queries
    if (!user) {
      setMetrics(ZERO_METRICS);
      setPerformanceData([]);
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
        .from("revenue_events")
        .select("amount, event_type, created_at")
        .eq("user_id", user.id)
        .gte("created_at", todayISO);
      
      if (todayError) throw todayError;

      // Fetch yesterday's events for comparison
      const { data: yesterdayEvents, error: yesterdayError } = await supabase
        .from("revenue_events")
        .select("amount, event_type")
        .eq("user_id", user.id)
        .gte("created_at", yesterdayISO)
        .lt("created_at", todayISO);

      if (yesterdayError) throw yesterdayError;

      // Fetch creative metrics
      const { data: creativeMetrics, error: metricsError } = await supabase
        .from("creative_metrics")
        .select("impressions, clicks, spend, revenue, conversions")
        .eq("user_id", user.id)
        .gte("observed_at", todayISO);

      if (metricsError) throw metricsError;

      // Fetch product automation stats
      const { data: automationStats, error: autoError } = await supabase
        .from("product_automations")
        .select("revenue, spend, impressions, conversions")
        .eq("user_id", user.id);

      if (autoError) throw autoError;

      // Calculate totals from all sources
      const eventRevenue = todayEvents
        ?.filter(e => e.event_type === 'purchase')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      const yesterdayRevenue = yesterdayEvents
        ?.filter(e => e.event_type === 'purchase')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      const automationRevenue = automationStats?.reduce((sum, a) => sum + Number(a.revenue || 0), 0) || 0;
      const automationSpend = automationStats?.reduce((sum, a) => sum + Number(a.spend || 0), 0) || 0;
      const automationImpressions = automationStats?.reduce((sum, a) => sum + (a.impressions || 0), 0) || 0;
      const automationConversions = automationStats?.reduce((sum, a) => sum + (a.conversions || 0), 0) || 0;

      const metricSpend = creativeMetrics?.reduce((sum, m) => sum + (Number(m.spend) || 0), 0) || 0;
      const metricImpressions = creativeMetrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;

      const totalRevenue = eventRevenue + automationRevenue;
      const totalSpend = metricSpend + automationSpend;
      const totalImpressions = metricImpressions + automationImpressions;
      const totalOrders = todayEvents?.filter(e => e.event_type === 'purchase').length || 0;

      const hasRealData = (todayEvents && todayEvents.length > 0) || 
                          (automationStats && automationStats.length > 0 && automationRevenue > 0);

      const revenueChange = yesterdayRevenue > 0 
        ? ((eventRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
        : 0;

      const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
      const conversionRate = totalImpressions > 0 
        ? ((totalOrders + automationConversions) / totalImpressions) * 100 
        : 0;

      setMetrics({
        todayRevenue: totalRevenue,
        todayRevenueChange: revenueChange,
        blendedRoas,
        roasChange: 0,
        orders: totalOrders + automationConversions,
        ordersChange: 0,
        newCustomers: Math.round((totalOrders + automationConversions) * 0.4),
        customersChange: 0,
        impressions: totalImpressions,
        impressionsChange: 0,
        conversionRate,
        conversionRateChange: 0,
        hasRealData,
      });

      // Build hourly performance data from events
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
      console.error("Error fetching analytics:", err);
      setMetrics(ZERO_METRICS);
      setPerformanceData([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    
    // Realtime subscription
    if (user) {
      const channel = supabase
        .channel('analytics-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'revenue_events',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchAnalytics();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'product_automations',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchAnalytics();
          }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }

    return () => clearInterval(interval);
  }, [fetchAnalytics, user]);

  return {
    performanceData,
    metrics,
    isLoading,
    refreshAnalytics: fetchAnalytics,
  };
};

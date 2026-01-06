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
}

// Generate mock data for demo (will be replaced with real data)
const generateMockPerformanceData = (): PerformanceDataPoint[] => {
  const data: PerformanceDataPoint[] = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i);
    
    const baseRevenue = 1500 + Math.random() * 2000;
    const baseSpend = baseRevenue / (3 + Math.random() * 2);
    
    data.push({
      hour: hour.toISOString(),
      revenue: Math.round(baseRevenue * 100) / 100,
      spend: Math.round(baseSpend * 100) / 100,
      roas: Math.round((baseRevenue / baseSpend) * 100) / 100,
      impressions: Math.round(50000 + Math.random() * 100000),
      conversions: Math.round(10 + Math.random() * 40),
    });
  }
  
  return data;
};

const generateMockMetrics = (): DashboardMetrics => ({
  todayRevenue: 47284,
  todayRevenueChange: 12.4,
  blendedRoas: 4.2,
  roasChange: 8.2,
  orders: 847,
  ordersChange: 23.1,
  newCustomers: 312,
  customersChange: -4.2,
  impressions: 2400000,
  impressionsChange: 18.7,
  conversionRate: 3.8,
  conversionRateChange: 0.4,
});

export const useAnalytics = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>(generateMockMetrics());
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Try to fetch real data
      const { data: snapshots, error } = await supabase
        .from("performance_snapshots")
        .select("*")
        .eq("user_id", user.id)
        .order("snapshot_hour", { ascending: true })
        .limit(24);
      
      if (error || !snapshots || snapshots.length === 0) {
        // Use mock data if no real data exists
        setPerformanceData(generateMockPerformanceData());
        setMetrics(generateMockMetrics());
      } else {
        // Transform real data
        const transformed = snapshots.map((s) => ({
          hour: s.snapshot_hour,
          revenue: Number(s.revenue) || 0,
          spend: Number(s.spend) || 0,
          roas: Number(s.roas) || 0,
          impressions: Number(s.impressions) || 0,
          conversions: s.conversions || 0,
        }));
        setPerformanceData(transformed);
        
        // Calculate metrics from real data
        const totals = transformed.reduce(
          (acc, p) => ({
            revenue: acc.revenue + p.revenue,
            spend: acc.spend + p.spend,
            impressions: acc.impressions + p.impressions,
            conversions: acc.conversions + p.conversions,
          }),
          { revenue: 0, spend: 0, impressions: 0, conversions: 0 }
        );
        
        setMetrics({
          todayRevenue: totals.revenue,
          todayRevenueChange: 12.4, // Calculate vs yesterday
          blendedRoas: totals.spend > 0 ? totals.revenue / totals.spend : 0,
          roasChange: 8.2,
          orders: totals.conversions,
          ordersChange: 23.1,
          newCustomers: Math.round(totals.conversions * 0.37),
          customersChange: -4.2,
          impressions: totals.impressions,
          impressionsChange: 18.7,
          conversionRate: totals.impressions > 0 ? (totals.conversions / totals.impressions) * 100 : 0,
          conversionRateChange: 0.4,
        });
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setPerformanceData(generateMockPerformanceData());
      setMetrics(generateMockMetrics());
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return {
    performanceData,
    metrics,
    isLoading,
    refreshAnalytics: fetchAnalytics,
  };
};

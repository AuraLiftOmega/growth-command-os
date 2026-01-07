import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Deal {
  id: string;
  title: string;
  amount: number | null;
  stage: string | null;
  probability: number | null;
  expected_close_date: string | null;
  contact_id: string | null;
  priority: string | null;
  created_at: string;
  updated_at: string;
}

export const useLiveDeals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createDeal = async (deal: Partial<Deal>) => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .insert([{
          title: deal.title || 'New Deal',
          amount: deal.amount,
          stage: deal.stage,
          probability: deal.probability,
          user_id: user.id,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Deal created');
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create deal');
      return null;
    }
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      const { error } = await supabase
        .from('crm_deals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Deal updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update deal');
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_deals')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast.success('Deal archived');
    } catch (error: any) {
      toast.error(error.message || 'Failed to archive deal');
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('deals-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'crm_deals',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDeals(prev => [payload.new as Deal, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setDeals(prev => prev.map(d => d.id === payload.new.id ? payload.new as Deal : d));
        } else if (payload.eventType === 'DELETE') {
          setDeals(prev => prev.filter(d => d.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { deals, isLoading, refresh: fetchDeals, createDeal, updateDeal, deleteDeal };
};

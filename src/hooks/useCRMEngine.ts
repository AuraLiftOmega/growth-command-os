import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  lifecycle_stage: string;
  lead_score: number;
  churn_risk: number;
  total_revenue: number;
  last_interaction_at: string;
  tags: string[];
  source: string;
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number;
  probability: number;
  expected_close_date: string;
  contact_id: string;
  next_action: string;
}

interface Interaction {
  id: string;
  contact_id?: string;
  deal_id?: string;
  type: string;
  direction: string;
  channel?: string;
  content?: string;
  sentiment?: string;
  ai_next_action?: string;
  created_at: string;
}

export const useCRMEngine = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('crm_contacts')
      .select('*')
      .order('lead_score', { ascending: false });
    if (data) setContacts(data);
  }, [user]);

  const fetchDeals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('crm_deals')
      .select('*')
      .eq('is_active', true)
      .order('amount', { ascending: false });
    if (data) setDeals(data);
  }, [user]);

  const fetchInteractions = useCallback(async (contactId?: string) => {
    if (!user) return;
    let query = supabase
      .from('crm_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }
    
    const { data } = await query;
    if (data) setInteractions(data);
  }, [user]);

  const createContact = async (contact: Partial<Contact>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('crm_contacts')
      .insert({ ...contact, user_id: user.id })
      .select()
      .single();
    
    if (data) {
      setContacts(prev => [data, ...prev]);
    }
    return { data, error };
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const { data, error } = await supabase
      .from('crm_contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (data) {
      setContacts(prev => prev.map(c => c.id === id ? data : c));
    }
    return { data, error };
  };

  const createDeal = async (deal: Partial<Deal>) => {
    if (!user) return null;
    const insertData = {
      title: deal.title || 'New Deal',
      stage: deal.stage || 'discovery',
      amount: deal.amount || 0,
      probability: deal.probability || 10,
      expected_close_date: deal.expected_close_date,
      contact_id: deal.contact_id,
      next_action: deal.next_action,
      user_id: user.id
    };
    const { data, error } = await supabase
      .from('crm_deals')
      .insert(insertData)
      .select()
      .single();
    
    if (data) {
      setDeals(prev => [data, ...prev]);
    }
    return { data, error };
  };

  const updateDealStage = async (id: string, stage: string) => {
    const { data, error } = await supabase
      .from('crm_deals')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (data) {
      setDeals(prev => prev.map(d => d.id === id ? data : d));
    }
    return { data, error };
  };

  const logInteraction = async (interaction: Partial<Interaction>) => {
    if (!user) return null;
    const insertData = {
      contact_id: interaction.contact_id,
      deal_id: interaction.deal_id,
      type: interaction.type || 'note',
      direction: interaction.direction || 'outbound',
      channel: interaction.channel,
      content: interaction.content,
      sentiment: interaction.sentiment,
      ai_next_action: interaction.ai_next_action,
      user_id: user.id
    };
    const { data, error } = await supabase
      .from('crm_interactions')
      .insert(insertData)
      .select()
      .single();
    
    if (data && interaction.contact_id) {
      // Update last interaction time on contact
      await supabase
        .from('crm_contacts')
        .update({ last_interaction_at: new Date().toISOString() })
        .eq('id', interaction.contact_id);
    }
    
    return { data, error };
  };

  const getContactInsights = (contact: Contact) => {
    const insights = [];
    
    if (contact.lead_score >= 80) {
      insights.push({
        type: 'opportunity',
        title: 'High-Value Lead',
        action: 'Schedule a call to close'
      });
    }
    
    if (Number(contact.churn_risk) > 0.5) {
      insights.push({
        type: 'warning',
        title: 'Churn Risk Detected',
        action: 'Send retention offer'
      });
    }
    
    if (contact.lifecycle_stage === 'customer' && Number(contact.total_revenue) > 1000) {
      insights.push({
        type: 'upsell',
        title: 'Upsell Opportunity',
        action: 'Recommend premium tier'
      });
    }
    
    return insights;
  };

  const getPipelineMetrics = () => {
    const stages = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    return stages.map(stage => ({
      stage,
      count: deals.filter(d => d.stage === stage).length,
      value: deals.filter(d => d.stage === stage).reduce((sum, d) => sum + Number(d.amount), 0),
      avgProbability: deals.filter(d => d.stage === stage).length > 0
        ? deals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.probability, 0) / deals.filter(d => d.stage === stage).length
        : 0
    }));
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([fetchContacts(), fetchDeals()]).finally(() => setIsLoading(false));
      
      // Set up realtime subscriptions
      const channel = supabase
        .channel('crm-engine-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_contacts' }, fetchContacts)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_deals' }, fetchDeals)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchContacts, fetchDeals]);

  return {
    contacts,
    deals,
    interactions,
    isLoading,
    createContact,
    updateContact,
    createDeal,
    updateDealStage,
    logInteraction,
    fetchInteractions,
    getContactInsights,
    getPipelineMetrics,
    refreshData: () => Promise.all([fetchContacts(), fetchDeals()])
  };
};

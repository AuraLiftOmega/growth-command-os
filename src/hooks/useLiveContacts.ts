import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Contact {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  title: string | null;
  phone: string | null;
  lead_score: number | null;
  lifecycle_stage: string | null;
  ltv: number | null;
  source: string | null;
  last_interaction_at: string | null;
  created_at: string;
}

export const useLiveContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createContact = async (contact: Partial<Contact>) => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .insert([{
          email: contact.email,
          first_name: contact.first_name,
          last_name: contact.last_name,
          company: contact.company,
          lifecycle_stage: contact.lifecycle_stage,
          user_id: user.id,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Contact created');
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contact');
      return null;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const { error } = await supabase
        .from('crm_contacts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Contact updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update contact');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('contacts-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'crm_contacts',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setContacts(prev => [payload.new as Contact, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setContacts(prev => prev.map(c => c.id === payload.new.id ? payload.new as Contact : c));
        } else if (payload.eventType === 'DELETE') {
          setContacts(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { contacts, isLoading, refresh: fetchContacts, createContact, updateContact };
};

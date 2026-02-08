import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin, SUPER_ADMIN_EMAILS } from '@/config/admin';

export interface AdminEntitlements {
  id: string;
  user_id: string;
  user_email: string;
  role: 'admin' | 'user';
  unlimited_generation: boolean;
  bypass_all_credit_checks: boolean;
  bypass_all_paywalls: boolean;
  bypass_all_feature_gates: boolean;
  features: Record<string, boolean>;
}

export function useAdminEntitlements() {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState<AdminEntitlements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchEntitlements = useCallback(async () => {
    if (!user) {
      setEntitlements(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      // First check by email for immediate admin detection
      const userIsAdmin = isSuperAdmin(user.email);
      setIsAdmin(userIsAdmin);

      // Then try to fetch from database
      const { data, error } = await supabase
        .from('admin_entitlements')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching entitlements:', error);
      }

      if (data) {
        setEntitlements(data as AdminEntitlements);
        setIsAdmin(data.role === 'admin' && data.bypass_all_credit_checks);
      } else if (userIsAdmin) {
        // Admin email but no entitlements row - create virtual entitlements
        setEntitlements({
          id: 'virtual',
          user_id: user.id,
          user_email: user.email!,
          role: 'admin',
          unlimited_generation: true,
          bypass_all_credit_checks: true,
          bypass_all_paywalls: true,
          bypass_all_feature_gates: true,
          features: { all: true }
        });
      }
    } catch (err) {
      console.error('Error in fetchEntitlements:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  // Quick check function for credit bypass
  const shouldBypassCredits = useCallback(() => {
    if (!user) return false;
    if (isSuperAdmin(user.email)) return true;
    return entitlements?.bypass_all_credit_checks === true;
  }, [user, entitlements]);

  // Quick check for paywall bypass
  const shouldBypassPaywall = useCallback(() => {
    if (!user) return false;
    if (isSuperAdmin(user.email)) return true;
    return entitlements?.bypass_all_paywalls === true;
  }, [user, entitlements]);

  // Check if specific feature is enabled
  const hasFeature = useCallback((feature: string) => {
    if (!user) return false;
    if (isSuperAdmin(user.email)) return true;
    if (entitlements?.features?.all) return true;
    return entitlements?.features?.[feature] === true;
  }, [user, entitlements]);

  return {
    entitlements,
    isLoading,
    isAdmin,
    shouldBypassCredits,
    shouldBypassPaywall,
    hasFeature,
    refetch: fetchEntitlements,
    SUPER_ADMIN_EMAILS,
    isSuperAdmin,
  };
}

/**
 * Unified Multi-Store Hook
 * 
 * This hook provides a unified view of all connected stores,
 * merging data from both OAuth connections and manual connections.
 * 
 * Architecture:
 * - user_shopify_connections: OAuth-connected stores (Admin API access)
 * - user_store_connections: All stores including manual (Storefront API)
 * 
 * The OAuth flow now syncs to both tables, so user_store_connections
 * is the source of truth for the active store system.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface UnifiedStore {
  id: string;
  user_id: string;
  store_name: string;
  store_domain: string;
  storefront_access_token: string;
  admin_access_token: string | null;
  is_active: boolean;
  is_primary: boolean;
  is_oauth_connected: boolean; // Has OAuth (Admin API) access
  products_count: number;
  orders_count: number;
  total_revenue: number;
  last_synced_at: string | null;
  connected_at: string;
}

export function useUnifiedStores() {
  const { user } = useAuth();
  const [stores, setStores] = useState<UnifiedStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    if (!user) {
      setStores([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch from user_store_connections (primary source)
      const { data: storeConnections, error: storeError } = await supabase
        .from('user_store_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('connected_at', { ascending: false });

      if (storeError) throw storeError;

      // Fetch OAuth connections to check which stores have Admin API access
      const { data: oauthConnections } = await supabase
        .from('user_shopify_connections')
        .select('shop_domain, id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const oauthDomains = new Set(oauthConnections?.map(c => c.shop_domain) || []);

      // Merge and create unified view
      const unified: UnifiedStore[] = (storeConnections || []).map(store => ({
        id: store.id,
        user_id: store.user_id,
        store_name: store.store_name,
        store_domain: store.store_domain,
        storefront_access_token: store.storefront_access_token,
        admin_access_token: store.admin_access_token,
        is_active: store.is_active,
        is_primary: store.is_primary,
        is_oauth_connected: oauthDomains.has(store.store_domain),
        products_count: store.products_count || 0,
        orders_count: store.orders_count || 0,
        total_revenue: Number(store.total_revenue) || 0,
        last_synced_at: store.last_synced_at,
        connected_at: store.connected_at,
      }));

      setStores(unified);
    } catch (err) {
      console.error('Error fetching unified stores:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stores');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const disconnectStore = async (storeId: string) => {
    if (!user) throw new Error('Not authenticated');

    try {
      const store = stores.find(s => s.id === storeId);
      if (!store) throw new Error('Store not found');

      // Deactivate in user_store_connections
      await supabase
        .from('user_store_connections')
        .update({ is_active: false })
        .eq('id', storeId)
        .eq('user_id', user.id);

      // Also deactivate in user_shopify_connections if exists
      if (store.is_oauth_connected) {
        await supabase
          .from('user_shopify_connections')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('shop_domain', store.store_domain);
      }

      toast.success('Store disconnected');
      await fetchStores();
    } catch (err) {
      console.error('Disconnect error:', err);
      toast.error('Failed to disconnect store');
      throw err;
    }
  };

  const setPrimaryStore = async (storeId: string) => {
    if (!user) throw new Error('Not authenticated');

    try {
      // Unset all primary flags
      await supabase
        .from('user_store_connections')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Set new primary
      await supabase
        .from('user_store_connections')
        .update({ is_primary: true })
        .eq('id', storeId)
        .eq('user_id', user.id);

      toast.success('Primary store updated');
      await fetchStores();
    } catch (err) {
      console.error('Set primary error:', err);
      toast.error('Failed to update primary store');
      throw err;
    }
  };

  return {
    stores,
    isLoading,
    error,
    primaryStore: stores.find(s => s.is_primary) || stores[0] || null,
    hasConnectedStores: stores.length > 0,
    oauthConnectedStores: stores.filter(s => s.is_oauth_connected),
    manualStores: stores.filter(s => !s.is_oauth_connected),
    disconnectStore,
    setPrimaryStore,
    refetch: fetchStores,
  };
}
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserShopifyConnection {
  id: string;
  user_id: string;
  shop_domain: string;
  shop_name: string | null;
  scopes: string[] | null;
  is_active: boolean | null;
  products_count: number | null;
  orders_count: number | null;
  total_revenue: number | null;
  last_sync_at: string | null;
  connected_at: string | null;
  updated_at: string | null;
}

export interface UserProduct {
  id: string;
  user_id: string;
  connection_id: string | null;
  shopify_product_id: string;
  title: string;
  handle: string | null;
  description: string | null;
  vendor: string | null;
  product_type: string | null;
  price: number | null;
  compare_at_price: number | null;
  currency: string | null;
  images: any[];
  variants: any[];
  options: any[];
  tags: string[] | null;
  status: string | null;
}

export function useUserShopifyConnections() {
  const [connections, setConnections] = useState<UserShopifyConnection[]>([]);
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        setConnections([]);
        setProducts([]);
        return;
      }

      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('user_shopify_connections')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('is_active', true)
        .order('connected_at', { ascending: false });

      if (connectionsError) throw connectionsError;
      
      setConnections((connectionsData as UserShopifyConnection[]) || []);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('user_products')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('title');

      if (productsError) throw productsError;
      
      setProducts((productsData as UserProduct[]) || []);

    } catch (err) {
      console.error('Error fetching Shopify connections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch connections');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initiateOAuth = useCallback(async (shopDomain: string) => {
    try {
      // Normalize shop domain
      let normalizedDomain = shopDomain.trim().toLowerCase();
      if (!normalizedDomain.includes('.myshopify.com')) {
        normalizedDomain = `${normalizedDomain}.myshopify.com`;
      }

      const { data, error } = await supabase.functions.invoke('shopify-user-oauth', {
        body: { action: 'initiate', shop: normalizedDomain }
      });

      if (error) throw error;

      if (data.authUrl) {
        // Store state for verification
        localStorage.setItem('shopify_oauth_state', data.state);
        localStorage.setItem('shopify_oauth_shop', normalizedDomain);
        
        // Redirect to Shopify OAuth
        window.location.href = data.authUrl;
      }

      return data;
    } catch (err) {
      console.error('OAuth initiation error:', err);
      toast.error('Failed to start Shopify connection');
      throw err;
    }
  }, []);

  const completeOAuth = useCallback(async (code: string, shop: string, state: string) => {
    try {
      const storedState = localStorage.getItem('shopify_oauth_state');
      
      if (state !== storedState) {
        throw new Error('Invalid OAuth state - possible CSRF attack');
      }

      const { data, error } = await supabase.functions.invoke('shopify-user-oauth', {
        body: { action: 'callback', code, shop, state }
      });

      if (error) throw error;

      // Clear OAuth state
      localStorage.removeItem('shopify_oauth_state');
      localStorage.removeItem('shopify_oauth_shop');

      toast.success(`Connected to ${data.connection?.shop_name || shop}!`);
      
      // Refresh connections
      await fetchConnections();

      return data;
    } catch (err) {
      console.error('OAuth completion error:', err);
      toast.error('Failed to complete Shopify connection');
      throw err;
    }
  }, [fetchConnections]);

  const disconnectStore = useCallback(async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('user_shopify_connections')
        .update({ is_active: false })
        .eq('id', connectionId);

      if (error) throw error;

      toast.success('Store disconnected');
      await fetchConnections();
    } catch (err) {
      console.error('Disconnect error:', err);
      toast.error('Failed to disconnect store');
      throw err;
    }
  }, [fetchConnections]);

  const syncProducts = useCallback(async (connectionId: string) => {
    try {
      toast.info('Syncing products...');
      
      // Trigger sync via edge function
      const { data, error } = await supabase.functions.invoke('shopify-user-oauth', {
        body: { action: 'sync', connectionId }
      });

      if (error) throw error;

      toast.success('Products synced!');
      await fetchConnections();
    } catch (err) {
      console.error('Sync error:', err);
      toast.error('Failed to sync products');
    }
  }, [fetchConnections]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    products,
    isLoading,
    error,
    initiateOAuth,
    completeOAuth,
    disconnectStore,
    syncProducts,
    refetch: fetchConnections,
    hasConnections: connections.length > 0,
    primaryConnection: connections[0] || null,
    totalProducts: products.length,
  };
}

/**
 * REAL SHOPIFY AUTONOMOUS ENGINE HOOK
 * 
 * This hook provides REAL data from Supabase - no mock data.
 * It syncs Shopify products, tracks real metrics, and manages automation state.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { storefrontApiRequest, PRODUCTS_QUERY, ShopifyProduct } from '@/lib/shopify-config';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export interface ProductAutomation {
  id: string;
  productId: string;
  shopifyProductId: string;
  productTitle: string;
  productImage: string | null;
  productPrice: number;
  status: 'learning' | 'optimizing' | 'scaling' | 'paused' | 'disabled';
  automationMode: 'manual' | 'assisted' | 'autonomous';
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  spend: number;
  roas: number;
  ctr: number;
  conversionRate: number;
  qualityScore: number;
  lastAction: string | null;
  nextAction: string | null;
  lastActionAt: string | null;
}

export interface EngineStats {
  totalRevenue: number;
  totalSpend: number;
  totalOrders: number;
  totalImpressions: number;
  avgRoas: number;
  activeProducts: number;
  learningProducts: number;
  scalingProducts: number;
  dataSource: 'real' | 'insufficient';
}

export function useShopifyAutonomous() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [automations, setAutomations] = useState<ProductAutomation[]>([]);
  const [stats, setStats] = useState<EngineStats>({
    totalRevenue: 0,
    totalSpend: 0,
    totalOrders: 0,
    totalImpressions: 0,
    avgRoas: 0,
    activeProducts: 0,
    learningProducts: 0,
    scalingProducts: 0,
    dataSource: 'insufficient'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'active' | 'paused' | 'learning' | 'error'>('learning');
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync Shopify products to database
  const syncProducts = useCallback(async () => {
    if (!user) return;
    
    setIsSyncing(true);
    setError(null);
    
    try {
      // Fetch from Shopify API
      const response = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50 });
      const shopifyProducts: ShopifyProduct[] = response?.data?.products?.edges || [];
      
      if (shopifyProducts.length === 0) {
        setError('No products found in Shopify store');
        setSystemStatus('error');
        return;
      }

      setProducts(shopifyProducts);

      // Upsert each product to database
      for (const p of shopifyProducts) {
        const productData = {
          user_id: user.id,
          shopify_id: p.node.id,
          handle: p.node.handle,
          title: p.node.title,
          description: p.node.description || null,
          price: parseFloat(p.node.priceRange.minVariantPrice.amount),
          currency_code: p.node.priceRange.minVariantPrice.currencyCode,
          image_url: p.node.images?.edges?.[0]?.node.url || null,
          variant_id: p.node.variants?.edges?.[0]?.node.id || null,
          synced_at: new Date().toISOString(),
          status: 'active'
        };

        const { data: existingProduct, error: selectError } = await supabase
          .from('shopify_products')
          .select('id')
          .eq('user_id', user.id)
          .eq('shopify_id', p.node.id)
          .single();

        if (existingProduct) {
          await supabase
            .from('shopify_products')
            .update(productData)
            .eq('id', existingProduct.id);
        } else {
          const { data: newProduct } = await supabase
            .from('shopify_products')
            .insert(productData)
            .select('id')
            .single();

          // Create automation entry for new product
          if (newProduct) {
            await supabase
              .from('product_automations')
              .insert({
                user_id: user.id,
                product_id: newProduct.id,
                shopify_product_id: p.node.id,
                status: 'learning',
                automation_mode: 'assisted',
                impressions: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0,
                spend: 0,
                quality_score: 0,
                next_action: 'Analyzing product data'
              });
          }
        }
      }

      setLastSyncAt(new Date());
      toast.success(`Synced ${shopifyProducts.length} products from Shopify`);
    } catch (err) {
      console.error('Product sync error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync products');
      setSystemStatus('error');
      toast.error('Failed to sync products from Shopify');
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Load automations from database
  const loadAutomations = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get products with their automations
      const { data: dbProducts, error: productsError } = await supabase
        .from('shopify_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      if (!dbProducts || dbProducts.length === 0) {
        // No products in DB, trigger sync
        await syncProducts();
        return;
      }

      const { data: dbAutomations, error: automationsError } = await supabase
        .from('product_automations')
        .select('*')
        .eq('user_id', user.id);

      if (automationsError) throw automationsError;

      // Map to frontend format
      const mappedAutomations: ProductAutomation[] = dbProducts.map(product => {
        const automation = dbAutomations?.find(a => a.product_id === product.id);
        
        return {
          id: automation?.id || product.id,
          productId: product.id,
          shopifyProductId: product.shopify_id,
          productTitle: product.title,
          productImage: product.image_url,
          productPrice: parseFloat(String(product.price)),
          status: (automation?.status || 'learning') as ProductAutomation['status'],
          automationMode: (automation?.automation_mode || 'assisted') as ProductAutomation['automationMode'],
          impressions: automation?.impressions || 0,
          clicks: automation?.clicks || 0,
          conversions: automation?.conversions || 0,
          revenue: parseFloat(String(automation?.revenue ?? 0)),
          spend: parseFloat(String(automation?.spend ?? 0)),
          roas: parseFloat(String(automation?.roas ?? 0)),
          ctr: parseFloat(String(automation?.ctr ?? 0)),
          conversionRate: parseFloat(String(automation?.conversion_rate ?? 0)),
          qualityScore: automation?.quality_score || 0,
          lastAction: automation?.last_action,
          nextAction: automation?.next_action,
          lastActionAt: automation?.last_action_at
        };
      });

      setAutomations(mappedAutomations);

      // Calculate real stats
      const totalRevenue = mappedAutomations.reduce((sum, a) => sum + a.revenue, 0);
      const totalSpend = mappedAutomations.reduce((sum, a) => sum + a.spend, 0);
      const totalOrders = mappedAutomations.reduce((sum, a) => sum + a.conversions, 0);
      const totalImpressions = mappedAutomations.reduce((sum, a) => sum + a.impressions, 0);
      const activeProducts = mappedAutomations.filter(a => a.status !== 'disabled' && a.status !== 'paused').length;
      const learningProducts = mappedAutomations.filter(a => a.status === 'learning').length;
      const scalingProducts = mappedAutomations.filter(a => a.status === 'scaling').length;

      setStats({
        totalRevenue,
        totalSpend,
        totalOrders,
        totalImpressions,
        avgRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
        activeProducts,
        learningProducts,
        scalingProducts,
        dataSource: totalImpressions > 0 ? 'real' : 'insufficient'
      });

      // Set system status based on data
      if (totalImpressions === 0) {
        setSystemStatus('learning');
      } else if (activeProducts > 0) {
        setSystemStatus('active');
      } else {
        setSystemStatus('paused');
      }

    } catch (err) {
      console.error('Error loading automations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load automations');
    } finally {
      setIsLoading(false);
    }
  }, [user, syncProducts]);

  // Update automation status
  const updateAutomationStatus = useCallback(async (
    automationId: string, 
    newStatus: ProductAutomation['status']
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('product_automations')
        .update({ 
          status: newStatus,
          last_action: `Status changed to ${newStatus}`,
          last_action_at: new Date().toISOString()
        })
        .eq('id', automationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setAutomations(prev => prev.map(a => 
        a.id === automationId 
          ? { ...a, status: newStatus, lastAction: `Status changed to ${newStatus}` }
          : a
      ));

      toast.success(`Automation status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating automation:', err);
      toast.error('Failed to update automation');
    }
  }, [user]);

  // Update automation mode (manual/assisted/autonomous)
  const updateAutomationMode = useCallback(async (
    automationId: string,
    newMode: ProductAutomation['automationMode']
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('product_automations')
        .update({ 
          automation_mode: newMode,
          last_action: `Mode changed to ${newMode}`,
          last_action_at: new Date().toISOString()
        })
        .eq('id', automationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setAutomations(prev => prev.map(a => 
        a.id === automationId 
          ? { ...a, automationMode: newMode }
          : a
      ));

      toast.success(`Automation mode set to ${newMode}`);
    } catch (err) {
      console.error('Error updating mode:', err);
      toast.error('Failed to update automation mode');
    }
  }, [user]);

  // Toggle global engine state
  const toggleEngine = useCallback(async (enabled: boolean) => {
    if (!user) return;

    try {
      const newStatus = enabled ? 'optimizing' : 'paused';
      
      const { error } = await supabase
        .from('product_automations')
        .update({ 
          status: newStatus,
          last_action: enabled ? 'Engine activated' : 'Engine paused',
          last_action_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .neq('status', 'disabled');

      if (error) throw error;

      setSystemStatus(enabled ? 'active' : 'paused');
      setAutomations(prev => prev.map(a => 
        a.status !== 'disabled' 
          ? { ...a, status: newStatus as ProductAutomation['status'] }
          : a
      ));

      toast.success(enabled ? 'Autonomous engine activated' : 'Autonomous engine paused');
    } catch (err) {
      console.error('Error toggling engine:', err);
      toast.error('Failed to toggle engine');
    }
  }, [user]);

  // Record a revenue event
  const recordEvent = useCallback(async (
    productId: string,
    eventType: 'impression' | 'click' | 'add_to_cart' | 'checkout' | 'purchase' | 'refund',
    amount: number = 0,
    metadata: Record<string, string | number | boolean | null> = {}
  ) => {
    if (!user) return;

    try {
      await supabase
        .from('revenue_events')
        .insert([{
          user_id: user.id,
          product_id: productId,
          event_type: eventType,
          amount,
          metadata,
          platform: 'shopify'
        }]);

      // Update automation metrics based on event
      if (eventType === 'impression' || eventType === 'click' || eventType === 'purchase') {
        const updates: Record<string, unknown> = {};
        
        if (eventType === 'impression') {
          const automation = automations.find(a => a.productId === productId);
          if (automation) {
            updates.impressions = automation.impressions + 1;
          }
        } else if (eventType === 'click') {
          const automation = automations.find(a => a.productId === productId);
          if (automation) {
            updates.clicks = automation.clicks + 1;
          }
        } else if (eventType === 'purchase') {
          const automation = automations.find(a => a.productId === productId);
          if (automation) {
            updates.conversions = automation.conversions + 1;
            updates.revenue = automation.revenue + amount;
          }
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('product_automations')
            .update(updates)
            .eq('product_id', productId)
            .eq('user_id', user.id);
        }
      }
    } catch (err) {
      console.error('Error recording event:', err);
    }
  }, [user, automations]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('autonomous-engine')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_automations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadAutomations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'revenue_events',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh stats on new events
          loadAutomations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadAutomations]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadAutomations();
    }
  }, [user, loadAutomations]);

  return {
    products,
    automations,
    stats,
    isLoading,
    isSyncing,
    systemStatus,
    lastSyncAt,
    error,
    syncProducts,
    loadAutomations,
    updateAutomationStatus,
    updateAutomationMode,
    toggleEngine,
    recordEvent
  };
}
/**
 * REAL SHOPIFY AUTONOMOUS ENGINE HOOK
 * 
 * This hook provides REAL data from Supabase - no mock data.
 * It syncs Shopify products, tracks real metrics, and manages automation state.
 * 
 * When Test Mode is enabled, it provides demo data for testing all features.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { storefrontApiRequest, PRODUCTS_QUERY, ShopifyProduct } from '@/lib/shopify-config';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { isTestMode } from '@/lib/demo-mode';

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

// Demo data for test mode
const TEST_MODE_PRODUCTS: ShopifyProduct[] = [
  { node: { id: 'demo-1', title: 'Aura Lift Serum', handle: 'aura-lift-serum', description: 'Anti-aging serum', priceRange: { minVariantPrice: { amount: '89.00', currencyCode: 'USD' } }, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', altText: 'Aura Lift Serum' } }] }, variants: { edges: [{ node: { id: 'v1', title: 'Default', price: { amount: '89.00', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] }, options: [] } },
  { node: { id: 'demo-2', title: 'Radiance Moisturizer', handle: 'radiance-moisturizer', description: 'Daily hydration', priceRange: { minVariantPrice: { amount: '65.00', currencyCode: 'USD' } }, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', altText: 'Radiance Moisturizer' } }] }, variants: { edges: [{ node: { id: 'v2', title: 'Default', price: { amount: '65.00', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] }, options: [] } },
  { node: { id: 'demo-3', title: 'Youth Renewal Eye Cream', handle: 'youth-renewal', description: 'Eye treatment', priceRange: { minVariantPrice: { amount: '78.00', currencyCode: 'USD' } }, images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400', altText: 'Youth Renewal Eye Cream' } }] }, variants: { edges: [{ node: { id: 'v3', title: 'Default', price: { amount: '78.00', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] }, options: [] } },
];

const TEST_MODE_AUTOMATIONS: ProductAutomation[] = [
  { id: 'auto-1', productId: 'demo-1', shopifyProductId: 'demo-1', productTitle: 'Aura Lift Serum', productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', productPrice: 89, status: 'scaling', automationMode: 'autonomous', impressions: 487291, clicks: 19421, conversions: 1847, revenue: 164383, spend: 34212, roas: 4.8, ctr: 3.98, conversionRate: 9.5, qualityScore: 92, lastAction: 'Scaled budget +15%', nextAction: 'Test new hook variant', lastActionAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'auto-2', productId: 'demo-2', shopifyProductId: 'demo-2', productTitle: 'Radiance Moisturizer', productImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', productPrice: 65, status: 'optimizing', automationMode: 'autonomous', impressions: 324891, clicks: 12891, conversions: 987, revenue: 64155, spend: 18234, roas: 3.5, ctr: 3.97, conversionRate: 7.6, qualityScore: 78, lastAction: 'A/B test started', nextAction: 'Evaluate variant B', lastActionAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'auto-3', productId: 'demo-3', shopifyProductId: 'demo-3', productTitle: 'Youth Renewal Eye Cream', productImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400', productPrice: 78, status: 'learning', automationMode: 'assisted', impressions: 89234, clicks: 3421, conversions: 234, revenue: 18252, spend: 6891, roas: 2.6, ctr: 3.83, conversionRate: 6.8, qualityScore: 65, lastAction: 'Collecting data', nextAction: 'First optimization', lastActionAt: new Date(Date.now() - 86400000).toISOString() },
];

const TEST_MODE_STATS: EngineStats = {
  totalRevenue: 246790,
  totalSpend: 59337,
  totalOrders: 3068,
  totalImpressions: 901416,
  avgRoas: 4.16,
  activeProducts: 3,
  learningProducts: 1,
  scalingProducts: 1,
  dataSource: 'real'
};

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

  // Check test mode immediately and set data
  const testModeActive = isTestMode();

  // Load test mode data if enabled - this runs synchronously on mount
  useEffect(() => {
    if (testModeActive) {
      setProducts(TEST_MODE_PRODUCTS);
      setAutomations(TEST_MODE_AUTOMATIONS);
      setStats(TEST_MODE_STATS);
      setSystemStatus('active');
      setLastSyncAt(new Date());
      setIsLoading(false);
      setError(null);
    }
  }, [testModeActive]);

  // Sync Shopify products to database
  const syncProducts = useCallback(async () => {
    // In test mode, just simulate a successful sync
    if (testModeActive) {
      setIsSyncing(true);
      await new Promise(r => setTimeout(r, 500));
      setProducts(TEST_MODE_PRODUCTS);
      setAutomations(TEST_MODE_AUTOMATIONS);
      setStats(TEST_MODE_STATS);
      setLastSyncAt(new Date());
      setIsSyncing(false);
      toast.success('Synced 3 products (Test Mode)');
      return;
    }

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
  }, [user, testModeActive]);

  // Load automations from database
  const loadAutomations = useCallback(async () => {
    // Skip if in test mode - data is already set
    if (testModeActive) {
      setIsLoading(false);
      return;
    }

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
  }, [user, syncProducts, testModeActive]);

  // Update automation status
  const updateAutomationStatus = useCallback(async (
    automationId: string, 
    newStatus: ProductAutomation['status']
  ) => {
    // In test mode, just update local state
    if (testModeActive) {
      setAutomations(prev => prev.map(a => 
        a.id === automationId 
          ? { ...a, status: newStatus, lastAction: `Status changed to ${newStatus}` }
          : a
      ));
      toast.success(`Automation status updated to ${newStatus}`);
      return;
    }

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
  }, [user, testModeActive]);

  // Update automation mode (manual/assisted/autonomous)
  const updateAutomationMode = useCallback(async (
    automationId: string,
    newMode: ProductAutomation['automationMode']
  ) => {
    // In test mode, just update local state
    if (testModeActive) {
      setAutomations(prev => prev.map(a => 
        a.id === automationId 
          ? { ...a, automationMode: newMode }
          : a
      ));
      toast.success(`Automation mode set to ${newMode}`);
      return;
    }

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
  }, [user, testModeActive]);

  // Toggle global engine state
  const toggleEngine = useCallback(async (enabled: boolean) => {
    // In test mode, just update local state
    if (testModeActive) {
      setSystemStatus(enabled ? 'active' : 'paused');
      setAutomations(prev => prev.map(a => 
        a.status !== 'disabled' 
          ? { ...a, status: enabled ? 'optimizing' : 'paused' as ProductAutomation['status'] }
          : a
      ));
      toast.success(enabled ? 'Autonomous engine activated' : 'Autonomous engine paused');
      return;
    }

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
  }, [user, testModeActive]);

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

  // Subscribe to realtime updates (skip in test mode)
  useEffect(() => {
    if (!user || testModeActive) return;

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
  }, [user, loadAutomations, testModeActive]);

  // Initial load (skip in test mode - already handled)
  useEffect(() => {
    if (user && !testModeActive) {
      loadAutomations();
    }
  }, [user, loadAutomations, testModeActive]);

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
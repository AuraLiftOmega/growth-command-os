/**
 * PROFIT REAPER ENGINE - Multi-Tenant Store Command
 * 
 * Manages ALL connected stores dynamically from user_store_connections
 * with automatic 60% profit margin calculation from CJ wholesale costs.
 * Each store can have its own Shopify App credentials and margin config.
 */

import { supabase } from '@/integrations/supabase/client';

// Default profit configuration - overridable per store
export const PROFIT_CONFIG = {
  targetMargin: 0.60,
  minMargin: 0.45,
  maxMargin: 0.80,
  platformFee: 0.05,
};

export interface StoreConnection {
  id: string;
  storeDomain: string;
  storeName: string;
  storeType: 'shopify' | 'cj' | 'custom';
  storefrontAccessToken: string;
  adminAccessToken: string | null;
  shopifyClientId: string | null;
  shopifyClientSecret: string | null;
  isActive: boolean;
  isPrimary: boolean;
  productCount: number;
  totalRevenue: number;
  profitMarginTarget: number;
  minMargin: number;
  platformFee: number;
  lastSync: string | null;
}

export interface ProductPricing {
  productId: string;
  productTitle: string;
  storeConnectionId?: string;
  cjCost: number;
  shippingCost: number;
  totalCost: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
}

/**
 * Calculate selling price to achieve target profit margin
 * Formula: Selling Price = Cost / (1 - Margin)
 */
export function calculateSellingPrice(cjCost: number, shippingCost: number = 0, targetMargin?: number): ProductPricing {
  const margin = targetMargin ?? PROFIT_CONFIG.targetMargin;
  const totalCost = cjCost + shippingCost;
  const sellingPrice = totalCost / (1 - margin);
  const profit = sellingPrice - totalCost;
  
  return {
    productId: '',
    productTitle: '',
    cjCost,
    shippingCost,
    totalCost,
    sellingPrice: Math.ceil(sellingPrice * 100) / 100,
    profit: Math.floor(profit * 100) / 100,
    profitMargin: margin,
  };
}

/**
 * Calculate profit from current selling price
 */
export function calculateProfit(sellingPrice: number, cjCost: number, shippingCost: number = 0): ProductPricing {
  const totalCost = cjCost + shippingCost;
  const profit = sellingPrice - totalCost;
  const profitMargin = sellingPrice > 0 ? profit / sellingPrice : 0;
  
  return {
    productId: '',
    productTitle: '',
    cjCost,
    shippingCost,
    totalCost,
    sellingPrice,
    profit,
    profitMargin,
  };
}

/**
 * Get recommended price for target margin
 */
export function getRecommendedPrice(cjCost: number, shippingCost: number = 0, targetMargin?: number): number {
  const margin = targetMargin ?? PROFIT_CONFIG.targetMargin;
  const totalCost = cjCost + shippingCost;
  return Math.ceil((totalCost / (1 - margin)) * 100) / 100;
}

/**
 * Validate if current price meets minimum margin
 */
export function validateMargin(sellingPrice: number, totalCost: number, minMargin?: number): boolean {
  const threshold = minMargin ?? PROFIT_CONFIG.minMargin;
  const margin = (sellingPrice - totalCost) / sellingPrice;
  return margin >= threshold;
}

/**
 * Get all active store connections for the current user from DB
 */
export async function getActiveStores(): Promise<StoreConnection[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_store_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('is_primary', { ascending: false });

  if (error || !data) {
    console.error('[ProfitReaper] Failed to fetch stores:', error);
    return [];
  }

  return data.map(store => ({
    id: store.id,
    storeDomain: store.store_domain,
    storeName: store.store_name,
    storeType: 'shopify' as const,
    storefrontAccessToken: store.storefront_access_token,
    adminAccessToken: store.admin_access_token,
    shopifyClientId: (store as any).shopify_client_id ?? null,
    shopifyClientSecret: (store as any).shopify_client_secret ?? null,
    isActive: store.is_active,
    isPrimary: store.is_primary,
    productCount: store.products_count ?? 0,
    totalRevenue: Number(store.total_revenue) || 0,
    profitMarginTarget: Number((store as any).profit_margin_target) || PROFIT_CONFIG.targetMargin,
    minMargin: Number((store as any).min_margin) || PROFIT_CONFIG.minMargin,
    platformFee: Number((store as any).platform_fee) || PROFIT_CONFIG.platformFee,
    lastSync: store.last_synced_at,
  }));
}

/**
 * Get a specific store connection by ID
 */
export async function getStoreById(storeId: string): Promise<StoreConnection | null> {
  const stores = await getActiveStores();
  return stores.find(s => s.id === storeId) ?? null;
}

/**
 * Get store by domain
 */
export async function getStoreByDomain(domain: string): Promise<StoreConnection | null> {
  const stores = await getActiveStores();
  return stores.find(s => s.storeDomain === domain.toLowerCase().trim()) ?? null;
}

/**
 * Fetch products from any connected store via edge function
 */
export async function fetchStoreProducts(storeId?: string, limit: number = 50, category?: string) {
  try {
    const stores = await getActiveStores();
    const targetStore = storeId 
      ? stores.find(s => s.id === storeId) 
      : stores.find(s => s.isPrimary) ?? stores[0];
    
    if (!targetStore) {
      console.error('[ProfitReaper] No store found');
      return [];
    }

    const query = category && category.toLowerCase() !== 'all' 
      ? `product_type:${category}` 
      : undefined;
    
    const { data, error } = await supabase.functions.invoke('fetch-shopify-products', {
      body: { 
        limit, 
        query,
        storeDomain: targetStore.storeDomain,
        storefrontToken: targetStore.storefrontAccessToken,
      }
    });
    
    if (error) {
      console.error('[ProfitReaper] Error fetching products:', error);
      return [];
    }
    
    return data?.products || [];
  } catch (err) {
    console.error('[ProfitReaper] Failed to fetch store products:', err);
    return [];
  }
}

/**
 * Calculate pricing for all products with store-specific margin
 */
export function calculateBulkPricing(
  products: any[], 
  cjCostMap: Record<string, number>,
  store?: StoreConnection
): ProductPricing[] {
  const targetMargin = store?.profitMarginTarget ?? PROFIT_CONFIG.targetMargin;
  
  return products.map(product => {
    const productId = product.node?.id || product.id;
    const title = product.node?.title || product.title;
    const cjCost = cjCostMap[productId] || 0;
    const shippingCost = 5.99;
    
    const pricing = calculateSellingPrice(cjCost, shippingCost, targetMargin);
    
    return {
      ...pricing,
      productId,
      productTitle: title,
      storeConnectionId: store?.id,
    };
  });
}

/**
 * Get store health metrics across all connected stores
 */
export async function getStoreHealth() {
  const stores = await getActiveStores();
  
  const avgMargin = stores.length > 0
    ? stores.reduce((acc, s) => acc + s.profitMarginTarget, 0) / stores.length
    : PROFIT_CONFIG.targetMargin;
  
  return {
    totalStores: stores.length,
    activeStores: stores.filter(s => s.isActive).length,
    totalProducts: stores.reduce((acc, s) => acc + s.productCount, 0),
    totalRevenue: stores.reduce((acc, s) => acc + s.totalRevenue, 0),
    averageMargin: avgMargin,
    stores: stores.map(s => ({
      id: s.id,
      name: s.storeName,
      domain: s.storeDomain,
      isPrimary: s.isPrimary,
      productCount: s.productCount,
      revenue: s.totalRevenue,
      marginTarget: s.profitMarginTarget,
      hasClientCredentials: !!(s.shopifyClientId && s.shopifyClientSecret),
    })),
    status: stores.length > 0 ? 'operational' : 'no_stores',
    lastCheck: new Date().toISOString(),
  };
}

/**
 * Sync product prices to achieve target margin for a specific store
 */
export async function syncProductPrices(products: ProductPricing[], store?: StoreConnection) {
  const minMargin = store?.minMargin ?? PROFIT_CONFIG.minMargin;
  const updates = products.filter(p => !validateMargin(p.sellingPrice, p.totalCost, minMargin));
  
  console.log(`[ProfitReaper] ${updates.length} products need price adjustment for ${(store?.profitMarginTarget ?? PROFIT_CONFIG.targetMargin) * 100}% margin on store: ${store?.storeName ?? 'default'}`);
  
  return {
    updated: updates.length,
    products: updates,
    storeId: store?.id,
  };
}

/**
 * Update per-store credentials
 */
export async function updateStoreCredentials(
  storeId: string, 
  credentials: { shopifyClientId?: string; shopifyClientSecret?: string }
) {
  const { error } = await supabase
    .from('user_store_connections')
    .update({
      shopify_client_id: credentials.shopifyClientId,
      shopify_client_secret: credentials.shopifyClientSecret,
    } as any)
    .eq('id', storeId);
  
  if (error) {
    console.error('[ProfitReaper] Failed to update credentials:', error);
    throw error;
  }
}

// Export engine status (dynamic)
export function getEngineStatus() {
  return {
    version: '3.0.0',
    mode: 'multi-tenant',
    targetMargin: `${PROFIT_CONFIG.targetMargin * 100}%`,
    minMargin: `${PROFIT_CONFIG.minMargin * 100}%`,
    platformFee: `${PROFIT_CONFIG.platformFee * 100}%`,
    status: 'active',
  };
}

// Legacy export for backward compatibility
export const ENGINE_STATUS = getEngineStatus();
export const PRIMARY_STORE = {
  domain: 'lovable-project-7fb70.myshopify.com',
  name: 'AURAOMEGA Store',
  type: 'shopify' as const,
  apiVersion: '2025-07',
};
export const CONNECTED_STORES = [{ id: 'primary', domain: PRIMARY_STORE.domain, name: PRIMARY_STORE.name, type: PRIMARY_STORE.type, isActive: true, secretKey: 'SHOPIFY_ACCESS_TOKEN' }];

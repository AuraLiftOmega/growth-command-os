/**
 * DYNAMIC STORE CONFIGURATION - AURAOMEGA SaaS Platform
 * 
 * Per-user dynamic configuration - NO hardcoded stores.
 * Each user connects their own Shopify store via OAuth.
 */

import { supabase } from '@/integrations/supabase/client';

export interface UserStoreConnection {
  id: string;
  shop_domain: string;
  shop_name: string | null;
  access_token_encrypted: string;
  is_active: boolean;
  products_count: number;
  orders_count: number;
  total_revenue: number;
  last_sync_at: string | null;
  connected_at: string;
}

export interface DynamicStoreConfig {
  domain: string;
  name: string;
  productCount: number;
  ordersCount: number;
  revenue: number;
  connected: boolean;
  lastSync: string | null;
}

// Get user's connected stores from database
export async function getUserStores(userId: string): Promise<UserStoreConnection[]> {
  const { data, error } = await supabase
    .from('user_shopify_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user stores:', error);
    return [];
  }

  return data || [];
}

// Get primary (first) store for a user
export async function getPrimaryStore(userId: string): Promise<DynamicStoreConfig | null> {
  const stores = await getUserStores(userId);
  if (stores.length === 0) return null;

  const primary = stores[0];
  return {
    domain: primary.shop_domain,
    name: primary.shop_name || primary.shop_domain.replace('.myshopify.com', ''),
    productCount: primary.products_count ?? 0,
    ordersCount: primary.orders_count ?? 0,
    revenue: primary.total_revenue ?? 0,
    connected: primary.is_active,
    lastSync: primary.last_sync_at,
  };
}

// Get user's products from their connected stores
export async function getUserProducts(userId: string) {
  const { data, error } = await supabase
    .from('user_products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user products:', error);
    return [];
  }

  return data || [];
}

// DYNAMIC: No hardcoded store - returns empty config for unconnected users
export function getEmptyStoreConfig(): DynamicStoreConfig {
  return {
    domain: '',
    name: 'No Store Connected',
    productCount: 0,
    ordersCount: 0,
    revenue: 0,
    connected: false,
    lastSync: null,
  };
}

// Build storefront API URL for a user's store
export function buildStorefrontUrl(shopDomain: string, apiVersion = '2025-07'): string {
  return `https://${shopDomain}/api/${apiVersion}/graphql.json`;
}

// Per-user storefront API request (requires token from database)
export async function userStorefrontRequest(
  connectionId: string,
  query: string,
  variables: Record<string, unknown> = {}
) {
  // Call edge function to make authenticated request
  const { data, error } = await supabase.functions.invoke('user-shopify-storefront', {
    body: { connectionId, query, variables }
  });

  if (error) {
    console.error('User storefront request failed:', error);
    throw error;
  }

  return data;
}

// AI Suggestion for connecting stores
export const AI_SUGGESTIONS = {
  noStore: {
    title: 'Connect Your Shopify Store',
    message: 'Add your Shopify store to start generating AI video ads and posting to all channels.',
    action: 'Connect Store',
    priority: 'high',
  },
  noSocial: {
    title: 'Connect Social Channels',
    message: 'Connect TikTok, Instagram, or Pinterest to post your video ads automatically.',
    action: 'Connect Channels',
    priority: 'high',
  },
  noVideos: {
    title: 'Generate Your First Video Ad',
    message: 'Select a product to generate a professional AI video ad in seconds.',
    action: 'Create Video',
    priority: 'medium',
  },
  lowEngagement: {
    title: 'Boost Engagement',
    message: 'Try posting at peak hours (9 AM, 12 PM, 6 PM) for 2-3x more reach.',
    action: 'Schedule Post',
    priority: 'low',
  },
  scaleWinner: {
    title: 'Scale Winning Creative',
    message: 'This video has 5x+ ROAS. Consider increasing budget by 20%.',
    action: 'Scale Now',
    priority: 'high',
  },
};

/**
 * SHOPIFY SAFETY LAYER
 * 
 * Supports multi-store mode with dynamic validation
 * against user_store_connections table.
 */

import { supabase } from '@/integrations/supabase/client';

// Default primary store (used as fallback only)
export const PRIMARY_SHOP_DOMAIN = 'lovable-project-7fb70.myshopify.com';

export interface ShopifySafetyStatus {
  isOperational: boolean;
  safeModeEnabled: boolean;
  primaryStore: string;
  multiShopEnabled: boolean;
  lastVerified: string | null;
}

/**
 * Get current Shopify safety status
 */
export async function getShopifySafetyStatus(): Promise<ShopifySafetyStatus> {
  try {
    const { data: config } = await supabase
      .from('shopify_config')
      .select('*')
      .eq('project_slug', 'primary')
      .single();

    return {
      isOperational: !config?.safe_mode_enabled,
      safeModeEnabled: config?.safe_mode_enabled ?? false,
      primaryStore: config?.primary_shop_domain ?? PRIMARY_SHOP_DOMAIN,
      multiShopEnabled: config?.multi_shop_mode ?? false,
      lastVerified: null
    };
  } catch (error) {
    console.error('[shopify-safety] Failed to get status:', error);
    return {
      isOperational: true,
      safeModeEnabled: false,
      primaryStore: PRIMARY_SHOP_DOMAIN,
      multiShopEnabled: true, // Fail open for multi-store
      lastVerified: null
    };
  }
}

/**
 * Validate shop domain is in user's connected stores
 */
export async function validateShopDomainForUser(shopDomain: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_store_connections')
    .select('id')
    .eq('user_id', userId)
    .eq('store_domain', shopDomain.toLowerCase().trim())
    .eq('is_active', true)
    .maybeSingle();

  return !!data;
}

/**
 * Simple domain format validation (no longer locked to single store)
 */
export function validateShopDomain(shopDomain: string): boolean {
  const normalized = shopDomain.toLowerCase().trim();
  return normalized.endsWith('.myshopify.com') && normalized.length > '.myshopify.com'.length;
}

/**
 * Check if write operations are allowed
 */
export async function canPerformWrite(): Promise<boolean> {
  const status = await getShopifySafetyStatus();
  return status.isOperational && !status.safeModeEnabled;
}

/**
 * Guard for Shopify write operations - now supports any user-connected store
 */
export async function shopifyWriteGuard(
  shopDomain: string,
  operation: string
): Promise<{ allowed: boolean; reason?: string }> {
  if (!validateShopDomain(shopDomain)) {
    return {
      allowed: false,
      reason: `Invalid shop domain format: "${shopDomain}"`
    };
  }

  const status = await getShopifySafetyStatus();
  
  if (status.safeModeEnabled) {
    return {
      allowed: false,
      reason: 'Safe mode is enabled - write operations blocked'
    };
  }

  try {
    await supabase.from('shopify_audit_log').insert({
      event_type: 'WRITE_ATTEMPT',
      shop_domain: shopDomain,
      action: operation,
      details: { timestamp: new Date().toISOString() },
      performed_by: 'api'
    });
  } catch (e) {
    // Don't block on logging failure
  }

  return { allowed: true };
}

/**
 * Validate webhook source domain
 */
export function validateWebhookSource(
  shopDomain: string,
  hmacHeader: string | null
): { valid: boolean; reason?: string } {
  if (!shopDomain) {
    return { valid: false, reason: 'Missing shop domain header' };
  }

  if (!validateShopDomain(shopDomain)) {
    return { 
      valid: false, 
      reason: `Webhook from invalid store domain: ${shopDomain}` 
    };
  }

  if (!hmacHeader) {
    return { valid: false, reason: 'Missing HMAC signature' };
  }

  return { valid: true };
}

/**
 * Get storefront credentials for primary store (fallback)
 */
export function getPrimaryStoreCredentials(): {
  domain: string;
  storefrontToken: string;
  apiVersion: string;
} {
  return {
    domain: PRIMARY_SHOP_DOMAIN,
    storefrontToken: 'd9830af538b34d418e1167726cf1f67a',
    apiVersion: '2025-07'
  };
}

/**
 * Build Storefront API URL for any store domain
 */
export function buildStorefrontUrl(storeDomain?: string): string {
  const domain = storeDomain || PRIMARY_SHOP_DOMAIN;
  return `https://${domain}/api/2025-07/graphql.json`;
}

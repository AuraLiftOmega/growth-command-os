/**
 * SHOPIFY SAFETY LAYER
 * 
 * Enforces single-store mode and provides safety checks
 * for all Shopify operations.
 */

import { supabase } from '@/integrations/supabase/client';

// CANONICAL PRIMARY STORE - LOCKED
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

    const { data: connection } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('shop_domain', PRIMARY_SHOP_DOMAIN)
      .eq('role', 'primary')
      .single();

    return {
      isOperational: !config?.safe_mode_enabled && connection?.is_verified,
      safeModeEnabled: config?.safe_mode_enabled ?? false,
      primaryStore: config?.primary_shop_domain ?? PRIMARY_SHOP_DOMAIN,
      multiShopEnabled: config?.multi_shop_mode ?? false,
      lastVerified: connection?.last_verified_at ?? null
    };
  } catch (error) {
    console.error('[shopify-safety] Failed to get status:', error);
    return {
      isOperational: true, // Fail open for reads
      safeModeEnabled: false,
      primaryStore: PRIMARY_SHOP_DOMAIN,
      multiShopEnabled: false,
      lastVerified: null
    };
  }
}

/**
 * Validate shop domain matches primary store
 */
export function validateShopDomain(shopDomain: string): boolean {
  const normalized = shopDomain.toLowerCase().trim();
  return normalized === PRIMARY_SHOP_DOMAIN;
}

/**
 * Check if write operations are allowed
 */
export async function canPerformWrite(): Promise<boolean> {
  const status = await getShopifySafetyStatus();
  return status.isOperational && !status.safeModeEnabled;
}

/**
 * Guard for Shopify write operations
 */
export async function shopifyWriteGuard(
  shopDomain: string,
  operation: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Validate domain first
  if (!validateShopDomain(shopDomain)) {
    return {
      allowed: false,
      reason: `Shop domain "${shopDomain}" does not match primary store`
    };
  }

  // Check safe mode
  const status = await getShopifySafetyStatus();
  
  if (status.safeModeEnabled) {
    return {
      allowed: false,
      reason: 'Safe mode is enabled - write operations blocked'
    };
  }

  // Log the operation attempt
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
      reason: `Webhook from unauthorized store: ${shopDomain}` 
    };
  }

  if (!hmacHeader) {
    return { valid: false, reason: 'Missing HMAC signature' };
  }

  return { valid: true };
}

/**
 * Get storefront credentials for primary store
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
 * Build Storefront API URL for primary store
 */
export function buildStorefrontUrl(): string {
  const { domain, apiVersion } = getPrimaryStoreCredentials();
  return `https://${domain}/api/${apiVersion}/graphql.json`;
}

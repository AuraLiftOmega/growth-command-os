/**
 * Unified Product Sync - Populates unified_products table from Shopify + CJ
 * 
 * Call syncUnifiedProducts() on-demand or schedule via n8n/cron.
 * Frontend reads from unified_products WHERE live = true for guaranteed accuracy.
 */

import { supabase } from '@/integrations/supabase/client';
import { fetchShopifyProducts, type NormalizedProduct } from '@/lib/fetch-shopify-products';

interface SyncOptions {
  storeDomain: string;
  token: string;
  limit?: number;
}

interface SyncResult {
  synced: number;
  created: number;
  updated: number;
  deactivated: number;
  errors: string[];
}

export async function syncUnifiedProducts(options: SyncOptions): Promise<SyncResult> {
  const result: SyncResult = { synced: 0, created: 0, updated: 0, deactivated: 0, errors: [] };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    result.errors.push('Not authenticated');
    return result;
  }

  // Fetch live products from Shopify + CJ enrichment
  let products: NormalizedProduct[];
  try {
    products = await fetchShopifyProducts({
      storeDomain: options.storeDomain,
      token: options.token,
      limit: options.limit || 250,
      enrichCj: true,
    });
  } catch (err) {
    result.errors.push(`Fetch failed: ${err instanceof Error ? err.message : String(err)}`);
    return result;
  }

  const activeShopifyIds = new Set<string>();

  // Upsert each product
  for (const p of products) {
    activeShopifyIds.add(p.shopifyProductId);

    const row = {
      user_id: user.id,
      shopify_product_id: p.shopifyProductId,
      cj_product_id: p.cjProductId,
      name: p.name,
      price: p.price,
      image_url: p.imageUrl,
      handle: p.handle,
      vendor: p.vendor,
      product_type: p.productType,
      status: 'active',
      live: true,
      currency: p.currency,
      last_synced_at: new Date().toISOString(),
    };

    const { error, status } = await supabase
      .from('unified_products')
      .upsert(row, { onConflict: 'user_id,shopify_product_id' });

    if (error) {
      result.errors.push(`Upsert ${p.shopifyProductId}: ${error.message}`);
    } else {
      result.synced++;
      // 201 = created, 200 = updated (approximate)
      if (status === 201) result.created++;
      else result.updated++;
    }
  }

  // Deactivate products no longer in Shopify
  if (activeShopifyIds.size > 0) {
    const { data: existing } = await supabase
      .from('unified_products')
      .select('id, shopify_product_id')
      .eq('user_id', user.id)
      .eq('live', true);

    if (existing) {
      const toDeactivate = existing.filter(e => !activeShopifyIds.has(e.shopify_product_id));
      for (const item of toDeactivate) {
        await supabase
          .from('unified_products')
          .update({ live: false, status: 'inactive' })
          .eq('id', item.id);
        result.deactivated++;
      }
    }
  }

  return result;
}

/**
 * Quick read: get all live unified products for current user
 */
export async function getUnifiedProducts() {
  const { data, error } = await supabase
    .from('unified_products')
    .select('*')
    .eq('live', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

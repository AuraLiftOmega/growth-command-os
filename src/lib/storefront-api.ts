/**
 * SHOPIFY STOREFRONT API - Proxied through Edge Functions
 * 
 * All Shopify interactions go through edge functions to avoid
 * CORS/auth issues with direct Storefront API calls from browser.
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    vendor?: string;
    productType?: string;
    tags?: string[];
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

// ─── Product Fetching (via Admin API edge function) ───

export async function fetchProducts(options: { first?: number; query?: string } = {}): Promise<ShopifyProduct[]> {
  const { first = 20, query } = options;
  try {
    const { data, error } = await supabase.functions.invoke('fetch-shopify-products', {
      body: { limit: first, query },
    });
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return data?.products || [];
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

export async function fetchProductByHandle(handle: string) {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-shopify-product', {
      body: { handle },
    });
    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }
    return data?.product || null;
  } catch (err) {
    console.error('Failed to fetch product:', err);
    return null;
  }
}

// ─── Cart Operations (via Storefront API edge function) ───

async function cartAction(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('shopify-cart', { body });
  if (error) {
    console.error('Cart action error:', error);
    throw new Error(error.message || 'Cart operation failed');
  }
  return data;
}

export async function createShopifyCart(
  variantId: string,
  quantity: number
): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  try {
    const data = await cartAction({ action: 'create', variantId, quantity });
    if (data?.error) {
      console.error('Cart creation failed:', data.error);
      toast.error('Failed to create cart');
      return null;
    }
    return data;
  } catch {
    toast.error('Failed to create cart');
    return null;
  }
}

export async function addLineToShopifyCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  try {
    return await cartAction({ action: 'addLine', cartId, variantId, quantity });
  } catch {
    return { success: false };
  }
}

export async function updateShopifyCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<{ success: boolean; cartNotFound?: boolean }> {
  try {
    return await cartAction({ action: 'updateLine', cartId, lineId, quantity });
  } catch {
    return { success: false };
  }
}

export async function removeLineFromShopifyCart(
  cartId: string,
  lineId: string
): Promise<{ success: boolean; cartNotFound?: boolean }> {
  try {
    return await cartAction({ action: 'removeLine', cartId, lineId });
  } catch {
    return { success: false };
  }
}

export async function fetchShopifyCart(
  cartId: string
): Promise<{ exists: boolean; totalQuantity: number }> {
  try {
    return await cartAction({ action: 'fetch', cartId });
  } catch {
    return { exists: false, totalQuantity: 0 };
  }
}

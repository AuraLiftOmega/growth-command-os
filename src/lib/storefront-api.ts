/**
 * SHOPIFY STOREFRONT API - Direct browser calls
 * 
 * Uses Storefront API token for public product browsing.
 * Cart operations use edge function proxy for mutations.
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'lovable-project-7fb70.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'd9830af538b34d418e1167726cf1f67a';

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

// ─── Storefront API helper ───

async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Your Shopify store needs an active billing plan to serve API requests.",
    });
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`Shopify error: ${data.errors.map((e: any) => e.message).join(', ')}`);
  }

  return data;
}

// ─── Product Fetching (direct Storefront API) ───

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          vendor
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      vendor
      productType
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

export async function fetchProducts(options: { first?: number; query?: string } = {}): Promise<ShopifyProduct[]> {
  const { first = 20, query } = options;
  try {
    const data = await storefrontApiRequest(PRODUCTS_QUERY, { first, query: query || null });
    if (!data) return [];
    
    const edges = data.data?.products?.edges || [];
    return edges as ShopifyProduct[];
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
    if (!data?.data?.product) return null;
    
    return { node: data.data.product } as ShopifyProduct;
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

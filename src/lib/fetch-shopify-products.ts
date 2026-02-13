/**
 * fetchShopifyProducts - Multi-store product fetcher
 * 
 * Usage:
 *   const products = await fetchShopifyProducts({
 *     storeDomain: activeStore.domain,
 *     token: activeStore.token,
 *   });
 *   // returns products with: shopifyProductId, name, price, imageUrl, cjProductId
 */

import { supabase } from '@/integrations/supabase/client';
import { SHOPIFY_API_VERSION } from '@/lib/shopify-config';

export interface NormalizedProduct {
  shopifyProductId: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  handle: string;
  vendor: string;
  productType: string;
  description: string;
  available: boolean;
  cjProductId: string | null;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    available: boolean;
  }>;
}

interface FetchOptions {
  storeDomain: string;
  token: string;
  limit?: number;
  query?: string;
  vendor?: string;
  enrichCj?: boolean;
}

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

export async function fetchShopifyProducts(options: FetchOptions): Promise<NormalizedProduct[]> {
  const { storeDomain, token, limit = 50, query, vendor, enrichCj = true } = options;

  const url = `https://${storeDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const gqlQuery = vendor ? `vendor:"${vendor}"` : query;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({
      query: PRODUCTS_QUERY,
      variables: { first: limit, query: gqlQuery || null },
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`Shopify GraphQL: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  const edges = data?.data?.products?.edges || [];

  // Parse raw Shopify products into normalized shape
  const products: NormalizedProduct[] = edges.map((edge: any) => {
    const node = edge.node;
    const firstVariant = node.variants?.edges?.[0]?.node;
    const imageUrl = node.images?.edges?.[0]?.node?.url || null;
    const shopifyProductId = node.id; // Full GID like gid://shopify/Product/123

    return {
      shopifyProductId,
      name: node.title,
      price: parseFloat(node.priceRange?.minVariantPrice?.amount || '0'),
      currency: node.priceRange?.minVariantPrice?.currencyCode || 'USD',
      imageUrl,
      handle: node.handle,
      vendor: node.vendor || '',
      productType: node.productType || '',
      description: node.description || '',
      available: firstVariant?.availableForSale ?? false,
      cjProductId: null, // Will be enriched below
      variants: (node.variants?.edges || []).map((v: any) => ({
        id: v.node.id,
        title: v.node.title,
        price: parseFloat(v.node.price?.amount || '0'),
        available: v.node.availableForSale ?? false,
      })),
    };
  });

  // Enrich with CJ product IDs from cj_logs table
  if (enrichCj && products.length > 0) {
    try {
      // Extract numeric IDs for DB lookup
      const numericIds = products
        .map(p => p.shopifyProductId.replace('gid://shopify/Product/', ''))
        .filter(Boolean);

      const { data: cjRows } = await supabase
        .from('cj_logs')
        .select('shopify_product_id, cj_product_id')
        .in('shopify_product_id', numericIds);

      if (cjRows && cjRows.length > 0) {
        const cjMap = new Map(cjRows.map(r => [r.shopify_product_id, r.cj_product_id]));
        for (const product of products) {
          const numericId = product.shopifyProductId.replace('gid://shopify/Product/', '');
          product.cjProductId = cjMap.get(numericId) || null;
        }
      }
    } catch (err) {
      console.warn('CJ enrichment failed (non-blocking):', err);
    }
  }

  // Filter to active products only
  return products.filter(p => p.available);
}

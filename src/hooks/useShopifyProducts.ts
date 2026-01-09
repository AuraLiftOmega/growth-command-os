/**
 * REAL SHOPIFY PRODUCTS HOOK
 * 
 * Fetches real products from connected Shopify store
 * Used by VideoAdStudio, ProductIntelligenceEngine, and RealVideoSwarm
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { PRODUCT_IMAGE_FALLBACKS } from '@/lib/shopify-config';

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'lovable-project-7fb70.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'd9830af538b34d418e1167726cf1f67a';

export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  vendor: string;
  productType: string;
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
}

export interface ParsedShopifyProduct {
  id: string;
  shopifyId: string;
  title: string;
  description: string;
  handle: string;
  vendor: string;
  productType: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  images: string[];
  variants: Array<{
    id: string;
    title: string;
    price: number;
    available: boolean;
  }>;
  available: boolean;
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

async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Shopify API access requires an active billing plan."
    });
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

function parseProduct(node: ShopifyProduct): ParsedShopifyProduct {
  const firstVariant = node.variants.edges[0]?.node;
  const shopifyImages = node.images.edges.map(e => e.node.url);
  
  // Use local fallback if no Shopify images
  const fallbackImage = PRODUCT_IMAGE_FALLBACKS[node.handle];
  const images = shopifyImages.length > 0 ? shopifyImages : (fallbackImage ? [fallbackImage] : []);
  
  return {
    id: node.id.replace('gid://shopify/Product/', ''),
    shopifyId: node.id,
    title: node.title,
    description: node.description,
    handle: node.handle,
    vendor: node.vendor,
    productType: node.productType,
    price: parseFloat(node.priceRange.minVariantPrice.amount),
    currency: node.priceRange.minVariantPrice.currencyCode,
    imageUrl: images[0] || null,
    images,
    variants: node.variants.edges.map(v => ({
      id: v.node.id,
      title: v.node.title,
      price: parseFloat(v.node.price.amount),
      available: v.node.availableForSale
    })),
    available: firstVariant?.availableForSale ?? false
  };
}

/**
 * REAL SHOPIFY PRODUCTS HOOK
 * 
 * DEFAULT: Fetches ONLY AuraLift Beauty products
 * Set vendor to 'all' to fetch all products
 */
export function useShopifyProducts(options?: { 
  vendor?: string; 
  limit?: number;
  autoLoad?: boolean;
}) {
  const [products, setProducts] = useState<ParsedShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // DEFAULT TO AURALIFT BEAUTY - Real products only
  const defaultVendor = options?.vendor === 'all' ? undefined : (options?.vendor || 'AuraLift Beauty');

  const fetchProducts = useCallback(async (vendorFilter?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use provided filter or default to AuraLift Beauty
      const effectiveVendor = vendorFilter ?? defaultVendor;
      const query = effectiveVendor ? `vendor:"${effectiveVendor}"` : undefined;
      
      const result = await storefrontApiRequest(PRODUCTS_QUERY, { 
        first: options?.limit || 50,
        query 
      });

      if (!result?.data?.products?.edges) {
        throw new Error('No products found');
      }

      const parsed = result.data.products.edges.map((edge: { node: ShopifyProduct }) => 
        parseProduct(edge.node)
      );

      setProducts(parsed);
      setLastFetched(new Date());
      return parsed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      console.error('Shopify fetch error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [options?.limit, defaultVendor]);

  useEffect(() => {
    if (options?.autoLoad !== false) {
      fetchProducts(defaultVendor);
    }
  }, [defaultVendor, options?.autoLoad, fetchProducts]);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id || p.shopifyId === id);
  }, [products]);

  const getProductByHandle = useCallback((handle: string) => {
    return products.find(p => p.handle === handle);
  }, [products]);

  const getAuraLiftProducts = useCallback(() => {
    return products.filter(p => p.vendor === 'AuraLift Beauty');
  }, [products]);

  return {
    products,
    isLoading,
    error,
    lastFetched,
    fetchProducts,
    getProductById,
    getProductByHandle,
    getAuraLiftProducts,
    refetch: () => fetchProducts(defaultVendor)
  };
}

// Export for use in video generation
export { SHOPIFY_STORE_PERMANENT_DOMAIN, SHOPIFY_STOREFRONT_TOKEN };

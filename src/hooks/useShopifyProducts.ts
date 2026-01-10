/**
 * REAL SHOPIFY PRODUCTS HOOK - PER-USER DYNAMIC
 * 
 * Uses per-user Shopify connections from user_shopify_connections table
 * No hardcoded stores - users must connect their own stores
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PRODUCT_IMAGE_FALLBACKS, storefrontApiRequest, SHOPIFY_API_VERSION } from '@/lib/shopify-config';
import { useActiveStore } from './useActiveStore';

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

// Cache for products fetched via edge function
let cachedProducts: ParsedShopifyProduct[] = [];
let cacheTimestamp: Date | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function parseStorefrontProduct(node: ShopifyProduct): ParsedShopifyProduct {
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
 * REAL SHOPIFY PRODUCTS HOOK - PER USER
 * 
 * Uses user's connected store from useActiveStore hook
 */
export function useShopifyProducts(options?: { 
  vendor?: string; 
  limit?: number;
  autoLoad?: boolean;
}) {
  const { activeStore, hasConnectedStores } = useActiveStore();
  const [products, setProducts] = useState<ParsedShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [source, setSource] = useState<'storefront' | 'edge' | 'cache' | 'none'>('none');

  const fetchProducts = useCallback(async (vendorFilter?: string) => {
    if (!activeStore) {
      setError('No store connected. Connect your Shopify store to view products.');
      setProducts([]);
      setSource('none');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      if (cachedProducts.length > 0 && cacheTimestamp && (Date.now() - cacheTimestamp.getTime() < CACHE_TTL)) {
        const filtered = vendorFilter 
          ? cachedProducts.filter(p => p.vendor === vendorFilter)
          : cachedProducts;
        
        if (filtered.length > 0) {
          setProducts(filtered);
          setSource('cache');
          setLastFetched(cacheTimestamp);
          setIsLoading(false);
          return filtered;
        }
      }

      // Try Storefront API with user's store credentials
      const query = vendorFilter ? `vendor:"${vendorFilter}"` : undefined;
      
      const storefrontResult = await storefrontApiRequest(
        activeStore.storeDomain,
        activeStore.storefrontToken,
        PRODUCTS_QUERY, 
        { first: options?.limit || 50, query }
      );

      if (!storefrontResult.error && storefrontResult?.data?.products?.edges?.length > 0) {
        const parsed = storefrontResult.data.products.edges.map((edge: { node: ShopifyProduct }) => 
          parseStorefrontProduct(edge.node)
        );
        
        setProducts(parsed);
        setSource('storefront');
        setLastFetched(new Date());
        
        // Update cache
        cachedProducts = parsed;
        cacheTimestamp = new Date();
        
        return parsed;
      }

      // No products found or API error
      if (storefrontResult.error) {
        setError(`Shopify API error: ${storefrontResult.error}`);
      } else {
        setError('No products found in your store.');
      }
      setProducts([]);
      return [];

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      console.error('Shopify fetch error:', err);
      setProducts([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [activeStore, options?.limit]);

  useEffect(() => {
    if (options?.autoLoad !== false && activeStore) {
      fetchProducts(options?.vendor);
    }
  }, [activeStore, options?.vendor, options?.autoLoad, fetchProducts]);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id || p.shopifyId === id);
  }, [products]);

  const getProductByHandle = useCallback((handle: string) => {
    return products.find(p => p.handle === handle);
  }, [products]);

  return {
    products,
    isLoading,
    error,
    lastFetched,
    source,
    fetchProducts,
    getProductById,
    getProductByHandle,
    refetch: () => fetchProducts(options?.vendor),
    hasConnectedStore: hasConnectedStores,
    activeStore,
  };
}

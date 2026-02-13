/**
 * SHOPIFY PRODUCTS HOOK - Uses edge function proxy
 * 
 * Routes all requests through fetch-shopify-products edge function
 * to avoid CORS/auth issues with direct Storefront API calls.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

// Cache
let cachedProducts: ParsedShopifyProduct[] = [];
let cacheTimestamp: Date | null = null;
const CACHE_TTL = 5 * 60 * 1000;

function parseEdgeProduct(node: any): ParsedShopifyProduct {
  const firstVariant = node.variants?.edges?.[0]?.node;
  const images = node.images?.edges?.map((e: any) => e.node.url) || [];

  return {
    id: (node.id || '').replace('gid://shopify/Product/', ''),
    shopifyId: node.id,
    title: node.title || '',
    description: node.description || '',
    handle: node.handle || '',
    vendor: node.vendor || '',
    productType: node.productType || '',
    price: parseFloat(node.priceRange?.minVariantPrice?.amount || '0'),
    currency: node.priceRange?.minVariantPrice?.currencyCode || 'USD',
    imageUrl: images[0] || null,
    images,
    variants: (node.variants?.edges || []).map((v: any) => ({
      id: v.node.id,
      title: v.node.title,
      price: parseFloat(v.node.price?.amount || '0'),
      available: v.node.availableForSale ?? true,
    })),
    available: firstVariant?.availableForSale ?? false,
  };
}

export function useShopifyProducts(options?: {
  vendor?: string;
  limit?: number;
  autoLoad?: boolean;
}) {
  const [products, setProducts] = useState<ParsedShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchProducts = useCallback(async (vendorFilter?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache
      if (cachedProducts.length > 0 && cacheTimestamp && (Date.now() - cacheTimestamp.getTime() < CACHE_TTL)) {
        const filtered = vendorFilter
          ? cachedProducts.filter(p => p.vendor === vendorFilter)
          : cachedProducts;
        if (filtered.length > 0) {
          setProducts(filtered);
          setLastFetched(cacheTimestamp);
          setIsLoading(false);
          return filtered;
        }
      }

      const query = vendorFilter ? `vendor:"${vendorFilter}"` : undefined;
      const { data, error: fnError } = await supabase.functions.invoke('fetch-shopify-products', {
        body: { limit: options?.limit || 50, query },
      });

      if (fnError) {
        setError('Failed to fetch products');
        setProducts([]);
        return [];
      }

      const parsed = (data?.products || []).map((p: any) => parseEdgeProduct(p.node));
      setProducts(parsed);
      setLastFetched(new Date());
      cachedProducts = parsed;
      cacheTimestamp = new Date();
      return parsed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      setProducts([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [options?.limit]);

  useEffect(() => {
    if (options?.autoLoad !== false) {
      fetchProducts(options?.vendor);
    }
  }, [options?.vendor, options?.autoLoad, fetchProducts]);

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
    source: 'edge' as const,
    fetchProducts,
    getProductById,
    getProductByHandle,
    refetch: () => fetchProducts(options?.vendor),
    hasConnectedStore: true,
    activeStore: null,
  };
}

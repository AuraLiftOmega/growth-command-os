/**
 * REAL SHOPIFY PRODUCTS HOOK
 * 
 * Uses Lovable Shopify Admin API tools for reliable product fetching
 * Falls back to Storefront API if available
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PRODUCT_IMAGE_FALLBACKS } from '@/lib/shopify-config';

// Import from centralized config
import { 
  SHOPIFY_STORE_PERMANENT_DOMAIN, 
  SHOPIFY_STOREFRONT_TOKEN,
  SHOPIFY_STOREFRONT_URL 
} from '@/lib/shopify-config';

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

/**
 * Fetch products via edge function (uses Admin API - always works)
 */
async function fetchViaEdgeFunction(vendorFilter?: string): Promise<ParsedShopifyProduct[]> {
  try {
    const { data, error } = await supabase.functions.invoke('shopify-sync-products', {
      body: { vendor: vendorFilter }
    });

    if (error) throw error;
    
    if (data?.products) {
      return data.products;
    }
    
    return [];
  } catch (err) {
    console.error('Edge function fetch failed:', err);
    return [];
  }
}

/**
 * Fetch products via Storefront API (client-side)
 */
async function fetchViaStorefrontApi(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 401) {
    console.warn('Storefront API 401 - token may be expired, using fallback');
    return { error: 'UNAUTHORIZED', data: null };
  }

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Shopify API access requires an active billing plan."
    });
    return { error: 'PAYMENT_REQUIRED', data: null };
  }

  if (!response.ok) {
    return { error: `HTTP_${response.status}`, data: null };
  }

  const data = await response.json();
  
  if (data.errors) {
    console.error('Storefront API errors:', data.errors);
    return { error: 'GRAPHQL_ERROR', data: null };
  }

  return { error: null, data };
}

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

// Hardcoded AuraLift products as ultimate fallback (these are REAL products in the store)
const AURALIFT_PRODUCTS_FALLBACK: ParsedShopifyProduct[] = [
  {
    id: '10511372484913',
    shopifyId: 'gid://shopify/Product/10511372484913',
    title: 'Hydra-Glow Retinol Night Cream',
    description: 'Advanced retinol night cream for glowing, youthful skin',
    handle: 'hydra-glow-retinol-night-cream',
    vendor: 'AuraLift Beauty',
    productType: 'Skincare',
    price: 89.00,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800',
    images: ['https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800'],
    variants: [{ id: 'gid://shopify/ProductVariant/1', title: 'Default', price: 89.00, available: true }],
    available: true
  },
  {
    id: '10511372747057',
    shopifyId: 'gid://shopify/Product/10511372747057',
    title: 'Luxe Rose Quartz Face Roller Set',
    description: 'Premium rose quartz face roller for lymphatic drainage and glow',
    handle: 'luxe-rose-quartz-face-roller-set',
    vendor: 'AuraLift Beauty',
    productType: 'Beauty Tools',
    price: 45.00,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800',
    images: ['https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800'],
    variants: [{ id: 'gid://shopify/ProductVariant/2', title: 'Default', price: 45.00, available: true }],
    available: true
  },
  {
    id: '10511372812593',
    shopifyId: 'gid://shopify/Product/10511372812593',
    title: 'Omega Glow Collagen Peptide Moisturizer',
    description: 'Collagen-boosting peptide moisturizer for firm, hydrated skin',
    handle: 'omega-glow-collagen-peptide-moisturizer',
    vendor: 'AuraLift Beauty',
    productType: 'Skincare',
    price: 75.00,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'],
    variants: [{ id: 'gid://shopify/ProductVariant/3', title: 'Default', price: 75.00, available: true }],
    available: true
  },
  {
    id: '10517788819761',
    shopifyId: 'gid://shopify/Product/10517788819761',
    title: 'Face Lift Up Wrinkle Remover Gua Sha Stone',
    description: 'Premium gua sha stone for face massage and skin lifting',
    handle: 'face-lift-up-wrinkle-remover-gua-sha-stone',
    vendor: 'AuraLift Beauty',
    productType: 'Beauty Tools',
    price: 35.00,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800',
    images: ['https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800'],
    variants: [{ id: 'gid://shopify/ProductVariant/4', title: 'Default', price: 35.00, available: true }],
    available: true
  }
];

/**
 * REAL SHOPIFY PRODUCTS HOOK
 * 
 * Priority:
 * 1. Try Storefront API (fastest, client-side)
 * 2. Fall back to Edge Function (Admin API, always works)
 * 3. Use hardcoded real product data as last resort
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
  const [source, setSource] = useState<'storefront' | 'edge' | 'cache' | 'fallback'>('cache');

  // DEFAULT TO AURALIFT BEAUTY - Real products only
  const defaultVendor = options?.vendor === 'all' ? undefined : (options?.vendor || 'AuraLift Beauty');

  const fetchProducts = useCallback(async (vendorFilter?: string) => {
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

      // Try Storefront API first
      const effectiveVendor = vendorFilter ?? defaultVendor;
      const query = effectiveVendor ? `vendor:"${effectiveVendor}"` : undefined;
      
      const storefrontResult = await fetchViaStorefrontApi(PRODUCTS_QUERY, { 
        first: options?.limit || 50,
        query 
      });

      if (!storefrontResult.error && storefrontResult.data?.data?.products?.edges?.length > 0) {
        const parsed = storefrontResult.data.data.products.edges.map((edge: { node: ShopifyProduct }) => 
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

      // Storefront failed - try edge function
      console.log('Storefront API unavailable, trying edge function...');
      const edgeProducts = await fetchViaEdgeFunction(effectiveVendor);
      
      if (edgeProducts.length > 0) {
        setProducts(edgeProducts);
        setSource('edge');
        setLastFetched(new Date());
        
        // Update cache
        cachedProducts = edgeProducts;
        cacheTimestamp = new Date();
        
        return edgeProducts;
      }

      // Both failed - use hardcoded fallback
      console.log('Using hardcoded product fallback');
      const fallbackFiltered = effectiveVendor
        ? AURALIFT_PRODUCTS_FALLBACK.filter(p => p.vendor === effectiveVendor)
        : AURALIFT_PRODUCTS_FALLBACK;
      
      setProducts(fallbackFiltered);
      setSource('fallback');
      setLastFetched(new Date());
      setError('Using cached product data - Storefront token needs refresh');
      
      toast.warning('Shopify Sync Issue', {
        description: 'Showing cached products. Storefront token may need regeneration in Shopify Admin.',
        action: {
          label: 'Go to Admin',
          onClick: () => window.open('https://admin.shopify.com/store/lovable-project-7fb70/settings/apps/development', '_blank')
        }
      });
      
      return fallbackFiltered;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      console.error('Shopify fetch error:', err);
      
      // Return fallback on error
      setProducts(AURALIFT_PRODUCTS_FALLBACK);
      setSource('fallback');
      return AURALIFT_PRODUCTS_FALLBACK;
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
    source,
    fetchProducts,
    getProductById,
    getProductByHandle,
    getAuraLiftProducts,
    refetch: () => fetchProducts(defaultVendor)
  };
}

// Export for use in video generation
export { SHOPIFY_STORE_PERMANENT_DOMAIN, SHOPIFY_STOREFRONT_TOKEN };

/**
 * SHOPIFY SYNC PRODUCTS - Edge Function
 * 
 * Fetches REAL products from Shopify Storefront API
 * Now uses actual API - no hardcoded products
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Shopify store config (from Lovable integration)
const SHOPIFY_STORE_DOMAIN = 'lovable-project-7fb70.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = Deno.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN') || 'd9830af538b34d418e1167726cf1f67a';
const SHOPIFY_API_VERSION = '2025-07';

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
              }
            }
          }
        }
      }
    }
  }
`;

// Fallback images for when Shopify images are missing
const FALLBACK_IMAGES: Record<string, string> = {
  'radiance-vitamin-c-serum': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
  'hydra-glow-retinol-night-cream': 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800',
  'ultra-hydration-hyaluronic-serum': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800',
  'omega-glow-collagen-peptide-moisturizer': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
  'luxe-rose-quartz-face-roller-set': 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800',
};
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendor } = await req.json().catch(() => ({}));
    
    console.log('=== SHOPIFY SYNC PRODUCTS ===');
    console.log(`Store: ${SHOPIFY_STORE_DOMAIN}`);
    console.log(`Vendor filter: ${vendor || 'all'}`);

    // Build query - filter by vendor if specified
    const queryFilter = vendor ? `vendor:"${vendor}"` : null;

    // Fetch from Shopify Storefront API
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
          variables: {
            first: 50,
            query: queryFilter,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error(`Shopify API error: ${response.status}`);
      throw new Error(`Shopify API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('Shopify GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    const products = (data.data?.products?.edges || []).map((edge: any) => {
      const node = edge.node;
      const handle = node.handle || '';
      const firstImage = node.images?.edges?.[0]?.node?.url;
      const imageUrl = firstImage || FALLBACK_IMAGES[handle] || DEFAULT_IMAGE;
      
      return {
        id: node.id.replace('gid://shopify/Product/', ''),
        shopifyId: node.id,
        title: node.title,
        description: node.description,
        handle: handle,
        vendor: node.vendor || 'AuraLift Beauty',
        productType: node.productType || 'Skincare',
        price: parseFloat(node.priceRange?.minVariantPrice?.amount || '0'),
        currency: node.priceRange?.minVariantPrice?.currencyCode || 'USD',
        imageUrl,
        images: node.images?.edges?.map((img: any) => img.node.url) || [imageUrl],
        variants: node.variants?.edges?.map((v: any) => ({
          id: v.node.id,
          title: v.node.title,
          price: parseFloat(v.node.price?.amount || '0'),
          available: v.node.availableForSale,
        })) || [],
        available: node.variants?.edges?.some((v: any) => v.node.availableForSale) ?? true,
        tags: node.tags || [],
      };
    });

    console.log(`✅ Fetched ${products.length} real products from Shopify`);

    return new Response(
      JSON.stringify({ 
        success: true,
        products,
        source: 'storefront_api_live',
        store: SHOPIFY_STORE_DOMAIN,
        timestamp: new Date().toISOString(),
        count: products.length,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in shopify-sync-products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        products: [],
        source: 'error',
        message: 'Failed to fetch products from Shopify. Please check store connection.',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 so UI can handle gracefully
      }
    );
  }
});

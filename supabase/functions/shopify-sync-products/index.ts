/**
 * SHOPIFY SYNC PRODUCTS - Edge Function (PER-USER)
 * 
 * Fetches products for a specific user's connected Shopify store
 * NO HARDCODED STORES - Uses user_shopify_connections table
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid auth token');
    }

    const body = await req.json().catch(() => ({}));
    const { vendor, connectionId } = body;
    
    console.log('=== SHOPIFY SYNC PRODUCTS (PER-USER) ===');
    console.log(`User: ${user.id}`);
    console.log(`Connection ID: ${connectionId || 'primary'}`);
    console.log(`Vendor filter: ${vendor || 'all'}`);

    // Fetch user's Shopify connection
    let query = supabase
      .from('user_shopify_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (connectionId) {
      query = query.eq('id', connectionId);
    }

    const { data: connections, error: connError } = await query.order('connected_at', { ascending: false }).limit(1);

    if (connError || !connections || connections.length === 0) {
      console.log('No Shopify connection found for user');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No Shopify store connected',
          products: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const connection = connections[0];
    const shopDomain = connection.shop_domain;
    
    // Get access token (decrypted from secure storage)
    const accessToken = connection.storefront_access_token || Deno.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
    
    if (!accessToken) {
      throw new Error('No storefront access token available');
    }

    // Build query filter
    const queryFilter = vendor ? `vendor:"${vendor}"` : null;

    // Fetch from user's Shopify store
    const response = await fetch(
      `https://${shopDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken,
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

    const edges = data.data?.products?.edges || [];
    console.log(`Fetched ${edges.length} products from ${shopDomain}`);

    // Transform products
    const products = edges.map((edge: any) => {
      const product = edge.node;
      const images = product.images?.edges?.map((img: any) => ({
        url: img.node.url,
        altText: img.node.altText
      })) || [];

      const variants = product.variants?.edges?.map((v: any) => ({
        id: v.node.id,
        title: v.node.title,
        price: parseFloat(v.node.price?.amount || '0'),
        available: v.node.availableForSale
      })) || [];

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        handle: product.handle,
        vendor: product.vendor,
        productType: product.productType,
        tags: product.tags || [],
        price: parseFloat(product.priceRange?.minVariantPrice?.amount || '0'),
        currency: product.priceRange?.minVariantPrice?.currencyCode || 'USD',
        images,
        variants,
        imageUrl: images[0]?.url || null,
        available: variants.some((v: any) => v.available)
      };
    });

    // Update connection with products count
    await supabase
      .from('user_shopify_connections')
      .update({ 
        products_count: products.length,
        last_sync_at: new Date().toISOString()
      })
      .eq('id', connection.id);

    // Upsert products to user_products table
    if (products.length > 0) {
      const userProducts = products.map((p: any) => ({
        user_id: user.id,
        connection_id: connection.id,
        shopify_product_id: p.id,
        title: p.title,
        handle: p.handle,
        description: p.description,
        vendor: p.vendor,
        product_type: p.productType,
        price: p.price,
        currency: p.currency,
        images: p.images,
        variants: p.variants,
        tags: p.tags,
        status: p.available ? 'active' : 'draft',
        updated_at: new Date().toISOString()
      }));

      await supabase
        .from('user_products')
        .upsert(userProducts, { onConflict: 'user_id,shopify_product_id' });
    }

    return new Response(
      JSON.stringify({
        success: true,
        products,
        count: products.length,
        store: shopDomain,
        syncedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Shopify sync error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        products: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

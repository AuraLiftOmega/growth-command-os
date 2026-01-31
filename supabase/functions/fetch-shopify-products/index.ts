import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = "lovable-project-7fb70.myshopify.com";
const SHOPIFY_API_VERSION = "2025-01";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 20, query } = await req.json().catch(() => ({}));
    
    const adminToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    
    if (!adminToken) {
      console.error("SHOPIFY_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Store not configured", products: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Build GraphQL query for Admin API
    const graphqlQuery = `
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
              priceRangeV2 {
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
                    price
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

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { first: limit, query: query || null },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify Admin API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Shopify API error: ${response.status}`, products: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return new Response(
        JSON.stringify({ error: "GraphQL error", products: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Transform Admin API response to match Storefront API format
    const products = data.data?.products?.edges?.map((edge: any) => ({
      node: {
        id: edge.node.id,
        title: edge.node.title,
        description: edge.node.description,
        handle: edge.node.handle,
        vendor: edge.node.vendor,
        productType: edge.node.productType,
        tags: edge.node.tags,
        priceRange: {
          minVariantPrice: {
            amount: edge.node.priceRangeV2?.minVariantPrice?.amount || "0",
            currencyCode: edge.node.priceRangeV2?.minVariantPrice?.currencyCode || "USD",
          },
        },
        images: edge.node.images,
        variants: {
          edges: edge.node.variants?.edges?.map((v: any) => ({
            node: {
              id: v.node.id,
              title: v.node.title,
              price: {
                amount: v.node.price || "0",
                currencyCode: "USD",
              },
              availableForSale: v.node.availableForSale ?? true,
              selectedOptions: v.node.selectedOptions || [],
            },
          })) || [],
        },
        options: edge.node.options || [],
      },
    })) || [];

    console.log(`Fetched ${products.length} products from Shopify Admin API`);

    return new Response(
      JSON.stringify({ products }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Error in fetch-shopify-products:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, products: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

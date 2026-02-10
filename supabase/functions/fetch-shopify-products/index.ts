import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Primary store configuration
const SHOPIFY_STORE_DOMAIN = "lovable-project-7fb70.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 50, query } = await req.json().catch(() => ({}));

    const adminToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!adminToken) {
      return new Response(
        JSON.stringify({ error: "Store not configured", products: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 1. Get all CJ-sourced product names from cj_logs
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: cjProducts, error: cjError } = await supabase
      .from('cj_logs')
      .select('cj_product_id, cj_product_name, shopify_product_id')
      .order('cj_product_id');

    if (cjError) {
      console.error("Error fetching CJ logs:", cjError);
    }

    // Build a set of CJ-sourced product names (normalized) for matching
    const cjProductNames = new Set<string>();
    const cjShopifyIds = new Set<string>();
    if (cjProducts) {
      for (const p of cjProducts) {
        if (p.cj_product_name) {
          cjProductNames.add(p.cj_product_name.toLowerCase().trim());
        }
        if (p.shopify_product_id) {
          cjShopifyIds.add(p.shopify_product_id);
        }
      }
    }

    console.log(`Found ${cjProductNames.size} unique CJ product names, ${cjShopifyIds.size} with Shopify IDs`);

    // 2. Fetch all products from Shopify
    const graphqlQuery = `
      query GetProducts($first: Int!, $query: String) {
        products(first: $first, query: $query, sortKey: TITLE) {
          edges {
            node {
              id
              title
              description
              handle
              vendor
              productType
              tags
              status
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
          variables: { first: limit, query: query || "status:active" },
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

    // 3. Filter to only CJ-sourced products
    const allEdges = data.data?.products?.edges || [];
    const sourcedEdges = allEdges.filter((edge: any) => {
      const shopifyGid = edge.node.id;
      const title = (edge.node.title || '').toLowerCase().trim();

      // Match by Shopify GID if linked in cj_logs
      if (cjShopifyIds.has(shopifyGid)) return true;

      // Match by product name (fuzzy: CJ name contained in Shopify title or vice versa)
      for (const cjName of cjProductNames) {
        if (title === cjName) return true;
        if (title.includes(cjName) || cjName.includes(title)) return true;
      }

      return false;
    });

    // 4. Transform to storefront format
    const products = sourcedEdges.map((edge: any) => ({
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
    }));

    console.log(`Returning ${products.length} CJ-sourced products out of ${allEdges.length} total`);

    return new Response(
      JSON.stringify({ products, totalInStore: allEdges.length, totalSourced: products.length }),
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

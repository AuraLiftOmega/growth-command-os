import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = "lovable-project-7fb70.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { handle } = await req.json();
    if (!handle) {
      return new Response(
        JSON.stringify({ error: "handle is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const adminToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!adminToken) {
      return new Response(
        JSON.stringify({ error: "Store not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const graphqlQuery = `
      query GetProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          description
          descriptionHtml
          handle
          vendor
          productType
          priceRangeV2 {
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
          variants(first: 50) {
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
    `;

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({ query: graphqlQuery, variables: { handle } }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify Admin API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Shopify API error: ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const data = await response.json();
    const p = data.data?.productByHandle;

    if (!p) {
      return new Response(
        JSON.stringify({ product: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Transform Admin API format to match Storefront API shape
    const product = {
      id: p.id,
      title: p.title,
      description: p.description,
      descriptionHtml: p.descriptionHtml,
      handle: p.handle,
      vendor: p.vendor,
      productType: p.productType,
      priceRange: {
        minVariantPrice: {
          amount: p.priceRangeV2?.minVariantPrice?.amount || "0",
          currencyCode: p.priceRangeV2?.minVariantPrice?.currencyCode || "USD",
        },
      },
      images: p.images,
      variants: {
        edges: p.variants?.edges?.map((v: any) => ({
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
      options: p.options || [],
    };

    return new Response(
      JSON.stringify({ product }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error("Error in fetch-shopify-product:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

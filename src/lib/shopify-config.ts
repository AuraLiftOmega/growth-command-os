// Shopify Store Configuration
export const SHOPIFY_STORE_PERMANENT_DOMAIN = 'lovable-project-7fb70.myshopify.com';
export const SHOPIFY_STOREFRONT_TOKEN = 'd9830af538b34d418e1167726cf1f67a';
export const SHOPIFY_API_VERSION = '2025-07';
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// Fallback images for products when Shopify image is missing (using Unsplash URLs)
export const PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  'radiance-vitamin-c-serum': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
  'hydra-glow-retinol-night-cream': 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800',
  'ultra-hydration-hyaluronic-serum': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800',
  'omega-glow-collagen-peptide-moisturizer': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
  'luxe-rose-quartz-face-roller-set': 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800',
};

// Default fallback for unknown products
const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800';

// Helper to get product image with fallback
export function getProductImage(handle: string, shopifyImageUrl?: string): string {
  // Return Shopify image if it exists and is a valid URL
  if (shopifyImageUrl && shopifyImageUrl.startsWith('http')) {
    return shopifyImageUrl;
  }
  // Return fallback based on product handle, or default
  return PRODUCT_IMAGE_FALLBACKS[handle] || DEFAULT_FALLBACK;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    vendor?: string;
    productType?: string;
    tags?: string[];
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
  };
}

// PURGED: No demo fallback - return empty if Shopify unavailable
export const DEMO_PRODUCTS: never[] = [];

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  try {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query, variables }),
    });

    if (response.status === 401) {
      console.error('Shopify 401: Token expired - NO DEMO FALLBACK');
      return { data: { products: { edges: [] } }, error: 'Token expired' };
    }

    if (response.status === 402) {
      console.error('Shopify 402: Payment required - NO DEMO FALLBACK');
      return { data: { products: { edges: [] } }, error: 'Payment required' };
    }

    if (!response.ok) {
      console.error(`Shopify HTTP error: ${response.status} - NO DEMO FALLBACK`);
      return { data: { products: { edges: [] } }, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('Shopify GraphQL errors:', data.errors);
      return { data: { products: { edges: [] } }, error: data.errors };
    }

    return data;
  } catch (error) {
    console.error('Shopify API request failed - NO DEMO FALLBACK:', error);
    return { data: { products: { edges: [] } }, error };
  }
}

export const PRODUCTS_QUERY = `
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

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      priceRange {
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
`;

export const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

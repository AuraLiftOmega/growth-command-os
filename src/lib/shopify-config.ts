/**
 * SHOPIFY STORE CONFIGURATION - DOMINION SaaS
 * 
 * FULLY DYNAMIC PER-USER CONFIGURATION
 * All store references are fetched from user_shopify_connections table
 * No hardcoded stores - each user connects their own store via OAuth
 */

// API version - shared across all user stores
export const SHOPIFY_API_VERSION = '2025-07';

// Video generation engine config (shared)
export const VIDEO_ENGINE = {
  provider: 'D-ID Pro',
  apiKey: 'DID_API_KEY',
  voice: 'ElevenLabs Sarah',
  avatars: ['amy', 'anna', 'emma'],
  defaultAvatar: 'amy',
};

// Fallback images for products when image is missing
export const PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  'vitamin-c-serum': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
  'retinol-cream': 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800',
  'hyaluronic-serum': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800',
  'collagen-moisturizer': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
  'face-roller': 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800',
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800';

// Helper to get product image with fallback
export function getProductImage(handle: string, shopifyImageUrl?: string): string {
  if (shopifyImageUrl && shopifyImageUrl.startsWith('http')) {
    return shopifyImageUrl;
  }
  
  // Try to match partial handle
  for (const [key, url] of Object.entries(PRODUCT_IMAGE_FALLBACKS)) {
    if (handle.toLowerCase().includes(key)) {
      return url;
    }
  }
  
  return DEFAULT_FALLBACK;
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

// No demo products - users must connect their own stores
export const DEMO_PRODUCTS: never[] = [];

/**
 * Dynamic Storefront API request - requires user's store credentials
 */
export async function storefrontApiRequest(
  storeDomain: string,
  storefrontToken: string,
  query: string, 
  variables: Record<string, unknown> = {}
) {
  const url = `https://${storeDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken
      },
      body: JSON.stringify({ query, variables }),
    });

    if (response.status === 401) {
      console.error('Shopify 401: Token expired');
      return { data: { products: { edges: [] } }, error: 'Token expired - reconnect store' };
    }

    if (response.status === 402) {
      console.error('Shopify 402: Payment required');
      return { data: { products: { edges: [] } }, error: 'Payment required - upgrade Shopify plan' };
    }

    if (!response.ok) {
      console.error(`Shopify HTTP error: ${response.status}`);
      return { data: { products: { edges: [] } }, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('Shopify GraphQL errors:', data.errors);
      return { data: { products: { edges: [] } }, error: data.errors };
    }

    return data;
  } catch (error) {
    console.error('Shopify API request failed:', error);
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

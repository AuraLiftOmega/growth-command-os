// Shopify Store Configuration
export const SHOPIFY_STORE_PERMANENT_DOMAIN = 'lovable-project-7fb70.myshopify.com';
export const SHOPIFY_STOREFRONT_TOKEN = 'd9830af538b34d418e1167726cf1f67a';
export const SHOPIFY_API_VERSION = '2025-07';
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
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

// Demo fallback products for when Shopify is unavailable
export const DEMO_PRODUCTS = [
  {
    node: {
      id: 'demo-1',
      title: 'Smart Fitness Watch Pro',
      description: 'Advanced fitness tracking with AI-powered insights',
      handle: 'smart-fitness-watch-pro',
      priceRange: { minVariantPrice: { amount: '299.99', currencyCode: 'USD' } },
      images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', altText: 'Smart Watch' } }] },
      variants: { edges: [{ node: { id: 'demo-v1', title: 'Default', price: { amount: '299.99', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] },
      options: []
    }
  },
  {
    node: {
      id: 'demo-2',
      title: 'Premium Wireless Headphones',
      description: 'Immersive sound with active noise cancellation',
      handle: 'premium-wireless-headphones',
      priceRange: { minVariantPrice: { amount: '199.99', currencyCode: 'USD' } },
      images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', altText: 'Headphones' } }] },
      variants: { edges: [{ node: { id: 'demo-v2', title: 'Default', price: { amount: '199.99', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] },
      options: []
    }
  },
  {
    node: {
      id: 'demo-3',
      title: 'Carbon Fiber Training Sneakers',
      description: 'Lightweight performance footwear for elite athletes',
      handle: 'carbon-fiber-training-sneakers',
      priceRange: { minVariantPrice: { amount: '249.99', currencyCode: 'USD' } },
      images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', altText: 'Sneakers' } }] },
      variants: { edges: [{ node: { id: 'demo-v3', title: 'Default', price: { amount: '249.99', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] },
      options: []
    }
  }
];

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
      console.warn('Shopify 401: Token may be expired. Using demo fallback.');
      return { data: { products: { edges: DEMO_PRODUCTS } }, usedFallback: true };
    }

    if (response.status === 402) {
      console.warn('Shopify 402: Payment required. Store needs billing plan.');
      return { data: { products: { edges: DEMO_PRODUCTS } }, usedFallback: true };
    }

    if (!response.ok) {
      console.error(`Shopify HTTP error: ${response.status}`);
      return { data: { products: { edges: DEMO_PRODUCTS } }, usedFallback: true };
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('Shopify GraphQL errors:', data.errors);
      return { data: { products: { edges: DEMO_PRODUCTS } }, usedFallback: true };
    }

    return data;
  } catch (error) {
    console.error('Shopify API request failed:', error);
    return { data: { products: { edges: DEMO_PRODUCTS } }, usedFallback: true };
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

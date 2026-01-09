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

// REAL PRODUCTS ONLY - No demo/fake fallbacks
// AuraLift Beauty is the ONLY authorized vendor
export const AURA_LIFT_PRODUCTS = [
  {
    node: {
      id: 'auralift-1',
      title: 'Radiance Vitamin C Serum',
      description: 'Brightening serum with 20% Vitamin C for radiant, even-toned skin',
      handle: 'radiance-vitamin-c-serum',
      priceRange: { minVariantPrice: { amount: '49.99', currencyCode: 'USD' } },
      images: { edges: [] },
      variants: { edges: [{ node: { id: 'al-v1', title: 'Default', price: { amount: '49.99', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] },
      options: [],
      vendor: 'AuraLift Beauty'
    }
  },
  {
    node: {
      id: 'auralift-2',
      title: 'Hydra-Glow Retinol Night Cream',
      description: 'Anti-aging night cream with retinol for youthful, glowing skin',
      handle: 'retinol-night-cream',
      priceRange: { minVariantPrice: { amount: '64.99', currencyCode: 'USD' } },
      images: { edges: [] },
      variants: { edges: [{ node: { id: 'al-v2', title: 'Default', price: { amount: '64.99', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] },
      options: [],
      vendor: 'AuraLift Beauty'
    }
  },
  {
    node: {
      id: 'auralift-3',
      title: 'Ultra Hydration Hyaluronic Serum',
      description: 'Deep hydration serum with hyaluronic acid for plump, moisturized skin',
      handle: 'hyaluronic-serum',
      priceRange: { minVariantPrice: { amount: '54.99', currencyCode: 'USD' } },
      images: { edges: [] },
      variants: { edges: [{ node: { id: 'al-v3', title: 'Default', price: { amount: '54.99', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] },
      options: [],
      vendor: 'AuraLift Beauty'
    }
  },
  {
    node: {
      id: 'auralift-4',
      title: 'Omega Glow Collagen Peptide Moisturizer',
      description: 'Collagen-boosting moisturizer for firmer, more youthful skin',
      handle: 'collagen-moisturizer',
      priceRange: { minVariantPrice: { amount: '74.99', currencyCode: 'USD' } },
      images: { edges: [] },
      variants: { edges: [{ node: { id: 'al-v4', title: 'Default', price: { amount: '74.99', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] },
      options: [],
      vendor: 'AuraLift Beauty'
    }
  },
  {
    node: {
      id: 'auralift-5',
      title: 'Luxe Rose Quartz Face Roller Set',
      description: 'Premium face roller set for lymphatic drainage and de-puffing',
      handle: 'rose-quartz-roller',
      priceRange: { minVariantPrice: { amount: '39.99', currencyCode: 'USD' } },
      images: { edges: [] },
      variants: { edges: [{ node: { id: 'al-v5', title: 'Default', price: { amount: '39.99', currencyCode: 'USD' }, availableForSale: true, selectedOptions: [] } }] },
      options: [],
      vendor: 'AuraLift Beauty'
    }
  }
];

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

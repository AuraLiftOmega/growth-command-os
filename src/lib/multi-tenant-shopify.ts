import { toast } from "sonner";
import type { UserStoreConnection } from "@/hooks/useUserStore";

export const SHOPIFY_API_VERSION = '2025-07';

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

// Create a Shopify client for a specific store
export function createShopifyClient(store: UserStoreConnection) {
  const storefrontUrl = `https://${store.store_domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
    const response = await fetch(storefrontUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': store.storefront_access_token
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (response.status === 402) {
      toast.error("Shopify: Payment required", {
        description: "This Shopify store requires an active billing plan.",
      });
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }

    return data;
  }

  const GET_PRODUCTS_QUERY = `
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

  const CART_CREATE_MUTATION = `
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
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      handle
                    }
                  }
                }
              }
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

  return {
    storeDomain: store.store_domain,
    storeName: store.store_name,

    async fetchProducts(first: number = 20, query?: string): Promise<ShopifyProduct[]> {
      try {
        const data = await storefrontApiRequest(GET_PRODUCTS_QUERY, { first, query });
        if (!data) return [];
        return data.data.products.edges || [];
      } catch (error) {
        console.error('Error fetching Shopify products:', error);
        return [];
      }
    },

    async createCheckout(items: Array<{ variantId: string; quantity: number }>): Promise<string> {
      try {
        const lines = items.map(item => ({
          quantity: item.quantity,
          merchandiseId: item.variantId,
        }));

        const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
          input: { lines },
        });

        if (!cartData) {
          throw new Error('Failed to create cart');
        }

        if (cartData.data.cartCreate.userErrors.length > 0) {
          throw new Error(`Cart creation failed: ${cartData.data.cartCreate.userErrors.map((e: { message: string }) => e.message).join(', ')}`);
        }

        const cart = cartData.data.cartCreate.cart;
        
        if (!cart.checkoutUrl) {
          throw new Error('No checkout URL returned from Shopify');
        }

        const url = new URL(cart.checkoutUrl);
        url.searchParams.set('channel', 'online_store');
        return url.toString();
      } catch (error) {
        console.error('Error creating storefront checkout:', error);
        throw error;
      }
    },

    getAdminUrl(): string {
      return `https://${store.store_domain}/admin`;
    },
  };
}

// Validate Shopify credentials by making a test request
export async function validateShopifyCredentials(
  storeDomain: string,
  storefrontAccessToken: string
): Promise<{ valid: boolean; error?: string; storeName?: string }> {
  const cleanDomain = storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const storefrontUrl = `https://${cleanDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const testQuery = `
    query {
      shop {
        name
        primaryDomain {
          host
        }
      }
    }
  `;

  try {
    const response = await fetch(storefrontUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query: testQuery }),
    });

    if (response.status === 401 || response.status === 403) {
      return { valid: false, error: "Invalid access token" };
    }

    if (response.status === 402) {
      return { valid: false, error: "Store requires active Shopify billing plan" };
    }

    if (!response.ok) {
      return { valid: false, error: `Connection failed (${response.status})` };
    }

    const data = await response.json();
    
    if (data.errors) {
      return { valid: false, error: data.errors[0]?.message || "API error" };
    }

    return { 
      valid: true, 
      storeName: data.data.shop.name 
    };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : "Connection failed" 
    };
  }
}

/**
 * PLATFORM STORE CONFIG
 * This is the primary Shopify store connected to this Lovable project
 * Used for public storefront pages that don't require user authentication
 */

export const PLATFORM_STORE = {
  domain: 'lovable-project-7fb70.myshopify.com',
  storefrontToken: 'd9830af538b34d418e1167726cf1f67a',
  name: 'Aura Lift Essentials',
  apiVersion: '2025-07',
} as const;

export const PLATFORM_STOREFRONT_URL = `https://${PLATFORM_STORE.domain}/api/${PLATFORM_STORE.apiVersion}/graphql.json`;

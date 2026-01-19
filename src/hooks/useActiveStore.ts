import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export type StoreRole = 'platform' | 'personal' | 'customer';

export interface ActiveStoreConfig {
  storeDomain: string;
  storefrontToken: string;
  storeName: string;
  role: StoreRole;
  storeId?: string;
  fullUrl: string;
}

interface ActiveStoreState {
  activeStoreId: string | null;
  setActiveStoreId: (id: string | null) => void;
}

export const useActiveStoreState = create<ActiveStoreState>()(
  persist(
    (set) => ({
      activeStoreId: null,
      setActiveStoreId: (id) => set({ activeStoreId: id }),
    }),
    { name: 'active-store' }
  )
);

// Helper to build public URL from store domain
// Converts xxx.myshopify.com to https://www.xxx.com or uses custom domain if available
function buildStoreUrl(storeDomain: string, storeName?: string): string {
  // Extract store handle from myshopify domain
  const handle = storeDomain.replace('.myshopify.com', '').toLowerCase();
  
  // For Lovable-managed stores, use the myshopify.com domain directly
  if (handle.startsWith('lovable-project-')) {
    return `https://${storeDomain}`;
  }
  
  // Default: use the myshopify domain as public URL
  return `https://${storeDomain}`;
}

export function useActiveStore() {
  const { stores, primaryStore } = useUserStore();
  const { activeStoreId, setActiveStoreId } = useActiveStoreState();

  // No platform store - users connect their own
  const getActiveStore = (): ActiveStoreConfig | null => {
    if (!activeStoreId && !primaryStore) {
      return null;
    }
    
    if (!activeStoreId && primaryStore) {
      return {
        storeDomain: primaryStore.store_domain,
        storefrontToken: primaryStore.storefront_access_token,
        storeName: primaryStore.store_name,
        role: 'personal',
        storeId: primaryStore.id,
        fullUrl: buildStoreUrl(primaryStore.store_domain, primaryStore.store_name),
      };
    }

    const selectedStore = stores.find(s => s.id === activeStoreId);
    if (!selectedStore) {
      // Return primary store or null
      if (primaryStore) {
        return {
          storeDomain: primaryStore.store_domain,
          storefrontToken: primaryStore.storefront_access_token,
          storeName: primaryStore.store_name,
          role: 'personal',
          storeId: primaryStore.id,
          fullUrl: buildStoreUrl(primaryStore.store_domain, primaryStore.store_name),
        };
      }
      return null;
    }

    return {
      storeDomain: selectedStore.store_domain,
      storefrontToken: selectedStore.storefront_access_token,
      storeName: selectedStore.store_name,
      role: selectedStore.is_primary ? 'personal' : 'customer',
      storeId: selectedStore.id,
      fullUrl: buildStoreUrl(selectedStore.store_domain, selectedStore.store_name),
    };
  };

  // Separate stores by role
  const userStores: ActiveStoreConfig[] = stores.map(s => ({
    storeDomain: s.store_domain,
    storefrontToken: s.storefront_access_token,
    storeName: s.store_name,
    role: (s.is_primary ? 'personal' : 'customer') as StoreRole,
    storeId: s.id,
    fullUrl: buildStoreUrl(s.store_domain, s.store_name),
  }));

  // All available stores (user connected only)
  const allStores: ActiveStoreConfig[] = [...userStores];

  return {
    activeStore: getActiveStore(),
    userStores,
    allStores,
    setActiveStoreId,
    activeStoreId,
    hasConnectedStores: stores.length > 0,
  };
}

// Helper to make API request with any store config
export async function storefrontApiRequestWithStore(
  store: ActiveStoreConfig,
  query: string,
  variables: Record<string, unknown> = {}
) {
  const url = `https://${store.storeDomain}/api/2025-07/graphql.json`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': store.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

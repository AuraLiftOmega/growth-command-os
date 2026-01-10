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
      };
    }

    const selectedStore = stores.find(s => s.id === activeStoreId);
    if (!selectedStore) {
      return platformStore;
    }

    return {
      storeDomain: selectedStore.store_domain,
      storefrontToken: selectedStore.storefront_access_token,
      storeName: selectedStore.store_name,
      role: selectedStore.is_primary ? 'personal' : 'customer',
      storeId: selectedStore.id,
    };
  };

  // Separate stores by role
  const userStores = stores.map(s => ({
    storeDomain: s.store_domain,
    storefrontToken: s.storefront_access_token,
    storeName: s.store_name,
    role: (s.is_primary ? 'personal' : 'customer') as StoreRole,
    storeId: s.id,
  }));

  // All available stores
  const allStores: ActiveStoreConfig[] = [platformStore, ...userStores];

  return {
    activeStore: getActiveStore(),
    platformStore,
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

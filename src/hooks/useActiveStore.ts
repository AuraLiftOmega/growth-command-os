import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';
import { 
  SHOPIFY_STORE_PERMANENT_DOMAIN, 
  SHOPIFY_STOREFRONT_TOKEN 
} from '@/lib/shopify-config';

export type StoreRole = 'platform' | 'personal' | 'customer';

export interface ActiveStoreConfig {
  storeDomain: string;
  storefrontToken: string;
  storeName: string;
  role: StoreRole;
  storeId?: string;
}

interface ActiveStoreState {
  activeStoreId: string | null; // null = use platform store
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

  // Platform store config (for selling DOMINION software)
  const platformStore: ActiveStoreConfig = {
    storeDomain: SHOPIFY_STORE_PERMANENT_DOMAIN,
    storefrontToken: SHOPIFY_STOREFRONT_TOKEN,
    storeName: 'DOMINION Platform',
    role: 'platform',
  };

  // Get active store config
  const getActiveStore = (): ActiveStoreConfig => {
    if (!activeStoreId) {
      return platformStore;
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

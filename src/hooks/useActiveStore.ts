import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';
import { 
  SHOPIFY_STORE_PERMANENT_DOMAIN, 
  SHOPIFY_STOREFRONT_TOKEN 
} from '@/lib/shopify-config';

export interface ActiveStoreConfig {
  storeDomain: string;
  storefrontToken: string;
  storeName: string;
  isDefault: boolean;
  storeId?: string;
}

interface ActiveStoreState {
  activeStoreId: string | null; // null = use default Lovable store
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

  // Default Lovable store config
  const defaultStore: ActiveStoreConfig = {
    storeDomain: SHOPIFY_STORE_PERMANENT_DOMAIN,
    storefrontToken: SHOPIFY_STOREFRONT_TOKEN,
    storeName: 'Lovable Store (Default)',
    isDefault: true,
  };

  // Get active store config
  const getActiveStore = (): ActiveStoreConfig => {
    if (!activeStoreId) {
      return defaultStore;
    }

    const selectedStore = stores.find(s => s.id === activeStoreId);
    if (!selectedStore) {
      return defaultStore;
    }

    return {
      storeDomain: selectedStore.store_domain,
      storefrontToken: selectedStore.storefront_access_token,
      storeName: selectedStore.store_name,
      isDefault: false,
      storeId: selectedStore.id,
    };
  };

  // All available stores (default + user stores)
  const allStores: ActiveStoreConfig[] = [
    defaultStore,
    ...stores.map(s => ({
      storeDomain: s.store_domain,
      storefrontToken: s.storefront_access_token,
      storeName: s.store_name,
      isDefault: false,
      storeId: s.id,
    })),
  ];

  return {
    activeStore: getActiveStore(),
    allStores,
    setActiveStoreId,
    activeStoreId,
    hasMultipleStores: stores.length > 0,
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

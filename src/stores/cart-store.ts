import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, createShopifyClient, SHOPIFY_API_VERSION } from '@/lib/multi-tenant-shopify';
import { toast } from 'sonner';

export interface CartItem {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantity: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  // Multi-tenant store info
  storeDomain: string;
  storefrontToken: string;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isOpen: boolean;
  
  // Actions
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  setCartId: (cartId: string) => void;
  setCheckoutUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  setOpen: (open: boolean) => void;
  createCheckout: () => Promise<string | null>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Create checkout using the store credentials from the cart items
async function createMultiTenantCheckout(items: CartItem[]): Promise<string> {
  if (items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Get store credentials from first item (all items should be from same store)
  const { storeDomain, storefrontToken } = items[0];

  // Create a pseudo store connection for the client
  const storeConnection = {
    id: 'cart-checkout',
    user_id: '',
    store_name: 'Checkout',
    store_domain: storeDomain,
    storefront_access_token: storefrontToken,
    admin_access_token: null,
    is_active: true,
    is_primary: false,
    last_synced_at: null,
    products_count: 0,
    orders_count: 0,
    total_revenue: 0,
    connected_at: '',
    updated_at: '',
  };

  const client = createShopifyClient(storeConnection);
  
  const cartItems = items.map(item => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));

  return await client.createCheckout(cartItems);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isOpen: false,

      addItem: (item) => {
        const { items } = get();
        
        // Check if item is from a different store
        if (items.length > 0 && items[0].storeDomain !== item.storeDomain) {
          toast.error("Can't add items from different stores", {
            description: "Please checkout or clear your cart first",
          });
          return;
        }
        
        const existingItem = items.find(i => i.variantId === item.variantId);
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          });
        } else {
          set({ items: [...items, item] });
        }
        set({ isOpen: true });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.variantId === variantId ? { ...item, quantity } : item
          )
        });
      },

      removeItem: (variantId) => {
        set({
          items: get().items.filter(item => item.variantId !== variantId)
        });
      },

      clearCart: () => {
        set({ items: [], cartId: null, checkoutUrl: null });
      },

      setCartId: (cartId) => set({ cartId }),
      setCheckoutUrl: (checkoutUrl) => set({ checkoutUrl }),
      setLoading: (isLoading) => set({ isLoading }),
      setOpen: (isOpen) => set({ isOpen }),

      createCheckout: async () => {
        const { items, setLoading, setCheckoutUrl } = get();
        if (items.length === 0) return null;

        setLoading(true);
        try {
          const checkoutUrl = await createMultiTenantCheckout(items);
          setCheckoutUrl(checkoutUrl);
          return checkoutUrl;
        } catch (error) {
          console.error('Failed to create checkout:', error);
          toast.error("Checkout failed", {
            description: error instanceof Error ? error.message : "Please try again",
          });
          return null;
        } finally {
          setLoading(false);
        }
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
      }
    }),
    {
      name: 'shopify-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

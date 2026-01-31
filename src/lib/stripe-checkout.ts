/**
 * Stripe Product Checkout
 * 
 * Handles checkout for storefront products via Stripe
 * Ensures 60% profit margin is maintained
 */

import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/stores/cart-store";

export interface StripeCheckoutItem {
  productTitle: string;
  productHandle: string;
  variantId: string;
  variantTitle: string;
  price: number; // Price in cents
  quantity: number;
  imageUrl?: string;
}

export interface StripeCheckoutResult {
  sessionId: string;
  url: string;
  isLive: boolean;
}

/**
 * Convert cart items to Stripe checkout format
 */
export function cartItemsToStripeItems(items: CartItem[]): StripeCheckoutItem[] {
  return items.map(item => ({
    productTitle: item.product.node.title,
    productHandle: item.product.node.handle,
    variantId: item.variantId,
    variantTitle: item.variantTitle,
    price: Math.round(parseFloat(item.price.amount) * 100), // Convert to cents
    quantity: item.quantity,
    imageUrl: item.product.node.images.edges[0]?.node?.url,
  }));
}

/**
 * Create a Stripe checkout session for cart items
 */
export async function createStripeProductCheckout(
  items: CartItem[],
  customerEmail?: string
): Promise<StripeCheckoutResult> {
  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  const stripeItems = cartItemsToStripeItems(items);
  const origin = window.location.origin;

  const { data, error } = await supabase.functions.invoke("product-checkout", {
    body: {
      items: stripeItems,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/checkout/cancel`,
      customerEmail,
    },
  });

  if (error) {
    console.error("Stripe checkout error:", error);
    throw new Error(error.message || "Failed to create checkout");
  }

  if (!data?.url) {
    throw new Error("No checkout URL received");
  }

  return {
    sessionId: data.sessionId,
    url: data.url,
    isLive: data.isLive,
  };
}

/**
 * Redirect to Stripe checkout
 */
export async function redirectToStripeCheckout(
  items: CartItem[],
  customerEmail?: string
): Promise<void> {
  const { url } = await createStripeProductCheckout(items, customerEmail);
  
  // Open in same tab for better UX
  window.location.href = url;
}

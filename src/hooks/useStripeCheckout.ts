import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type StripePlan = "starter" | "growth" | "enterprise";
export type BillingCycle = "monthly" | "annual";

interface CheckoutResult {
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}

export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = useCallback(async (
    plan: StripePlan,
    billingCycle: BillingCycle = "monthly"
  ): Promise<CheckoutResult> => {
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        toast.error("Please sign in to subscribe");
        return { success: false, error: "Not authenticated" };
      }

      const response = await supabase.functions.invoke("stripe-checkout", {
        body: {
          plan,
          billingCycle,
          successUrl: `${window.location.origin}/pricing?success=true&plan=${plan}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { url, sessionId } = response.data;

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
        return { success: true, url, sessionId };
      }

      return { success: false, error: "No checkout URL returned" };
    } catch (error) {
      console.error("Checkout error:", error);
      const message = error instanceof Error ? error.message : "Checkout failed";
      toast.error("Checkout error", { description: message });
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createCheckoutSession,
    isLoading,
  };
}

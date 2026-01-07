import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const ADMIN_EMAIL = "ryanauralift@gmail.com";

export interface Subscription {
  id: string;
  user_id: string;
  plan: "free" | "starter" | "growth" | "enterprise";
  status: "active" | "past_due" | "canceled" | "trialing";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stores_limit: number;
  monthly_video_credits: number;
  monthly_ai_credits: number;
  stores_used: number;
  videos_used_this_month: number;
  ai_credits_used_this_month: number;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export const PLAN_FEATURES = {
  free: {
    name: "Free",
    price: 0,
    stores: 1,
    videoCredits: 10,
    aiCredits: 100,
    features: ["1 Shopify store", "10 AI videos/month", "Basic analytics", "Email support"],
  },
  starter: {
    name: "Starter",
    price: 49,
    stores: 3,
    videoCredits: 50,
    aiCredits: 500,
    features: ["3 Shopify stores", "50 AI videos/month", "Advanced analytics", "Priority support", "Comment automation"],
  },
  growth: {
    name: "Growth",
    price: 149,
    stores: 10,
    videoCredits: 200,
    aiCredits: 2000,
    features: ["10 Shopify stores", "200 AI videos/month", "Full analytics suite", "Dedicated support", "All automations", "Custom branding"],
  },
  enterprise: {
    name: "Enterprise",
    price: 499,
    stores: -1, // Unlimited
    videoCredits: -1,
    aiCredits: -1,
    features: ["Unlimited stores", "Unlimited AI videos", "White-label option", "API access", "Custom integrations", "SLA guarantee"],
  },
};

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    // Check if user is admin
    const userIsAdmin = user.email === ADMIN_EMAIL;
    setIsAdmin(userIsAdmin);

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        // No subscription found, might be a new user before trigger ran
        if (fetchError.code === "PGRST116") {
          // Create one manually
          const { data: newSub, error: createError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: user.id,
              plan: "free",
              status: "trialing",
              trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single();

          if (createError) throw createError;
          setSubscription(newSub as Subscription);
          return;
        }
        throw fetchError;
      }

      setSubscription(data as Subscription);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch subscription");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isTrialing = subscription?.status === "trialing";
  const trialDaysLeft = subscription?.trial_ends_at 
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Admin always bypasses limits
  const canAddStore = isAdmin || (subscription 
    ? subscription.stores_limit === -1 || subscription.stores_used < subscription.stores_limit
    : false);

  const canGenerateVideo = isAdmin || (subscription
    ? subscription.monthly_video_credits === -1 || subscription.videos_used_this_month < subscription.monthly_video_credits
    : false);

  const planFeatures = subscription ? PLAN_FEATURES[subscription.plan] : PLAN_FEATURES.free;

  return {
    subscription,
    isLoading,
    error,
    isTrialing,
    trialDaysLeft,
    canAddStore,
    canGenerateVideo,
    planFeatures,
    isAdmin,
    refetch: fetchSubscription,
  };
}

/**
 * Canonical Stripe Configuration
 * 
 * ALL Stripe operations MUST use this centralized configuration.
 * This ensures all payments, webhooks, and Connect operations
 * route through the single canonical platform account.
 */

import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

// =============================================================================
// CANONICAL STRIPE PLATFORM CONFIGURATION
// =============================================================================

export interface StripeConfig {
  secretKey: string;
  isLive: boolean;
  platformAccountId: string | null;
  webhookSecret: string | null;
}

/**
 * Get the canonical Stripe configuration.
 * Prioritizes live keys and validates against the platform account.
 * Fails loudly if configuration is invalid.
 */
export function getStripeConfig(): StripeConfig | null {
  const liveKey = Deno.env.get("STRIPE_LIVE_SECRET_KEY");
  const fallbackKey = Deno.env.get("STRIPE_SECRET_KEY");
  const platformAccountId = Deno.env.get("STRIPE_PLATFORM_ACCOUNT_ID");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  // Prioritize live key
  let secretKey: string | undefined;
  let isLive = false;

  if (liveKey?.startsWith("sk_live_")) {
    secretKey = liveKey;
    isLive = true;
  } else if (fallbackKey?.startsWith("sk_live_")) {
    secretKey = fallbackKey;
    isLive = true;
  } else if (fallbackKey?.startsWith("sk_test_")) {
    secretKey = fallbackKey;
    isLive = false;
  } else if (liveKey) {
    secretKey = liveKey;
    isLive = liveKey.startsWith("sk_live_");
  }

  if (!secretKey) {
    return null;
  }

  return {
    secretKey,
    isLive,
    platformAccountId: platformAccountId || null,
    webhookSecret: webhookSecret || null,
  };
}

/**
 * Create a Stripe instance using canonical configuration.
 * Returns null if Stripe is not configured.
 */
export function createStripeClient(): { stripe: Stripe; config: StripeConfig } | null {
  const config = getStripeConfig();
  
  if (!config) {
    console.error("❌ [stripe-config] No Stripe secret key configured");
    return null;
  }

  const stripe = new Stripe(config.secretKey, {
    apiVersion: "2023-10-16",
  });

  console.log(`🔐 [stripe-config] Initialized — ${config.isLive ? "💰 LIVE MODE" : "⚠️ TEST MODE"}`);
  
  if (config.platformAccountId) {
    console.log(`🏢 [stripe-config] Platform Account: ${config.platformAccountId}`);
  }

  return { stripe, config };
}

/**
 * Validate that the Stripe account matches the canonical platform account.
 * Call this on startup for critical payment operations.
 */
export async function validateCanonicalAccount(stripe: Stripe, config: StripeConfig): Promise<boolean> {
  if (!config.platformAccountId) {
    console.warn("⚠️ [stripe-config] No STRIPE_PLATFORM_ACCOUNT_ID configured — skipping validation");
    return true;
  }

  try {
    const account = await stripe.accounts.retrieve();
    
    if (account.id !== config.platformAccountId) {
      console.error(`🚨 [stripe-config] ACCOUNT MISMATCH DETECTED!`);
      console.error(`   Expected: ${config.platformAccountId}`);
      console.error(`   Actual: ${account.id}`);
      console.error(`   This is a critical security violation. All Stripe operations should use the canonical account.`);
      return false;
    }

    console.log(`✅ [stripe-config] Account validated: ${account.id}`);
    return true;
  } catch (error) {
    console.error("❌ [stripe-config] Failed to validate account:", error);
    return false;
  }
}

// =============================================================================
// PLAN CONFIGURATIONS (Single Source of Truth)
// =============================================================================

export const STRIPE_PLANS = {
  starter: {
    name: "Starter",
    monthlyPrice: 4900,
    annualPrice: 47000,
    features: {
      stores_limit: 3,
      monthly_video_credits: 50,
      monthly_ai_credits: 500,
    },
  },
  growth: {
    name: "Growth",
    monthlyPrice: 9900,
    annualPrice: 95000,
    features: {
      stores_limit: 10,
      monthly_video_credits: 200,
      monthly_ai_credits: 2000,
    },
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: 29900,
    annualPrice: 287000,
    features: {
      stores_limit: -1,
      monthly_video_credits: -1,
      monthly_ai_credits: -1,
    },
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;

export const PLAN_FEATURES = {
  starter: STRIPE_PLANS.starter.features,
  growth: STRIPE_PLANS.growth.features,
  enterprise: STRIPE_PLANS.enterprise.features,
} as const;

// =============================================================================
// CORS HEADERS
// =============================================================================

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function handleCorsPreflightRequest(): Response {
  return new Response(null, { headers: corsHeaders });
}

export function createErrorResponse(error: string, status = 500): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function createSuccessResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Canonical Stripe Configuration
 * 
 * ALL Stripe operations MUST use this centralized configuration.
 * This ensures all payments, webhooks, and Connect operations
 * route through the single canonical platform account.
 * 
 * SECURITY: Zero leakage architecture - all payments flow to ONE confirmed account
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

export interface StripeValidationResult {
  valid: boolean;
  status: 'pass' | 'fail' | 'warn';
  accountId: string | null;
  expectedAccountId: string | null;
  isLive: boolean;
  error?: string;
}

/**
 * Get the canonical Stripe configuration.
 * Prioritizes live keys and validates against the platform account.
 * Fails loudly if configuration is invalid.
 */
export function getStripeConfig(): StripeConfig | null {
  // Try keys in order of preference:
  // 1. STRIPE_LIVE_SECRET_KEY (full live secret key)
  // 2. STRIPE_SECRET_KEY (general secret key)
  // 3. STRIPE_CANONICAL_SECRET_KEY (may be restricted)
  const liveSecretKey = Deno.env.get("STRIPE_LIVE_SECRET_KEY");
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const canonicalKey = Deno.env.get("STRIPE_CANONICAL_SECRET_KEY");
  
  const platformAccountId = Deno.env.get("STRIPE_PLATFORM_ACCOUNT_ID");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  // Use the first available key (prioritize live secret key for checkouts)
  const activeKey = liveSecretKey || secretKey || canonicalKey;
  
  if (!activeKey) {
    console.error("❌ [stripe-config] No Stripe secret key configured");
    return null;
  }

  const isLive = activeKey.startsWith("sk_live_") || activeKey.startsWith("rk_live_");
  const keyType = liveSecretKey ? "LIVE_SECRET" : (secretKey ? "SECRET" : "CANONICAL");

  console.log(`🔐 [stripe-config] Using ${keyType} Stripe key — ${isLive ? "💰 LIVE" : "⚠️ TEST"}`);

  return {
    secretKey: activeKey,
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

/**
 * Boot-time validation for critical payment operations.
 * Call this at the start of any edge function that handles money.
 * 
 * @param functionName - The name of the calling function for logging
 * @param strict - If true, throws an error on validation failure
 */
export async function validateStripeOnBoot(
  functionName: string,
  strict: boolean = true
): Promise<StripeValidationResult> {
  console.log(`🔒 [${functionName}] Running boot-time Stripe validation...`);

  const stripeClient = createStripeClient();
  
  if (!stripeClient) {
    const result: StripeValidationResult = {
      valid: false,
      status: 'fail',
      accountId: null,
      expectedAccountId: null,
      isLive: false,
      error: 'Stripe not configured',
    };
    
    if (strict) {
      throw new Error(`[${functionName}] Boot validation failed: Stripe not configured`);
    }
    
    return result;
  }

  const { stripe, config } = stripeClient;

  try {
    const account = await stripe.accounts.retrieve();
    const expectedAccountId = config.platformAccountId;
    
    // Check for account mismatch
    if (expectedAccountId && account.id !== expectedAccountId) {
      const result: StripeValidationResult = {
        valid: false,
        status: 'fail',
        accountId: account.id,
        expectedAccountId,
        isLive: config.isLive,
        error: `Account mismatch: expected ${expectedAccountId}, got ${account.id}`,
      };

      console.error(`🚨 [${functionName}] CRITICAL: Stripe account mismatch!`);
      console.error(`   Expected: ${expectedAccountId}`);
      console.error(`   Actual: ${account.id}`);
      console.error(`   This is a security violation - payments may be going to wrong account!`);

      if (strict) {
        throw new Error(`[${functionName}] Stripe account mismatch detected`);
      }

      return result;
    }

    // Validate account is live if in live mode
    if (config.isLive && !account.charges_enabled) {
      console.warn(`⚠️ [${functionName}] Live mode but charges not enabled on account`);
    }

    const result: StripeValidationResult = {
      valid: true,
      status: 'pass',
      accountId: account.id,
      expectedAccountId: expectedAccountId || account.id,
      isLive: config.isLive,
    };

    console.log(`✅ [${functionName}] Boot validation passed — Account: ${account.id} (${config.isLive ? 'LIVE' : 'TEST'})`);
    
    return result;

  } catch (error) {
    if (error instanceof Error && error.message.includes('mismatch')) {
      throw error; // Re-throw mismatch errors in strict mode
    }

    const result: StripeValidationResult = {
      valid: false,
      status: 'warn',
      accountId: null,
      expectedAccountId: config.platformAccountId,
      isLive: config.isLive,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    console.error(`❌ [${functionName}] Boot validation error:`, error);

    if (strict) {
      throw new Error(`[${functionName}] Boot validation failed: ${result.error}`);
    }

    return result;
  }
}

/**
 * Runtime guard to check if a request is going to the correct Stripe account.
 * Call this before processing any payment to ensure money goes to the right place.
 */
export async function assertCanonicalAccount(stripe: Stripe, functionName: string): Promise<void> {
  const expectedAccountId = Deno.env.get("STRIPE_PLATFORM_ACCOUNT_ID");
  
  if (!expectedAccountId) {
    console.warn(`⚠️ [${functionName}] No STRIPE_PLATFORM_ACCOUNT_ID set — cannot verify destination`);
    return;
  }

  try {
    const account = await stripe.accounts.retrieve();
    
    if (account.id !== expectedAccountId) {
      const errorMsg = `🚨 CRITICAL: Payment attempted on wrong Stripe account! Expected ${expectedAccountId}, got ${account.id}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log(`✅ [${functionName}] Canonical account verified: ${account.id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('CRITICAL')) {
      throw error;
    }
    console.error(`❌ [${functionName}] Failed to verify canonical account:`, error);
    throw new Error(`Cannot verify Stripe account — refusing to process payment`);
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

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

export interface EnvironmentValidation {
  isValid: boolean;
  mode: 'live' | 'test' | 'unconfigured';
  warnings: string[];
  errors: string[];
}

/**
 * Validate environment configuration for Stripe.
 * Call this during deployment/startup to catch configuration issues.
 */
export function validateEnvironment(): EnvironmentValidation {
  const warnings: string[] = [];
  const errors: string[] = [];

  const canonicalKey = Deno.env.get("STRIPE_CANONICAL_SECRET_KEY");
  const platformAccountId = Deno.env.get("STRIPE_PLATFORM_ACCOUNT_ID");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  // Check for canonical key
  if (!canonicalKey) {
    errors.push("STRIPE_CANONICAL_SECRET_KEY not configured — all payments blocked");
  }

  // Check for platform account ID
  if (!platformAccountId) {
    warnings.push("STRIPE_PLATFORM_ACCOUNT_ID not set — account validation disabled");
  }

  // Check for webhook secret
  if (!webhookSecret) {
    warnings.push("STRIPE_WEBHOOK_SECRET not set — webhooks will not be verified");
  }

  const isLive = canonicalKey?.startsWith("sk_live_") || false;
  const mode: 'live' | 'test' | 'unconfigured' = 
    !canonicalKey ? 'unconfigured' :
    isLive ? 'live' : 'test';

  return {
    isValid: errors.length === 0,
    mode,
    warnings,
    errors,
  };
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import {
  createStripeClient,
  validateCanonicalAccount,
  STRIPE_PLANS,
  corsHeaders,
  handleCorsPreflightRequest,
  createErrorResponse,
  createSuccessResponse,
} from "../_shared/stripe-config.ts";

/**
 * Billing Checkout API
 * 
 * Endpoints:
 * - POST /session (default) - Create Checkout Session for subscription or one-time
 * - POST /payment-intent - Create PaymentIntent for embedded Elements flow
 * - POST /verify-session - Verify session status after redirect
 * - GET /products - List available products/prices
 */

serve(async (req) => {
  console.log("🚀 [billing-checkout] Function invoked at", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    const stripeClient = createStripeClient();
    
    if (!stripeClient) {
      return createErrorResponse("Stripe not configured", 500);
    }

    const { stripe, config } = stripeClient;

    // Validate canonical account
    const isValid = await validateCanonicalAccount(stripe, config);
    if (!isValid && config.platformAccountId) {
      console.error("🚨 [billing-checkout] Canonical account mismatch!");
      return createErrorResponse("Stripe account configuration error", 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action = "session" } = body;

    // ========================================
    // ACTION: Get available products
    // ========================================
    if (action === "products") {
      const products = Object.entries(STRIPE_PLANS).map(([key, plan]) => ({
        id: key,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        features: plan.features,
      }));

      return createSuccessResponse({ products, isLive: config.isLive });
    }

    // ========================================
    // Authenticate user for payment actions
    // ========================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createErrorResponse("Authorization required", 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createErrorResponse("Unauthorized", 401);
    }

    // ========================================
    // ACTION: Verify checkout session
    // ========================================
    if (action === "verify-session") {
      const { sessionId } = body;
      
      if (!sessionId) {
        return createErrorResponse("Session ID required", 400);
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      return createSuccessResponse({
        status: session.status,
        paymentStatus: session.payment_status,
        customerId: session.customer,
        subscriptionId: session.subscription,
        amountTotal: session.amount_total,
        currency: session.currency,
        isLive: config.isLive,
      });
    }

    // ========================================
    // ACTION: Create PaymentIntent (for Elements)
    // ========================================
    if (action === "payment-intent") {
      const { amount, productName, description, metadata } = body;

      if (!amount || amount < 100) {
        return createErrorResponse("Invalid amount (minimum 100 cents)", 400);
      }

      // Get or create billing customer
      const customerId = await getOrCreateCustomer(supabase, stripe, user, config.isLive);

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        customer: customerId,
        automatic_payment_methods: { enabled: true },
        description: productName || description,
        metadata: {
          supabase_user_id: user.id,
          product_name: productName,
          type: "one_time",
          ...metadata,
        },
      });

      // Record payment intent
      await supabase.from("billing_payments").insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        type: "payment_intent",
        status: "pending",
        amount,
        currency: "usd",
        description: productName,
        livemode: config.isLive,
      });

      return createSuccessResponse({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        isLive: config.isLive,
      });
    }

    // ========================================
    // DEFAULT ACTION: Create Checkout Session
    // ========================================
    const { type = "subscription", planOrSku, billingCycle = "monthly", successUrl, cancelUrl, quantity = 1 } = body;

    // Get base URL from env or request origin
    const appBaseUrl = Deno.env.get("APP_BASE_URL") || req.headers.get("origin") || "https://omegaalpha.io";

    // Build success/cancel URLs
    const finalSuccessUrl = successUrl || `${appBaseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${appBaseUrl}/billing/cancel`;

    // Get or create customer
    const customerId = await getOrCreateCustomer(supabase, stripe, user, config.isLive);

    if (type === "one_time") {
      // One-time payment checkout
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: planOrSku || "One-time purchase",
            },
            unit_amount: body.amount || 1000,
          },
          quantity,
        }],
        mode: "payment",
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
        metadata: {
          supabase_user_id: user.id,
          type: "one_time",
          product: planOrSku,
        },
      });

      console.log(`💳 [billing-checkout] One-time session created: ${session.id}`);

      return createSuccessResponse({
        sessionId: session.id,
        url: session.url,
        isLive: config.isLive,
      });
    }

    // Subscription checkout
    const plan = planOrSku as keyof typeof STRIPE_PLANS;
    if (!plan || !STRIPE_PLANS[plan]) {
      return createErrorResponse(`Invalid plan: ${plan}`, 400);
    }

    const planConfig = STRIPE_PLANS[plan];
    const isAnnual = billingCycle === "annual";
    const priceAmount = isAnnual ? planConfig.annualPrice : planConfig.monthlyPrice;
    const interval = isAnnual ? "year" : "month";

    // Create or get product
    const productName = `Omega ${planConfig.name}`;
    const products = await stripe.products.search({ query: `name:'${productName}'` });

    let productId: string;
    if (products.data.length > 0) {
      productId = products.data[0].id;
    } else {
      const product = await stripe.products.create({
        name: productName,
        metadata: { plan_key: plan, ...planConfig.features },
      });
      productId = product.id;
    }

    // Create price
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: priceAmount,
      currency: "usd",
      recurring: { interval },
      metadata: { plan_key: plan, billing_cycle: billingCycle },
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "subscription",
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
          billing_cycle: billingCycle,
        },
        trial_period_days: 14,
      },
      metadata: {
        supabase_user_id: user.id,
        plan,
        type: "subscription",
      },
      allow_promotion_codes: true,
    });

    console.log(`💳 [billing-checkout] Subscription session created: ${session.id} — ${config.isLive ? "LIVE" : "TEST"}`);

    return createSuccessResponse({
      sessionId: session.id,
      url: session.url,
      customerId,
      isLive: config.isLive,
    });

  } catch (error: unknown) {
    console.error("❌ [billing-checkout] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(message, 500);
  }
});

async function getOrCreateCustomer(
  supabase: any,
  stripe: Stripe,
  user: { id: string; email?: string },
  isLive: boolean
): Promise<string> {
  // Check billing_customers table first
  const { data: billingCustomer } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (billingCustomer?.stripe_customer_id) {
    return billingCustomer.stripe_customer_id;
  }

  // Check legacy subscriptions table
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (subscription?.stripe_customer_id) {
    // Migrate to billing_customers
    await supabase.from("billing_customers").upsert({
      user_id: user.id,
      stripe_customer_id: subscription.stripe_customer_id,
      email: user.email,
    }, { onConflict: "user_id" });
    
    return subscription.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      supabase_user_id: user.id,
      environment: isLive ? "LIVE" : "TEST",
    },
  });

  // Store in billing_customers
  await supabase.from("billing_customers").upsert({
    user_id: user.id,
    stripe_customer_id: customer.id,
    email: user.email,
  }, { onConflict: "user_id" });

  console.log(`👤 [billing-checkout] Created customer: ${customer.id}`);

  return customer.id;
}

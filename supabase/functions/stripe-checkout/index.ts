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
} from "../_shared/stripe-config.ts";

serve(async (req) => {
  console.log("🚀 [stripe-checkout] Function invoked at", new Date().toISOString());
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    // Use canonical Stripe configuration
    const stripeClient = createStripeClient();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    console.log("🔐 [stripe-checkout] Key status:", {
      hasKey: !!stripeClient,
      isLive: stripeClient?.config.isLive,
      platformAccount: stripeClient?.config.platformAccountId || "not set",
      hasWebhookSecret: !!webhookSecret,
    });

    const body = await req.json();
    
    // Handle verify-live-mode action
    if (body.action === "verify-live-mode") {
      let verified = false;
      let verificationError: string | null = null;
      let accountId: string | null = null;
      
      if (stripeClient?.config.isLive) {
        try {
          const account = await stripeClient.stripe.accounts.retrieve();
          accountId = account.id;
          
          // Validate canonical account
          if (stripeClient.config.platformAccountId && account.id !== stripeClient.config.platformAccountId) {
            verificationError = `Account mismatch: expected ${stripeClient.config.platformAccountId}, got ${account.id}`;
          } else {
            await stripeClient.stripe.balance.retrieve();
            verified = true;
          }
        } catch (err) {
          verificationError = err instanceof Error ? err.message : "Verification failed";
        }
      }
      
      return new Response(JSON.stringify({
        isConnected: !!stripeClient,
        isLiveMode: stripeClient?.config.isLive || false,
        hasWebhookSecret: !!webhookSecret,
        platformAccountId: stripeClient?.config.platformAccountId || null,
        accountId,
        verified,
        message: verified ? "💰 LIVE CONNECTED — VERIFIED 💰" : "Live keys required",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle ping action
    if (body.action === "ping") {
      return new Response(JSON.stringify({ 
        status: "ok",
        isLive: stripeClient?.config.isLive,
        platformAccountId: stripeClient?.config.platformAccountId || null,
        message: stripeClient?.config.isLive ? "💰 LIVE MODE ACTIVE 💰" : "Test mode",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Require valid Stripe key for all other actions
    if (!stripeClient) {
      throw new Error("Stripe secret key not configured");
    }

    const { stripe, config } = stripeClient;
    
    // Validate canonical account for payment operations
    const isValidAccount = await validateCanonicalAccount(stripe, config);
    if (!isValidAccount && config.platformAccountId) {
      console.error("🚨 [stripe-checkout] Canonical account validation failed!");
      throw new Error("Stripe account mismatch - cannot process payments");
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========================================
    // ACTION: Create subscription directly with PaymentMethod (Stripe Elements)
    // ========================================
    if (body.action === "create-subscription-direct") {
      const { paymentMethodId, plan, billingCycle } = body;

      if (!paymentMethodId || !plan || !STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
        return new Response(JSON.stringify({ error: "Invalid parameters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
      const isAnnual = billingCycle === "annual";
      const priceAmount = isAnnual ? planConfig.annualPrice : planConfig.monthlyPrice;
      const interval = isAnnual ? "year" : "month";

      // Get or create customer
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .single();

      let customerId = subscription?.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          payment_method: paymentMethodId,
          invoice_settings: { default_payment_method: paymentMethodId },
          metadata: { supabase_user_id: user.id, environment: config.isLive ? "LIVE" : "TEST" },
        });
        customerId = customer.id;
      } else {
        // Attach payment method to existing customer
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
      }

      // Create or get product
      const productName = `DOMINION ${planConfig.name}`;
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

      // Create subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: { supabase_user_id: user.id, plan, billing_cycle: billingCycle },
        trial_period_days: 14,
      });

      const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

      // If trial, subscription is active immediately
      if (stripeSubscription.status === "trialing" || stripeSubscription.status === "active") {
        console.log(`✅ Subscription created for user ${user.id}, status: ${stripeSubscription.status}`);
        
        return new Response(JSON.stringify({
          subscription: stripeSubscription,
          status: "active",
          isLiveMode: config.isLive,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Handle 3D Secure if required
      if (paymentIntent?.status === "requires_action") {
        return new Response(JSON.stringify({
          subscription: stripeSubscription,
          clientSecret: paymentIntent.client_secret,
          requiresAction: true,
          isLiveMode: config.isLive,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        subscription: stripeSubscription,
        status: stripeSubscription.status,
        isLiveMode: config.isLive,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========================================
    // ACTION: Create one-time payment (PaymentIntent)
    // ========================================
    if (body.action === "create-payment-intent") {
      const { paymentMethodId, amount, productName, description, metadata } = body;

      if (!paymentMethodId || !amount) {
        return new Response(JSON.stringify({ error: "Invalid parameters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get or create customer
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .single();

      let customerId = subscription?.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          payment_method: paymentMethodId,
          metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
      } else {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
      }

      // Create PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        description: productName || description,
        metadata: {
          supabase_user_id: user.id,
          product_name: productName,
          ...metadata,
        },
      });

      if (paymentIntent.status === "requires_action") {
        return new Response(JSON.stringify({
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          requiresAction: true,
          isLiveMode: config.isLive,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        isLiveMode: config.isLive,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========================================
    // DEFAULT: Checkout Session (redirect flow)
    // ========================================
    const { plan, billingCycle, successUrl, cancelUrl } = body;

    if (!plan || !STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
    const isAnnual = billingCycle === "annual";
    const priceAmount = isAnnual ? planConfig.annualPrice : planConfig.monthlyPrice;
    const interval = isAnnual ? "year" : "month";

    // Get or create customer
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id, environment: config.isLive ? "LIVE" : "TEST" },
      });
      customerId = customer.id;
    }

    // Create or get product
    const productName = `DOMINION ${planConfig.name}`;
    const products = await stripe.products.search({ query: `name:'${productName}'` });

    let productId: string;
    if (products.data.length > 0) {
      productId = products.data[0].id;
    } else {
      const product = await stripe.products.create({
        name: productName,
        metadata: { plan_key: plan },
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

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl || `${req.headers.get("origin")}/pricing?success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/pricing?canceled=true`,
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan, billing_cycle: billingCycle },
        trial_period_days: 14,
      },
      metadata: { supabase_user_id: user.id, plan },
      allow_promotion_codes: true,
    });

    console.log(`💰 Checkout session created for user ${user.id}, plan: ${plan}`);

    return new Response(JSON.stringify({ 
      sessionId: session.id, 
      url: session.url,
      customerId,
      isLiveMode: config.isLive,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

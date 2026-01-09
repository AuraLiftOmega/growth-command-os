import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stripe plan configurations
const STRIPE_PLANS = {
  starter: {
    name: "Starter",
    monthlyPrice: 4900, // $49 in cents
    annualPrice: 47000, // $470/year (2 months free)
    features: {
      stores_limit: 3,
      monthly_video_credits: 50,
      monthly_ai_credits: 500,
    },
  },
  growth: {
    name: "Growth", 
    monthlyPrice: 14900, // $149
    annualPrice: 142800, // $1428/year
    features: {
      stores_limit: 10,
      monthly_video_credits: 200,
      monthly_ai_credits: 2000,
    },
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: 49900, // $499
    annualPrice: 478800, // $4788/year
    features: {
      stores_limit: -1, // Unlimited
      monthly_video_credits: -1,
      monthly_ai_credits: -1,
    },
  },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // FORCE LIVE KEYS: Prioritize sk_live_ keys
    const liveKey = Deno.env.get("STRIPE_LIVE_SECRET_KEY");
    const fallbackKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    // Use live key first, fallback to STRIPE_SECRET_KEY only if it's also a live key
    let stripeSecretKey = liveKey;
    if (!stripeSecretKey && fallbackKey?.startsWith("sk_live_")) {
      stripeSecretKey = fallbackKey;
    } else if (!stripeSecretKey) {
      stripeSecretKey = fallbackKey; // For status checks only
    }
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    // Determine key type
    const isLiveKey = stripeSecretKey?.startsWith("sk_live_") || false;
    const isTestKey = stripeSecretKey?.startsWith("sk_test_") || false;
    const keyType = isLiveKey ? "live" : isTestKey ? "test" : "none";
    
    const body = await req.json();
    
    // Handle verify-live-mode action (no auth required for status check)
    if (body.action === "verify-live-mode") {
      return new Response(JSON.stringify({
        isConnected: !!stripeSecretKey,
        isLiveMode: isLiveKey,
        hasWebhookSecret: !!webhookSecret,
        keyType: keyType,
        liveKeyConfigured: !!liveKey || (!!fallbackKey && fallbackKey.startsWith("sk_live_")),
        message: isLiveKey ? "REAL MONEY LIVE — CONNECTED" : "Live keys required for real payments",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle ping action
    if (body.action === "ping") {
      return new Response(JSON.stringify({ 
        status: "ok",
        isLive: isLiveKey,
        keyType: keyType,
        message: isLiveKey ? "💰 LIVE MODE ACTIVE 💰" : "Test mode - no real money",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle test-charge action for verification
    if (body.action === "test-live-connection") {
      if (!stripeSecretKey) {
        return new Response(JSON.stringify({ 
          error: "No Stripe key configured",
          isLive: false,
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (!isLiveKey) {
        return new Response(JSON.stringify({ 
          error: "Live key required (sk_live_) for real money verification",
          keyType: keyType,
          isLive: false,
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
      
      // Verify connection by fetching account
      try {
        const account = await stripe.accounts.retrieve();
        return new Response(JSON.stringify({
          success: true,
          isLive: true,
          message: "💰 REAL MONEY LIVE — CONNECTED 💰",
          accountId: account.id,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (stripeErr) {
        return new Response(JSON.stringify({
          error: "Failed to verify Stripe account",
          details: stripeErr instanceof Error ? stripeErr.message : "Unknown error",
          isLive: false,
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // For actual checkout, ENFORCE LIVE KEYS ONLY
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }
    
    // CRITICAL: Reject test keys for real checkout
    if (!isLiveKey) {
      console.error("🚫 REJECTED: Test key used for checkout. Live keys (sk_live_) REQUIRED for real money.");
      return new Response(JSON.stringify({ 
        error: "LIVE STRIPE KEYS REQUIRED. Test keys (sk_test_) cannot process real payments. Add STRIPE_LIVE_SECRET_KEY or update STRIPE_SECRET_KEY with sk_live_ key.",
        keyType: keyType,
        solution: "Update STRIPE_SECRET_KEY with your sk_live_ key from Stripe Dashboard",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("💰 Processing checkout with LIVE Stripe key — REAL MONEY MODE");

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

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

    // Check for existing Stripe customer
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
          environment: "LIVE",
        },
      });
      customerId = customer.id;
    }

    // Create a product and price on the fly (or use existing)
    const productName = `DOMINION ${planConfig.name}`;
    
    // Search for existing product
    const products = await stripe.products.search({
      query: `name:'${productName}'`,
    });

    let productId: string;
    if (products.data.length > 0) {
      productId = products.data[0].id;
    } else {
      const product = await stripe.products.create({
        name: productName,
        metadata: {
          plan_key: plan,
          stores_limit: String(planConfig.features.stores_limit),
          monthly_video_credits: String(planConfig.features.monthly_video_credits),
          monthly_ai_credits: String(planConfig.features.monthly_ai_credits),
          environment: "LIVE",
        },
      });
      productId = product.id;
    }

    // Create price for this checkout
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: priceAmount,
      currency: "usd",
      recurring: {
        interval: interval,
      },
      metadata: {
        plan_key: plan,
        billing_cycle: billingCycle,
        environment: "LIVE",
      },
    });

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${req.headers.get("origin")}/pricing?success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/pricing?canceled=true`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan: plan,
          billing_cycle: billingCycle,
          environment: "LIVE",
        },
        trial_period_days: 14, // 14-day trial
      },
      metadata: {
        supabase_user_id: user.id,
        plan: plan,
        environment: "LIVE",
      },
      allow_promotion_codes: true,
    });

    console.log(`💰 LIVE checkout session created for user ${user.id}, plan: ${plan} — REAL MONEY`);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url,
        customerId: customerId,
        isLiveMode: true,
        message: "💰 REAL MONEY CHECKOUT — LIVE MODE",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

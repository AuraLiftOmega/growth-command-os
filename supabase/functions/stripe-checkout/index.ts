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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

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

    const body = await req.json();
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
        },
        trial_period_days: 14, // 14-day trial
      },
      metadata: {
        supabase_user_id: user.id,
        plan: plan,
      },
      allow_promotion_codes: true,
    });

    console.log(`Checkout session created for user ${user.id}, plan: ${plan}`);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url,
        customerId: customerId,
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

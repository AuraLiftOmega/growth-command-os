import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Plan feature mappings
const PLAN_FEATURES = {
  starter: {
    stores_limit: 3,
    monthly_video_credits: 50,
    monthly_ai_credits: 500,
  },
  growth: {
    stores_limit: 10,
    monthly_video_credits: 200,
    monthly_ai_credits: 2000,
  },
  enterprise: {
    stores_limit: -1,
    monthly_video_credits: -1,
    monthly_ai_credits: -1,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // FORCE LIVE KEYS: Prioritize sk_live_ keys
    const liveKey = Deno.env.get("STRIPE_LIVE_SECRET_KEY");
    const fallbackKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    // Use live key first, fallback only if it's a live key
    let stripeSecretKey = liveKey;
    if (!stripeSecretKey && fallbackKey?.startsWith("sk_live_")) {
      stripeSecretKey = fallbackKey;
    } else if (!stripeSecretKey) {
      stripeSecretKey = fallbackKey;
    }
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    const isLiveKey = stripeSecretKey.startsWith("sk_live_");
    console.log(`🔄 Stripe webhook processing — ${isLiveKey ? "💰 LIVE MODE" : "⚠️ TEST MODE"}`);

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log(`✅ Webhook signature verified — ${isLiveKey ? "LIVE" : "TEST"} mode`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Webhook signature verification failed:", message);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // For testing without webhook secret
      event = JSON.parse(body);
      console.warn("⚠️ Webhook received without signature verification — testing mode");
    }

    console.log(`📩 Stripe webhook received: ${event.type} — ${isLiveKey ? "💰 REAL MONEY" : "TEST"}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, stripe, session, isLiveKey);
        break;
      }
      
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription, isLiveKey);
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(supabase, subscription);
        break;
      }
      
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice, isLiveKey);
        break;
      }
      
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge;
        await logTransactionToAnalytics(supabase, charge, "charge_succeeded", isLiveKey);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await logPaymentIntentToAnalytics(supabase, paymentIntent, isLiveKey);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ 
      received: true,
      isLiveMode: isLiveKey,
      message: isLiveKey ? "💰 REAL MONEY PROCESSED" : "Test event processed",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("❌ Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function logTransactionToAnalytics(
  supabase: any,
  charge: Stripe.Charge,
  eventType: string,
  isLive: boolean
) {
  if (!isLive) {
    console.log("⚠️ Skipping analytics log for test transaction");
    return;
  }

  const customerId = charge.customer as string;
  const amountInDollars = charge.amount / 100;

  console.log(`💰 REAL MONEY: $${amountInDollars} charged — logging to analytics`);

  // Log to ai_decision_log as a revenue event
  await supabase.from("ai_decision_log").insert({
    user_id: charge.metadata?.supabase_user_id || "system",
    decision_type: "revenue_event",
    action_taken: `Real payment received: $${amountInDollars}`,
    confidence: 1,
    entity_type: "stripe_charge",
    entity_id: charge.id,
    execution_status: "completed",
    impact_metrics: {
      amount: amountInDollars,
      currency: charge.currency,
      customer_id: customerId,
      is_live: true,
      event_type: eventType,
      receipt_url: charge.receipt_url,
    },
    reasoning: "Live Stripe payment processed successfully",
  });
}

async function logPaymentIntentToAnalytics(
  supabase: any,
  paymentIntent: Stripe.PaymentIntent,
  isLive: boolean
) {
  if (!isLive) return;

  const amountInDollars = paymentIntent.amount / 100;
  console.log(`💰 Payment intent succeeded: $${amountInDollars}`);

  await supabase.from("ai_decision_log").insert({
    user_id: paymentIntent.metadata?.supabase_user_id || "system",
    decision_type: "payment_intent",
    action_taken: `Payment intent succeeded: $${amountInDollars}`,
    confidence: 1,
    entity_type: "stripe_payment_intent",
    entity_id: paymentIntent.id,
    execution_status: "completed",
    impact_metrics: {
      amount: amountInDollars,
      currency: paymentIntent.currency,
      is_live: true,
    },
    reasoning: "Live payment intent completed",
  });
}

async function handleCheckoutCompleted(
  supabase: any,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  isLive: boolean
) {
  const userId = session.metadata?.supabase_user_id;
  const plan = session.metadata?.plan as keyof typeof PLAN_FEATURES;
  
  if (!userId || !plan) {
    console.error("Missing metadata in checkout session");
    return;
  }

  console.log(`${isLive ? "💰 LIVE" : "⚠️ TEST"} checkout completed for user ${userId}, plan: ${plan}`);

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  const planFeatures = PLAN_FEATURES[plan] || PLAN_FEATURES.starter;

  // Update subscription in database using service role (bypasses RLS trigger)
  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId,
      plan: plan,
      status: subscription.status === "trialing" ? "trialing" : "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stores_limit: planFeatures.stores_limit,
      monthly_video_credits: planFeatures.monthly_video_credits,
      monthly_ai_credits: planFeatures.monthly_ai_credits,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_ends_at: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null,
      videos_used_this_month: 0,
      ai_credits_used_this_month: 0,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }

  // Log to analytics if live
  if (isLive) {
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
    await supabase.from("ai_decision_log").insert({
      user_id: userId,
      decision_type: "subscription_activated",
      action_taken: `${plan} subscription activated — $${amountTotal}`,
      confidence: 1,
      entity_type: "subscription",
      entity_id: subscriptionId,
      execution_status: "completed",
      impact_metrics: {
        plan,
        amount: amountTotal,
        is_live: true,
        customer_id: customerId,
      },
      reasoning: "Live subscription checkout completed",
    });
  }

  console.log(`✅ Subscription activated for user ${userId}, plan: ${plan} — ${isLive ? "REAL MONEY" : "TEST"}`);
}

async function handleSubscriptionUpdate(
  supabase: any,
  subscription: Stripe.Subscription,
  isLive: boolean
) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.error("No user ID in subscription metadata");
    return;
  }

  console.log(`${isLive ? "💰" : "⚠️"} Subscription update for user ${userId}`);

  const plan = subscription.metadata?.plan as keyof typeof PLAN_FEATURES;
  const planFeatures = plan ? PLAN_FEATURES[plan] : null;

  const updateData: any = {
    stripe_subscription_id: subscription.id,
    status: mapStripeStatus(subscription.status),
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (planFeatures) {
    updateData.plan = plan;
    updateData.stores_limit = planFeatures.stores_limit;
    updateData.monthly_video_credits = planFeatures.monthly_video_credits;
    updateData.monthly_ai_credits = planFeatures.monthly_ai_credits;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating subscription:", error);
  }

  console.log(`✅ Subscription updated for user ${userId}`);
}

async function handleSubscriptionCanceled(
  supabase: any,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) return;

  console.log(`⚠️ Subscription canceled for user ${userId}`);

  // Downgrade to free plan
  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan: "free",
      status: "canceled",
      stripe_subscription_id: null,
      stores_limit: 1,
      monthly_video_credits: 10,
      monthly_ai_credits: 100,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Error canceling subscription:", error);
  }

  console.log(`✅ Subscription canceled for user ${userId}, downgraded to free`);
}

async function handleInvoicePaid(
  supabase: any,
  invoice: Stripe.Invoice,
  isLive: boolean
) {
  // Reset monthly credits on successful payment
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const amountPaid = invoice.amount_paid / 100;
  console.log(`${isLive ? "💰" : "⚠️"} Invoice paid: $${amountPaid}`);

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (subs?.user_id) {
    await supabase
      .from("subscriptions")
      .update({
        videos_used_this_month: 0,
        ai_credits_used_this_month: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", subs.user_id);

    // Log to analytics if live
    if (isLive) {
      await supabase.from("ai_decision_log").insert({
        user_id: subs.user_id,
        decision_type: "invoice_paid",
        action_taken: `Invoice paid: $${amountPaid} — credits reset`,
        confidence: 1,
        entity_type: "stripe_invoice",
        entity_id: invoice.id,
        execution_status: "completed",
        impact_metrics: {
          amount: amountPaid,
          is_live: true,
        },
        reasoning: "Live invoice payment received, monthly credits reset",
      });
    }

    console.log(`✅ Credits reset for user ${subs.user_id}`);
  }
}

async function handlePaymentFailed(
  supabase: any,
  invoice: Stripe.Invoice
) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  console.log(`❌ Payment failed for invoice ${invoice.id}`);

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (subs?.user_id) {
    await supabase
      .from("subscriptions")
      .update({
        status: "past_due",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", subs.user_id);

    console.log(`⚠️ Payment failed for user ${subs.user_id}`);
  }
}

function mapStripeStatus(status: string): string {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    default:
      return "active";
  }
}

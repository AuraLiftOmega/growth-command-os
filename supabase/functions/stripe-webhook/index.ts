import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { 
  createStripeClient,
  validateCanonicalAccount, 
  PLAN_FEATURES,
  corsHeaders, 
  handleCorsPreflightRequest,
} from "../_shared/stripe-config.ts";

serve(async (req) => {
  console.log("🚀 [stripe-webhook] Function invoked at", new Date().toISOString());
  
  if (req.method === "OPTIONS") {
    console.log("📋 [stripe-webhook] CORS preflight request handled");
    return handleCorsPreflightRequest();
  }

  try {
    // Use canonical Stripe configuration
    const stripeClient = createStripeClient();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const platformAccountId = Deno.env.get("STRIPE_PLATFORM_ACCOUNT_ID");
    
    console.log("🔐 [stripe-webhook] Config:", {
      hasStripeClient: !!stripeClient,
      isLive: stripeClient?.config.isLive,
      platformAccount: platformAccountId || "not set",
      hasWebhookSecret: !!webhookSecret,
    });
    
    if (!stripeClient) {
      console.error("❌ [stripe-webhook] No Stripe secret key configured!");
      throw new Error("Stripe secret key not configured");
    }

    const { stripe, config } = stripeClient;
    const isLiveKey = config.isLive;
    
    console.log(`🔄 [stripe-webhook] Processing — ${isLiveKey ? "💰 LIVE MODE" : "⚠️ TEST MODE"}`);
    if (config.platformAccountId) {
      console.log(`🏢 [stripe-webhook] Platform: ${config.platformAccountId}`);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  // Handle test/ping requests
  let parsedBody: any = null;
  try {
    parsedBody = JSON.parse(body);
  } catch {
    // Not JSON, proceed with webhook verification
  }

  // Handle test action - respond 200 immediately
  if (parsedBody?.action === "test-webhook") {
    console.log("🔧 [stripe-webhook] Test ping received");
    const response = { 
      success: true,
      isLive: isLiveKey,
      platformAccountId: config.platformAccountId || null,
      hasWebhookSecret: !!webhookSecret,
      message: "Webhook endpoint is active and responding",
      timestamp: new Date().toISOString(),
    };
    console.log("📤 [stripe-webhook] Test response:", JSON.stringify(response));
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let event: Stripe.Event;

  // Verify webhook signature if secret is configured
  if (webhookSecret && signature) {
    try {
      // Use constructEventAsync for Deno compatibility
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log(`✅ Webhook signature verified — ${isLiveKey ? "LIVE" : "TEST"} mode`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Webhook signature verification failed:", message);
      // Still return 200 to prevent Stripe retries on signature issues during setup
      return new Response(JSON.stringify({ 
        error: "Signature verification failed",
        details: message,
        tip: "Ensure STRIPE_WEBHOOK_SECRET matches your Stripe Dashboard webhook signing secret",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } else if (parsedBody && parsedBody.type) {
    // For testing without webhook secret - accept if it looks like a Stripe event
    event = parsedBody as Stripe.Event;
    console.warn("⚠️ Webhook received without signature verification — testing mode");
  } else {
    console.warn("⚠️ No signature and no valid event body");
    return new Response(JSON.stringify({ 
      error: "No signature provided",
      tip: "Configure STRIPE_WEBHOOK_SECRET for production webhooks",
    }), {
      status: 200, // Return 200 to prevent retries
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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

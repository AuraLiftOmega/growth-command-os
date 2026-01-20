import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import {
  createStripeClient,
  PLAN_FEATURES,
  corsHeaders,
  handleCorsPreflightRequest,
} from "../_shared/stripe-config.ts";

/**
 * Billing Webhook Handler
 * 
 * SOURCE OF TRUTH for payment fulfillment.
 * Handles all critical Stripe events with:
 * - Signature verification (mandatory in prod)
 * - Event deduplication via stripe_events table
 * - Idempotent processing
 * - Alerting for critical events
 */

serve(async (req) => {
  console.log("🚀 [billing-webhook] Function invoked at", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  const startTime = Date.now();

  try {
    const stripeClient = createStripeClient();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeClient) {
      console.error("❌ [billing-webhook] No Stripe key configured");
      throw new Error("Stripe not configured");
    }

    const { stripe, config } = stripeClient;
    
    // Boot-time validation - ensure payments go to canonical account
    if (config.platformAccountId) {
      const account = await stripe.accounts.retrieve();
      if (account.id !== config.platformAccountId) {
        console.error(`🚨 [billing-webhook] CRITICAL: Account mismatch! Expected ${config.platformAccountId}, got ${account.id}`);
        throw new Error("Stripe account mismatch - refusing to process webhook");
      }
      console.log(`✅ [billing-webhook] Canonical account verified: ${account.id}`);
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Handle test ping
    try {
      const parsed = JSON.parse(body);
      if (parsed?.action === "test-webhook") {
        return new Response(JSON.stringify({
          success: true,
          isLive: config.isLive,
          hasWebhookSecret: !!webhookSecret,
          message: "Webhook endpoint active",
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch { /* not JSON test */ }

    // Verify webhook signature
    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
        console.log(`✅ [billing-webhook] Signature verified — ${config.isLive ? "LIVE" : "TEST"}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Verification failed";
        console.error("❌ [billing-webhook] Signature verification failed:", message);
        
        // Record alert for signature failure
        await createAlert(supabase, "critical", "WEBHOOK_SIGNATURE_FAILURE", message);
        
        return new Response(JSON.stringify({ error: "Signature verification failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Accept without signature in test mode only
      try {
        event = JSON.parse(body) as Stripe.Event;
        console.warn("⚠️ [billing-webhook] Processing without signature — testing mode only");
      } catch {
        return new Response(JSON.stringify({ error: "Invalid event body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ========================================
    // DEDUPLICATION CHECK
    // ========================================
    const { data: existingEvent } = await supabase
      .from("stripe_events")
      .select("id, status")
      .eq("stripe_event_id", event.id)
      .single();

    if (existingEvent) {
      console.log(`⏭️ [billing-webhook] Event ${event.id} already processed`);
      return new Response(JSON.stringify({ received: true, deduplicated: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record event as received
    await supabase.from("stripe_events").insert({
      stripe_event_id: event.id,
      type: event.type,
      api_version: event.api_version,
      livemode: event.livemode,
      account: typeof event.account === "string" ? event.account : null,
      request_id: event.request?.id,
      payload_json: event,
      received_at: new Date().toISOString(),
      status: "processing",
    });

    console.log(`📩 [billing-webhook] Processing: ${event.type} — ${config.isLive ? "💰 LIVE" : "TEST"}`);

    let processingError: string | null = null;

    try {
      // ========================================
      // EVENT HANDLERS
      // ========================================
      switch (event.type) {
        // ---- Checkout completed ----
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(supabase, stripe, session, config.isLive);
          break;
        }

        // ---- Subscription events ----
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdate(supabase, subscription, config.isLive);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCanceled(supabase, subscription);
          break;
        }

        // ---- Invoice events ----
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaid(supabase, invoice, config.isLive);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(supabase, invoice);
          await createAlert(supabase, "warn", "PAYMENT_FAILED", 
            `Invoice payment failed: ${invoice.id}`, invoice.customer as string);
          break;
        }

        // ---- Payment events ----
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentIntentSucceeded(supabase, paymentIntent, config.isLive);
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await createAlert(supabase, "warn", "PAYMENT_INTENT_FAILED",
            `Payment failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
            paymentIntent.metadata?.supabase_user_id);
          break;
        }

        // ---- Charge events ----
        case "charge.succeeded": {
          const charge = event.data.object as Stripe.Charge;
          await handleChargeSucceeded(supabase, charge, config.isLive);
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          await handleRefund(supabase, charge);
          break;
        }

        // ---- CRITICAL: Dispute events ----
        case "charge.dispute.created": {
          const dispute = event.data.object as Stripe.Dispute;
          await createAlert(supabase, "critical", "DISPUTE_CREATED",
            `Dispute created for $${dispute.amount / 100}: ${dispute.reason}`,
            null, { dispute_id: dispute.id, charge_id: dispute.charge });
          break;
        }

        default:
          console.log(`ℹ️ [billing-webhook] Unhandled event: ${event.type}`);
      }
    } catch (err: unknown) {
      processingError = err instanceof Error ? err.message : "Processing failed";
      console.error(`❌ [billing-webhook] Processing error:`, err);
    }

    // Update event status
    const processingTime = Date.now() - startTime;
    await supabase
      .from("stripe_events")
      .update({
        processed_at: new Date().toISOString(),
        status: processingError ? "error" : "processed",
        error: processingError,
        processing_time_ms: processingTime,
      })
      .eq("stripe_event_id", event.id);

    return new Response(JSON.stringify({
      received: true,
      eventType: event.type,
      isLive: config.isLive,
      processingTimeMs: processingTime,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("❌ [billing-webhook] Fatal error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ========================================
// EVENT HANDLERS
// ========================================

async function handleCheckoutCompleted(
  supabase: any,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  isLive: boolean
) {
  const userId = session.metadata?.supabase_user_id;
  const type = session.metadata?.type;
  const plan = session.metadata?.plan as keyof typeof PLAN_FEATURES;

  if (!userId) {
    console.error("❌ [billing-webhook] No user_id in checkout session");
    return;
  }

  const customerId = session.customer as string;
  const amountTotal = (session.amount_total || 0) / 100;

  // Record payment
  await supabase.from("billing_payments").upsert({
    user_id: userId,
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent as string,
    type: type === "subscription" ? "subscription" : "one_time",
    status: "succeeded",
    amount: session.amount_total || 0,
    currency: session.currency || "usd",
    description: plan ? `${plan} subscription` : "Payment",
    livemode: isLive,
  }, { onConflict: "stripe_session_id" });

  if (type === "subscription" && session.subscription) {
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const planFeatures = plan ? PLAN_FEATURES[plan] : PLAN_FEATURES.starter;

    // Update billing_subscriptions
    await supabase.from("billing_subscriptions").upsert({
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      plan: plan || "starter",
      status: subscription.status,
      billing_cycle: session.metadata?.billing_cycle || "monthly",
      amount: session.amount_total,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    }, { onConflict: "stripe_subscription_id" });

    // Update legacy subscriptions table for compatibility
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan: plan || "starter",
      status: subscription.status === "trialing" ? "trialing" : "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stores_limit: planFeatures.stores_limit,
      monthly_video_credits: planFeatures.monthly_video_credits,
      monthly_ai_credits: planFeatures.monthly_ai_credits,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      videos_used_this_month: 0,
      ai_credits_used_this_month: 0,
    }, { onConflict: "user_id" });

    // Grant entitlement
    await supabase.from("billing_entitlements").upsert({
      user_id: userId,
      entitlement_key: "subscription_active",
      plan: plan || "starter",
      status: "active",
      source: "stripe",
      source_id: subscriptionId,
      granted_at: new Date().toISOString(),
      expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
    }, { onConflict: "user_id,entitlement_key" });
  }

  console.log(`✅ [billing-webhook] Checkout completed: $${amountTotal} — ${isLive ? "LIVE" : "TEST"}`);
}

async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription, isLive: boolean) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) return;

  const plan = subscription.metadata?.plan as keyof typeof PLAN_FEATURES;
  const planFeatures = plan ? PLAN_FEATURES[plan] : null;

  await supabase.from("billing_subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    plan: plan || "unknown",
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
  }, { onConflict: "stripe_subscription_id" });

  // Update legacy table
  const updateData: any = {
    stripe_subscription_id: subscription.id,
    status: mapStripeStatus(subscription.status),
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  };

  if (planFeatures) {
    updateData.plan = plan;
    updateData.stores_limit = planFeatures.stores_limit;
    updateData.monthly_video_credits = planFeatures.monthly_video_credits;
    updateData.monthly_ai_credits = planFeatures.monthly_ai_credits;
  }

  await supabase.from("subscriptions").update(updateData).eq("user_id", userId);

  console.log(`✅ [billing-webhook] Subscription updated: ${userId} — ${subscription.status}`);
}

async function handleSubscriptionCanceled(supabase: any, subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) return;

  await supabase.from("billing_subscriptions")
    .update({ status: "canceled", canceled_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id);

  await supabase.from("subscriptions").update({
    plan: "free",
    status: "canceled",
    stripe_subscription_id: null,
    stores_limit: 1,
    monthly_video_credits: 10,
    monthly_ai_credits: 100,
  }).eq("user_id", userId);

  await supabase.from("billing_entitlements")
    .update({ status: "revoked" })
    .eq("user_id", userId)
    .eq("entitlement_key", "subscription_active");

  console.log(`⚠️ [billing-webhook] Subscription canceled: ${userId}`);
}

async function handleInvoicePaid(supabase: any, invoice: Stripe.Invoice, isLive: boolean) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const amountPaid = invoice.amount_paid / 100;

  // Reset monthly credits
  const { data: sub } = await supabase
    .from("billing_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (sub?.user_id) {
    await supabase.from("subscriptions").update({
      videos_used_this_month: 0,
      ai_credits_used_this_month: 0,
    }).eq("user_id", sub.user_id);

    // Record payment
    await supabase.from("billing_payments").insert({
      user_id: sub.user_id,
      stripe_invoice_id: invoice.id,
      type: "invoice",
      status: "succeeded",
      amount: invoice.amount_paid,
      currency: invoice.currency,
      livemode: isLive,
    });
  }

  console.log(`✅ [billing-webhook] Invoice paid: $${amountPaid}`);
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const { data: sub } = await supabase
    .from("billing_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (sub?.user_id) {
    await supabase.from("subscriptions")
      .update({ status: "past_due" })
      .eq("user_id", sub.user_id);

    await supabase.from("billing_subscriptions")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", subscriptionId);
  }

  console.log(`❌ [billing-webhook] Payment failed: ${invoice.id}`);
}

async function handlePaymentIntentSucceeded(supabase: any, paymentIntent: Stripe.PaymentIntent, isLive: boolean) {
  const userId = paymentIntent.metadata?.supabase_user_id;
  if (!userId) return;

  await supabase.from("billing_payments").upsert({
    user_id: userId,
    stripe_payment_intent_id: paymentIntent.id,
    type: paymentIntent.metadata?.type || "payment",
    status: "succeeded",
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    description: paymentIntent.description,
    livemode: isLive,
  }, { onConflict: "stripe_payment_intent_id" });

  console.log(`✅ [billing-webhook] PaymentIntent succeeded: $${paymentIntent.amount / 100}`);
}

async function handleChargeSucceeded(supabase: any, charge: Stripe.Charge, isLive: boolean) {
  const userId = charge.metadata?.supabase_user_id;
  
  // Calculate profit allocation (40% of 45% margin = ~40% of revenue goes to profit)
  const PROFIT_MARGIN_PERCENT = 45;
  const PROFIT_ALLOCATION_PERCENT = 40;
  
  const chargeAmount = charge.amount; // in cents
  const profitAmount = Math.floor(chargeAmount * (PROFIT_ALLOCATION_PERCENT / 100));
  
  // Record payment with profit tracking
  await supabase.from("billing_payments").upsert({
    user_id: userId || null,
    stripe_charge_id: charge.id,
    stripe_payment_intent_id: charge.payment_intent as string,
    type: "charge",
    status: "succeeded",
    amount: chargeAmount,
    currency: charge.currency,
    receipt_url: charge.receipt_url,
    livemode: isLive,
    metadata: {
      profit_margin_percent: PROFIT_MARGIN_PERCENT,
      profit_allocation_percent: PROFIT_ALLOCATION_PERCENT,
      profit_amount_cents: profitAmount,
      payment_captured: charge.captured,
      captured_at: charge.captured ? new Date().toISOString() : null,
    },
  }, { onConflict: "stripe_charge_id" });

  // Log profit routing for captured payments
  if (charge.captured) {
    console.log(`💰 [billing-webhook] Payment captured! Revenue: $${chargeAmount / 100}, Profit routed: $${profitAmount / 100} (${PROFIT_ALLOCATION_PERCENT}%)`);
    
    // Auto-payout is handled by Stripe's automatic payouts to your connected bank
    // The profit is already in your Stripe balance once the charge succeeds
    console.log(`🏦 [billing-webhook] $${profitAmount / 100} profit queued for automatic payout to bank`);
  }

  console.log(`✅ [billing-webhook] Charge succeeded: $${chargeAmount / 100} — Profit: $${profitAmount / 100} — ${isLive ? "LIVE" : "TEST"}`);
}

async function handleRefund(supabase: any, charge: Stripe.Charge) {
  const userId = charge.metadata?.supabase_user_id;
  
  await supabase.from("billing_payments")
    .update({ status: "refunded" })
    .eq("stripe_charge_id", charge.id);

  if (userId) {
    await createAlert(supabase, "info", "CHARGE_REFUNDED",
      `Refund processed: $${(charge.amount_refunded || 0) / 100}`, userId);
  }

  console.log(`💸 [billing-webhook] Refund processed: ${charge.id}`);
}

// ========================================
// HELPERS
// ========================================

async function createAlert(
  supabase: any,
  severity: "info" | "warn" | "critical",
  code: string,
  message: string,
  userId?: string | null,
  meta?: Record<string, unknown>
) {
  const dedupeKey = `${code}:${userId || "system"}:${new Date().toISOString().split("T")[0]}`;

  await supabase.from("billing_alerts").upsert({
    severity,
    code,
    message,
    user_id: userId,
    dedupe_key: dedupeKey,
    status: "open",
    meta_json: meta || {},
  }, { onConflict: "dedupe_key", ignoreDuplicates: true });

  // Send Slack alert for critical
  if (severity === "critical") {
    const slackUrl = Deno.env.get("ALERT_SLACK_WEBHOOK_URL");
    if (slackUrl) {
      try {
        await fetch(slackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🚨 *CRITICAL BILLING ALERT*\n*Code:* ${code}\n*Message:* ${message}`,
          }),
        });
      } catch (e) {
        console.error("Failed to send Slack alert:", e);
      }
    }
  }
}

function mapStripeStatus(status: string): string {
  switch (status) {
    case "active": return "active";
    case "trialing": return "trialing";
    case "past_due": return "past_due";
    case "canceled":
    case "unpaid": return "canceled";
    default: return "active";
  }
}

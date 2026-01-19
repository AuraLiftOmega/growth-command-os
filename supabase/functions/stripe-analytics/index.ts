import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { 
  createStripeClient, 
  corsHeaders, 
  handleCorsPreflightRequest,
  createSuccessResponse,
} from "../_shared/stripe-config.ts";

serve(async (req) => {
  console.log("📊 [stripe-analytics] Function invoked at", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    // Use canonical Stripe configuration
    const stripeClient = createStripeClient();
    
    if (!stripeClient) {
      console.error("❌ No Stripe secret key configured");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Stripe not configured",
        metrics: getEmptyMetrics(),
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { stripe, config } = stripeClient;
    const isLive = config.isLive;
    
    console.log(`🔐 [stripe-analytics] Running in ${isLive ? "💰 LIVE" : "⚠️ TEST"} mode`);
    if (config.platformAccountId) {
      console.log(`🏢 [stripe-analytics] Platform: ${config.platformAccountId}`);
    }

    const body = await req.json().catch(() => ({}));
    const { period = "today" } = body;

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    console.log("📅 Fetching Stripe data...");

    // Fetch real data from Stripe
    const [
      todayCharges,
      weekCharges,
      monthCharges,
      recentPaymentIntents,
      balanceTransactions,
      customers,
    ] = await Promise.all([
      // Today's charges
      stripe.charges.list({
        created: { gte: Math.floor(todayStart.getTime() / 1000) },
        limit: 100,
      }),
      // This week's charges
      stripe.charges.list({
        created: { gte: Math.floor(weekStart.getTime() / 1000) },
        limit: 100,
      }),
      // This month's charges
      stripe.charges.list({
        created: { gte: Math.floor(monthStart.getTime() / 1000) },
        limit: 100,
      }),
      // Recent successful payment intents
      stripe.paymentIntents.list({
        created: { gte: Math.floor(todayStart.getTime() / 1000) },
        limit: 50,
      }),
      // Balance transactions for accurate revenue
      stripe.balanceTransactions.list({
        created: { gte: Math.floor(todayStart.getTime() / 1000) },
        type: "charge",
        limit: 100,
      }),
      // Customer count
      stripe.customers.list({
        limit: 100,
      }),
    ]);

    // Calculate metrics from real Stripe data
    const calculateRevenue = (charges: Stripe.Charge[]) => 
      charges
        .filter((c: Stripe.Charge) => c.status === "succeeded" && !c.refunded)
        .reduce((sum: number, c: Stripe.Charge) => sum + (c.amount / 100), 0);

    const todayRevenue = calculateRevenue(todayCharges.data as Stripe.Charge[]);
    const weekRevenue = calculateRevenue(weekCharges.data as Stripe.Charge[]);
    const monthRevenue = calculateRevenue(monthCharges.data as Stripe.Charge[]);

    // Calculate conversions (successful charges)
    const todayConversions = (todayCharges.data as Stripe.Charge[]).filter((c: Stripe.Charge) => c.status === "succeeded").length;
    const weekConversions = (weekCharges.data as Stripe.Charge[]).filter((c: Stripe.Charge) => c.status === "succeeded").length;

    // Get successful payment intents for today
    const successfulPayments = (recentPaymentIntents.data as Stripe.PaymentIntent[]).filter(
      (pi: Stripe.PaymentIntent) => pi.status === "succeeded"
    );

    // Calculate average order value
    const avgOrderValue = todayConversions > 0 ? todayRevenue / todayConversions : 0;

    // Build revenue events feed from recent charges
    const revenueEvents = (todayCharges.data as Stripe.Charge[])
      .filter((c: Stripe.Charge) => c.status === "succeeded")
      .slice(0, 20)
      .map((charge: Stripe.Charge) => ({
        id: charge.id,
        type: charge.invoice ? "subscription" : "sale",
        amount: charge.amount / 100,
        product: charge.description || "Payment",
        channel: charge.metadata?.channel || "Direct",
        timestamp: new Date(charge.created * 1000).toISOString(),
        stripeId: charge.id,
        customerEmail: charge.receipt_email,
      }));

    // Build chart data from balance transactions (hourly for today)
    const chartData: Array<{ time: string; revenue: number }> = [];
    const hourlyRevenue: Record<number, number> = {};

    for (let hour = 0; hour <= now.getHours(); hour++) {
      hourlyRevenue[hour] = 0;
    }

    (balanceTransactions.data as Stripe.BalanceTransaction[]).forEach((tx: Stripe.BalanceTransaction) => {
      if (tx.type === "charge") {
        const txDate = new Date(tx.created * 1000);
        const hour = txDate.getHours();
        hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + (tx.amount / 100);
      }
    });

    let cumulativeRevenue = 0;
    Object.entries(hourlyRevenue).forEach(([hour, amount]) => {
      cumulativeRevenue += amount;
      chartData.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        revenue: cumulativeRevenue,
      });
    });

    // Get top products from charges metadata
    const productRevenue: Record<string, { revenue: number; count: number }> = {};
    (monthCharges.data as Stripe.Charge[])
      .filter((c: Stripe.Charge) => c.status === "succeeded")
      .forEach((charge: Stripe.Charge) => {
        const product = charge.description || charge.metadata?.product || "Other";
        if (!productRevenue[product]) {
          productRevenue[product] = { revenue: 0, count: 0 };
        }
        productRevenue[product].revenue += charge.amount / 100;
        productRevenue[product].count += 1;
      });

    const topProducts = Object.entries(productRevenue)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        orders: data.count,
        growth: 0, // Would need historical data to calculate
      }));

    // Build response
    const metrics = {
      todayRevenue,
      weekRevenue,
      monthRevenue,
      todayConversions,
      weekConversions,
      avgOrderValue,
      totalCustomers: customers.data.length,
      isLive,
      lastUpdated: new Date().toISOString(),
      revenueEvents,
      chartData,
      topProducts,
      // Calculated metrics
      roas: 0, // Would need ad spend data
      adsSpend: 0,
    };

    console.log(`✅ [stripe-analytics] Fetched real data — Today: $${todayRevenue}, Week: $${weekRevenue}`);

    return new Response(JSON.stringify({
      success: true,
      isLive,
      metrics,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ [stripe-analytics] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(JSON.stringify({
      success: false,
      error: message,
      metrics: getEmptyMetrics(),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getEmptyMetrics() {
  return {
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    todayConversions: 0,
    weekConversions: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    isLive: false,
    lastUpdated: new Date().toISOString(),
    revenueEvents: [],
    chartData: [],
    topProducts: [],
    roas: 0,
    adsSpend: 0,
  };
}

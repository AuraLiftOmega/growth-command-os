import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

async function getCJAccessToken(apiKey: string, supabase: any): Promise<string> {
  // Check for cached token in DB
  const { data: cached } = await supabase
    .from("cj_settings")
    .select("updated_at, last_sync_at")
    .limit(1)
    .single();

  // If we have a recent token stored in last_sync_at (repurposed as token cache)
  // and it was updated less than 14 days ago, use it
  if (cached?.last_sync_at) {
    const updatedAt = new Date(cached.updated_at).getTime();
    const now = Date.now();
    const daysSinceUpdate = (now - updatedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 14) {
      return cached.last_sync_at; // We store the token here
    }
  }

  const resp = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });

  if (resp.status === 429) {
    if (cached?.last_sync_at) return cached.last_sync_at;
    throw new Error("CJ auth rate limited and no cached token. Retry in 5 min.");
  }

  if (!resp.ok) throw new Error(`CJ auth HTTP ${resp.status}`);

  const data = await resp.json();
  if (data?.data?.accessToken) {
    const token = data.data.accessToken;
    // Cache token in cj_settings.last_sync_at field
    if (cached) {
      await supabase
        .from("cj_settings")
        .update({ last_sync_at: token, updated_at: new Date().toISOString() })
        .not("id", "is", null);
    }
    return token;
  }

  throw new Error(`CJ auth failed: ${data?.message || "Unknown"}`);
}

async function cjRequest(token: string, path: string, method = "GET", body?: any) {
  const opts: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": token,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const resp = await fetch(`${CJ_BASE}${path}`, opts);
  const data = await resp.json();
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, order_id, shopify_order_id, customer_name, customer_email, items, shipping_address } = await req.json();
    const cjApiKey = Deno.env.get("CJ_API_KEY");
    if (!cjApiKey) throw new Error("CJ_API_KEY not configured");

    const token = await getCJAccessToken(cjApiKey, supabase);
    let result: any = {};

    if (action === "check_order") {
      // Query CJ for order by shopify order ID or CJ order ID
      if (order_id) {
        result = await cjRequest(token, `/shopping/order/queryById?orderId=${order_id}`);
      } else {
        // List recent orders to find matching one
        result = await cjRequest(token, `/shopping/order/list?pageNum=1&pageSize=20`);
      }
    } else if (action === "create_order") {
      // Create a CJ order for fulfillment
      const orderPayload = {
        orderNumber: shopify_order_id || `SHOP-${Date.now()}`,
        shippingCustomerName: shipping_address?.name || customer_name || "",
        shippingCountryCode: shipping_address?.country_code || "US",
        shippingProvince: shipping_address?.province || "",
        shippingCity: shipping_address?.city || "",
        shippingAddress: shipping_address?.address || "",
        shippingZip: shipping_address?.zip || "",
        shippingPhone: shipping_address?.phone || "",
        remark: `Shopify Order ${shopify_order_id} - Customer: ${customer_name}`,
        products: (items || []).map((item: any) => ({
          vid: item.cj_variant_id || item.variant_id || "",
          quantity: item.quantity || 1,
        })),
      };

      result = await cjRequest(token, "/shopping/order/createOrderV2", "POST", orderPayload);

      // Log the result
      await supabase.from("cj_logs").insert({
        user_id: (await supabase.auth.getUser())?.data?.user?.id || "system",
        cj_product_id: items?.[0]?.cj_product_id || "unknown",
        cj_product_name: items?.[0]?.product_name || customer_name || "Order fulfillment",
        shopify_product_id: shopify_order_id,
        sync_status: result?.code === 200 ? "order_created" : "order_failed",
        error_message: result?.code !== 200 ? JSON.stringify(result) : null,
        metadata: { action: "fulfill_order", cj_response: result, customer_name, customer_email },
      });
    } else if (action === "list_products") {
      // Search CJ product catalog
      const keyword = items?.[0]?.keyword || "";
      result = await cjRequest(token, `/product/listV2?page=1&size=20&keyWord=${encodeURIComponent(keyword)}`);
    } else if (action === "check_tracking") {
      // Get tracking info for an order
      if (order_id) {
        result = await cjRequest(token, `/logistic/getTrackInfo?orderIds=${order_id}`);
      }
    } else if (action === "confirm_order") {
      // Confirm/pay for a CJ order using balance
      result = await cjRequest(token, "/shopping/order/confirmOrder", "POST", { orderId: order_id });
    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, action, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("CJ Order Fulfill Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

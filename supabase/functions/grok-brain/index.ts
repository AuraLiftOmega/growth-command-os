import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

// ─── CJ Helpers ───
async function getCJToken(apiKey: string, supabase: any): Promise<string> {
  const { data: cached } = await supabase
    .from("cj_settings")
    .select("updated_at, last_sync_at")
    .limit(1)
    .single();

  if (cached?.last_sync_at) {
    const age = (Date.now() - new Date(cached.updated_at).getTime()) / 864e5;
    if (age < 14) return cached.last_sync_at;
  }

  const resp = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });

  if (resp.status === 429 && cached?.last_sync_at) return cached.last_sync_at;
  if (!resp.ok) throw new Error(`CJ auth HTTP ${resp.status}`);

  const data = await resp.json();
  if (!data?.data?.accessToken) throw new Error("CJ auth failed");
  
  const token = data.data.accessToken;
  if (cached) {
    await supabase.from("cj_settings").update({ last_sync_at: token, updated_at: new Date().toISOString() }).not("id", "is", null);
  }
  return token;
}

async function cjReq(token: string, path: string, method = "GET", body?: any) {
  const opts: RequestInit = { method, headers: { "Content-Type": "application/json", "CJ-Access-Token": token } };
  if (body) opts.body = JSON.stringify(body);
  return (await fetch(`${CJ_BASE}${path}`, opts)).json();
}

// ─── Shopify Admin Helpers ───
async function shopifyAdmin(storeDomain: string, adminToken: string, path: string, method = "GET", body?: any) {
  const url = `https://${storeDomain}/admin/api/2025-01/${path}`;
  const opts: RequestInit = { method, headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": adminToken } };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  return resp.json();
}

// ─── Tool Definitions for Grok ───
const TOOLS = [
  {
    type: "function",
    function: {
      name: "list_all_stores",
      description: "List all active stores across the platform with their domains, names, product counts, order counts, and revenue.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_store_products",
      description: "Fetch products from a specific Shopify store via Storefront API.",
      parameters: {
        type: "object",
        properties: {
          store_domain: { type: "string", description: "The myshopify.com domain" },
          storefront_token: { type: "string", description: "Storefront access token" },
          limit: { type: "number", description: "Number of products to fetch (max 50)" },
        },
        required: ["store_domain", "storefront_token"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_store_orders",
      description: "Fetch recent orders from a Shopify store via Admin API.",
      parameters: {
        type: "object",
        properties: {
          store_domain: { type: "string", description: "The myshopify.com domain" },
          status: { type: "string", description: "Order status filter: any, open, closed, cancelled" },
          limit: { type: "number", description: "Number of orders (max 50)" },
        },
        required: ["store_domain"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cj_check_order",
      description: "Check order status on CJ Dropshipping by CJ order ID.",
      parameters: {
        type: "object",
        properties: { order_id: { type: "string", description: "CJ order ID" } },
        required: ["order_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cj_create_order",
      description: "Create a fulfillment order on CJ Dropshipping for a customer.",
      parameters: {
        type: "object",
        properties: {
          shopify_order_id: { type: "string" },
          customer_name: { type: "string" },
          country_code: { type: "string" },
          province: { type: "string" },
          city: { type: "string" },
          address: { type: "string" },
          zip: { type: "string" },
          phone: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: { vid: { type: "string" }, quantity: { type: "number" } },
            },
          },
        },
        required: ["customer_name", "country_code", "address", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cj_search_products",
      description: "Search CJ Dropshipping product catalog by keyword.",
      parameters: {
        type: "object",
        properties: { keyword: { type: "string" } },
        required: ["keyword"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cj_check_tracking",
      description: "Get tracking/shipping info for a CJ order.",
      parameters: {
        type: "object",
        properties: { order_id: { type: "string" } },
        required: ["order_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_store_metrics",
      description: "Update a store's product count, order count, or revenue in the database.",
      parameters: {
        type: "object",
        properties: {
          store_id: { type: "string" },
          products_count: { type: "number" },
          orders_count: { type: "number" },
          total_revenue: { type: "number" },
        },
        required: ["store_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_decision",
      description: "Log an AI decision or action taken for audit trail.",
      parameters: {
        type: "object",
        properties: {
          decision_type: { type: "string" },
          action_taken: { type: "string" },
          reasoning: { type: "string" },
          confidence: { type: "number" },
          entity_type: { type: "string" },
          entity_id: { type: "string" },
        },
        required: ["decision_type", "action_taken"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_automation_job",
      description: "Queue an automation job for execution (e.g., bulk sync, campaign launch).",
      parameters: {
        type: "object",
        properties: {
          job_type: { type: "string", description: "Type: sync_products, fulfill_orders, generate_ads, recover_carts, scale_winners" },
          target_id: { type: "string", description: "Store or entity ID" },
          input_data: { type: "object", description: "Job configuration payload" },
          priority: { type: "number", description: "1-10, higher = more urgent" },
        },
        required: ["job_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_platform_analytics",
      description: "Get aggregated analytics across all stores: total revenue, orders, products, active stores.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

// ─── Tool Execution ───
async function executeTool(name: string, args: any, supabase: any, cjToken: string | null, adminToken: string | null): Promise<any> {
  switch (name) {
    case "list_all_stores": {
      const { data } = await supabase.from("user_store_connections").select("*").eq("is_active", true).order("connected_at", { ascending: false });
      return data || [];
    }

    case "get_store_products": {
      const query = `{ products(first: ${args.limit || 20}) { edges { node { id title handle description priceRange { minVariantPrice { amount currencyCode } } images(first: 1) { edges { node { url } } } variants(first: 5) { edges { node { id title price { amount } availableForSale } } } } } } }`;
      const resp = await fetch(`https://${args.store_domain}/api/2025-07/graphql.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": args.storefront_token },
        body: JSON.stringify({ query }),
      });
      return (await resp.json())?.data?.products?.edges?.map((e: any) => ({
        id: e.node.id,
        title: e.node.title,
        handle: e.node.handle,
        price: e.node.priceRange.minVariantPrice.amount,
        currency: e.node.priceRange.minVariantPrice.currencyCode,
        image: e.node.images.edges[0]?.node?.url,
        variants: e.node.variants.edges.length,
        available: e.node.variants.edges.some((v: any) => v.node.availableForSale),
      })) || [];
    }

    case "get_store_orders": {
      if (!adminToken) return { error: "No admin token available. Configure SHOPIFY_ACCESS_TOKEN." };
      const domain = args.store_domain || "lovable-project-7fb70.myshopify.com";
      const status = args.status || "any";
      const limit = args.limit || 20;
      return shopifyAdmin(domain, adminToken, `orders.json?status=${status}&limit=${limit}`);
    }

    case "cj_check_order": {
      if (!cjToken) return { error: "CJ not connected" };
      return cjReq(cjToken, `/shopping/order/queryById?orderId=${args.order_id}`);
    }

    case "cj_create_order": {
      if (!cjToken) return { error: "CJ not connected" };
      return cjReq(cjToken, "/shopping/order/createOrderV2", "POST", {
        orderNumber: args.shopify_order_id || `GROK-${Date.now()}`,
        shippingCustomerName: args.customer_name,
        shippingCountryCode: args.country_code,
        shippingProvince: args.province || "",
        shippingCity: args.city || "",
        shippingAddress: args.address,
        shippingZip: args.zip || "",
        shippingPhone: args.phone || "",
        products: args.items,
      });
    }

    case "cj_search_products": {
      if (!cjToken) return { error: "CJ not connected" };
      return cjReq(cjToken, `/product/listV2?page=1&size=20&keyWord=${encodeURIComponent(args.keyword)}`);
    }

    case "cj_check_tracking": {
      if (!cjToken) return { error: "CJ not connected" };
      return cjReq(cjToken, `/logistic/getTrackInfo?orderIds=${args.order_id}`);
    }

    case "update_store_metrics": {
      const update: any = {};
      if (args.products_count !== undefined) update.products_count = args.products_count;
      if (args.orders_count !== undefined) update.orders_count = args.orders_count;
      if (args.total_revenue !== undefined) update.total_revenue = args.total_revenue;
      const { error } = await supabase.from("user_store_connections").update(update).eq("id", args.store_id);
      return error ? { error: error.message } : { success: true };
    }

    case "log_decision": {
      const { error } = await supabase.from("ai_decision_log").insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        decision_type: args.decision_type,
        action_taken: args.action_taken,
        reasoning: args.reasoning || null,
        confidence: args.confidence || null,
        entity_type: args.entity_type || null,
        entity_id: args.entity_id || null,
        execution_status: "executed",
      });
      return error ? { error: error.message } : { logged: true };
    }

    case "create_automation_job": {
      const { error } = await supabase.from("automation_jobs").insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        job_type: args.job_type,
        target_id: args.target_id || null,
        input_data: args.input_data || {},
        priority: args.priority || 5,
        status: "pending",
      });
      return error ? { error: error.message } : { queued: true };
    }

    case "get_platform_analytics": {
      const { data: stores } = await supabase.from("user_store_connections").select("*").eq("is_active", true);
      const { data: orders } = await supabase.from("automation_jobs").select("id").eq("job_type", "fulfill_orders");
      const { data: ads } = await supabase.from("ads").select("id, views, revenue");
      const { data: creatives } = await supabase.from("creatives").select("id, status, revenue");

      const totalRevenue = (stores || []).reduce((s: number, st: any) => s + (st.total_revenue || 0), 0);
      const totalProducts = (stores || []).reduce((s: number, st: any) => s + (st.products_count || 0), 0);

      return {
        stores_count: stores?.length || 0,
        total_revenue: totalRevenue,
        total_products: totalProducts,
        automation_jobs: orders?.length || 0,
        ads_count: ads?.length || 0,
        ads_total_revenue: (ads || []).reduce((s: number, a: any) => s + (a.revenue || 0), 0),
        creatives_count: creatives?.length || 0,
        active_creatives: (creatives || []).filter((c: any) => c.status === "published").length,
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ─── Main Grok Brain Loop ───
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get CJ token (best-effort)
    let cjToken: string | null = null;
    const cjKey = Deno.env.get("CJ_API_KEY");
    if (cjKey) {
      try { cjToken = await getCJToken(cjKey, supabase); } catch { /* CJ unavailable */ }
    }

    const adminToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN") || null;
    const { message, context, stream } = await req.json();

    // Build system prompt with live store data
    const { data: stores } = await supabase.from("user_store_connections").select("id, store_domain, store_name, is_primary, products_count, orders_count, total_revenue").eq("is_active", true);

    const storeList = (stores || []).map((s: any) =>
      `• ${s.store_name} (${s.store_domain}) — ${s.products_count || 0} products, ${s.orders_count || 0} orders, $${s.total_revenue || 0} revenue${s.is_primary ? " [PRIMARY]" : ""}`
    ).join("\n");

    const systemPrompt = `You are the GROK BRAIN — the supreme AI orchestrator for MASTER_OS, a multi-tenant e-commerce empire.

YOUR CAPABILITIES:
- Full control over ALL connected Shopify stores (products, orders, analytics)
- CJ Dropshipping integration (search products, create/check/track orders)
- Marketing automation (queue ad generation, content scheduling, cart recovery)
- Platform-wide analytics and decision logging

CONNECTED STORES:
${storeList || "No stores connected yet."}

CJ STATUS: ${cjToken ? "✅ Connected" : "❌ Not connected"}
SHOPIFY ADMIN: ${adminToken ? "✅ Available" : "⚠️ Storefront-only mode"}

RULES:
1. Always use tools to fetch real data — NEVER make up numbers or statuses.
2. Log important decisions using log_decision for audit trail.
3. When fulfilling orders, always verify CJ product sourcing first.
4. For cross-store operations, iterate through stores systematically.
5. Be direct, decisive, and action-oriented. You are the CEO brain.
6. When creating CJ orders, ensure shipping addresses are complete.
7. Present data in clear, structured format with actionable insights.

${context ? `ADDITIONAL CONTEXT: ${context}` : ""}`;

    // Grok conversation with tool-use loop
    let messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const MAX_ITERATIONS = 8;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const aiResp = await fetch(AI_GATEWAY, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          tools: TOOLS,
          tool_choice: "auto",
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("AI Gateway error:", aiResp.status, errText);
        if (aiResp.status === 429) throw new Error("Rate limited — try again in a moment.");
        if (aiResp.status === 402) throw new Error("AI credits depleted — add credits in workspace settings.");
        throw new Error(`AI Gateway error ${aiResp.status}: ${errText}`);
      }

      const grokData = await aiResp.json();
      const choice = grokData.choices?.[0];
      if (!choice) throw new Error("No response from Grok");

      const msg = choice.message;
      messages.push(msg);

      // If no tool calls, we have the final answer
      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        return new Response(JSON.stringify({
          response: msg.content,
          tools_used: messages.filter((m: any) => m.role === "tool").map((m: any) => m.name || "tool"),
          iterations: i + 1,
          stores_count: stores?.length || 0,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Execute all tool calls
      for (const tc of msg.tool_calls) {
        const toolName = tc.function.name;
        let toolArgs: any = {};
        try { toolArgs = JSON.parse(tc.function.arguments); } catch {}

        console.log(`[Grok Brain] Executing tool: ${toolName}`, toolArgs);
        const toolResult = await executeTool(toolName, toolArgs, supabase, cjToken, adminToken);

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          name: toolName,
          content: JSON.stringify(toolResult).slice(0, 8000), // Truncate huge responses
        });
      }
    }

    // Max iterations reached
    const lastAssistant = messages.filter((m: any) => m.role === "assistant").pop();
    return new Response(JSON.stringify({
      response: lastAssistant?.content || "Completed maximum analysis iterations. Check the decision log for details.",
      tools_used: messages.filter((m: any) => m.role === "tool").map((m: any) => m.name || "tool"),
      iterations: MAX_ITERATIONS,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Grok Brain Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

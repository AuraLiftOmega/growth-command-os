import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supported supplier configurations
const SUPPLIER_REGISTRY = {
  cj_dropshipping: {
    name: "CJ Dropshipping",
    type: "dropship",
    api_base: "https://developers.cjdropshipping.com/api/v2",
    avg_shipping_days: 8,
    strengths: ["Low cost", "Wide catalog", "Custom packaging", "US warehouses"],
    categories: ["skincare", "beauty", "electronics", "home", "fashion"],
  },
  dsers: {
    name: "DSers (AliExpress Official)",
    type: "dropship",
    api_base: "https://api.dsers.com/v1",
    avg_shipping_days: 10,
    strengths: ["AliExpress integration", "Bulk ordering", "Auto-mapping"],
    categories: ["electronics", "fashion", "home", "toys", "sports"],
  },
  spocket: {
    name: "Spocket",
    type: "dropship",
    api_base: "https://api.spocket.co/v1",
    avg_shipping_days: 5,
    strengths: ["US/EU suppliers", "Fast shipping", "Quality products", "Branded invoicing"],
    categories: ["fashion", "beauty", "home", "accessories", "pet"],
  },
  zendrop: {
    name: "Zendrop",
    type: "dropship",
    api_base: "https://api.zendrop.com/v1",
    avg_shipping_days: 6,
    strengths: ["Fast US fulfillment", "Custom branding", "Auto-fulfillment", "Bundles"],
    categories: ["beauty", "health", "electronics", "home", "fashion"],
  },
  printful: {
    name: "Printful",
    type: "print_on_demand",
    api_base: "https://api.printful.com",
    avg_shipping_days: 4,
    strengths: ["Custom prints", "Merch", "US production", "Mockups"],
    categories: ["apparel", "accessories", "home_decor", "stickers"],
  },
  aliexpress: {
    name: "AliExpress Direct",
    type: "dropship",
    api_base: "https://api.aliexpress.com",
    avg_shipping_days: 12,
    strengths: ["Cheapest prices", "Massive catalog", "Choice shipping"],
    categories: ["everything"],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Auth required");

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Invalid auth");

    const body = await req.json();
    const { action } = body;
    console.log(`[SupplierManager] Action: ${action}`);

    switch (action) {
      // ========== INITIALIZE DEFAULT SUPPLIERS ==========
      case "init_suppliers": {
        const defaults = ["cj_dropshipping", "spocket", "zendrop", "dsers"];
        const inserted = [];

        for (const key of defaults) {
          const info = SUPPLIER_REGISTRY[key as keyof typeof SUPPLIER_REGISTRY];
          if (!info) continue;

          const { data: existing } = await supabase
            .from("supplier_connections").select("id")
            .eq("user_id", user.id).eq("supplier_name", key).single();

          if (!existing) {
            const { data } = await supabase.from("supplier_connections").insert({
              user_id: user.id,
              supplier_name: key,
              supplier_type: info.type,
              api_endpoint: info.api_base,
              is_active: key === "cj_dropshipping", // Only CJ active by default
              auto_source: true,
              priority_rank: defaults.indexOf(key) + 1,
              avg_shipping_days: info.avg_shipping_days,
              config: { strengths: info.strengths, categories: info.categories },
            }).select().single();
            if (data) inserted.push(data);
          }
        }

        return new Response(JSON.stringify({
          success: true, initialized: inserted.length,
          suppliers: inserted, available: Object.keys(SUPPLIER_REGISTRY),
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ========== FIND BEST SUPPLIER FOR PRODUCT ==========
      case "find_best_supplier": {
        const { product_name, category, max_cost, shipping_priority } = body;

        const { data: suppliers } = await supabase
          .from("supplier_connections").select("*")
          .eq("user_id", user.id).eq("is_active", true)
          .order("priority_rank", { ascending: true });

        if (!suppliers?.length) throw new Error("No active suppliers configured");

        // Score each supplier for this product
        const scored = suppliers.map(s => {
          const info = SUPPLIER_REGISTRY[s.supplier_name as keyof typeof SUPPLIER_REGISTRY];
          let score = 100 - (s.priority_rank * 10);

          // Shipping speed bonus
          if (shipping_priority === "fast") {
            score += Math.max(0, 15 - s.avg_shipping_days) * 3;
          }

          // Category match
          if (info?.categories?.includes(category) || info?.categories?.includes("everything")) {
            score += 20;
          }

          // Success rate
          score += (s.success_rate || 100) * 0.3;

          return { ...s, score, supplier_info: info };
        }).sort((a, b) => b.score - a.score);

        return new Response(JSON.stringify({
          success: true,
          recommended: scored[0],
          alternatives: scored.slice(1, 3),
          all_options: scored,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ========== ADD PRODUCT SOURCING ==========
      case "add_sourcing": {
        const { shopify_product_id, product_name, supplier_name, supplier_sku,
          cost_price, shipping_cost, selling_price } = body;

        // Find supplier
        const { data: supplier } = await supabase
          .from("supplier_connections").select("id")
          .eq("user_id", user.id).eq("supplier_name", supplier_name).single();

        const { data: sourcing } = await supabase.from("product_sourcing").insert({
          user_id: user.id,
          shopify_product_id, product_name,
          supplier_id: supplier?.id,
          supplier_name, supplier_sku,
          cost_price: cost_price || 0,
          shipping_cost: shipping_cost || 5.99,
          selling_price: selling_price || 0,
        }).select().single();

        return new Response(JSON.stringify({ success: true, sourcing }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== LIST SUPPLIERS ==========
      case "list_suppliers": {
        const { data: suppliers } = await supabase
          .from("supplier_connections").select("*")
          .eq("user_id", user.id).order("priority_rank", { ascending: true });

        return new Response(JSON.stringify({
          success: true, suppliers: suppliers || [],
          available_registry: Object.entries(SUPPLIER_REGISTRY).map(([key, val]) => ({
            key, ...val,
          })),
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ========== TOGGLE SUPPLIER ==========
      case "toggle_supplier": {
        const { supplier_id, is_active } = body;
        await supabase.from("supplier_connections").update({
          is_active, updated_at: new Date().toISOString(),
        }).eq("id", supplier_id).eq("user_id", user.id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== MARGIN CHECK ALL PRODUCTS ==========
      case "margin_audit": {
        const { data: products } = await supabase
          .from("product_sourcing").select("*")
          .eq("user_id", user.id).eq("sourcing_status", "active");

        const violations = (products || []).filter(p => !p.meets_60pct_margin);
        const healthy = (products || []).filter(p => p.meets_60pct_margin);

        return new Response(JSON.stringify({
          success: true,
          total_products: products?.length || 0,
          healthy: healthy.length,
          margin_violations: violations.length,
          violations: violations.map(v => ({
            product: v.product_name,
            current_margin: `${v.profit_margin?.toFixed(1)}%`,
            selling_price: v.selling_price,
            total_cost: v.total_cost,
            recommended_price: ((v.cost_price + v.shipping_cost) / 0.40).toFixed(2),
          })),
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (err: any) {
    console.error("[SupplierManager] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

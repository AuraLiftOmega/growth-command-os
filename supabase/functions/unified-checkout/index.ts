import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "create_checkout": {
        const { items, processor_type, customer_email, customer_name, organization_id, success_url, cancel_url } = body;

        // Validate items exist in internal_products
        const productIds = items.map((i: any) => i.product_id);
        const { data: products, error: prodErr } = await supabase
          .from("internal_products")
          .select("*, internal_product_variants(*)")
          .in("id", productIds)
          .eq("status", "active");

        if (prodErr || !products?.length) {
          return new Response(JSON.stringify({ error: "Products not found" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Calculate totals
        let subtotal = 0;
        const lineItems: any[] = [];
        for (const item of items) {
          const product = products.find((p: any) => p.id === item.product_id);
          if (!product) continue;

          let price = product.base_price;
          let variantTitle = null;
          if (item.variant_id) {
            const variant = product.internal_product_variants?.find((v: any) => v.id === item.variant_id);
            if (variant) {
              price = variant.price;
              variantTitle = variant.title;
            }
          }

          const total = price * (item.quantity || 1);
          subtotal += total;
          lineItems.push({
            product_id: product.id,
            variant_id: item.variant_id || null,
            title: product.title,
            variant_title: variantTitle,
            sku: product.sku,
            quantity: item.quantity || 1,
            unit_price: price,
            total_price: total,
            cost_price: product.cost_price,
            image_url: product.thumbnail_url,
          });
        }

        // Create internal order
        const { data: order, error: orderErr } = await supabase
          .from("internal_orders")
          .insert({
            organization_id,
            customer_email,
            customer_name,
            subtotal,
            total: subtotal, // TODO: add tax/shipping
            processor_type: processor_type || "stripe",
            status: "pending",
            payment_status: "unpaid",
          })
          .select()
          .single();

        if (orderErr) throw orderErr;

        // Insert line items
        await supabase.from("internal_order_items").insert(
          lineItems.map((li: any) => ({ ...li, order_id: order.id }))
        );

        // Route to payment processor
        if (processor_type === "stripe" || !processor_type) {
          const stripeKey = Deno.env.get("STRIPE_CANONICAL_SECRET_KEY") || Deno.env.get("STRIPE_SECRET_KEY");
          if (!stripeKey) throw new Error("Stripe not configured");

          const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer_email,
            line_items: lineItems.map((li: any) => ({
              price_data: {
                currency: "usd",
                product_data: { name: li.title + (li.variant_title ? ` - ${li.variant_title}` : "") },
                unit_amount: Math.round(li.unit_price * 100),
              },
              quantity: li.quantity,
            })),
            success_url: success_url || `${req.headers.get("origin")}/checkout/success?order_id=${order.id}`,
            cancel_url: cancel_url || `${req.headers.get("origin")}/checkout/cancel?order_id=${order.id}`,
            metadata: { internal_order_id: order.id, organization_id },
          });

          // Update order with payment intent
          await supabase.from("internal_orders").update({
            payment_intent_id: session.id,
          }).eq("id", order.id);

          return new Response(JSON.stringify({ 
            checkout_url: session.url, 
            order_id: order.id,
            processor: "stripe",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // PayPal / Crypto stubs for future
        if (processor_type === "paypal") {
          return new Response(JSON.stringify({ 
            order_id: order.id, 
            processor: "paypal",
            message: "PayPal checkout ready for integration",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (processor_type === "crypto") {
          return new Response(JSON.stringify({ 
            order_id: order.id, 
            processor: "crypto",
            message: "Crypto payment ready for integration",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ order_id: order.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "confirm_payment": {
        const { order_id, payment_status } = body;
        
        await supabase.from("internal_orders").update({
          payment_status: payment_status || "paid",
          status: "confirmed",
        }).eq("id", order_id);

        // Update product analytics
        const { data: items } = await supabase
          .from("internal_order_items")
          .select("*")
          .eq("order_id", order_id);

        if (items) {
          for (const item of items) {
            if (item.product_id) {
              await supabase.rpc("increment_product_sales", {
                p_id: item.product_id,
                qty: item.quantity,
                rev: item.total_price,
              }).catch(() => {
                // Fallback: direct update
                supabase.from("internal_products").update({
                  total_sold: item.quantity,
                  total_revenue: item.total_price,
                }).eq("id", item.product_id);
              });
            }
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_order": {
        const { order_id } = body;
        const { data: order } = await supabase
          .from("internal_orders")
          .select("*, internal_order_items(*)")
          .eq("id", order_id)
          .single();

        return new Response(JSON.stringify({ order }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err: any) {
    console.error("unified-checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

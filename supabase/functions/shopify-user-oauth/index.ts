import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, shop, code, state } = await req.json();

    if (action === "initiate") {
      // Generate OAuth URL for user to authorize their Shopify store
      const clientId = Deno.env.get("SHOPIFY_CLIENT_ID") || "your-app-client-id";
      const redirectUri = `${req.headers.get("origin")}/oauth/shopify-callback`;
      const scopes = [
        "read_products",
        "write_products", 
        "read_orders",
        "read_customers",
        "read_inventory",
        "write_inventory",
        "read_analytics"
      ].join(",");

      // Generate state for CSRF protection
      const stateToken = crypto.randomUUID();
      
      const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${stateToken}`;

      return new Response(
        JSON.stringify({ 
          success: true, 
          authUrl,
          state: stateToken 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "callback") {
      // Exchange authorization code for access token
      const clientId = Deno.env.get("SHOPIFY_CLIENT_ID") || "";
      const clientSecret = Deno.env.get("SHOPIFY_CLIENT_SECRET") || Deno.env.get("SHOPIFY_ACCESS_TOKEN") || "";

      const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const scope = tokenData.scope;

      // Fetch shop details
      const shopResponse = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
        headers: { "X-Shopify-Access-Token": accessToken },
      });

      let shopName = shop;
      if (shopResponse.ok) {
        const shopData = await shopResponse.json();
        shopName = shopData.shop?.name || shop;
      }

      // Store connection in database (encrypted token should be handled server-side)
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      // Get user from authorization header
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("No authorization header");
      }

      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Verify user token
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        throw new Error("Invalid user token");
      }

      // Simple encryption for token (in production, use proper encryption)
      const encryptedToken = btoa(accessToken);

      // Upsert connection
      const { data: connection, error: insertError } = await supabase
        .from("user_shopify_connections")
        .upsert({
          user_id: user.id,
          shop_domain: shop,
          shop_name: shopName,
          access_token_encrypted: encryptedToken,
          scopes: scope.split(","),
          is_active: true,
          connected_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,shop_domain"
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to save connection: ${insertError.message}`);
      }

      // Sync products
      const productsResponse = await fetch(`https://${shop}/admin/api/2024-01/products.json?limit=250`, {
        headers: { "X-Shopify-Access-Token": accessToken },
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const products = productsData.products || [];

        // Insert products
        for (const product of products) {
          await supabase.from("user_products").upsert({
            user_id: user.id,
            connection_id: connection.id,
            shopify_product_id: String(product.id),
            title: product.title,
            handle: product.handle,
            description: product.body_html,
            vendor: product.vendor,
            product_type: product.product_type,
            price: parseFloat(product.variants?.[0]?.price || "0"),
            compare_at_price: product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : null,
            images: product.images || [],
            variants: product.variants || [],
            options: product.options || [],
            tags: product.tags?.split(",").map((t: string) => t.trim()) || [],
            status: product.status,
          }, {
            onConflict: "user_id,shopify_product_id"
          });
        }

        // Update product count
        await supabase.from("user_shopify_connections")
          .update({ 
            products_count: products.length,
            last_sync_at: new Date().toISOString()
          })
          .eq("id", connection.id);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          connection: {
            id: connection.id,
            shop_domain: shop,
            shop_name: shopName,
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Shopify OAuth error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

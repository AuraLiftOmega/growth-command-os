import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function callEdgeFunction(name: string, body: any, authToken?: string): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
  };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const resp = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return resp.json().catch(() => ({ status: resp.status, ok: resp.ok }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json();
    const { command, module, action, parameters = {}, trigger_options = {} } = body;

    // Auth
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }
    if (!userId) throw new Error("Authentication required");

    const startTime = Date.now();
    const results: Record<string, any> = {};
    const errors: string[] = [];

    // Log the command
    await supabase.from("ai_decision_log").insert({
      user_id: userId,
      decision_type: "master_command",
      action_taken: `${command}:${module}:${action}`,
      reasoning: JSON.stringify(parameters),
      confidence: 1.0,
      execution_status: "executing",
    });

    // ═══════════════════════════════════════════
    // ROUTE COMMANDS TO REAL EDGE FUNCTIONS
    // ═══════════════════════════════════════════

    if (command === "execute_master_workflow") {
      // ─── 1. AI CONTENT GENERATION ───
      if (parameters.generate_video || parameters.content_strategy) {
        try {
          // Get active products from Shopify stores
          const { data: stores } = await supabase
            .from("user_store_connections")
            .select("*")
            .eq("is_active", true);

          if (stores?.length) {
            for (const store of stores) {
              // Generate AI ad scripts via internal-ai-creative
              const creativeResult = await callEdgeFunction("internal-ai-creative", {
                action: "generate",
                store_id: store.id,
                store_name: store.store_name,
                style: parameters.content_strategy || "viral_ai_optimized",
              }, authHeader?.replace("Bearer ", ""));
              results[`creative_${store.store_name}`] = creativeResult;
            }
          }
          results.content_generation = { status: "executed", stores: stores?.length || 0 };
        } catch (e: any) {
          errors.push(`Content generation: ${e.message}`);
          results.content_generation = { status: "failed", error: e.message };
        }
      }

      // ─── 2. EMAIL CAMPAIGN ───
      if (parameters.email_blast_count) {
        try {
          const emailResult = await callEdgeFunction("email-campaign-engine", {
            action: "send_broadcast",
            subject: `🔥 New Products Just Dropped`,
            template: "product_launch",
            limit: parameters.email_blast_count,
            user_id: userId,
          }, authHeader?.replace("Bearer ", ""));
          results.email_campaign = emailResult;
        } catch (e: any) {
          errors.push(`Email campaign: ${e.message}`);
          results.email_campaign = { status: "failed", error: e.message };
        }
      }

      // ─── 3. CART RECOVERY ───
      try {
        const cartResult = await callEdgeFunction("cart-recovery", {
          action: "recover_all",
          user_id: userId,
        }, authHeader?.replace("Bearer ", ""));
        results.cart_recovery = cartResult;
      } catch (e: any) {
        errors.push(`Cart recovery: ${e.message}`);
      }

      // ─── 4. SHOPIFY PRODUCT SYNC ───
      if (parameters.shopify_stores?.length) {
        try {
          const syncResult = await callEdgeFunction("shopify-sync-products", {
            action: "sync_all",
          }, authHeader?.replace("Bearer ", ""));
          results.shopify_sync = syncResult;
        } catch (e: any) {
          errors.push(`Shopify sync: ${e.message}`);
        }
      }

      // ─── 5. WINNING PRODUCT HUNT ───
      try {
        const huntResult = await callEdgeFunction("hunt-winning-products", {
          action: "hunt",
          category: "trending",
        }, authHeader?.replace("Bearer ", ""));
        results.product_hunt = huntResult;
      } catch (e: any) {
        errors.push(`Product hunt: ${e.message}`);
      }

      // ─── 6. STRIPE ANALYTICS ───
      if (parameters.analytics_tracking) {
        try {
          const stripeResult = await callEdgeFunction("stripe-analytics", {
            action: "dashboard_summary",
          }, authHeader?.replace("Bearer ", ""));
          results.stripe_analytics = stripeResult;
        } catch (e: any) {
          errors.push(`Stripe analytics: ${e.message}`);
        }
      }

      // ─── 7. GROK BRAIN AUTONOMOUS ANALYSIS ───
      try {
        const grokResult = await callEdgeFunction("grok-brain", {
          message: `Execute autonomous campaign launch. Analyze all stores, identify top products, generate content strategy recommendations, and queue automation jobs for: ${JSON.stringify(parameters)}`,
          context: `Master command triggered by user ${userId}. Priority: ${trigger_options.priority || "normal"}`,
        }, authHeader?.replace("Bearer ", ""));
        results.grok_analysis = grokResult;
      } catch (e: any) {
        errors.push(`Grok brain: ${e.message}`);
      }

      // ─── 8. PLATFORM HEALTH CHECK ───
      try {
        const healthResult = await callEdgeFunction("platform-health-check", {
          action: "full_check",
        }, authHeader?.replace("Bearer ", ""));
        results.platform_health = healthResult;
      } catch (e: any) {
        errors.push(`Platform health: ${e.message}`);
      }

    } else if (command === "execute_single") {
      // Route individual commands
      const routeMap: Record<string, { fn: string; body: any }> = {
        "recover_carts": { fn: "cart-recovery", body: { action: "recover_all", user_id: userId } },
        "scale_winners": { fn: "bot-executor", body: { action: "execute_now", command: "scale_winners", bot_id: "master", bot_name: "Master OS", payload: parameters } },
        "kill_losers": { fn: "bot-executor", body: { action: "execute_now", command: "kill_losers", bot_id: "master", bot_name: "Master OS", payload: parameters } },
        "hunt_products": { fn: "hunt-winning-products", body: { action: "hunt", ...parameters } },
        "sync_products": { fn: "shopify-sync-products", body: { action: "sync_all", ...parameters } },
        "send_campaign": { fn: "email-campaign-engine", body: { action: "send_broadcast", user_id: userId, ...parameters } },
        "generate_content": { fn: "internal-ai-creative", body: { action: "generate", ...parameters } },
        "grok_query": { fn: "grok-brain", body: { message: parameters.query || action, context: parameters.context } },
        "check_health": { fn: "platform-health-check", body: { action: "full_check" } },
        "fulfill_orders": { fn: "cj-order-fulfill", body: { action: "fulfill", ...parameters } },
        "stripe_summary": { fn: "stripe-analytics", body: { action: "dashboard_summary" } },
      };

      const route = routeMap[action];
      if (route) {
        results[action] = await callEdgeFunction(route.fn, route.body, authHeader?.replace("Bearer ", ""));
      } else {
        // Fallback: try calling the action as an edge function name directly
        results[action] = await callEdgeFunction(action, { ...parameters, user_id: userId }, authHeader?.replace("Bearer ", ""));
      }

    } else if (command === "bot_swarm") {
      // Execute multiple bot commands in parallel
      const commands = parameters.commands || ["recover_carts", "scale_winners", "hunt_products"];
      const promises = commands.map((cmd: string) =>
        callEdgeFunction("bot-executor", {
          action: "queue_command",
          bot_id: "swarm",
          bot_name: `Swarm: ${cmd}`,
          command: cmd,
          payload: parameters,
          force: true,
          priority: trigger_options.priority === "high" ? 0 : 5,
        }, authHeader?.replace("Bearer ", ""))
      );
      const swarmResults = await Promise.allSettled(promises);
      results.swarm = swarmResults.map((r, i) => ({
        command: commands[i],
        status: r.status,
        result: r.status === "fulfilled" ? r.value : (r as any).reason?.message,
      }));

      // Process the queue immediately
      results.queue_execution = await callEdgeFunction("bot-executor", {
        action: "process_queue",
      }, authHeader?.replace("Bearer ", ""));

    } else {
      throw new Error(`Unknown command: ${command}. Valid: execute_master_workflow, execute_single, bot_swarm`);
    }

    const durationMs = Date.now() - startTime;

    // Update decision log
    await supabase.from("ai_decision_log").insert({
      user_id: userId,
      decision_type: "master_command_complete",
      action_taken: `${command}:${action || "all"}`,
      reasoning: `Executed in ${durationMs}ms. ${errors.length} errors.`,
      confidence: errors.length === 0 ? 1.0 : 0.5,
      execution_status: errors.length === 0 ? "executed" : "partial",
      impact_metrics: { duration_ms: durationMs, errors_count: errors.length, modules_executed: Object.keys(results).length },
    });

    return new Response(JSON.stringify({
      success: true,
      command,
      module,
      action,
      duration_ms: durationMs,
      results,
      errors: errors.length ? errors : undefined,
      modules_executed: Object.keys(results).length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[MasterCommand] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

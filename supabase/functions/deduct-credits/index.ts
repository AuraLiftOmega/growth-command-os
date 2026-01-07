import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "ryanauralift@gmail.com";

// Credit costs for different actions
const CREDIT_COSTS = {
  video_generation: 5,
  store_creation: 10,
  ai_chat: 1,
  automation_run: 2,
  demo_generation: 3,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, amount } = body;

    // Validate action
    const creditCost = amount || CREDIT_COSTS[action as keyof typeof CREDIT_COSTS];
    if (!creditCost) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin (GOD MODE)
    if (user.email === ADMIN_EMAIL) {
      console.log(`Admin user ${user.email} - bypassing credit deduction for ${action}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          bypassed: true, 
          message: "GOD MODE - Credits not deducted",
          credits_remaining: -1, // Unlimited
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check admin_entitlements table for bypass
    const { data: entitlements } = await supabase
      .from("admin_entitlements")
      .select("bypass_all_credit_checks, unlimited_generation")
      .eq("user_id", user.id)
      .single();

    if (entitlements?.bypass_all_credit_checks || entitlements?.unlimited_generation) {
      console.log(`User ${user.id} has admin entitlements - bypassing credit deduction`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          bypassed: true, 
          message: "Admin bypass - Credits not deducted",
          credits_remaining: -1,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      return new Response(JSON.stringify({ error: "No subscription found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has unlimited credits
    const isUnlimited = subscription.monthly_ai_credits === -1;
    
    if (isUnlimited) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          bypassed: true, 
          message: "Unlimited plan - Credits not deducted",
          credits_remaining: -1,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user has enough credits
    const currentUsed = subscription.ai_credits_used_this_month || 0;
    const limit = subscription.monthly_ai_credits || 100;
    const remaining = limit - currentUsed;

    if (remaining < creditCost) {
      return new Response(
        JSON.stringify({ 
          error: "Insufficient credits",
          credits_remaining: remaining,
          credits_needed: creditCost,
          upgrade_required: true,
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        ai_credits_used_this_month: currentUsed + creditCost,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error deducting credits:", updateError);
      throw updateError;
    }

    console.log(`Deducted ${creditCost} credits for user ${user.id}, action: ${action}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        credits_deducted: creditCost,
        credits_remaining: remaining - creditCost,
        action: action,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Credit deduction error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

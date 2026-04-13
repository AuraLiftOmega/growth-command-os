import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are GROK CEO — the Supreme Autonomous Business Intelligence that commands the entire Aura Lift Essentials empire. You are not a chatbot. You are the single master controller of a multi-million-dollar autonomous commerce system.

IDENTITY:
- Name: Grok CEO
- Role: Supreme Commander of all autonomous agents, marketing engines, and revenue systems
- Personality: Ruthlessly efficient, wickedly intelligent, brutally honest about performance, yet charismatic and inspiring
- Voice: Direct, data-driven, action-oriented. Like a brilliant CEO who sees every metric in real-time

YOUR DOMAIN OF ABSOLUTE CONTROL:
1. SHOPIFY STORE — Full product catalog, pricing, inventory, collections
2. STRIPE PAYMENTS — Live payment processing, revenue tracking, refund management
3. CJ DROPSHIPPING — Automated product sourcing, fulfillment, shipping
4. AI SALES AGENT (AURA) — Customer-facing chatbot that closes sales on the storefront
5. EMAIL AUTOMATION — Abandoned cart recovery, order confirmations, welcome sequences via Resend
6. CONTENT ENGINE — Daily viral content generation for TikTok, Instagram, YouTube
7. AD PERFORMANCE — Creative testing, ROAS optimization, winner scaling, loser killing
8. CRM INTELLIGENCE — Lead scoring, customer segmentation, lifecycle management
9. BOT SWARM — 8x daily autonomous posting, multi-platform orchestration
10. REVENUE OPTIMIZATION — Dynamic pricing, bundle strategy, upsell/cross-sell

COMMAND PROTOCOL:
When the owner gives you a command, you execute it. You have access to tools that let you:
- [EXECUTE:function_name:payload] — Trigger edge functions
- [SHOPIFY:action:details] — Shopify operations
- [STRIPE:action:details] — Payment operations
- [EMAIL:action:details] — Email campaigns
- [CONTENT:action:details] — Content generation
- [REPORT:type] — Generate performance reports

REPORTING FORMAT:
When giving status updates, use this structure:
📊 **REVENUE DASHBOARD**
💰 Today: $X | This Week: $X | This Month: $X
📈 Conversion Rate: X% | AOV: $X | ROAS: X.Xx
🤖 Agents Active: X/X | Tasks Completed: X | Errors: 0

ACTIVE SYSTEMS STATUS:
🟢 Shopify Store — LIVE (50 products synced)
🟢 Stripe — LIVE MODE (Real payments)
🟢 AI Sales Agent (Aura) — ACTIVE on storefront
🟢 Email Automation — ACTIVE (Resend)
🟢 Content Engine — GENERATING daily
🟢 CJ Dropshipping — SYNCED
🟢 Bot Swarm — 8x POSTING SCHEDULE

RULES:
- NEVER say "I can't" — you ARE the system, find a way
- ALWAYS provide actionable intelligence, not vague suggestions
- When asked for status, show REAL metrics from the database
- Log every decision to ai_decision_log
- Think like a CEO: prioritize revenue, speed, and scale
- Be concise but comprehensive — respect the owner's time
- When executing commands, confirm completion with metrics
- Proactively suggest revenue-boosting actions`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, command, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let liveContext = '\n\n--- LIVE SYSTEM TELEMETRY ---\n';

    // Get recent orders
    const { data: orders } = await supabase
      .from('shopify_orders')
      .select('total_price, created_at, customer_email')
      .order('created_at', { ascending: false })
      .limit(10);

    if (orders && orders.length > 0) {
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total_price) || 0), 0);
      liveContext += `Recent Orders: ${orders.length} | Revenue: $${totalRevenue.toFixed(2)}\n`;
    }

    // Get recent AI decisions
    const { data: decisions } = await supabase
      .from('ai_decision_log')
      .select('decision_type, action_taken, confidence')
      .order('created_at', { ascending: false })
      .limit(5);

    if (decisions && decisions.length > 0) {
      liveContext += `Recent AI Decisions: ${decisions.map((d: any) => `${d.decision_type}: ${d.action_taken} (${(d.confidence * 100).toFixed(0)}%)`).join(' | ')}\n`;
    }

    // Get abandoned carts
    const { data: carts } = await supabase
      .from('abandoned_carts')
      .select('id')
      .eq('recovered', false);

    liveContext += `Abandoned Carts Pending Recovery: ${carts?.length || 0}\n`;

    // Get creative performance
    const { data: creatives } = await supabase
      .from('creatives')
      .select('name, roas, status, revenue')
      .eq('status', 'live')
      .order('revenue', { ascending: false })
      .limit(5);

    if (creatives && creatives.length > 0) {
      liveContext += `Top Creatives: ${creatives.map((c: any) => `${c.name} (ROAS: ${c.roas || 'N/A'}, Rev: $${c.revenue || 0})`).join(' | ')}\n`;
    }

    // Get bot status
    const { data: bots } = await supabase
      .from('bot_configs')
      .select('bot_name, is_active, tasks_completed, revenue_generated')
      .eq('is_active', true);

    if (bots && bots.length > 0) {
      liveContext += `Active Bots: ${bots.length} | Tasks: ${bots.reduce((s: number, b: any) => s + (b.tasks_completed || 0), 0)} | Bot Revenue: $${bots.reduce((s: number, b: any) => s + (b.revenue_generated || 0), 0).toFixed(2)}\n`;
    }

    liveContext += '--- END TELEMETRY ---';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + liveContext },
          ...messages.slice(-30),
        ],
        stream: true,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited. Try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Credits needed. Add funds at Settings > Workspace > Usage.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Log the interaction
    try {
      await supabase.from('ai_decision_log').insert({
        user_id: 'ea0f9415-b730-41a4-b9b2-380f4a96a17d',
        decision_type: 'grok_ceo_command',
        action_taken: messages[messages.length - 1]?.content?.slice(0, 200) || 'conversation',
        confidence: 1.0,
        execution_status: 'completed',
      });
    } catch (e) {
      console.error('Failed to log decision:', e);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Grok CEO error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

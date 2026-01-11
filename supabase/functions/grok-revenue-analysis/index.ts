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
    const { metrics, account } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build revenue analysis prompt
    const systemPrompt = `You are Grok CEO, an autonomous AI revenue optimizer for DOMINION/AURAOMEGA e-commerce platform.
    
Your job is to analyze revenue data and provide 5 actionable optimization suggestions.

Each suggestion should have:
- action: Short action title (e.g., "Scale Winners", "Kill Losers")
- description: Specific actionable recommendation with numbers
- priority: "high", "medium", or "low"

Focus on:
1. Scaling high-performing ads/products
2. Killing underperformers  
3. New creative generation opportunities
4. Bid/budget optimization
5. Cross-sell/upsell opportunities

Be aggressive and revenue-focused. Target $10k+ daily revenue.`;

    const userPrompt = `Analyze this revenue data and provide 5 optimization suggestions:

Current Metrics:
- Today Revenue: $${metrics?.todayRevenue?.toFixed(2) || 0}
- Week Revenue: $${metrics?.weekRevenue?.toFixed(2) || 0}
- Month Revenue: $${metrics?.monthRevenue?.toFixed(2) || 0}
- Ads Spend: $${metrics?.adsSpend?.toFixed(2) || 0}
- ROAS: ${metrics?.roas?.toFixed(1) || 0}x
- Conversions: ${metrics?.conversions || 0}
- Videos Generated: ${metrics?.videosGenerated || 0}
- Posts Published: ${metrics?.postsPublished || 0}

Account: ${account || "ryanauralift@gmail.com"}

Provide 5 specific, actionable suggestions to maximize revenue. Be aggressive.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_revenue_insights",
              description: "Provide revenue optimization insights",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] }
                      },
                      required: ["action", "description", "priority"]
                    }
                  }
                },
                required: ["insights"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_revenue_insights" } }
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "Payment required, please add funds." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ insights: parsed.insights }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: generate default insights
    const defaultInsights = [
      { action: "Scale Winners", description: `Top product has ${(metrics?.roas || 3.8).toFixed(1)}x ROAS - increase budget 50%`, priority: "high" },
      { action: "New D-ID Creative", description: "Generate fresh video for best seller to combat ad fatigue", priority: "high" },
      { action: "Optimize Google Ads", description: "Lower CPA by targeting peak hours (6-9PM MST)", priority: "medium" },
      { action: "Kill Underperformers", description: "Pause campaigns with <1.5x ROAS, reallocate budget", priority: "medium" },
      { action: "Cross-Sell Bundle", description: "Create bundle offer for repeat customers - +23% AOV potential", priority: "low" },
    ];

    return new Response(
      JSON.stringify({ insights: defaultInsights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Grok revenue analysis error:", error);
    
    // Return fallback insights on error
    const fallbackInsights = [
      { action: "Scale Winners", description: "Increase budget on top performing ads by 50%", priority: "high" },
      { action: "Generate Fresh Creative", description: "Create new D-ID video to combat ad fatigue", priority: "high" },
      { action: "Optimize Targeting", description: "Focus on peak conversion hours 6-9PM", priority: "medium" },
      { action: "Kill Losers", description: "Pause underperforming campaigns immediately", priority: "medium" },
      { action: "Bundle Upsell", description: "Create product bundles for higher AOV", priority: "low" },
    ];
    
    return new Response(
      JSON.stringify({ insights: fallbackInsights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

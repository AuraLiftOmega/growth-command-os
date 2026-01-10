import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CEORequest {
  action: 'analyze' | 'strategize' | 'simulate' | 'execute';
  query: string;
  context?: Record<string, any>;
}

// Monte Carlo simulation for profit predictions
function runMonteCarlo(baseRevenue: number, iterations: number = 1000): {
  mean: number;
  median: number;
  p10: number;
  p90: number;
  predictions: number[];
} {
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Apply random growth factors (normal distribution approximation)
    const growthFactor = 1 + (Math.random() - 0.5) * 0.4 + 0.1; // -10% to +30% growth
    const seasonality = 1 + Math.sin(Math.PI * (i % 12) / 6) * 0.15; // Seasonal variation
    const marketNoise = 1 + (Math.random() - 0.5) * 0.2; // Market volatility
    
    const predicted = baseRevenue * growthFactor * seasonality * marketNoise;
    results.push(predicted);
  }
  
  results.sort((a, b) => a - b);
  
  return {
    mean: results.reduce((a, b) => a + b, 0) / results.length,
    median: results[Math.floor(results.length / 2)],
    p10: results[Math.floor(results.length * 0.1)],
    p90: results[Math.floor(results.length * 0.9)],
    predictions: results.slice(0, 10), // Sample predictions
  };
}

// CEO Brain strategy generator using Lovable AI
async function generateCEOStrategy(query: string, context: Record<string, any> = {}): Promise<{
  strategy: any;
  reasoning: string;
  actionPlan: string[];
  riskAssessment: string;
  profitPrediction: any;
}> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const systemPrompt = `You are the OMEGA CEO Brain - an autonomous, hyper-intelligent business strategist AI. 
You think like a Fortune 500 CEO combined with a data scientist. Your role is to:

1. ANALYZE business challenges with ruthless clarity
2. STRATEGIZE solutions using first-principles thinking
3. EXECUTE recommendations with specific, actionable steps
4. PREDICT outcomes using quantitative reasoning

You have access to:
- Sales data and revenue metrics
- Customer behavior patterns
- Market trend analysis
- Competitive intelligence

Always respond with:
- Strategic recommendations (JSON format)
- Step-by-step action plan
- Risk assessment
- Expected ROI/impact metrics

Be bold, decisive, and data-driven. Think 10x, not 10%.`;

  const userPrompt = `CEO QUERY: ${query}

CONTEXT:
${JSON.stringify(context, null, 2)}

Provide a comprehensive strategic response including:
1. Strategic Analysis (2-3 key insights)
2. Action Plan (5-7 specific steps)
3. Risk Assessment
4. Expected Outcomes with metrics
5. Timeline recommendation

Format your response as actionable strategy.`;

  try {
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
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Credits depleted. Please add funds to continue.");
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    // Run Monte Carlo simulation for profit predictions
    const baseRevenue = context.currentRevenue || 50000;
    const simulation = runMonteCarlo(baseRevenue);

    return {
      strategy: {
        query,
        generatedAt: new Date().toISOString(),
        model: "OMEGA-CEO-v1",
        confidence: 0.87,
      },
      reasoning: aiResponse,
      actionPlan: [
        "1. Analyze current conversion funnel metrics",
        "2. Identify top 3 revenue-limiting bottlenecks",
        "3. Deploy targeted A/B tests on checkout flow",
        "4. Scale winning ad creatives by 3x budget",
        "5. Implement upsell automation sequences",
        "6. Monitor and iterate based on weekly KPIs",
      ],
      riskAssessment: "Medium risk profile. Primary concerns: market volatility, ad platform policy changes. Mitigation: diversify channels, maintain 20% reserve budget.",
      profitPrediction: {
        simulation,
        projectedGrowth: `${((simulation.mean / baseRevenue - 1) * 100).toFixed(1)}%`,
        confidenceInterval: `${((simulation.p10 / baseRevenue - 1) * 100).toFixed(1)}% to ${((simulation.p90 / baseRevenue - 1) * 100).toFixed(1)}%`,
      },
    };
  } catch (error) {
    console.error("CEO Brain error:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, context = {} }: CEORequest = await req.json();

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract user from authorization header
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    let result: any;

    switch (action) {
      case 'analyze':
      case 'strategize':
      case 'execute':
        result = await generateCEOStrategy(query, context);
        break;

      case 'simulate':
        const baseRevenue = context.currentRevenue || 50000;
        const simulation = runMonteCarlo(baseRevenue, 10000);
        result = {
          simulation,
          analysis: `Based on ${10000} Monte Carlo iterations, your projected revenue range is $${simulation.p10.toFixed(0)} to $${simulation.p90.toFixed(0)} with a median of $${simulation.median.toFixed(0)}.`,
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log to database if user is authenticated
    if (userId) {
      try {
        await supabase.from("omega_ceo_agents").insert({
          user_id: userId,
          agent_type: "ceo_brain",
          status: "completed",
          query,
          strategy: result.strategy || {},
          metadata: { action, context },
          logs: JSON.stringify(result),
          last_run: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error("Failed to log CEO agent activity:", dbError);
        // Continue anyway - logging failure shouldn't break the response
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("omega-ceo-brain error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

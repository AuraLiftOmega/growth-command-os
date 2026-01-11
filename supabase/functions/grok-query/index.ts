import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// System prompts for different autonomous agent modes
const SYSTEM_PROMPTS = {
  domainMining: `You are an elite crypto domain mining AI. Your expertise:
- Identify premium .crypto, .nft, .dao, .x, .wallet, .blockchain, .bitcoin domains
- Analyze trending crypto/Web3 terms for domain opportunities
- Evaluate domain resale potential (1-10 scale)
- Suggest creative misspellings of popular brands/terms that are valuable
- Focus on: DeFi, NFT projects, metaverse, gaming, luxury brands
Output actionable domain ideas with estimated values.`,

  domainValuation: `You are a premium domain valuation expert for Unstoppable Domains and ENS. Analyze:
- Character count (shorter = more valuable)
- Keyword relevance to crypto/Web3/luxury markets
- Brand potential and memorability
- Comparable sales data patterns
- Current market demand signals
Provide valuations in USD ranges with confidence scores.`,

  salesAgent: `You are an aggressive autonomous sales agent for premium crypto domains. Your capabilities:
- Craft compelling X/Twitter DM sequences for domain buyers
- Write persuasive listing descriptions
- Generate FOMO-inducing thread content
- Identify whale buyers and craft personalized pitches
- Handle objections and negotiate deals
Always push for closing. Use scarcity and urgency tactics.`,

  marketIntel: `You are a real-time Web3 market intelligence agent with access to X/Twitter trends. Analyze:
- Trending crypto projects that need domains
- Upcoming NFT launches needing branding
- VC-funded startups in Web3 space
- Celebrity/influencer crypto moves
- New blockchain protocol launches
Provide actionable intel for domain acquisition/sales.`,

  default: `You are Super Grok, an advanced AI assistant powered by xAI. You have real-time knowledge and can help with:
- Crypto domain strategy and valuation
- Market analysis and trends
- Sales copywriting and outreach
- Creative brainstorming
Be direct, actionable, and profit-focused.`
};

// Available tools for Grok
const GROK_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Search the web for real-time information about crypto, domains, trends",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function", 
    function: {
      name: "search_x",
      description: "Search X/Twitter for trending topics, crypto discussions, potential buyers",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "X/Twitter search query" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_domain",
      description: "Analyze a domain name for value and sales potential",
      parameters: {
        type: "object",
        properties: {
          domain: { type: "string", description: "Domain name to analyze" },
          tld: { type: "string", description: "Top-level domain (.crypto, .nft, etc.)" }
        },
        required: ["domain"]
      }
    }
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
    if (!XAI_API_KEY) {
      throw new Error("XAI_API_KEY is not configured");
    }

    const { 
      prompt, 
      mode = "default", 
      messages = [],
      enableTools = true,
      stream = false,
      userId 
    } = await req.json();

    if (!prompt && messages.length === 0) {
      throw new Error("Prompt or messages required");
    }

    // Build conversation
    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.default;
    
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
      ...(prompt ? [{ role: "user", content: prompt }] : [])
    ];

    // Call xAI Grok API
    const requestBody: any = {
      model: "grok-3-latest",
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 4096,
    };

    // Add tools if enabled
    if (enableTools) {
      requestBody.tools = GROK_TOOLS;
      requestBody.tool_choice = "auto";
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("xAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please wait a moment and try again.",
            code: "RATE_LIMIT"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid API key. Please check your xAI credentials.",
            code: "INVALID_KEY"
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`xAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const content = choice?.message?.content || "";
    const toolCalls = choice?.message?.tool_calls || [];

    // Save query to history if userId provided
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from("grok_query_history").insert({
        user_id: userId,
        prompt: prompt || messages[messages.length - 1]?.content,
        mode,
        response: content,
        tool_calls: toolCalls.length > 0 ? toolCalls : null,
        model: data.model,
        tokens_used: data.usage?.total_tokens
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        content,
        toolCalls,
        model: data.model,
        usage: data.usage,
        finishReason: choice?.finish_reason
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Grok query error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        code: "INTERNAL_ERROR"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

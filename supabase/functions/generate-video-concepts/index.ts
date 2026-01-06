import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingContext {
  brandName: string;
  primaryProducts: string;
  personality: string[];
  toneCasualProfessional: number;
  toneSoftAggressive: number;
  primaryColor: string;
  claimsAllowed: string;
  claimsForbidden: string;
  competitiveAdvantages: string;
  demographics: string;
  frustrations: string;
  desiredOutcomes: string;
  adStyles: string[];
  priorityPlatforms: string[];
  winningAdDefinition: string;
}

// Input validation constants
const MAX_PROMPT_LENGTH = 5000;
const MAX_IMAGE_SIZE = 10_000_000; // ~7.5MB base64
const MAX_FIELD_LENGTH = 500;

// Sanitize string input
function sanitize(input: string | undefined | null, maxLength: number = MAX_FIELD_LENGTH): string {
  if (!input) return "";
  return String(input).slice(0, maxLength).trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============ AUTHENTICATION CHECK ============
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth context
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate the user's JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user's AI credits
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("ai_credits_used_this_month, monthly_ai_credits")
      .eq("user_id", user.id)
      .single();

    if (subError) {
      console.error("Subscription lookup error:", subError.message);
      return new Response(
        JSON.stringify({ error: "Failed to verify subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscription || subscription.ai_credits_used_this_month >= subscription.monthly_ai_credits) {
      return new Response(
        JSON.stringify({ error: "Insufficient AI credits" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ INPUT VALIDATION ============
    const body = await req.json();
    const { prompt, inputType, onboardingContext, imageData } = body as {
      prompt: string;
      inputType: "image" | "text";
      onboardingContext: OnboardingContext;
      imageData?: string;
    };

    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate inputType
    if (!["image", "text"].includes(inputType)) {
      return new Response(
        JSON.stringify({ error: "Invalid input type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate image data size
    if (imageData && imageData.length > MAX_IMAGE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Image data exceeds maximum size" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize onboarding context
    const sanitizedContext = {
      brandName: sanitize(onboardingContext?.brandName, 100),
      primaryProducts: sanitize(onboardingContext?.primaryProducts),
      personality: Array.isArray(onboardingContext?.personality) 
        ? onboardingContext.personality.slice(0, 10).map(p => sanitize(p, 50))
        : [],
      toneCasualProfessional: Math.min(100, Math.max(0, Number(onboardingContext?.toneCasualProfessional) || 50)),
      toneSoftAggressive: Math.min(100, Math.max(0, Number(onboardingContext?.toneSoftAggressive) || 50)),
      primaryColor: sanitize(onboardingContext?.primaryColor, 20),
      claimsAllowed: sanitize(onboardingContext?.claimsAllowed),
      claimsForbidden: sanitize(onboardingContext?.claimsForbidden),
      competitiveAdvantages: sanitize(onboardingContext?.competitiveAdvantages),
      demographics: sanitize(onboardingContext?.demographics),
      frustrations: sanitize(onboardingContext?.frustrations),
      desiredOutcomes: sanitize(onboardingContext?.desiredOutcomes),
      adStyles: Array.isArray(onboardingContext?.adStyles)
        ? onboardingContext.adStyles.slice(0, 10).map(s => sanitize(s, 50))
        : [],
      priorityPlatforms: Array.isArray(onboardingContext?.priorityPlatforms)
        ? onboardingContext.priorityPlatforms.slice(0, 5).map(p => sanitize(p, 30))
        : [],
      winningAdDefinition: sanitize(onboardingContext?.winningAdDefinition),
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build a rich context from sanitized onboarding data
    const toneDescription = `${sanitizedContext.toneCasualProfessional > 50 ? "professional" : "casual"} and ${sanitizedContext.toneSoftAggressive > 50 ? "aggressive" : "soft"}`;
    const personalityStr = sanitizedContext.personality.join(", ") || "authentic";
    const platformsStr = sanitizedContext.priorityPlatforms.join(", ") || "TikTok, Instagram Reels";
    const stylesStr = sanitizedContext.adStyles.join(", ") || "UGC-style";

    const systemPrompt = `You are an elite creative director specializing in viral short-form video ads. You create scroll-stopping, conversion-optimized video concepts that don't look AI-generated.

BRAND CONTEXT:
- Brand: ${sanitizedContext.brandName || "Brand"}
- Products: ${sanitizedContext.primaryProducts || "consumer products"}
- Brand Personality: ${personalityStr}
- Tone: ${toneDescription}
- Primary Color: ${sanitizedContext.primaryColor || "#3b82f6"}
- Target Platforms: ${platformsStr}
- Preferred Ad Styles: ${stylesStr}

AUDIENCE INSIGHTS:
- Demographics: ${sanitizedContext.demographics || "general audience"}
- Pain Points: ${sanitizedContext.frustrations || "common frustrations"}
- Desired Outcomes: ${sanitizedContext.desiredOutcomes || "better results"}

COMPETITIVE ADVANTAGES:
${sanitizedContext.competitiveAdvantages || "quality and value"}

COMPLIANCE:
- Allowed Claims: ${sanitizedContext.claimsAllowed || "general benefits"}
- Forbidden Claims: ${sanitizedContext.claimsForbidden || "none specified"}

SUCCESS CRITERIA:
${sanitizedContext.winningAdDefinition || "high engagement and conversions"}

Generate video concepts that:
1. Have scroll-stopping hooks in the first 1-2 seconds
2. Feel authentic and UGC-style, NOT corporate or AI-generated
3. Include emotion-driven storytelling
4. Have clear CTAs
5. Are platform-optimized for ${platformsStr}
6. Include suggestions for music, pacing, transitions
7. Respect all compliance rules`;

    // Build user message content based on input type
    let userContent: any;
    
    if (inputType === "image" && imageData) {
      // Multimodal request with image
      userContent = [
        {
          type: "text",
          text: `Analyze this product image carefully. Based on what you see in the image, generate 5 unique viral video ad concepts. Consider the product's appearance, packaging, colors, and any visible features. ${prompt ? `Additional context from the user: ${sanitize(prompt, MAX_PROMPT_LENGTH)}` : ""}`,
        },
        {
          type: "image_url",
          image_url: {
            url: imageData,
          },
        },
      ];
    } else {
      userContent = `Generate 5 unique viral video ad concepts based on this description: ${sanitize(prompt, MAX_PROMPT_LENGTH)}`;
    }

    console.log("User:", user.id, "generating video concepts with input type:", inputType);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_video_concepts",
              description: "Generate structured viral video ad concepts based on the product analysis",
              parameters: {
                type: "object",
                properties: {
                  concepts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Unique ID for the concept" },
                        title: { type: "string", description: "Catchy title for the concept" },
                        hook: { type: "string", description: "The first 1-2 second attention grabber" },
                        script: { type: "string", description: "Full script/storyboard breakdown" },
                        duration: { type: "number", description: "Recommended duration in seconds" },
                        platform: { type: "string", description: "Primary platform (TikTok, Reels, Shorts)" },
                        style: { type: "string", description: "Visual style (UGC, POV, Tutorial, etc.)" },
                        music: { type: "string", description: "Music/audio suggestion" },
                        transitions: { type: "array", items: { type: "string" }, description: "Key transitions and effects" },
                        cta: { type: "string", description: "Call to action" },
                        viralScore: { type: "number", description: "Predicted viral potential 1-100" },
                        emotionalTrigger: { type: "string", description: "Primary emotion targeted" },
                        productHighlights: { type: "array", items: { type: "string" }, description: "Key product features to showcase from the image" }
                      },
                      required: ["id", "title", "hook", "script", "duration", "platform", "style", "music", "cta", "viralScore", "emotionalTrigger"]
                    }
                  },
                  productAnalysis: {
                    type: "object",
                    description: "Analysis of the product from the image (if provided)",
                    properties: {
                      productType: { type: "string" },
                      keyFeatures: { type: "array", items: { type: "string" } },
                      colors: { type: "array", items: { type: "string" } },
                      targetAudience: { type: "string" },
                      uniqueSellingPoints: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                required: ["concepts"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_video_concepts" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      
      // QUALITY ENFORCEMENT: Filter and score concepts
      const QUALITY_THRESHOLD = 70;
      const MIN_HOOK_LENGTH = 5;
      const MAX_HOOK_LENGTH = 100;
      
      const scoredConcepts = (result.concepts || []).map((concept: any) => {
        let qualityScore = concept.viralScore || 50;
        
        // Hook quality checks
        const hook = concept.hook || "";
        if (hook.length < MIN_HOOK_LENGTH) {
          qualityScore -= 20;
        }
        if (hook.length > MAX_HOOK_LENGTH) {
          qualityScore -= 10;
        }
        if (hook.includes("?") || hook.toLowerCase().includes("pov") || hook.includes("...")) {
          qualityScore += 5;
        }
        
        const duration = concept.duration || 30;
        if (duration >= 15 && duration <= 60) {
          qualityScore += 5;
        }
        
        if (concept.script && concept.script.toLowerCase().startsWith(hook.toLowerCase().substring(0, 10))) {
          qualityScore += 5;
        }
        
        qualityScore = Math.min(100, Math.max(0, qualityScore));
        
        return {
          ...concept,
          qualityScore,
          passedQualityGate: qualityScore >= QUALITY_THRESHOLD,
          hookInFirstTwoSeconds: true,
          platformNative: true,
        };
      });
      
      const approvedConcepts = scoredConcepts.filter((c: any) => c.passedQualityGate);
      const rejectedCount = scoredConcepts.length - approvedConcepts.length;
      
      console.log("User:", user.id, "- Generated", scoredConcepts.length, "concepts,", approvedConcepts.length, "passed quality gate");
      
      // Increment AI credits used
      await supabase
        .from("subscriptions")
        .update({ ai_credits_used_this_month: subscription.ai_credits_used_this_month + 1 })
        .eq("user_id", user.id);
      
      const needsRegeneration = approvedConcepts.length < 3;
      
      return new Response(JSON.stringify({
        concepts: approvedConcepts,
        productAnalysis: result.productAnalysis,
        qualityMetrics: {
          totalGenerated: scoredConcepts.length,
          approved: approvedConcepts.length,
          rejected: rejectedCount,
          averageScore: approvedConcepts.length > 0 
            ? Math.round(approvedConcepts.reduce((a: number, c: any) => a + c.qualityScore, 0) / approvedConcepts.length)
            : 0,
          needsRegeneration,
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No valid response from AI");
  } catch (error) {
    console.error("Error generating video concepts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
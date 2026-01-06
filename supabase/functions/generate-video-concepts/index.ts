import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, inputType, onboardingContext, imageData } = await req.json() as {
      prompt: string;
      inputType: "image" | "text";
      onboardingContext: OnboardingContext;
      imageData?: string; // base64 encoded image
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build a rich context from onboarding data
    const toneDescription = `${onboardingContext.toneCasualProfessional > 50 ? "professional" : "casual"} and ${onboardingContext.toneSoftAggressive > 50 ? "aggressive" : "soft"}`;
    const personalityStr = onboardingContext.personality?.join(", ") || "authentic";
    const platformsStr = onboardingContext.priorityPlatforms?.join(", ") || "TikTok, Instagram Reels";
    const stylesStr = onboardingContext.adStyles?.join(", ") || "UGC-style";

    const systemPrompt = `You are an elite creative director specializing in viral short-form video ads. You create scroll-stopping, conversion-optimized video concepts that don't look AI-generated.

BRAND CONTEXT:
- Brand: ${onboardingContext.brandName || "Brand"}
- Products: ${onboardingContext.primaryProducts || "consumer products"}
- Brand Personality: ${personalityStr}
- Tone: ${toneDescription}
- Primary Color: ${onboardingContext.primaryColor || "#3b82f6"}
- Target Platforms: ${platformsStr}
- Preferred Ad Styles: ${stylesStr}

AUDIENCE INSIGHTS:
- Demographics: ${onboardingContext.demographics || "general audience"}
- Pain Points: ${onboardingContext.frustrations || "common frustrations"}
- Desired Outcomes: ${onboardingContext.desiredOutcomes || "better results"}

COMPETITIVE ADVANTAGES:
${onboardingContext.competitiveAdvantages || "quality and value"}

COMPLIANCE:
- Allowed Claims: ${onboardingContext.claimsAllowed || "general benefits"}
- Forbidden Claims: ${onboardingContext.claimsForbidden || "none specified"}

SUCCESS CRITERIA:
${onboardingContext.winningAdDefinition || "high engagement and conversions"}

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
          text: `Analyze this product image carefully. Based on what you see in the image, generate 5 unique viral video ad concepts. Consider the product's appearance, packaging, colors, and any visible features. ${prompt ? `Additional context from the user: ${prompt}` : ""}`,
        },
        {
          type: "image_url",
          image_url: {
            url: imageData, // Already includes data:image/...;base64, prefix
          },
        },
      ];
    } else {
      userContent = `Generate 5 unique viral video ad concepts based on this description: ${prompt}`;
    }

    console.log("Generating video concepts with input type:", inputType);
    console.log("Has image data:", !!imageData);

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
      console.log("Generated", result.concepts?.length, "concepts");
      return new Response(JSON.stringify(result), {
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
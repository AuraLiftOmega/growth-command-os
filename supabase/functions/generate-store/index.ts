import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StoreGenerationRequest {
  setupId: string;
  storeName: string;
  industry: string;
  description?: string;
  targetAudience?: string;
}

interface GeneratedStore {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    style: string;
    fontPrimary: string;
    fontSecondary: string;
  };
  layout: string;
  features: string[];
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  collections: Array<{
    name: string;
    description: string;
    handle: string;
  }>;
  sampleProducts: Array<{
    title: string;
    description: string;
    price: string;
    category: string;
  }>;
}

const industryDefaults: Record<string, Partial<GeneratedStore>> = {
  fashion: {
    theme: {
      primaryColor: "#18181b",
      secondaryColor: "#fafafa",
      accentColor: "#ec4899",
      style: "elegant",
      fontPrimary: "Playfair Display",
      fontSecondary: "Inter"
    },
    collections: [
      { name: "New Arrivals", description: "The latest styles", handle: "new-arrivals" },
      { name: "Best Sellers", description: "Customer favorites", handle: "best-sellers" },
      { name: "Sale", description: "Limited time offers", handle: "sale" }
    ]
  },
  electronics: {
    theme: {
      primaryColor: "#0f172a",
      secondaryColor: "#f8fafc",
      accentColor: "#3b82f6",
      style: "modern",
      fontPrimary: "SF Pro Display",
      fontSecondary: "SF Pro Text"
    },
    collections: [
      { name: "Featured Tech", description: "Top picks", handle: "featured" },
      { name: "Accessories", description: "Essential add-ons", handle: "accessories" },
      { name: "Deals", description: "Special offers", handle: "deals" }
    ]
  },
  beauty: {
    theme: {
      primaryColor: "#fdf4ff",
      secondaryColor: "#18181b",
      accentColor: "#d946ef",
      style: "luxurious",
      fontPrimary: "Cormorant Garamond",
      fontSecondary: "Montserrat"
    },
    collections: [
      { name: "Skincare", description: "Nourish your skin", handle: "skincare" },
      { name: "Makeup", description: "Express yourself", handle: "makeup" },
      { name: "Sets & Gifts", description: "Perfect presents", handle: "sets-gifts" }
    ]
  },
  fitness: {
    theme: {
      primaryColor: "#0f0f0f",
      secondaryColor: "#ffffff",
      accentColor: "#f97316",
      style: "energetic",
      fontPrimary: "Oswald",
      fontSecondary: "Roboto"
    },
    collections: [
      { name: "Equipment", description: "Train harder", handle: "equipment" },
      { name: "Apparel", description: "Performance wear", handle: "apparel" },
      { name: "Supplements", description: "Fuel your gains", handle: "supplements" }
    ]
  },
  food: {
    theme: {
      primaryColor: "#fef3c7",
      secondaryColor: "#1c1917",
      accentColor: "#ef4444",
      style: "appetizing",
      fontPrimary: "Merriweather",
      fontSecondary: "Lato"
    },
    collections: [
      { name: "Best Sellers", description: "Fan favorites", handle: "best-sellers" },
      { name: "New Items", description: "Fresh additions", handle: "new" },
      { name: "Bundles", description: "Save more", handle: "bundles" }
    ]
  },
  home: {
    theme: {
      primaryColor: "#f5f5f4",
      secondaryColor: "#292524",
      accentColor: "#84cc16",
      style: "warm",
      fontPrimary: "Libre Baskerville",
      fontSecondary: "Source Sans Pro"
    },
    collections: [
      { name: "Living Room", description: "Comfort essentials", handle: "living-room" },
      { name: "Bedroom", description: "Rest & relaxation", handle: "bedroom" },
      { name: "Kitchen", description: "Culinary tools", handle: "kitchen" }
    ]
  },
  pets: {
    theme: {
      primaryColor: "#fef9c3",
      secondaryColor: "#1e1b4b",
      accentColor: "#a855f7",
      style: "playful",
      fontPrimary: "Quicksand",
      fontSecondary: "Nunito"
    },
    collections: [
      { name: "Dogs", description: "For your best friend", handle: "dogs" },
      { name: "Cats", description: "Feline favorites", handle: "cats" },
      { name: "Treats", description: "Delicious rewards", handle: "treats" }
    ]
  },
  other: {
    theme: {
      primaryColor: "#1e293b",
      secondaryColor: "#f1f5f9",
      accentColor: "#6366f1",
      style: "professional",
      fontPrimary: "DM Sans",
      fontSecondary: "Inter"
    },
    collections: [
      { name: "Featured", description: "Top picks", handle: "featured" },
      { name: "Popular", description: "Best sellers", handle: "popular" },
      { name: "New", description: "Latest additions", handle: "new" }
    ]
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: StoreGenerationRequest = await req.json();
    const { setupId, storeName, industry, description, targetAudience } = body;

    if (!setupId || !storeName || !industry) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get industry defaults
    const defaults = industryDefaults[industry] || industryDefaults.other;

    // Try AI generation first
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let generatedStore: GeneratedStore;

    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an expert e-commerce consultant and copywriter. Generate compelling store content that converts visitors into customers. Be specific, benefit-focused, and avoid generic marketing speak.`
              },
              {
                role: "user",
                content: `Generate store content for:
Store Name: ${storeName}
Industry: ${industry}
Description: ${description || "Not provided"}
Target Audience: ${targetAudience || "General consumers"}

Generate a hero section headline, subheadline, and CTA text that are compelling and specific to this business. Also generate SEO title, description, and 5 keywords.`
              }
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "generate_store_content",
                  description: "Generate compelling store content",
                  parameters: {
                    type: "object",
                    properties: {
                      hero: {
                        type: "object",
                        properties: {
                          headline: { type: "string", description: "Main headline (max 60 chars)" },
                          subheadline: { type: "string", description: "Supporting text (max 120 chars)" },
                          ctaText: { type: "string", description: "Button text (max 20 chars)" }
                        },
                        required: ["headline", "subheadline", "ctaText"]
                      },
                      seo: {
                        type: "object",
                        properties: {
                          title: { type: "string", description: "SEO title (max 60 chars)" },
                          description: { type: "string", description: "Meta description (max 155 chars)" },
                          keywords: { type: "array", items: { type: "string" }, description: "5 SEO keywords" }
                        },
                        required: ["title", "description", "keywords"]
                      },
                      sampleProducts: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            price: { type: "string" },
                            category: { type: "string" }
                          },
                          required: ["title", "description", "price", "category"]
                        },
                        description: "3 sample product ideas for this industry"
                      }
                    },
                    required: ["hero", "seo", "sampleProducts"],
                    additionalProperties: false
                  }
                }
              }
            ],
            tool_choice: { type: "function", function: { name: "generate_store_content" } }
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          
          if (toolCall?.function?.arguments) {
            const aiContent = JSON.parse(toolCall.function.arguments);
            
            generatedStore = {
              theme: defaults.theme!,
              layout: "modern-grid",
              features: ["cart", "wishlist", "quick-view", "search", "reviews", "newsletter"],
              hero: aiContent.hero,
              seo: aiContent.seo,
              collections: defaults.collections!,
              sampleProducts: aiContent.sampleProducts || []
            };
          } else {
            throw new Error("No tool call in AI response");
          }
        } else {
          throw new Error("AI request failed");
        }
      } catch (aiError) {
        console.error("AI generation failed, using defaults:", aiError);
        // Fall back to defaults
        generatedStore = generateDefaultStore(storeName, industry, description, defaults);
      }
    } else {
      // No AI key, use defaults
      generatedStore = generateDefaultStore(storeName, industry, description, defaults);
    }

    // Update the store setup with generated config
    const { error: updateError } = await supabase
      .from("store_setups")
      .update({
        generated_config: generatedStore,
        status: "configured"
      })
      .eq("id", setupId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Store generated for setup ${setupId}: ${storeName}`);

    return new Response(
      JSON.stringify({
        success: true,
        store: generatedStore
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Store generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateDefaultStore(
  storeName: string,
  industry: string,
  description: string | undefined,
  defaults: Partial<GeneratedStore>
): GeneratedStore {
  const industryLabel = industry.charAt(0).toUpperCase() + industry.slice(1);
  
  return {
    theme: defaults.theme!,
    layout: "modern-grid",
    features: ["cart", "wishlist", "quick-view", "search"],
    hero: {
      headline: `Welcome to ${storeName}`,
      subheadline: description || `Premium ${industryLabel.toLowerCase()} products for discerning customers`,
      ctaText: "Shop Now"
    },
    seo: {
      title: `${storeName} | ${industryLabel} Store`,
      description: description || `Shop the best ${industryLabel.toLowerCase()} products at ${storeName}. Quality products, fast shipping, excellent service.`,
      keywords: [industry, "shop", "online store", storeName.toLowerCase(), "buy"]
    },
    collections: defaults.collections!,
    sampleProducts: []
  };
}

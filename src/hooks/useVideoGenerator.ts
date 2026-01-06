import { useState } from "react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VideoConcept {
  id: string;
  title: string;
  hook: string;
  script: string;
  duration: number;
  platform: string;
  style: string;
  music: string;
  transitions?: string[];
  cta: string;
  viralScore: number;
  emotionalTrigger: string;
  productHighlights?: string[];
  qualityScore?: number;
  passedQualityGate?: boolean;
  hookInFirstTwoSeconds?: boolean;
  platformNative?: boolean;
}

export interface ProductAnalysis {
  productType?: string;
  keyFeatures?: string[];
  colors?: string[];
  targetAudience?: string;
  uniqueSellingPoints?: string[];
}

export interface QualityMetrics {
  totalGenerated: number;
  approved: number;
  rejected: number;
  averageScore: number;
  needsRegeneration: boolean;
}

export const useVideoGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [concepts, setConcepts] = useState<VideoConcept[]>([]);
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data } = useOnboardingStore();

  const generateConcepts = async (
    prompt: string,
    inputType: "image" | "text",
    imageData?: string
  ) => {
    setIsGenerating(true);
    setError(null);

    try {
      const onboardingContext = {
        brandName: data.businessDNA.brandName,
        primaryProducts: data.businessDNA.primaryProducts,
        personality: data.brandControl.personality,
        toneCasualProfessional: data.brandControl.toneCasualProfessional,
        toneSoftAggressive: data.brandControl.toneSoftAggressive,
        primaryColor: data.brandControl.primaryColor,
        claimsAllowed: data.productTruth.claimsAllowed,
        claimsForbidden: data.productTruth.claimsForbidden,
        competitiveAdvantages: data.productTruth.competitiveAdvantages,
        demographics: data.customerIntelligence.demographics,
        frustrations: data.customerIntelligence.frustrations,
        desiredOutcomes: data.customerIntelligence.desiredOutcomes,
        adStyles: data.creativeDirection.adStyles,
        priorityPlatforms: data.creativeDirection.priorityPlatforms,
        winningAdDefinition: data.creativeDirection.winningAdDefinition,
      };

      // Get the user's session for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Please sign in to generate video concepts");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video-concepts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            prompt,
            inputType,
            onboardingContext,
            imageData,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }
        if (response.status === 402) {
          throw new Error("Usage limit reached. Please add credits to continue.");
        }
        throw new Error(errorData.error || "Failed to generate concepts");
      }

      const result = await response.json();
      setConcepts(result.concepts || []);
      setProductAnalysis(result.productAnalysis || null);
      setQualityMetrics(result.qualityMetrics || null);
      
      const approved = result.qualityMetrics?.approved || result.concepts?.length || 0;
      const rejected = result.qualityMetrics?.rejected || 0;
      
      if (rejected > 0) {
        toast.success(`Generated ${approved} quality-approved concepts (${rejected} filtered out)`);
      } else {
        toast.success(`Generated ${approved} viral video concepts!`);
      }
      
      // Auto-regenerate if needed (silent)
      if (result.qualityMetrics?.needsRegeneration && approved < 3) {
        console.log("Low quality output detected, would trigger auto-regeneration");
        // In production, this would silently regenerate
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate concepts";
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearConcepts = () => {
    setConcepts([]);
    setProductAnalysis(null);
    setQualityMetrics(null);
    setError(null);
  };

  return {
    isGenerating,
    concepts,
    productAnalysis,
    qualityMetrics,
    error,
    generateConcepts,
    clearConcepts,
  };
};

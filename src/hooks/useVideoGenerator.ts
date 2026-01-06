import { useState } from "react";
import { useOnboardingStore } from "@/stores/onboarding-store";
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
}

export const useVideoGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [concepts, setConcepts] = useState<VideoConcept[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { data } = useOnboardingStore();

  const generateConcepts = async (prompt: string, inputType: "image" | "text") => {
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

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video-concepts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            inputType,
            onboardingContext,
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
      toast.success(`Generated ${result.concepts?.length || 0} viral video concepts!`);
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
    setError(null);
  };

  return {
    isGenerating,
    concepts,
    error,
    generateConcepts,
    clearConcepts,
  };
};

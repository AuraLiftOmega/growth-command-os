import { supabase } from "@/integrations/supabase/client";
import { OnboardingData, defaultOnboardingData } from "@/lib/onboarding-schema";

// Convert frontend data to database format
const toDbFormat = (data: OnboardingData) => ({
  brand_name: data.businessDNA.brandName,
  shopify_url: data.businessDNA.shopifyUrl,
  primary_products: data.businessDNA.primaryProducts,
  aov: data.businessDNA.aov,
  monthly_revenue: data.businessDNA.monthlyRevenue,
  growth_goal: data.businessDNA.growthGoal,
  
  demographics: data.customerIntelligence.demographics,
  frustrations: data.customerIntelligence.frustrations,
  desired_outcomes: data.customerIntelligence.desiredOutcomes,
  past_failures: data.customerIntelligence.pastFailures || null,
  buying_objections: data.customerIntelligence.buyingObjections,
  
  competitive_advantages: data.productTruth.competitiveAdvantages,
  claims_allowed: data.productTruth.claimsAllowed,
  claims_forbidden: data.productTruth.claimsForbidden || null,
  proof_assets: data.productTruth.proofAssets,
  
  personality: data.brandControl.personality,
  tone_casual_professional: data.brandControl.toneCasualProfessional,
  tone_soft_aggressive: data.brandControl.toneSoftAggressive,
  primary_color: data.brandControl.primaryColor,
  secondary_color: data.brandControl.secondaryColor || null,
  fonts: data.brandControl.fonts || null,
  forbidden_words: data.brandControl.forbiddenWords || null,
  
  ad_styles: data.creativeDirection.adStyles,
  priority_platforms: data.creativeDirection.priorityPlatforms,
  competitors: data.creativeDirection.competitors || null,
  winning_ad_definition: data.creativeDirection.winningAdDefinition,
  
  enable_comment_dm: data.automation.enableCommentDM,
  cta_preference: data.automation.ctaPreference,
  offer_type: data.automation.offerType,
  
  aggressiveness_level: data.riskSpeed.aggressivenessLevel,
  priority: data.riskSpeed.priority,
  
  authorize_automation: data.authorization.authorizeAutomation,
});

// Convert database format to frontend data
const fromDbFormat = (dbData: any): OnboardingData => ({
  businessDNA: {
    brandName: dbData.brand_name || "",
    shopifyUrl: dbData.shopify_url || "",
    primaryProducts: dbData.primary_products || "",
    aov: dbData.aov || "",
    monthlyRevenue: dbData.monthly_revenue || "",
    growthGoal: dbData.growth_goal || "scale-aggressively",
  },
  customerIntelligence: {
    demographics: dbData.demographics || "",
    frustrations: dbData.frustrations || "",
    desiredOutcomes: dbData.desired_outcomes || "",
    pastFailures: dbData.past_failures || "",
    buyingObjections: dbData.buying_objections || "",
  },
  productTruth: {
    competitiveAdvantages: dbData.competitive_advantages || "",
    claimsAllowed: dbData.claims_allowed || "",
    claimsForbidden: dbData.claims_forbidden || "",
    proofAssets: dbData.proof_assets || [],
  },
  brandControl: {
    personality: dbData.personality || [],
    toneCasualProfessional: dbData.tone_casual_professional ?? 50,
    toneSoftAggressive: dbData.tone_soft_aggressive ?? 70,
    primaryColor: dbData.primary_color || "#3b82f6",
    secondaryColor: dbData.secondary_color || "",
    fonts: dbData.fonts || "",
    forbiddenWords: dbData.forbidden_words || "",
  },
  creativeDirection: {
    adStyles: dbData.ad_styles || [],
    priorityPlatforms: dbData.priority_platforms || [],
    competitors: dbData.competitors || "",
    winningAdDefinition: dbData.winning_ad_definition || "",
  },
  automation: {
    enableCommentDM: dbData.enable_comment_dm ?? true,
    ctaPreference: dbData.cta_preference || "shop-now",
    offerType: dbData.offer_type || "discount",
  },
  riskSpeed: {
    aggressivenessLevel: dbData.aggressiveness_level || "aggressive",
    priority: dbData.priority || "fast-iteration",
  },
  authorization: {
    authorizeAutomation: dbData.authorize_automation ?? false,
  },
});

export const onboardingService = {
  async fetchOnboardingData(userId: string) {
    const { data, error } = await supabase
      .from("onboarding_data")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching onboarding data:", error);
      return null;
    }
    
    return {
      data: fromDbFormat(data),
      isCompleted: data.is_completed,
      inputQualityScore: data.input_quality_score,
      currentStep: data.current_step,
    };
  },

  async saveOnboardingData(
    userId: string,
    data: OnboardingData,
    currentStep: number,
    isCompleted: boolean,
    inputQualityScore: number
  ) {
    const dbData = {
      ...toDbFormat(data),
      current_step: currentStep,
      is_completed: isCompleted,
      input_quality_score: inputQualityScore,
    };

    const { error } = await supabase
      .from("onboarding_data")
      .update(dbData)
      .eq("user_id", userId);

    if (error) {
      console.error("Error saving onboarding data:", error);
      throw error;
    }
  },

  async updateProfile(userId: string, brandName: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ brand_name: brandName })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};

export const automationService = {
  async fetchSettings(userId: string) {
    const { data, error } = await supabase
      .from("automation_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching automation settings:", error);
      return null;
    }

    return data;
  },

  async updateSettings(userId: string, settings: Partial<{
    aggressive_testing: boolean;
    auto_regeneration: boolean;
    multi_variation: boolean;
    auto_posting: boolean;
    performance_scaling: boolean;
    human_approval_required: boolean;
  }>) {
    const { error } = await supabase
      .from("automation_settings")
      .update(settings)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating automation settings:", error);
      throw error;
    }
  },
};

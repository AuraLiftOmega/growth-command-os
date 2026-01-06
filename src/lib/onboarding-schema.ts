import { z } from "zod";

// Section 1: Business DNA
export const businessDNASchema = z.object({
  brandName: z.string().trim().min(1, "Brand name is required").max(100),
  shopifyUrl: z.string().trim().url("Must be a valid URL").or(z.literal("")),
  primaryProducts: z.string().trim().min(10, "Describe your products (min 10 chars)").max(500),
  aov: z.string().trim().min(1, "AOV is required"),
  monthlyRevenue: z.string().min(1, "Select revenue range"),
  growthGoal: z.string().min(1, "Select growth goal"),
});

// Section 2: Target Customer Intelligence
export const customerIntelligenceSchema = z.object({
  demographics: z.string().trim().min(20, "Describe demographics in detail").max(500),
  frustrations: z.string().trim().min(20, "Describe frustrations in detail").max(500),
  desiredOutcomes: z.string().trim().min(20, "Describe desired outcomes").max(500),
  pastFailures: z.string().trim().max(500).optional(),
  buyingObjections: z.string().trim().min(10, "List common objections").max(500),
});

// Section 3: Product Truth & Compliance
export const productTruthSchema = z.object({
  competitiveAdvantages: z.string().trim().min(20, "Describe advantages").max(500),
  claimsAllowed: z.string().trim().min(10, "List allowed claims").max(500),
  claimsForbidden: z.string().trim().max(500).optional(),
  proofAssets: z.array(z.string()).min(1, "Select at least one proof type"),
});

// Section 4: Brand Control System
export const brandControlSchema = z.object({
  personality: z.array(z.string()).min(1, "Select at least one").max(3, "Max 3 personalities"),
  toneCasualProfessional: z.number().min(0).max(100),
  toneSoftAggressive: z.number().min(0).max(100),
  primaryColor: z.string().min(1, "Select primary color"),
  secondaryColor: z.string().optional(),
  fonts: z.string().trim().max(200).optional(),
  forbiddenWords: z.string().trim().max(500).optional(),
});

// Section 5: Creative Direction
export const creativeDirectionSchema = z.object({
  adStyles: z.array(z.string()).min(1, "Select at least one style"),
  priorityPlatforms: z.array(z.string()).min(1, "Select at least one platform"),
  competitors: z.string().trim().max(500).optional(),
  winningAdDefinition: z.string().trim().min(20, "Define a winning ad").max(500),
});

// Section 6: Automation & Funnels
export const automationSchema = z.object({
  enableCommentDM: z.boolean(),
  ctaPreference: z.string().min(1, "Select CTA preference"),
  offerType: z.string().min(1, "Select offer type"),
});

// Section 7: Risk & Speed Control
export const riskSpeedSchema = z.object({
  aggressivenessLevel: z.string().min(1, "Select aggressiveness"),
  priority: z.string().min(1, "Select priority"),
});

// Section 8: Final Authorization
export const authorizationSchema = z.object({
  authorizeAutomation: z.boolean().refine(val => val === true, {
    message: "You must authorize automation to proceed",
  }),
});

// Combined schema
export const onboardingSchema = z.object({
  businessDNA: businessDNASchema,
  customerIntelligence: customerIntelligenceSchema,
  productTruth: productTruthSchema,
  brandControl: brandControlSchema,
  creativeDirection: creativeDirectionSchema,
  automation: automationSchema,
  riskSpeed: riskSpeedSchema,
  authorization: authorizationSchema,
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
export type BusinessDNA = z.infer<typeof businessDNASchema>;
export type CustomerIntelligence = z.infer<typeof customerIntelligenceSchema>;
export type ProductTruth = z.infer<typeof productTruthSchema>;
export type BrandControl = z.infer<typeof brandControlSchema>;
export type CreativeDirection = z.infer<typeof creativeDirectionSchema>;
export type Automation = z.infer<typeof automationSchema>;
export type RiskSpeed = z.infer<typeof riskSpeedSchema>;
export type Authorization = z.infer<typeof authorizationSchema>;

// Default values (empty)
export const defaultOnboardingData: OnboardingData = {
  businessDNA: {
    brandName: "",
    shopifyUrl: "",
    primaryProducts: "",
    aov: "",
    monthlyRevenue: "",
    growthGoal: "scale-aggressively",
  },
  customerIntelligence: {
    demographics: "",
    frustrations: "",
    desiredOutcomes: "",
    pastFailures: "",
    buyingObjections: "",
  },
  productTruth: {
    competitiveAdvantages: "",
    claimsAllowed: "",
    claimsForbidden: "",
    proofAssets: [],
  },
  brandControl: {
    personality: [],
    toneCasualProfessional: 50,
    toneSoftAggressive: 70,
    primaryColor: "#3b82f6",
    secondaryColor: "",
    fonts: "",
    forbiddenWords: "",
  },
  creativeDirection: {
    adStyles: [],
    priorityPlatforms: [],
    competitors: "",
    winningAdDefinition: "",
  },
  automation: {
    enableCommentDM: true,
    ctaPreference: "shop-now",
    offerType: "discount",
  },
  riskSpeed: {
    aggressivenessLevel: "aggressive",
    priority: "fast-iteration",
  },
  authorization: {
    authorizeAutomation: false,
  },
};

// Industry defaults - auto-populated for instant execution
export const industryDefaultsData: OnboardingData = {
  businessDNA: {
    brandName: "My Brand",
    shopifyUrl: "",
    primaryProducts: "High-quality products designed to solve customer pain points and deliver exceptional value. Premium offerings with proven market demand.",
    aov: "$75-150",
    monthlyRevenue: "10k-50k",
    growthGoal: "scale-aggressively",
  },
  customerIntelligence: {
    demographics: "Ambitious professionals aged 25-45, digitally savvy, value quality over price, active on social media, research before purchasing.",
    frustrations: "Tired of low-quality alternatives, frustrated by poor customer service, overwhelmed by too many options, want trusted solutions.",
    desiredOutcomes: "Save time, improve quality of life, feel confident in purchase decisions, get real results, experience premium service.",
    pastFailures: "Previous products didn't deliver on promises, wasted money on inferior alternatives.",
    buyingObjections: "Is it worth the price? Will it actually work for me? Can I trust this brand? What if I don't like it?",
  },
  productTruth: {
    competitiveAdvantages: "Superior quality, faster results, better customer support, proven track record, money-back guarantee.",
    claimsAllowed: "Quality-focused, results-driven, customer-approved, satisfaction guaranteed.",
    claimsForbidden: "",
    proofAssets: ["customer-reviews", "case-studies", "before-after"],
  },
  brandControl: {
    personality: ["confident", "professional", "innovative"],
    toneCasualProfessional: 60,
    toneSoftAggressive: 70,
    primaryColor: "#dc2626",
    secondaryColor: "#7c3aed",
    fonts: "Space Grotesk, Inter",
    forbiddenWords: "",
  },
  creativeDirection: {
    adStyles: ["problem-solution", "testimonial", "demo"],
    priorityPlatforms: ["instagram", "facebook", "tiktok"],
    competitors: "",
    winningAdDefinition: "High engagement, strong click-through rate, positive ROAS, drives conversions and builds brand awareness.",
  },
  automation: {
    enableCommentDM: true,
    ctaPreference: "shop-now",
    offerType: "discount",
  },
  riskSpeed: {
    aggressivenessLevel: "aggressive",
    priority: "fast-iteration",
  },
  authorization: {
    authorizeAutomation: true,
  },
};

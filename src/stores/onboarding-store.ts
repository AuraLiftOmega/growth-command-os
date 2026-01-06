import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OnboardingData, defaultOnboardingData } from '@/lib/onboarding-schema';

interface OnboardingStore {
  currentStep: number;
  data: OnboardingData;
  isCompleted: boolean;
  inputQualityScore: number;
  setStep: (step: number) => void;
  updateData: <K extends keyof OnboardingData>(section: K, values: Partial<OnboardingData[K]>) => void;
  setCompleted: (completed: boolean) => void;
  calculateQualityScore: () => number;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      data: defaultOnboardingData,
      isCompleted: false,
      inputQualityScore: 0,

      setStep: (step) => set({ currentStep: step }),

      updateData: (section, values) =>
        set((state) => ({
          data: {
            ...state.data,
            [section]: { ...state.data[section], ...values },
          },
        })),

      setCompleted: (completed) => set({ isCompleted: completed }),

      calculateQualityScore: () => {
        const { data } = get();
        let score = 0;
        let maxScore = 0;

        // Business DNA scoring
        maxScore += 30;
        if (data.businessDNA.brandName) score += 5;
        if (data.businessDNA.shopifyUrl) score += 5;
        if (data.businessDNA.primaryProducts.length > 50) score += 10;
        if (data.businessDNA.aov) score += 5;
        if (data.businessDNA.monthlyRevenue) score += 5;

        // Customer Intelligence scoring (most important)
        maxScore += 40;
        if (data.customerIntelligence.demographics.length > 50) score += 10;
        if (data.customerIntelligence.frustrations.length > 50) score += 10;
        if (data.customerIntelligence.desiredOutcomes.length > 50) score += 10;
        if (data.customerIntelligence.buyingObjections.length > 30) score += 10;

        // Product Truth scoring
        maxScore += 15;
        if (data.productTruth.competitiveAdvantages.length > 30) score += 5;
        if (data.productTruth.claimsAllowed.length > 20) score += 5;
        if (data.productTruth.proofAssets.length > 0) score += 5;

        // Brand Control scoring
        maxScore += 10;
        if (data.brandControl.personality.length > 0) score += 5;
        if (data.brandControl.primaryColor) score += 5;

        // Creative Direction scoring
        maxScore += 5;
        if (data.creativeDirection.adStyles.length > 0) score += 2.5;
        if (data.creativeDirection.winningAdDefinition.length > 30) score += 2.5;

        const qualityScore = Math.round((score / maxScore) * 100);
        set({ inputQualityScore: qualityScore });
        return qualityScore;
      },

      reset: () => set({ currentStep: 0, data: defaultOnboardingData, isCompleted: false, inputQualityScore: 0 }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);

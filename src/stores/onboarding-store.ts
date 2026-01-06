import { create } from 'zustand';
import { OnboardingData, defaultOnboardingData, industryDefaultsData } from '@/lib/onboarding-schema';
import { onboardingService } from '@/services/database-service';

interface OnboardingStore {
  currentStep: number;
  data: OnboardingData;
  isCompleted: boolean;
  inputQualityScore: number;
  userId: string | null;
  isLoading: boolean;
  isSynced: boolean;
  isDemoMode: boolean;
  setStep: (step: number) => void;
  updateData: <K extends keyof OnboardingData>(section: K, values: Partial<OnboardingData[K]>) => void;
  setCompleted: (completed: boolean) => void;
  calculateQualityScore: () => number;
  reset: () => void;
  setUserId: (userId: string | null) => void;
  loadFromDatabase: (userId: string) => Promise<void>;
  saveToDatabase: () => Promise<void>;
  applyIndustryDefaults: () => void;
  enableDemoMode: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()((set, get) => ({
  currentStep: 0,
  data: defaultOnboardingData,
  isCompleted: false,
  inputQualityScore: 0,
  userId: null,
  isLoading: false,
  isSynced: false,
  isDemoMode: false,

  setStep: (step) => {
    set({ currentStep: step });
    // Auto-save on step change
    const { userId } = get();
    if (userId) {
      get().saveToDatabase();
    }
  },

  updateData: (section, values) => {
    set((state) => ({
      data: {
        ...state.data,
        [section]: { ...state.data[section], ...values },
      },
    }));
    // Debounced save handled by component
  },

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

  reset: () => set({ 
    currentStep: 0, 
    data: defaultOnboardingData, 
    isCompleted: false, 
    inputQualityScore: 0,
    isSynced: false,
    isDemoMode: false,
  }),

  applyIndustryDefaults: () => {
    set({ 
      data: industryDefaultsData,
      isCompleted: true,
      inputQualityScore: 85,
    });
  },

  enableDemoMode: () => {
    set({
      data: industryDefaultsData,
      isCompleted: true,
      inputQualityScore: 85,
      isDemoMode: true,
    });
  },

  setUserId: (userId) => set({ userId }),

  loadFromDatabase: async (userId: string) => {
    set({ isLoading: true, userId });
    try {
      const result = await onboardingService.fetchOnboardingData(userId);
      if (result) {
        set({
          data: result.data,
          isCompleted: result.isCompleted,
          inputQualityScore: result.inputQualityScore,
          currentStep: result.currentStep,
          isSynced: true,
        });
      }
    } catch (error) {
      console.error("Failed to load onboarding data:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveToDatabase: async () => {
    const { userId, data, currentStep, isCompleted, inputQualityScore } = get();
    if (!userId) return;

    try {
      await onboardingService.saveOnboardingData(
        userId,
        data,
        currentStep,
        isCompleted,
        inputQualityScore
      );
      set({ isSynced: true });
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }
  },
}));

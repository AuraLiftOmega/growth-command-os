import { useEffect, useCallback, useRef } from 'react';
import { useDominionStore, INDUSTRY_TEMPLATES, OfferType, SalesMotion } from '@/stores/dominion-core-store';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { getDemoModeConfig, applyDemoModeDefaults } from '@/lib/demo-mode';

/**
 * REVENUE ENGINE HOOK
 * 
 * Central hook for managing Revenue Engine state with:
 * - Automatic loading on auth
 * - Demo mode fallbacks
 * - Persistence guarantees
 * - Downstream logic triggers
 */

export function useRevenueEngine() {
  const { user, loading: authLoading } = useAuth();
  const initRef = useRef(false);
  
  const {
    // State
    industry,
    industryConfig,
    offerType,
    salesMotion,
    dealSize,
    buyingCycle,
    isConfigured,
    isActive,
    isLoading,
    isSynced,
    tenantMode,
    connectedIntegrations,
    isSelfMarketingActive,
    
    // Actions
    setUserId,
    loadFromDatabase,
    saveToDatabase,
    activateEngine,
    setIndustry,
    setOfferType,
    setSalesMotion,
    setDealSize,
    setBuyingCycle,
    addIntegration,
    removeIntegration,
    toggleSelfMarketing,
  } = useDominionStore();

  // Load config when user is authenticated
  useEffect(() => {
    if (authLoading) return;
    
    if (user?.id && !initRef.current) {
      initRef.current = true;
      setUserId(user.id);
      loadFromDatabase(user.id);
    } else if (!user && !initRef.current) {
      // Apply demo mode defaults for unauthenticated users
      initRef.current = true;
      const demoConfig = getDemoModeConfig('ecommerce');
      const template = INDUSTRY_TEMPLATES[demoConfig.industry];
      if (template) {
        applyDemoModeDefaults(
          setIndustry,
          (type: string) => setOfferType(type as OfferType),
          (motion: string) => setSalesMotion(motion as SalesMotion),
          setDealSize,
          setBuyingCycle,
          demoConfig.industry
        );
      }
    }
  }, [user?.id, authLoading]);

  // Quick config update methods with auto-save
  const updateIndustry = useCallback(async (industryId: string) => {
    const template = INDUSTRY_TEMPLATES[industryId];
    if (!template) return false;
    
    setIndustry(industryId, template);
    setBuyingCycle(template.buyerPsychology.cycleLength);
    
    if (user?.id) {
      const success = await saveToDatabase();
      if (success) {
        toast.success(`Industry set to ${template.name}`);
      }
      return success;
    }
    return true;
  }, [user?.id, saveToDatabase]);

  const updateOfferType = useCallback(async (type: OfferType) => {
    setOfferType(type);
    if (user?.id) {
      return await saveToDatabase();
    }
    return true;
  }, [user?.id, saveToDatabase]);

  const updateSalesMotion = useCallback(async (motion: SalesMotion) => {
    setSalesMotion(motion);
    if (user?.id) {
      return await saveToDatabase();
    }
    return true;
  }, [user?.id, saveToDatabase]);

  const updateDealSize = useCallback(async (size: 'low' | 'mid' | 'high' | 'enterprise') => {
    setDealSize(size);
    if (user?.id) {
      return await saveToDatabase();
    }
    return true;
  }, [user?.id, saveToDatabase]);

  const updateBuyingCycle = useCallback(async (cycle: 'instant' | 'short' | 'medium' | 'long' | 'enterprise') => {
    setBuyingCycle(cycle);
    if (user?.id) {
      return await saveToDatabase();
    }
    return true;
  }, [user?.id, saveToDatabase]);

  const connectIntegration = useCallback(async (integrationId: string) => {
    addIntegration(integrationId);
    if (user?.id) {
      const success = await saveToDatabase();
      if (success) {
        toast.success(`Connected to ${integrationId}`);
      }
      return success;
    }
    return true;
  }, [user?.id, saveToDatabase]);

  const disconnectIntegration = useCallback(async (integrationId: string) => {
    removeIntegration(integrationId);
    if (user?.id) {
      const success = await saveToDatabase();
      if (success) {
        toast.success(`Disconnected from ${integrationId}`);
      }
      return success;
    }
    return true;
  }, [user?.id, saveToDatabase]);

  const activate = useCallback(async () => {
    const success = await activateEngine();
    if (success) {
      toast.success("DOMINION activated!", {
        description: "Revenue engine is now live."
      });
    } else {
      toast.error("Failed to activate engine");
    }
    return success;
  }, [activateEngine]);

  const activateWithDefaults = useCallback(async (industryId?: string) => {
    const targetIndustry = industryId || industry || 'ecommerce';
    const template = INDUSTRY_TEMPLATES[targetIndustry];
    
    if (template) {
      setIndustry(targetIndustry, template);
      setBuyingCycle(template.buyerPsychology.cycleLength);
      
      // Set default offer type based on industry
      const defaultOffers: Record<string, OfferType> = {
        ecommerce: 'physical_product',
        saas: 'saas',
        agency: 'agency',
        coaching: 'coaching',
        enterprise: 'service',
        local_services: 'service',
        high_ticket_consulting: 'coaching',
      };
      setOfferType(defaultOffers[targetIndustry] || 'service');
      
      // Set default sales motion
      const defaultMotions: Record<string, SalesMotion> = {
        ecommerce: 'self_serve',
        saas: 'product_led',
        agency: 'sales_led',
        coaching: 'hybrid',
        enterprise: 'sales_led',
        local_services: 'hybrid',
        high_ticket_consulting: 'sales_led',
      };
      setSalesMotion(defaultMotions[targetIndustry] || 'hybrid');
    }
    
    return await activate();
  }, [industry, activate]);

  // Computed values for downstream logic
  const getKPIs = useCallback(() => {
    return industryConfig?.kpis || {
      primary: ['Revenue', 'ROAS', 'AOV'],
      secondary: ['CAC', 'LTV'],
      benchmarks: { ROAS: 3.0, AOV: 75 },
    };
  }, [industryConfig]);

  const getTone = useCallback(() => {
    return industryConfig?.language.tone || 'professional';
  }, [industryConfig]);

  const getDecisionMakers = useCallback(() => {
    return industryConfig?.buyerPsychology.decisionMakers || ['Individual'];
  }, [industryConfig]);

  const getObjections = useCallback(() => {
    return industryConfig?.buyerPsychology.objections || [];
  }, [industryConfig]);

  const getTriggers = useCallback(() => {
    return industryConfig?.buyerPsychology.triggers || [];
  }, [industryConfig]);

  const getApprovedPhrases = useCallback(() => {
    return industryConfig?.language.approvedPhrases || [];
  }, [industryConfig]);

  const getForbiddenWords = useCallback(() => {
    return industryConfig?.language.forbiddenWords || [];
  }, [industryConfig]);

  return {
    // State
    industry,
    industryConfig,
    offerType,
    salesMotion,
    dealSize,
    buyingCycle,
    isConfigured,
    isActive,
    isLoading: isLoading || authLoading,
    isSynced,
    tenantMode,
    connectedIntegrations,
    isSelfMarketingActive,
    isAuthenticated: !!user,
    
    // Update methods
    updateIndustry,
    updateOfferType,
    updateSalesMotion,
    updateDealSize,
    updateBuyingCycle,
    connectIntegration,
    disconnectIntegration,
    toggleSelfMarketing,
    
    // Activation
    activate,
    activateWithDefaults,
    
    // Downstream logic helpers
    getKPIs,
    getTone,
    getDecisionMakers,
    getObjections,
    getTriggers,
    getApprovedPhrases,
    getForbiddenWords,
  };
}

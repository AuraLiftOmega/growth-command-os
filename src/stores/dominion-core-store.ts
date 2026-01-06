import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { revenueEngineService, RevenueEngineUpdate } from '@/services/revenue-engine-service';

// CORE ENGINE - Revenue mechanics that never change
export type CoreCapability = 
  | 'traffic_generation'
  | 'attention_capture'
  | 'lead_conversion'
  | 'sales_execution'
  | 'pricing_optimization'
  | 'proof_compounding'
  | 'automation_replacement'
  | 'intelligence_loops';

// ADAPTIVE LAYERS - Industry-specific configurations
export interface IndustryConfig {
  id: string;
  name: string;
  language: {
    terminology: Record<string, string>;
    tone: 'aggressive' | 'professional' | 'consultative' | 'technical';
    forbiddenWords: string[];
    approvedPhrases: string[];
  };
  compliance: {
    disclaimers: string[];
    restrictions: string[];
    requiredDisclosures: string[];
  };
  kpis: {
    primary: string[];
    secondary: string[];
    benchmarks: Record<string, number>;
  };
  buyerPsychology: {
    decisionMakers: string[];
    objections: string[];
    triggers: string[];
    cycleLength: 'instant' | 'short' | 'medium' | 'long' | 'enterprise';
  };
  integrations: string[];
}

// Multi-Tenant Mode
export type TenantMode = 'founder' | 'customer' | 'demo';

// Offer Types
export type OfferType = 
  | 'physical_product'
  | 'digital_product'
  | 'saas'
  | 'service'
  | 'coaching'
  | 'agency'
  | 'marketplace';

// Sales Motion
export type SalesMotion = 
  | 'self_serve'
  | 'sales_led'
  | 'product_led'
  | 'hybrid';

interface DominionCoreState {
  // System Identity
  systemName: string;
  isFounderInstance: boolean;
  
  // Multi-Tenant
  tenantMode: TenantMode;
  customerId: string | null;
  
  // Industry Adaptation
  industry: string | null;
  industryConfig: IndustryConfig | null;
  offerType: OfferType | null;
  salesMotion: SalesMotion | null;
  dealSize: 'low' | 'mid' | 'high' | 'enterprise';
  buyingCycle: 'instant' | 'short' | 'medium' | 'long' | 'enterprise';
  
  // Core Engine Status
  coreCapabilities: Record<CoreCapability, boolean>;
  
  // Self-Marketing Mode
  isSelfMarketingActive: boolean;
  selfAsClient: boolean;
  
  // Integration Sovereignty
  connectedIntegrations: string[];
  orchestratedTools: string[];
  
  // Configuration Status
  isConfigured: boolean;
  isActive: boolean;
  isLoading: boolean;
  isSynced: boolean;
  userId: string | null;
  
  // Actions
  setTenantMode: (mode: TenantMode) => void;
  setIndustry: (industry: string, config: IndustryConfig) => void;
  setOfferType: (type: OfferType) => void;
  setSalesMotion: (motion: SalesMotion) => void;
  setDealSize: (size: 'low' | 'mid' | 'high' | 'enterprise') => void;
  setBuyingCycle: (cycle: 'instant' | 'short' | 'medium' | 'long' | 'enterprise') => void;
  toggleSelfMarketing: () => void;
  addIntegration: (integration: string) => void;
  removeIntegration: (integration: string) => void;
  resetToFounder: () => void;
  
  // Database sync
  setUserId: (userId: string | null) => void;
  loadFromDatabase: (userId: string) => Promise<void>;
  saveToDatabase: () => Promise<boolean>;
  activateEngine: () => Promise<boolean>;
  applyIndustryDefaults: (industry: string, config: IndustryConfig) => Promise<void>;
}

// Pre-built Industry Templates
export const INDUSTRY_TEMPLATES: Record<string, IndustryConfig> = {
  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce / DTC',
    language: {
      terminology: {
        'customer': 'buyer',
        'sale': 'conversion',
        'product': 'SKU',
        'marketing': 'acquisition',
      },
      tone: 'aggressive',
      forbiddenWords: ['maybe', 'try', 'hope'],
      approvedPhrases: ['scale', 'ROAS', 'AOV', 'LTV'],
    },
    compliance: {
      disclaimers: [],
      restrictions: ['No guaranteed income claims'],
      requiredDisclosures: ['Ad disclosure required'],
    },
    kpis: {
      primary: ['Revenue', 'ROAS', 'AOV', 'Conversion Rate'],
      secondary: ['CAC', 'LTV', 'Repeat Purchase Rate'],
      benchmarks: { 'ROAS': 3.0, 'AOV': 75, 'ConversionRate': 2.5 },
    },
    buyerPsychology: {
      decisionMakers: ['Individual consumer'],
      objections: ['Price', 'Trust', 'Shipping'],
      triggers: ['Scarcity', 'Social proof', 'Urgency'],
      cycleLength: 'instant',
    },
    integrations: ['shopify', 'meta_ads', 'google_ads', 'klaviyo'],
  },
  saas: {
    id: 'saas',
    name: 'SaaS / Software',
    language: {
      terminology: {
        'customer': 'user',
        'sale': 'subscription',
        'product': 'platform',
        'marketing': 'growth',
      },
      tone: 'professional',
      forbiddenWords: ['revolutionary', 'disruptive'],
      approvedPhrases: ['ARR', 'MRR', 'churn', 'retention'],
    },
    compliance: {
      disclaimers: ['Service level agreements apply'],
      restrictions: [],
      requiredDisclosures: ['Pricing transparency required'],
    },
    kpis: {
      primary: ['MRR', 'ARR', 'Churn Rate', 'NRR'],
      secondary: ['CAC', 'LTV:CAC', 'Activation Rate'],
      benchmarks: { 'ChurnRate': 5, 'NRR': 110, 'LTV_CAC': 3 },
    },
    buyerPsychology: {
      decisionMakers: ['End user', 'Manager', 'Procurement'],
      objections: ['Integration complexity', 'Training time', 'Vendor lock-in'],
      triggers: ['Efficiency gains', 'Cost reduction', 'Competitive advantage'],
      cycleLength: 'medium',
    },
    integrations: ['stripe', 'hubspot', 'intercom', 'segment'],
  },
  agency: {
    id: 'agency',
    name: 'Agency / Services',
    language: {
      terminology: {
        'customer': 'client',
        'sale': 'engagement',
        'product': 'service',
        'marketing': 'positioning',
      },
      tone: 'consultative',
      forbiddenWords: ['cheap', 'discount'],
      approvedPhrases: ['ROI', 'partnership', 'strategy', 'execution'],
    },
    compliance: {
      disclaimers: ['Results may vary'],
      restrictions: ['No guaranteed outcomes'],
      requiredDisclosures: [],
    },
    kpis: {
      primary: ['Revenue', 'Profit Margin', 'Client Retention'],
      secondary: ['Utilization Rate', 'Project Profitability'],
      benchmarks: { 'ProfitMargin': 30, 'ClientRetention': 85 },
    },
    buyerPsychology: {
      decisionMakers: ['Founder', 'CMO', 'VP Marketing'],
      objections: ['Past agency failures', 'Control concerns', 'ROI uncertainty'],
      triggers: ['Proven results', 'Industry expertise', 'Strategic partnership'],
      cycleLength: 'short',
    },
    integrations: ['slack', 'asana', 'hubspot', 'google_analytics'],
  },
  coaching: {
    id: 'coaching',
    name: 'Coaching / Info Products',
    language: {
      terminology: {
        'customer': 'student',
        'sale': 'enrollment',
        'product': 'program',
        'marketing': 'launch',
      },
      tone: 'aggressive',
      forbiddenWords: ['guarantee', 'promise'],
      approvedPhrases: ['transformation', 'results', 'proven system'],
    },
    compliance: {
      disclaimers: ['Income results not typical', 'Individual results vary'],
      restrictions: ['FTC guidelines apply', 'No false income claims'],
      requiredDisclosures: ['Earnings disclaimer required'],
    },
    kpis: {
      primary: ['Launch Revenue', 'Enrollment Rate', 'Completion Rate'],
      secondary: ['Refund Rate', 'Testimonial Rate', 'Upsell Rate'],
      benchmarks: { 'EnrollmentRate': 5, 'CompletionRate': 30, 'RefundRate': 10 },
    },
    buyerPsychology: {
      decisionMakers: ['Individual'],
      objections: ['Past course failures', 'Time commitment', 'Skepticism'],
      triggers: ['Transformation stories', 'Aspirational identity', 'Community'],
      cycleLength: 'short',
    },
    integrations: ['kajabi', 'circle', 'convertkit', 'stripe'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise / B2B',
    language: {
      terminology: {
        'customer': 'account',
        'sale': 'deal',
        'product': 'solution',
        'marketing': 'demand gen',
      },
      tone: 'technical',
      forbiddenWords: ['revolutionary', 'game-changing'],
      approvedPhrases: ['ROI', 'TCO', 'implementation', 'security'],
    },
    compliance: {
      disclaimers: ['Subject to terms and conditions'],
      restrictions: ['Procurement process required'],
      requiredDisclosures: ['Security certifications'],
    },
    kpis: {
      primary: ['Pipeline Value', 'Win Rate', 'Deal Velocity'],
      secondary: ['ACV', 'Expansion Revenue', 'NPS'],
      benchmarks: { 'WinRate': 25, 'DealVelocity': 90 },
    },
    buyerPsychology: {
      decisionMakers: ['Champion', 'Economic Buyer', 'Technical Buyer', 'Procurement'],
      objections: ['Security', 'Integration', 'Change management', 'Budget cycle'],
      triggers: ['Competitive pressure', 'Efficiency mandate', 'Digital transformation'],
      cycleLength: 'enterprise',
    },
    integrations: ['salesforce', 'linkedin', 'gong', 'outreach'],
  },
  local_services: {
    id: 'local_services',
    name: 'Local Services',
    language: {
      terminology: {
        'customer': 'client',
        'sale': 'booking',
        'product': 'service',
        'marketing': 'local reach',
      },
      tone: 'consultative',
      forbiddenWords: ['nationwide', 'global'],
      approvedPhrases: ['local', 'community', 'trusted', 'nearby'],
    },
    compliance: {
      disclaimers: ['Service area restrictions apply'],
      restrictions: ['Local licensing requirements'],
      requiredDisclosures: ['Insurance and bonding info'],
    },
    kpis: {
      primary: ['Bookings', 'Revenue', 'Review Score'],
      secondary: ['Repeat Rate', 'Referral Rate', 'Response Time'],
      benchmarks: { 'ReviewScore': 4.5, 'RepeatRate': 40, 'ResponseTime': 2 },
    },
    buyerPsychology: {
      decisionMakers: ['Homeowner', 'Property Manager'],
      objections: ['Trust', 'Availability', 'Price'],
      triggers: ['Urgency', 'Local reviews', 'Referrals'],
      cycleLength: 'instant',
    },
    integrations: ['google_business', 'yelp', 'square', 'calendly'],
  },
  high_ticket_consulting: {
    id: 'high_ticket_consulting',
    name: 'High-Ticket Consulting',
    language: {
      terminology: {
        'customer': 'client',
        'sale': 'engagement',
        'product': 'advisory',
        'marketing': 'thought leadership',
      },
      tone: 'consultative',
      forbiddenWords: ['cheap', 'budget', 'basic'],
      approvedPhrases: ['strategic', 'transformation', 'high-impact', 'exclusive'],
    },
    compliance: {
      disclaimers: ['Past results do not guarantee future outcomes'],
      restrictions: ['No guarantees on specific outcomes'],
      requiredDisclosures: ['Engagement terms and scope'],
    },
    kpis: {
      primary: ['Revenue', 'Deal Size', 'Close Rate'],
      secondary: ['Pipeline Value', 'Client Satisfaction', 'Referrals'],
      benchmarks: { 'DealSize': 50000, 'CloseRate': 30, 'Referrals': 40 },
    },
    buyerPsychology: {
      decisionMakers: ['CEO', 'Board', 'Executive Team'],
      objections: ['ROI uncertainty', 'Time investment', 'Past consultant failures'],
      triggers: ['Specific expertise', 'Proven track record', 'Strategic fit'],
      cycleLength: 'long',
    },
    integrations: ['hubspot', 'calendly', 'stripe', 'notion'],
  },
};

export const useDominionStore = create<DominionCoreState>()(
  persist(
    (set, get) => ({
      // System Identity
      systemName: 'DOMINION',
      isFounderInstance: true,
      
      // Multi-Tenant
      tenantMode: 'founder',
      customerId: null,
      
      // Industry Adaptation
      industry: null,
      industryConfig: null,
      offerType: null,
      salesMotion: null,
      dealSize: 'mid',
      buyingCycle: 'short',
      
      // Core Engine - All capabilities active by default
      coreCapabilities: {
        traffic_generation: true,
        attention_capture: true,
        lead_conversion: true,
        sales_execution: true,
        pricing_optimization: true,
        proof_compounding: true,
        automation_replacement: true,
        intelligence_loops: true,
      },
      
      // Self-Marketing
      isSelfMarketingActive: false,
      selfAsClient: false,
      
      // Integrations
      connectedIntegrations: ['shopify'],
      orchestratedTools: [],
      
      // Configuration Status
      isConfigured: false,
      isActive: false,
      isLoading: false,
      isSynced: false,
      userId: null,
      
      // Actions
      setTenantMode: (mode) => {
        set({ 
          tenantMode: mode,
          isFounderInstance: mode === 'founder'
        });
        get().saveToDatabase();
      },
      
      setIndustry: (industry, config) => {
        set({
          industry,
          industryConfig: config,
          buyingCycle: config.buyerPsychology.cycleLength,
        });
      },
      
      setOfferType: (type) => set({ offerType: type }),
      setSalesMotion: (motion) => set({ salesMotion: motion }),
      setDealSize: (size) => set({ dealSize: size }),
      setBuyingCycle: (cycle) => set({ buyingCycle: cycle }),
      
      toggleSelfMarketing: () => {
        set((state) => ({
          isSelfMarketingActive: !state.isSelfMarketingActive,
          selfAsClient: !state.isSelfMarketingActive,
        }));
        get().saveToDatabase();
      },
      
      addIntegration: (integration) => {
        set((state) => ({
          connectedIntegrations: [...state.connectedIntegrations, integration],
        }));
        get().saveToDatabase();
      },
      
      removeIntegration: (integration) => {
        set((state) => ({
          connectedIntegrations: state.connectedIntegrations.filter(i => i !== integration),
        }));
        get().saveToDatabase();
      },
      
      resetToFounder: () => {
        set({
          tenantMode: 'founder',
          isFounderInstance: true,
          customerId: null,
        });
        get().saveToDatabase();
      },
      
      // Database sync
      setUserId: (userId) => set({ userId }),
      
      loadFromDatabase: async (userId: string) => {
        set({ isLoading: true, userId });
        try {
          const config = await revenueEngineService.fetchConfig(userId);
          if (config) {
            set({
              industry: config.industry,
              industryConfig: config.industry_config,
              offerType: config.offer_type as OfferType | null,
              salesMotion: config.sales_motion as SalesMotion | null,
              dealSize: config.deal_size,
              buyingCycle: config.buying_cycle,
              coreCapabilities: config.core_capabilities as Record<CoreCapability, boolean>,
              isSelfMarketingActive: config.is_self_marketing_active,
              selfAsClient: config.self_as_client,
              connectedIntegrations: config.connected_integrations || ['shopify'],
              orchestratedTools: config.orchestrated_tools || [],
              tenantMode: config.tenant_mode,
              isFounderInstance: config.is_founder_instance,
              customerId: config.customer_id,
              isConfigured: config.is_configured,
              isActive: config.is_active,
              isSynced: true,
            });
          }
        } catch (error) {
          console.error("Failed to load revenue engine config:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      saveToDatabase: async () => {
        const state = get();
        if (!state.userId) return false;
        
        const updates: RevenueEngineUpdate = {
          industry: state.industry,
          industry_config: state.industryConfig,
          offer_type: state.offerType,
          sales_motion: state.salesMotion,
          deal_size: state.dealSize,
          buying_cycle: state.buyingCycle,
          core_capabilities: state.coreCapabilities,
          is_self_marketing_active: state.isSelfMarketingActive,
          self_as_client: state.selfAsClient,
          connected_integrations: state.connectedIntegrations,
          orchestrated_tools: state.orchestratedTools,
          tenant_mode: state.tenantMode,
          is_founder_instance: state.isFounderInstance,
          customer_id: state.customerId,
        };
        
        const success = await revenueEngineService.updateConfig(state.userId, updates);
        if (success) {
          set({ isSynced: true });
        }
        return success;
      },
      
      activateEngine: async () => {
        const state = get();
        if (!state.userId) return false;
        
        // Apply industry defaults if available
        const industryConfig = state.industryConfig;
        
        const updates: RevenueEngineUpdate = {
          industry: state.industry,
          industry_config: industryConfig,
          offer_type: state.offerType,
          sales_motion: state.salesMotion,
          deal_size: state.dealSize,
          buying_cycle: state.buyingCycle,
          core_capabilities: state.coreCapabilities,
          is_self_marketing_active: state.isSelfMarketingActive,
          self_as_client: state.selfAsClient,
          connected_integrations: state.connectedIntegrations,
          orchestrated_tools: state.orchestratedTools,
          tenant_mode: state.tenantMode,
          is_founder_instance: state.isFounderInstance,
          customer_id: state.customerId,
          is_configured: true,
          is_active: true,
          // Apply industry-specific settings
          language_tone: industryConfig?.language.tone,
          primary_kpis: industryConfig?.kpis.primary,
          secondary_kpis: industryConfig?.kpis.secondary,
          kpi_benchmarks: industryConfig?.kpis.benchmarks,
          approved_phrases: industryConfig?.language.approvedPhrases,
          forbidden_words: industryConfig?.language.forbiddenWords,
          decision_makers: industryConfig?.buyerPsychology.decisionMakers,
          objections: industryConfig?.buyerPsychology.objections,
          triggers: industryConfig?.buyerPsychology.triggers,
        };
        
        const success = await revenueEngineService.activateEngine(state.userId, updates);
        if (success) {
          set({ isConfigured: true, isActive: true, isSynced: true });
        }
        return success;
      },
      
      applyIndustryDefaults: async (industry: string, config: IndustryConfig) => {
        const state = get();
        
        set({
          industry,
          industryConfig: config,
          buyingCycle: config.buyerPsychology.cycleLength,
          connectedIntegrations: config.integrations,
        });
        
        if (state.userId) {
          await revenueEngineService.applyIndustryDefaults(state.userId, industry, config);
        }
      },
    }),
    {
      name: 'dominion-core',
    }
  )
);

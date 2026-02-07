import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * SELF-DEMO VIDEO ENGINE STORE
 * 
 * Manages demo video generation, variants, and analytics
 */

export type DemoVariant = 'standard' | 'aries' | 'enterprise' | 'silent';
export type DemoLength = 'short' | 'long';
export type SalesStage = 'cold' | 'warm' | 'close';
export type DealSize = 'smb' | 'mid_market' | 'enterprise';

export interface DemoCapability {
  id: string;
  name: string;
  description: string;
  module: string;
  outcomeMetric: string;
  priority: number;
  industryRelevance: string[];
}

export interface GeneratedDemo {
  id: string;
  variant: DemoVariant;
  industry: string;
  dealSize: DealSize;
  salesStage: SalesStage;
  length: DemoLength;
  capabilities: string[];
  narrative: {
    problem: string;
    revelation: string;
    demonstration: string[];
    outcome: string;
    close: string;
  };
  analytics: {
    views: number;
    avgWatchTime: number;
    completionRate: number;
    closeRate: number;
    dropOffPoints: { timestamp: number; percentage: number }[];
  };
  createdAt: string;
  status: 'generating' | 'ready' | 'optimizing';
}

interface DemoEngineState {
  // Engine Status
  isActive: boolean;
  currentVariant: DemoVariant;
  
  // Configuration
  targetIndustry: string;
  targetDealSize: DealSize;
  targetSalesStage: SalesStage;
  selectedLength: DemoLength;
  
  // Capabilities
  capabilities: DemoCapability[];
  selectedCapabilities: string[];
  
  // Generated Demos
  generatedDemos: GeneratedDemo[];
  
  // Analytics
  totalViews: number;
  avgCloseRate: number;
  topPerformingCapabilities: string[];
  
  // Actions
  setActive: (active: boolean) => void;
  setVariant: (variant: DemoVariant) => void;
  setTargetIndustry: (industry: string) => void;
  setTargetDealSize: (size: DealSize) => void;
  setTargetSalesStage: (stage: SalesStage) => void;
  setSelectedLength: (length: DemoLength) => void;
  toggleCapability: (capabilityId: string) => void;
  addGeneratedDemo: (demo: GeneratedDemo) => void;
  updateDemoAnalytics: (demoId: string, analytics: Partial<GeneratedDemo['analytics']>) => void;
}

// Core DOMINION capabilities for demo mapping
const DOMINION_CAPABILITIES: DemoCapability[] = [
  {
    id: 'traffic_engine',
    name: 'Traffic Engine',
    description: 'Ad-account-independent demand generation',
    module: 'Traffic',
    outcomeMetric: 'Leads without platform dependency',
    priority: 1,
    industryRelevance: ['ecommerce', 'saas', 'agency', 'coaching', 'enterprise'],
  },
  {
    id: 'cash_engine',
    name: 'Cash Engine',
    description: 'Perpetual revenue optimization',
    module: 'Monetization',
    outcomeMetric: 'MRR growth with reduced churn',
    priority: 2,
    industryRelevance: ['saas', 'coaching', 'agency'],
  },
  {
    id: 'automation_replacement',
    name: 'Automation Replacement',
    description: 'Human-to-system conversion',
    module: 'Operations',
    outcomeMetric: 'Headcount reduction with output increase',
    priority: 3,
    industryRelevance: ['ecommerce', 'saas', 'agency', 'enterprise'],
  },
  {
    id: 'proof_loop',
    name: 'Proof Loop Engine',
    description: 'Automatic win-to-proof conversion',
    module: 'Sales',
    outcomeMetric: 'Organic close rate improvement',
    priority: 4,
    industryRelevance: ['coaching', 'agency', 'high_ticket_consulting'],
  },
  {
    id: 'governance',
    name: 'Governance Controller',
    description: 'Founder sovereignty and access control',
    module: 'Control',
    outcomeMetric: 'Zero unauthorized access',
    priority: 5,
    industryRelevance: ['enterprise', 'agency', 'saas'],
  },
  {
    id: 'industry_adaptation',
    name: 'Industry Adaptation',
    description: 'Cross-industry deployment without rebuild',
    module: 'Universal',
    outcomeMetric: 'Single system, infinite verticals',
    priority: 6,
    industryRelevance: ['ecommerce', 'saas', 'agency', 'coaching', 'enterprise', 'local_services', 'high_ticket_consulting'],
  },
  {
    id: 'self_marketing',
    name: 'Self-Marketing Engine',
    description: 'DOMINION selling itself',
    module: 'Meta',
    outcomeMetric: 'Proof of capability',
    priority: 7,
    industryRelevance: ['saas', 'agency'],
  },
  {
    id: 'integration_sovereignty',
    name: 'Integration Sovereignty',
    description: 'Command layer over existing tools',
    module: 'Integration',
    outcomeMetric: 'No forced migrations',
    priority: 8,
    industryRelevance: ['enterprise', 'saas', 'agency'],
  },
];

export const useDemoEngineStore = create<DemoEngineState>()(
  persist(
    (set, get) => ({
      // Initial State
      isActive: false,
      currentVariant: 'standard',
      targetIndustry: 'ecommerce',
      targetDealSize: 'mid_market',
      targetSalesStage: 'warm',
      selectedLength: 'short',
      capabilities: DOMINION_CAPABILITIES,
      selectedCapabilities: ['traffic_engine', 'cash_engine', 'automation_replacement'],
      generatedDemos: [],
      totalViews: 0,
      avgCloseRate: 0,
      topPerformingCapabilities: [],

      // Actions
      setActive: (active) => set({ isActive: active }),
      setVariant: (variant) => set({ currentVariant: variant }),
      setTargetIndustry: (industry) => set({ targetIndustry: industry }),
      setTargetDealSize: (size) => set({ targetDealSize: size }),
      setTargetSalesStage: (stage) => set({ targetSalesStage: stage }),
      setSelectedLength: (length) => set({ selectedLength: length }),
      
      toggleCapability: (capabilityId) => set((state) => ({
        selectedCapabilities: state.selectedCapabilities.includes(capabilityId)
          ? state.selectedCapabilities.filter(id => id !== capabilityId)
          : [...state.selectedCapabilities, capabilityId]
      })),
      
      addGeneratedDemo: (demo) => set((state) => ({
        generatedDemos: [demo, ...state.generatedDemos],
      })),
      
      updateDemoAnalytics: (demoId, analytics) => set((state) => ({
        generatedDemos: state.generatedDemos.map(d => 
          d.id === demoId 
            ? { ...d, analytics: { ...d.analytics, ...analytics } }
            : d
        ),
      })),
    }),
    {
      name: 'demo-engine',
    }
  )
);

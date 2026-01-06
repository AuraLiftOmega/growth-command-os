import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * PERPETUAL CASH ENGINE MODE™
 * 
 * Optimized for:
 * - Retention over acquisition
 * - Expansion over replacement
 * - Compounding over novelty
 */

export interface PriceLiftRule {
  id: string;
  name: string;
  trigger: 'value_realization' | 'usage_threshold' | 'time_based' | 'market_demand';
  liftPercentage: number;
  appliesTo: 'new_customers' | 'existing_customers' | 'all';
  isActive: boolean;
  conditions: {
    minUsagePercent?: number;
    minDaysActive?: number;
    minRevenueGenerated?: number;
    marketDemandScore?: number;
  };
}

export interface UpgradeGravityRule {
  id: string;
  fromTier: string;
  toTier: string;
  triggerType: 'usage_limit' | 'feature_constraint' | 'success_signal' | 'growth_pattern';
  triggerThreshold: number;
  messagingStyle: 'unlock_throughput' | 'remove_constraint' | 'scale_capacity';
  isActive: boolean;
}

export interface ChurnSignal {
  id: string;
  signalType: 'declining_usage' | 'support_frustration' | 'billing_issue' | 'competitor_research';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  customerId: string;
  interventionTriggered: boolean;
}

export interface DependencyMetric {
  category: string;
  depth: number; // 0-100 scale
  description: string;
  switchingCost: 'low' | 'medium' | 'high' | 'extreme';
}

interface CashEngineState {
  // Engine Status
  isActive: boolean;
  activatedAt: Date | null;
  
  // Metrics
  currentMRR: number;
  projectedMRR: number;
  avgLTV: number;
  churnRate: number;
  expansionRevenue: number;
  
  // Price Lift System
  priceLiftRules: PriceLiftRule[];
  lastPriceLift: Date | null;
  totalPriceLiftsApplied: number;
  
  // Upgrade Gravity
  upgradeGravityRules: UpgradeGravityRule[];
  upgradeConversionRate: number;
  
  // Churn Prevention
  activeChurnSignals: ChurnSignal[];
  churnInterventionSuccess: number;
  
  // Dependency Metrics
  dependencyMetrics: DependencyMetric[];
  avgDependencyDepth: number;
  
  // Founder Sovereignty
  founderOverrides: {
    pricingLocked: boolean;
    accessLocked: boolean;
    limitsLocked: boolean;
    availabilityLocked: boolean;
  };
  
  // Actions
  activate: () => void;
  deactivate: () => void;
  
  // Price Lift Actions
  addPriceLiftRule: (rule: Omit<PriceLiftRule, 'id'>) => void;
  togglePriceLiftRule: (id: string) => void;
  removePriceLiftRule: (id: string) => void;
  executePriceLift: (ruleId: string) => void;
  
  // Upgrade Gravity Actions
  addUpgradeGravityRule: (rule: Omit<UpgradeGravityRule, 'id'>) => void;
  toggleUpgradeGravityRule: (id: string) => void;
  
  // Churn Prevention Actions
  detectChurnSignal: (signal: Omit<ChurnSignal, 'id' | 'detectedAt'>) => void;
  triggerIntervention: (signalId: string) => void;
  resolveChurnSignal: (signalId: string) => void;
  
  // Founder Sovereignty Actions
  setFounderOverride: (key: keyof CashEngineState['founderOverrides'], value: boolean) => void;
  instantPriceAdjust: (adjustment: { type: 'percentage' | 'fixed'; value: number; scope: 'all' | 'new' }) => void;
  
  // Metrics update
  updateMetrics: (metrics: Partial<Pick<CashEngineState, 'currentMRR' | 'projectedMRR' | 'avgLTV' | 'churnRate' | 'expansionRevenue'>>) => void;
}

const defaultPriceLiftRules: PriceLiftRule[] = [
  {
    id: 'value_realization_lift',
    name: 'Value Realization Lift',
    trigger: 'value_realization',
    liftPercentage: 10,
    appliesTo: 'new_customers',
    isActive: true,
    conditions: {
      minRevenueGenerated: 10000,
    },
  },
  {
    id: 'usage_threshold_lift',
    name: 'Usage Threshold Lift',
    trigger: 'usage_threshold',
    liftPercentage: 5,
    appliesTo: 'new_customers',
    isActive: true,
    conditions: {
      minUsagePercent: 80,
    },
  },
  {
    id: 'soft_existing_lift',
    name: 'Soft Existing Customer Lift',
    trigger: 'time_based',
    liftPercentage: 3,
    appliesTo: 'existing_customers',
    isActive: false,
    conditions: {
      minDaysActive: 365,
    },
  },
];

const defaultUpgradeGravityRules: UpgradeGravityRule[] = [
  {
    id: 'core_to_scale_usage',
    fromTier: 'core',
    toTier: 'scale',
    triggerType: 'usage_limit',
    triggerThreshold: 85,
    messagingStyle: 'unlock_throughput',
    isActive: true,
  },
  {
    id: 'scale_to_dominion_success',
    fromTier: 'scale',
    toTier: 'dominion',
    triggerType: 'success_signal',
    triggerThreshold: 50000, // Revenue threshold
    messagingStyle: 'scale_capacity',
    isActive: true,
  },
];

const defaultDependencyMetrics: DependencyMetric[] = [
  { category: 'Workflow Integration', depth: 78, description: 'Daily operational dependency', switchingCost: 'high' },
  { category: 'Proprietary Learning', depth: 85, description: 'Accumulated intelligence per account', switchingCost: 'extreme' },
  { category: 'Data Lock-in', depth: 65, description: 'Historical performance data', switchingCost: 'high' },
  { category: 'Team Training', depth: 45, description: 'Team expertise investment', switchingCost: 'medium' },
];

export const useCashEngineStore = create<CashEngineState>()(
  persist(
    (set, get) => ({
      // Engine Status
      isActive: false,
      activatedAt: null,
      
      // Metrics
      currentMRR: 47500,
      projectedMRR: 52000,
      avgLTV: 18500,
      churnRate: 2.1,
      expansionRevenue: 8750,
      
      // Price Lift
      priceLiftRules: defaultPriceLiftRules,
      lastPriceLift: null,
      totalPriceLiftsApplied: 3,
      
      // Upgrade Gravity
      upgradeGravityRules: defaultUpgradeGravityRules,
      upgradeConversionRate: 34.2,
      
      // Churn Prevention
      activeChurnSignals: [],
      churnInterventionSuccess: 87.5,
      
      // Dependency
      dependencyMetrics: defaultDependencyMetrics,
      avgDependencyDepth: 68,
      
      // Founder Sovereignty - all unlocked by default
      founderOverrides: {
        pricingLocked: false,
        accessLocked: false,
        limitsLocked: false,
        availabilityLocked: false,
      },
      
      // Actions
      activate: () => set({ isActive: true, activatedAt: new Date() }),
      deactivate: () => set({ isActive: false }),
      
      // Price Lift Actions
      addPriceLiftRule: (rule) => set((state) => ({
        priceLiftRules: [...state.priceLiftRules, { ...rule, id: `rule_${Date.now()}` }]
      })),
      
      togglePriceLiftRule: (id) => set((state) => ({
        priceLiftRules: state.priceLiftRules.map(r => 
          r.id === id ? { ...r, isActive: !r.isActive } : r
        )
      })),
      
      removePriceLiftRule: (id) => set((state) => ({
        priceLiftRules: state.priceLiftRules.filter(r => r.id !== id)
      })),
      
      executePriceLift: (ruleId) => set((state) => ({
        lastPriceLift: new Date(),
        totalPriceLiftsApplied: state.totalPriceLiftsApplied + 1,
      })),
      
      // Upgrade Gravity Actions
      addUpgradeGravityRule: (rule) => set((state) => ({
        upgradeGravityRules: [...state.upgradeGravityRules, { ...rule, id: `gravity_${Date.now()}` }]
      })),
      
      toggleUpgradeGravityRule: (id) => set((state) => ({
        upgradeGravityRules: state.upgradeGravityRules.map(r =>
          r.id === id ? { ...r, isActive: !r.isActive } : r
        )
      })),
      
      // Churn Prevention
      detectChurnSignal: (signal) => set((state) => ({
        activeChurnSignals: [...state.activeChurnSignals, {
          ...signal,
          id: `churn_${Date.now()}`,
          detectedAt: new Date(),
        }]
      })),
      
      triggerIntervention: (signalId) => set((state) => ({
        activeChurnSignals: state.activeChurnSignals.map(s =>
          s.id === signalId ? { ...s, interventionTriggered: true } : s
        )
      })),
      
      resolveChurnSignal: (signalId) => set((state) => ({
        activeChurnSignals: state.activeChurnSignals.filter(s => s.id !== signalId)
      })),
      
      // Founder Sovereignty
      setFounderOverride: (key, value) => set((state) => ({
        founderOverrides: { ...state.founderOverrides, [key]: value }
      })),
      
      instantPriceAdjust: (adjustment) => {
        // In production, this would trigger actual price changes
        console.log('Instant price adjustment:', adjustment);
      },
      
      // Metrics
      updateMetrics: (metrics) => set((state) => ({ ...state, ...metrics })),
    }),
    {
      name: 'dominion-cash-engine',
    }
  )
);

// Utility: Calculate dependency switching cost
export const calculateSwitchingCost = (metrics: DependencyMetric[]): string => {
  const avgDepth = metrics.reduce((sum, m) => sum + m.depth, 0) / metrics.length;
  if (avgDepth >= 75) return 'Switching feels irresponsible';
  if (avgDepth >= 50) return 'Switching requires significant effort';
  if (avgDepth >= 25) return 'Switching is inconvenient';
  return 'Low switching friction - increase dependency';
};

// Utility: Get upgrade message based on style
export const getUpgradeMessage = (style: UpgradeGravityRule['messagingStyle'], toTier: string): string => {
  switch (style) {
    case 'unlock_throughput':
      return `Unlock unlimited throughput with ${toTier.toUpperCase()}`;
    case 'remove_constraint':
      return `Remove execution constraints — upgrade to ${toTier.toUpperCase()}`;
    case 'scale_capacity':
      return `Scale your capacity with ${toTier.toUpperCase()} infrastructure`;
    default:
      return `Upgrade to ${toTier.toUpperCase()}`;
  }
};

/**
 * PRODUCTION MODE ONLY - ALL DEMO/TEST MODE DISABLED
 * 
 * This file is kept for backwards compatibility but ALL demo functionality is REMOVED.
 * DOMINION is now a REAL MONEY MACHINE - no simulations, no test data.
 */

// Test mode is PERMANENTLY DISABLED - always returns false
export function enableTestMode(): void {
  // NO-OP - Test mode is permanently disabled
  console.warn('[DOMINION] Test mode is permanently disabled. Production only.');
}

export function disableTestMode(): void {
  // Ensure any lingering test mode flags are removed
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dominion_test_mode');
    localStorage.removeItem('dominion_dev_mode');
  }
}

// ALWAYS returns false - no test mode in production
export function isTestMode(): boolean {
  // Force disable any lingering test mode
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dominion_test_mode');
  }
  return false; // ALWAYS FALSE - PRODUCTION ONLY
}

// ALWAYS returns false - no demo mode in production
export function isDemoMode(): boolean {
  return false; // ALWAYS FALSE - PRODUCTION ONLY
}

// Get demo mode badge text - returns LIVE
export function getDemoModeLabel(): string {
  return 'LIVE';
}

// Generate realistic timestamps (kept for compatibility)
export function generateRealisticTimestamps(count: number): string[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const hoursAgo = Math.floor(Math.random() * 168);
    return new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
  });
}

// Remove all demo data constants - these are no longer used
export const DEMO_MODE_VIDEOS: any[] = [];
export const DEMO_MODE_ANALYTICS: Record<string, any> = {};
export const DEMO_PLAYBACK_SCENES: any[] = [];

// Kept for backwards compatibility - returns empty/default config
export interface DemoModeConfig {
  industry: string;
  industryName: string;
  offerType: string;
  salesMotion: string;
  dealSize: 'low' | 'mid' | 'high' | 'enterprise';
  buyingCycle: 'instant' | 'short' | 'medium' | 'long' | 'enterprise';
  primaryKpis: string[];
  secondaryKpis: string[];
  benchmarks: Record<string, number>;
  tone: string;
  forbiddenWords: string[];
  approvedPhrases: string[];
}

// Default config - used for initial setup, not demo mode
const DEFAULT_CONFIG: DemoModeConfig = {
  industry: 'ecommerce',
  industryName: 'E-Commerce / DTC',
  offerType: 'physical_product',
  salesMotion: 'self_serve',
  dealSize: 'mid',
  buyingCycle: 'instant',
  primaryKpis: ['Revenue', 'ROAS', 'AOV', 'Conversion Rate'],
  secondaryKpis: ['CAC', 'LTV', 'Repeat Purchase Rate'],
  benchmarks: { 
    'ROAS': 3.0, 
    'AOV': 75, 
    'ConversionRate': 2.5,
    'Revenue': 50000,
    'CAC': 25,
    'LTV': 150
  },
  tone: 'aggressive',
  forbiddenWords: ['maybe', 'try', 'hope'],
  approvedPhrases: ['scale', 'ROAS', 'AOV', 'LTV']
};

// Get default config (NOT demo mode - just initial setup)
export function getDemoModeConfig(_industry?: string): DemoModeConfig {
  return DEFAULT_CONFIG;
}

// Apply defaults for initial setup (NOT demo mode)
export function applyDemoModeDefaults(
  setIndustry: (industry: string, config: any) => void,
  setOfferType: (type: string) => void,
  setSalesMotion: (motion: string) => void,
  setDealSize: (size: 'low' | 'mid' | 'high' | 'enterprise') => void,
  setBuyingCycle: (cycle: 'instant' | 'short' | 'medium' | 'long' | 'enterprise') => void,
  _industry?: string
): void {
  const config = DEFAULT_CONFIG;
  
  const industryConfigObj = {
    id: config.industry,
    name: config.industryName,
    language: {
      terminology: {},
      tone: config.tone as any,
      forbiddenWords: config.forbiddenWords,
      approvedPhrases: config.approvedPhrases
    },
    compliance: {
      disclaimers: [],
      restrictions: [],
      requiredDisclosures: []
    },
    kpis: {
      primary: config.primaryKpis,
      secondary: config.secondaryKpis,
      benchmarks: config.benchmarks
    },
    buyerPsychology: {
      decisionMakers: [],
      objections: [],
      triggers: [],
      cycleLength: config.buyingCycle
    },
    integrations: []
  };
  
  setIndustry(config.industry, industryConfigObj);
  setOfferType(config.offerType);
  setSalesMotion(config.salesMotion);
  setDealSize(config.dealSize);
  setBuyingCycle(config.buyingCycle);
}

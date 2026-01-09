/**
 * PRODUCTION MODE ONLY - DEMO/TEST FUNCTIONALITY PERMANENTLY REMOVED
 * 
 * DOMINION is a REAL MONEY MACHINE.
 * ALL demo, test, and simulation code has been PERMANENTLY DELETED.
 * Every metric is REAL. Every transaction is LIVE.
 */

// NO TEST MODE - PERMANENTLY DISABLED
export function enableTestMode(): void {
  throw new Error('[DOMINION] Test mode is permanently disabled. Production only.');
}

export function disableTestMode(): void {
  // Clear any legacy flags
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dominion_test_mode');
    localStorage.removeItem('dominion_dev_mode');
    localStorage.removeItem('demo_mode');
  }
}

// ALWAYS returns false - PRODUCTION ONLY
export function isTestMode(): boolean {
  disableTestMode();
  return false;
}

// ALWAYS returns false - PRODUCTION ONLY
export function isDemoMode(): boolean {
  return false;
}

// Returns LIVE - always
export function getDemoModeLabel(): string {
  return 'LIVE';
}

// Type definitions for backwards compatibility
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

export interface DemoPlaybackScene {
  title: string;
  subtitle: string;
  gradient: string;
  duration: number;
  metrics: Array<{ label: string; value: string; change?: string }>;
}

export interface DemoModeVideo {
  id: string;
  variant: string;
  industryName: string;
  deal_size: string;
  sales_stage: string;
  narrative: Record<string, any>;
  thumbnail_url: string | null;
  video_url: string | null;
  narration_url: string | null;
  duration_seconds: number | null;
}

// Default production config - used for initial setup only
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

// Returns production defaults (NOT demo mode - just initial config)
export function getDemoModeConfig(_industry?: string): DemoModeConfig {
  return DEFAULT_CONFIG;
}

// Apply production defaults for initial setup
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

// REMOVED: All demo mode data - empty arrays with proper types
export const DEMO_MODE_VIDEOS: DemoModeVideo[] = [];
export const DEMO_MODE_ANALYTICS: Record<string, any> = {};
export const DEMO_PLAYBACK_SCENES: DemoPlaybackScene[] = [];

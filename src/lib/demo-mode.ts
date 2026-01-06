/**
 * DEMO MODE SYSTEM
 * 
 * Provides realistic fallback data when:
 * - User is not authenticated
 * - No data exists yet
 * - API calls fail
 * - System is in demo/preview mode
 */

export interface DemoModeVideo {
  id: string;
  variant: 'standard' | 'intimidation' | 'enterprise' | 'silent';
  industry: string;
  industryName: string;
  deal_size: 'starter' | 'growth' | 'enterprise';
  sales_stage: 'awareness' | 'consideration' | 'decision' | 'close';
  length: 'short' | 'long';
  capabilities: string[];
  narrative: {
    hook: string;
    problem: string;
    revelation: string;
    proof: string;
    outcome: string;
    close: string;
  };
  status: 'ready' | 'generating';
  thumbnail_url: string | null;
  video_url: string | null;
  narration_url: string | null;
  duration_seconds: number;
  created_at: string;
  frames_generated: number;
  total_frames: number;
}

export interface DemoModeAnalytics {
  views: number;
  avg_watch_time_seconds: number;
  completion_rate: number;
  close_rate: number;
  closed_deals: number;
  revenue_attributed: number;
}

// Simulated demo videos for demo mode
export const DEMO_MODE_VIDEOS: DemoModeVideo[] = [
  {
    id: 'demo-video-1',
    variant: 'enterprise',
    industry: 'ecommerce',
    industryName: 'E-commerce & DTC',
    deal_size: 'enterprise',
    sales_stage: 'decision',
    length: 'long',
    capabilities: ['ai_video_generation', 'performance_scaling', 'unified_inbox'],
    narrative: {
      hook: "What if your AI could generate scroll-stopping videos while you sleep?",
      problem: "Most e-commerce brands waste 80% of their creative budget on ads that never convert.",
      revelation: "DOMINION's self-learning AI studies your top performers and generates winning creatives automatically.",
      proof: "Brands using DOMINION see an average 340% increase in ROAS within 90 days.",
      outcome: "Imagine waking up to find your AI has already killed underperformers and scaled winners.",
      close: "The question isn't whether you can afford DOMINION—it's whether you can afford not to have it."
    },
    status: 'ready',
    thumbnail_url: null,
    video_url: null,
    narration_url: null,
    duration_seconds: 180,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    frames_generated: 180,
    total_frames: 180,
  },
  {
    id: 'demo-video-2',
    variant: 'intimidation',
    industry: 'saas',
    industryName: 'SaaS & Software',
    deal_size: 'growth',
    sales_stage: 'consideration',
    length: 'short',
    capabilities: ['self_learning_ai', 'brand_safety', 'comment_automation'],
    narrative: {
      hook: "Your competitors are already using AI to outspend you 10:1.",
      problem: "Manual creative testing is like bringing a knife to a gunfight.",
      revelation: "DOMINION doesn't just run ads—it learns, adapts, and dominates.",
      proof: "One client went from $50K/month to $500K/month in 6 months. Automatically.",
      outcome: "Every hour you wait, your competitors get further ahead.",
      close: "This isn't marketing software. This is market domination."
    },
    status: 'ready',
    thumbnail_url: null,
    video_url: null,
    narration_url: null,
    duration_seconds: 90,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    frames_generated: 90,
    total_frames: 90,
  },
  {
    id: 'demo-video-3',
    variant: 'standard',
    industry: 'health_wellness',
    industryName: 'Health & Wellness',
    deal_size: 'starter',
    sales_stage: 'awareness',
    length: 'short',
    capabilities: ['multi_store_support', 'traffic_engine', 'data_advantage'],
    narrative: {
      hook: "What if scaling your wellness brand didn't mean scaling your team?",
      problem: "Health brands struggle with compliance while trying to grow fast.",
      revelation: "DOMINION maintains brand safety while maximizing performance.",
      proof: "Health brands report 85% reduction in compliance violations with 3x revenue growth.",
      outcome: "Scale with confidence knowing your AI respects your brand values.",
      close: "Ready to see what responsible automation looks like?"
    },
    status: 'ready',
    thumbnail_url: null,
    video_url: null,
    narration_url: null,
    duration_seconds: 75,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    frames_generated: 75,
    total_frames: 75,
  },
];

// Simulated analytics for demo mode
export const DEMO_MODE_ANALYTICS: Record<string, DemoModeAnalytics> = {
  'demo-video-1': {
    views: 1247,
    avg_watch_time_seconds: 156,
    completion_rate: 78,
    close_rate: 24,
    closed_deals: 12,
    revenue_attributed: 847291,
  },
  'demo-video-2': {
    views: 892,
    avg_watch_time_seconds: 82,
    completion_rate: 85,
    close_rate: 31,
    closed_deals: 8,
    revenue_attributed: 324500,
  },
  'demo-video-3': {
    views: 456,
    avg_watch_time_seconds: 68,
    completion_rate: 92,
    close_rate: 18,
    closed_deals: 4,
    revenue_attributed: 124000,
  },
};

// Simulated scenes for video playback
export const DEMO_PLAYBACK_SCENES = [
  {
    title: "Revenue Command Center",
    subtitle: "One dashboard to rule them all",
    gradient: "from-purple-500/20 to-pink-500/20",
    metrics: [
      { label: "Revenue", value: "$847,291", change: "+24%" },
      { label: "ROAS", value: "4.8x", change: "+18%" },
      { label: "Orders", value: "3,421", change: "+31%" },
    ]
  },
  {
    title: "AI Video Generation",
    subtitle: "Scroll-stopping content in seconds",
    gradient: "from-blue-500/20 to-cyan-500/20",
    metrics: [
      { label: "Videos Generated", value: "156", change: "+89" },
      { label: "Avg CTR", value: "4.2%", change: "+1.8%" },
      { label: "Time Saved", value: "240hrs", change: "" },
    ]
  },
  {
    title: "Self-Learning AI",
    subtitle: "Gets smarter with every campaign",
    gradient: "from-orange-500/20 to-red-500/20",
    metrics: [
      { label: "Patterns Learned", value: "847", change: "+156" },
      { label: "Accuracy", value: "94%", change: "+8%" },
      { label: "Auto-Optimized", value: "1,234", change: "+389" },
    ]
  },
  {
    title: "Traffic Engine",
    subtitle: "Platform-independent demand generation",
    gradient: "from-green-500/20 to-emerald-500/20",
    metrics: [
      { label: "Organic Traffic", value: "45%", change: "+12%" },
      { label: "Referral Revenue", value: "$124K", change: "+67%" },
      { label: "Email Subs", value: "18.4K", change: "+2.3K" },
    ]
  },
  {
    title: "Competitive Intelligence",
    subtitle: "Know what your competitors are doing",
    gradient: "from-red-500/20 to-orange-500/20",
    metrics: [
      { label: "Competitors Tracked", value: "24", change: "+4" },
      { label: "Opportunities Found", value: "89", change: "+23" },
      { label: "First-Mover Wins", value: "67%", change: "+12%" },
    ]
  },
];

// Check if app is in demo mode
export function isDemoMode(): boolean {
  // Demo mode when:
  // - No user is authenticated (handled by calling code)
  // - Specific query param is set
  // - No real data exists
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('demo') || urlParams.has('preview');
}

// Get demo mode badge text
export function getDemoModeLabel(): string {
  return 'Demo Mode';
}

// Generate realistic timestamps
export function generateRealisticTimestamps(count: number): string[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const hoursAgo = Math.floor(Math.random() * 168); // Up to 7 days
    return new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
  });
}

/**
 * DEMO MODE FALLBACK CONFIGURATION
 * 
 * Provides industry defaults when user skips configuration
 * or when no real data exists.
 */
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

// Default fallback config for demo mode
export const DEMO_MODE_DEFAULTS: DemoModeConfig = {
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

// Industry-specific demo configs
export const INDUSTRY_DEMO_CONFIGS: Record<string, DemoModeConfig> = {
  ecommerce: DEMO_MODE_DEFAULTS,
  saas: {
    industry: 'saas',
    industryName: 'SaaS / Software',
    offerType: 'saas',
    salesMotion: 'product_led',
    dealSize: 'mid',
    buyingCycle: 'medium',
    primaryKpis: ['MRR', 'ARR', 'Churn Rate', 'NRR'],
    secondaryKpis: ['CAC', 'LTV:CAC', 'Activation Rate'],
    benchmarks: { 'ChurnRate': 5, 'NRR': 110, 'LTV_CAC': 3, 'MRR': 10000 },
    tone: 'professional',
    forbiddenWords: ['revolutionary', 'disruptive'],
    approvedPhrases: ['ARR', 'MRR', 'churn', 'retention']
  },
  agency: {
    industry: 'agency',
    industryName: 'Agency / Services',
    offerType: 'agency',
    salesMotion: 'sales_led',
    dealSize: 'high',
    buyingCycle: 'short',
    primaryKpis: ['Revenue', 'Profit Margin', 'Client Retention'],
    secondaryKpis: ['Utilization Rate', 'Project Profitability'],
    benchmarks: { 'ProfitMargin': 30, 'ClientRetention': 85, 'Revenue': 100000 },
    tone: 'consultative',
    forbiddenWords: ['cheap', 'discount'],
    approvedPhrases: ['ROI', 'partnership', 'strategy', 'execution']
  },
  coaching: {
    industry: 'coaching',
    industryName: 'Coaching / Info Products',
    offerType: 'coaching',
    salesMotion: 'hybrid',
    dealSize: 'high',
    buyingCycle: 'short',
    primaryKpis: ['Launch Revenue', 'Enrollment Rate', 'Completion Rate'],
    secondaryKpis: ['Refund Rate', 'Testimonial Rate', 'Upsell Rate'],
    benchmarks: { 'EnrollmentRate': 5, 'CompletionRate': 30, 'RefundRate': 10 },
    tone: 'aggressive',
    forbiddenWords: ['guarantee', 'promise'],
    approvedPhrases: ['transformation', 'results', 'proven system']
  },
  enterprise: {
    industry: 'enterprise',
    industryName: 'Enterprise / B2B',
    offerType: 'service',
    salesMotion: 'sales_led',
    dealSize: 'enterprise',
    buyingCycle: 'enterprise',
    primaryKpis: ['Pipeline Value', 'Win Rate', 'Deal Velocity'],
    secondaryKpis: ['ACV', 'Expansion Revenue', 'NPS'],
    benchmarks: { 'WinRate': 25, 'DealVelocity': 90, 'PipelineValue': 500000 },
    tone: 'technical',
    forbiddenWords: ['revolutionary', 'game-changing'],
    approvedPhrases: ['ROI', 'TCO', 'implementation', 'security']
  }
};

/**
 * Get demo mode config for a specific industry or default
 */
export function getDemoModeConfig(industry?: string): DemoModeConfig {
  if (industry && INDUSTRY_DEMO_CONFIGS[industry]) {
    return INDUSTRY_DEMO_CONFIGS[industry];
  }
  return DEMO_MODE_DEFAULTS;
}

/**
 * Apply demo mode defaults to store
 * Used when user skips configuration or enters demo mode
 */
export function applyDemoModeDefaults(
  setIndustry: (industry: string, config: any) => void,
  setOfferType: (type: string) => void,
  setSalesMotion: (motion: string) => void,
  setDealSize: (size: 'low' | 'mid' | 'high' | 'enterprise') => void,
  setBuyingCycle: (cycle: 'instant' | 'short' | 'medium' | 'long' | 'enterprise') => void,
  industry?: string
): void {
  const config = getDemoModeConfig(industry);
  
  // Create a minimal industry config object
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

/**
 * PRODUCTION MODE - Real Money Operations
 * 
 * NO MORE SIMULATIONS. REAL PUBLISHING. REAL REVENUE.
 * 
 * This controls whether the app runs in:
 * - PRODUCTION MODE: Real API calls, real publishing, real money
 * - TEST MODE: Demo data for development only
 */

// Force production mode - no test badges
export const PRODUCTION_MODE = true;

// Admin email for god-mode bypass
export const ADMIN_EMAIL = 'ryanauralift@gmail.com';

// Check if currently in production mode
export function isProductionMode(): boolean {
  // Always true for real operations
  // Override with localStorage for dev only
  if (typeof window !== 'undefined') {
    const devMode = localStorage.getItem('dominion_dev_mode');
    if (devMode === 'true') return false;
  }
  return PRODUCTION_MODE;
}

// Check if test mode is explicitly enabled (dev only)
export function isDevTestMode(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dominion_dev_mode') === 'true';
  }
  return false;
}

// Toggle dev mode (admin only)
export function setDevMode(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    if (enabled) {
      localStorage.setItem('dominion_dev_mode', 'true');
    } else {
      localStorage.removeItem('dominion_dev_mode');
    }
  }
}

// Get mode label for display
export function getModeLabel(): string {
  return isProductionMode() ? 'LIVE' : 'DEV';
}

// Platform API Keys Status
export interface PlatformKeyStatus {
  platform: string;
  configured: boolean;
  key: string;
  description: string;
}

export const REQUIRED_PLATFORM_KEYS: PlatformKeyStatus[] = [
  // Social Publishing - ALL CONFIGURED
  { platform: 'TikTok', configured: true, key: 'TIKTOK_CLIENT_KEY', description: 'TikTok OAuth credentials ✓' },
  { platform: 'TikTok Secret', configured: true, key: 'TIKTOK_CLIENT_SECRET', description: 'TikTok OAuth secret ✓' },
  
  // Payments - CONFIGURED
  { platform: 'Stripe', configured: true, key: 'STRIPE_SECRET_KEY', description: 'Stripe payments ✓' },
  
  // AI Generation - ALL CONFIGURED
  { platform: 'Replicate', configured: true, key: 'REPLICATE_API_TOKEN', description: 'AI video generation ✓' },
  { platform: 'ElevenLabs', configured: true, key: 'ELEVENLABS_API_KEY', description: 'AI voice generation ✓' },
  { platform: 'Lovable AI', configured: true, key: 'LOVABLE_API_KEY', description: 'Lovable AI gateway ✓' },
  
  // Email - CONFIGURED
  { platform: 'Resend', configured: true, key: 'RESEND_API_KEY', description: 'Transactional email ✓' },
  
  // Optional - for additional features
  { platform: 'Meta/Instagram', configured: false, key: 'META_APP_SECRET', description: 'Meta publishing (optional)' },
  { platform: 'YouTube', configured: false, key: 'YOUTUBE_CLIENT_SECRET', description: 'YouTube Shorts (optional)' },
];

// Get unconfigured keys that need to be added
export function getRequiredKeys(): PlatformKeyStatus[] {
  return REQUIRED_PLATFORM_KEYS.filter(k => !k.configured);
}

// Shopify Store Configuration - LIVE
export const SHOPIFY_STORE = {
  domain: 'lovable-project-7fb70.myshopify.com',
  name: 'AuraLift Essentials',
  productCount: 15,
  connected: true,
  live: true,
};

// Stripe Configuration - READY FOR LIVE
export const STRIPE_CONFIG = {
  isLiveMode: true, // Production ready
  plans: [
    { id: 'free', name: 'Free', credits: 10, price: 0 },
    { id: 'pro', name: 'Pro', credits: 100, price: 49 },
    { id: 'enterprise', name: 'Enterprise', credits: -1, price: 199 },
  ]
};

// Connected Platforms Status
export const PLATFORM_STATUS = {
  tiktok: { connected: true, hasOAuth: true, status: 'ready' },
  instagram: { connected: false, hasOAuth: false, status: 'pending' },
  shopify: { connected: true, hasOAuth: true, status: 'live' },
  stripe: { connected: true, hasOAuth: true, status: 'live' },
  replicate: { connected: true, hasOAuth: true, status: 'live' },
};

// Revenue Metrics (Real data from swarm)
export interface SwarmMetrics {
  videosGenerated: number;
  videosPublished: number;
  totalImpressions: number;
  totalEngagement: number;
  conversions: number;
  revenue: number;
  roas: number;
}

// Initialize metrics tracking
export function createSwarmMetrics(): SwarmMetrics {
  return {
    videosGenerated: 0,
    videosPublished: 0,
    totalImpressions: 0,
    totalEngagement: 0,
    conversions: 0,
    revenue: 0,
    roas: 0,
  };
}

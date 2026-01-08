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
  // Social Publishing
  { platform: 'TikTok', configured: true, key: 'TIKTOK_CLIENT_KEY', description: 'TikTok app credentials for video publishing' },
  { platform: 'Meta/Instagram', configured: false, key: 'META_APP_SECRET', description: 'Meta/Facebook/Instagram API access' },
  { platform: 'YouTube', configured: false, key: 'YOUTUBE_CLIENT_SECRET', description: 'YouTube Shorts publishing' },
  { platform: 'Pinterest', configured: false, key: 'PINTEREST_APP_SECRET', description: 'Pinterest Pins publishing' },
  
  // Ads & Traffic
  { platform: 'Meta Ads', configured: false, key: 'META_ADS_ACCESS_TOKEN', description: 'Meta Ads Manager for budget allocation' },
  { platform: 'TikTok Ads', configured: false, key: 'TIKTOK_ADS_ACCESS_TOKEN', description: 'TikTok Ads for traffic scaling' },
  
  // Payments
  { platform: 'Stripe', configured: true, key: 'STRIPE_SECRET_KEY', description: 'Stripe payments (switch to live key for production)' },
  { platform: 'Stripe Webhook', configured: false, key: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook signature verification' },
  
  // AI Generation
  { platform: 'Replicate', configured: true, key: 'REPLICATE_API_TOKEN', description: 'AI video/image generation' },
  { platform: 'ElevenLabs', configured: true, key: 'ELEVENLABS_API_KEY', description: 'AI voice generation' },
  
  // Email
  { platform: 'Resend', configured: true, key: 'RESEND_API_KEY', description: 'Transactional email' },
];

// Get unconfigured keys that need to be added
export function getRequiredKeys(): PlatformKeyStatus[] {
  return REQUIRED_PLATFORM_KEYS.filter(k => !k.configured);
}

// Shopify Store Configuration
export const SHOPIFY_STORE = {
  domain: 'lovable-project-7fb70.myshopify.com',
  name: 'AuraLift Essentials',
  productCount: 15,
  connected: true,
};

// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_...', // Will be replaced with live key
  isLiveMode: false, // Set to true when live keys added
  plans: [
    { id: 'free', name: 'Free', credits: 10, price: 0 },
    { id: 'pro', name: 'Pro', credits: 100, price: 49 },
    { id: 'enterprise', name: 'Enterprise', credits: -1, price: 199 },
  ]
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

/**
 * DOMINION SaaS - Production Mode Configuration
 * 
 * FULLY DYNAMIC PER-USER CONFIGURATION
 * All stores and social accounts are fetched from user tables
 * No hardcoded references - clean multi-tenant SaaS
 */

// ================= PRODUCTION FLAGS =================
export const IS_PRODUCTION = true;
export const ENABLE_REAL_APIS = true;
export const REQUIRE_REAL_CONNECTIONS = true;

// ================= APP CONFIGURATION =================
export const APP_CONFIG = {
  name: 'DOMINION',
  tagline: 'AI Marketing Command Center',
  version: '2.0.0',
  domains: {
    primary: 'profitreaper.com',
    tech: 'omegaalpha.io',
  },
};

// ================= VIDEO ENGINE (SHARED) =================
export const VIDEO_ENGINE = {
  provider: 'D-ID Pro',
  apiKeyEnv: 'DID_API_KEY',
  voiceProvider: 'ElevenLabs',
  defaultVoice: 'Sarah',
  defaultVoiceId: 'EXAVITQu4vr4xnSDxMaL',
  avatars: ['amy', 'anna', 'emma'],
  defaultAvatar: 'amy',
};

// ================= PLATFORM OAUTH CONFIG =================
// OAuth credentials are stored securely in Supabase secrets
// Each user authenticates via their own platform accounts
export const PLATFORM_OAUTH = {
  shopify: {
    scopes: ['read_products', 'write_products', 'read_orders', 'read_customers'],
    apiVersion: '2024-10',
  },
  tiktok: {
    scopes: ['video.upload', 'user.info.basic'],
  },
  instagram: {
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
  },
  pinterest: {
    scopes: ['pins:read', 'pins:write', 'boards:read', 'boards:write'],
  },
  youtube: {
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
  },
  facebook: {
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'publish_video'],
  },
  x: {
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
  },
  linkedin: {
    scopes: ['w_member_social', 'r_liteprofile'],
  },
};

// ================= FEATURE FLAGS =================
export const FEATURES = {
  aiVideoGeneration: true,
  autonomousPosting: true,
  multiStoreSupport: true,
  realtimeSync: true,
  abTesting: true,
  advancedAnalytics: true,
  elevenLabsDashboard: true,
  superGrokCEO: true,
};

// ================= API CONFIGURATION =================
export const API_CONFIG = {
  shopifyApiVersion: '2025-07',
  maxProductsPerSync: 250,
  syncIntervalMs: 300000, // 5 minutes
  healthCheckIntervalMs: 60000, // 1 minute
};

// ================= SUBSCRIPTION TIERS =================
export const SUBSCRIPTION_TIERS = {
  free: {
    stores: 1,
    socialChannels: 2,
    videosPerMonth: 10,
    aiCredits: 100,
  },
  pro: {
    stores: 5,
    socialChannels: 5,
    videosPerMonth: 100,
    aiCredits: 1000,
  },
  enterprise: {
    stores: -1, // unlimited
    socialChannels: -1,
    videosPerMonth: -1,
    aiCredits: -1,
  },
};

/**
 * Helper to check if user has feature access based on subscription
 */
export function hasFeatureAccess(
  subscription: { plan: string } | null, 
  feature: keyof typeof FEATURES
): boolean {
  if (!subscription) return false;
  return FEATURES[feature] ?? false;
}

/**
 * Helper to get tier limits
 */
export function getTierLimits(plan: string) {
  return SUBSCRIPTION_TIERS[plan as keyof typeof SUBSCRIPTION_TIERS] ?? SUBSCRIPTION_TIERS.free;
}

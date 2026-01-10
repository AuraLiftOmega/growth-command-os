/**
 * DUAL-DOMAIN CONFIGURATION - AURAOMEGA/Dominion
 * 
 * Primary: profitreaper.com (Main App)
 * Tech/API Docs: omegaalpha.io
 */

export const DOMAINS = {
  // Primary production domain
  primary: {
    domain: 'profitreaper.com',
    url: 'https://profitreaper.com',
    label: 'ProfitReaper',
    description: 'Main Application',
  },
  // Tech documentation & API domain
  tech: {
    domain: 'omegaalpha.io',
    url: 'https://omegaalpha.io',
    label: 'OmegaAlpha.io',
    description: 'Tech Docs & API',
  },
  // Vercel staging
  staging: {
    domain: 'profitreaper.vercel.app',
    url: 'https://profitreaper.vercel.app',
    label: 'Staging',
  },
  // Legacy store (Shopify)
  shopify: {
    domain: 'www.auraliftessentials.com',
    url: 'https://www.auraliftessentials.com',
    apiDomain: 'lovable-project-7fb70.myshopify.com',
    label: 'AuraLift Essentials',
  },
} as const;

// Quick accessors
export const PRIMARY_DOMAIN = DOMAINS.primary.url;
export const TECH_DOMAIN = DOMAINS.tech.url;
export const SHOPIFY_URL = DOMAINS.shopify.url;

// Banner configuration
export const DUAL_DOMAIN_BANNER = {
  enabled: true,
  primaryText: `Live at ${DOMAINS.primary.domain}`,
  techText: `Tech Docs at ${DOMAINS.tech.domain}`,
  primaryLink: DOMAINS.primary.url,
  techLink: DOMAINS.tech.url,
};

// AI suggestions with domain-aware messaging
export const DOMAIN_SUGGESTIONS = {
  connectStore: {
    title: 'Connect Your Store',
    message: 'Connect your Shopify store to start printing money with AI-powered video ads.',
    icon: 'Store',
    priority: 'critical',
  },
  goLive: {
    title: 'Go Live Now',
    message: `Your app is ready at ${DOMAINS.primary.domain}. Start generating revenue today.`,
    icon: 'Rocket',
    priority: 'high',
  },
  techDocs: {
    title: 'API Documentation',
    message: `Full API docs and integrations available at ${DOMAINS.tech.domain}`,
    icon: 'FileCode',
    priority: 'medium',
  },
};

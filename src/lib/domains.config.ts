/**
 * CANONICAL DOMAIN ARCHITECTURE
 * 
 * Primary Control Plane: omegaalpha.io (Lovable master control, Payments Spine, dashboards)
 * Primary Commerce: auraliftessentials.com (Shopify storefront, customer-facing)
 * Secondary/Future: profitreaper.com (parked or future product)
 * 
 * NEVER USE: *.myshopify.com publicly (internal only)
 */

export const DOMAINS = {
  // Primary control plane domain - ALL admin/operator functions
  primary: {
    domain: 'omegaalpha.io',
    url: 'https://omegaalpha.io',
    label: 'Omega Alpha Control Plane',
    type: 'control' as const,
    purpose: 'Payments Spine, Dashboards, Growth Engine, Ads, Analytics, Alerts',
  },
  
  // Primary commerce/storefront domain - ALL customer-facing
  storefront: {
    domain: 'auraliftessentials.com',
    url: 'https://auraliftessentials.com',
    label: 'AuraLift Essentials',
    type: 'storefront' as const,
    purpose: 'Shopify storefront, Stripe checkout, Customer experience',
    shopifyInternal: 'aura-lift-essentials.myshopify.com', // Never expose publicly
  },
  
  // Secondary domain - future product or redirect
  secondary: {
    domain: 'profitreaper.com',
    url: 'https://profitreaper.com',
    label: 'Profit Reaper',
    type: 'secondary' as const,
    purpose: 'Future product or 301 redirect to omegaalpha.io',
  },
} as const;

export const BRANDING = {
  controlPlane: {
    name: 'Omega Alpha',
    tagline: 'AI Commerce Command Center',
    description: 'Unified control plane for payments, growth, and analytics',
    company: 'Omega Alpha Technologies',
  },
  storefront: {
    name: 'AuraLift Essentials',
    tagline: 'Elevate Your Everyday',
    description: 'Premium wellness and lifestyle products',
  },
};

// Domain detection utilities
export function isControlPlaneDomain(hostname: string): boolean {
  return hostname.includes('omegaalpha.io') || hostname.includes('localhost');
}

export function isStorefrontDomain(hostname: string): boolean {
  return hostname.includes('auraliftessentials.com');
}

export function isSecondaryDomain(hostname: string): boolean {
  return hostname.includes('profitreaper.com');
}

export function getDomainConfig(hostname: string) {
  if (isControlPlaneDomain(hostname)) return DOMAINS.primary;
  if (isStorefrontDomain(hostname)) return DOMAINS.storefront;
  if (isSecondaryDomain(hostname)) return DOMAINS.secondary;
  return DOMAINS.primary; // Default to control plane
}

export function getBranding(hostname: string) {
  if (isStorefrontDomain(hostname)) return BRANDING.storefront;
  return BRANDING.controlPlane;
}

// Stripe routing - checkout ONLY on storefront domain
export const STRIPE_CONFIG = {
  checkoutDomain: DOMAINS.storefront.domain,
  webhookDomain: DOMAINS.primary.domain, // Payments Spine receives all webhooks
  publishableKeyAllowedOn: [DOMAINS.storefront.domain], // Only storefront gets pk_live
};

// Redirect rules
export const REDIRECTS = {
  // www variants redirect to non-www
  'www.auraliftessentials.com': 'auraliftessentials.com',
  'www.omegaalpha.io': 'omegaalpha.io',
  // Secondary redirects to control plane (optional)
  'profitreaper.com': 'omegaalpha.io',
  'www.profitreaper.com': 'omegaalpha.io',
};

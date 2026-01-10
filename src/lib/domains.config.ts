/**
 * DOMINION SaaS - Domain Configuration
 * 
 * Primary: profitreaper.com (main app)
 * Tech/Docs: omegaalpha.io (API documentation, tech resources)
 */

export const DOMAINS = {
  // Primary application domain
  primary: {
    domain: 'profitreaper.com',
    url: 'https://profitreaper.com',
    label: 'DOMINION App',
    type: 'application' as const,
  },
  
  // Tech documentation domain
  tech: {
    domain: 'omegaalpha.io',
    url: 'https://omegaalpha.io',
    label: 'Tech & API Docs',
    type: 'documentation' as const,
  },
} as const;

export const BRANDING = {
  appName: 'DOMINION',
  tagline: 'AI Marketing Command Center',
  description: 'Autonomous AI-powered marketing platform for e-commerce',
  company: 'Omega Alpha Technologies',
};

export function getDomainLabel(hostname: string): string {
  if (hostname.includes('profitreaper.com')) {
    return DOMAINS.primary.label;
  }
  if (hostname.includes('omegaalpha.io')) {
    return DOMAINS.tech.label;
  }
  return BRANDING.appName;
}

export function isPrimaryDomain(hostname: string): boolean {
  return hostname.includes('profitreaper.com') || hostname.includes('localhost');
}

export function isTechDomain(hostname: string): boolean {
  return hostname.includes('omegaalpha.io');
}

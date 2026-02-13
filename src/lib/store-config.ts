/**
 * DYNAMIC STORE CONFIGURATION - AURAOMEGA / Dominion SaaS Platform
 * 
 * Per-user dynamic configuration - NO hardcoded stores.
 * Each user connects their own Shopify store via OAuth.
 * 
 * Provides default branding for unconnected users (the SaaS platform itself)
 */

// Platform Branding (store connected: Aura Luxe)
export const PLATFORM_CONFIG = {
  name: "Aura Lift Essentials",
  shortName: "Aura Lift",
  domain: "growth-command-os.lovable.app",
  fullUrl: "https://growth-command-os.lovable.app",
  tagline: "Premium Beauty & Skincare",
  email: "hello@auraliftessentials.com",
  phone: "",
  description: "Discover our curated collection of premium skincare and beauty essentials.",
  instagram: "@auraliftessentials",
  tiktok: "@auraliftessentials",
  pinterest: "auraliftessentials",
  
  // Helper functions for platform (not user store)
  getShareUrl: (path: string = "") => `https://growth-command-os.lovable.app${path}`,
  getProductUrl: (handle: string) => `/product/${handle}`,
  getStoreUrl: () => "/store",
} as const;

// Export for backward compatibility - components should migrate to useActiveStore
export const STORE_CONFIG = PLATFORM_CONFIG;

// AURAOMEGA Platform Logo
export const DOMINION_LOGO_URL = "https://files.catbox.moe/0k2q8l.png";
export const AURAOMEGA_LOGO_URL = DOMINION_LOGO_URL;

/**
 * Helper to generate dynamic store config from user's connected store
 */
export function createStoreConfig(store: {
  store_name: string;
  store_domain: string;
  email?: string;
}) {
  const domain = store.store_domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const baseDomain = domain.replace('.myshopify.com', '');
  
  return {
    name: store.store_name || baseDomain,
    shortName: store.store_name?.split(' ')[0] || baseDomain,
    domain: domain,
    fullUrl: `https://${domain}`,
    tagline: "Your Store",
    email: store.email || `hello@${baseDomain}.com`,
    phone: "",
    description: "",
    instagram: "",
    tiktok: "",
    pinterest: "",
    getShareUrl: (path: string = "") => `https://${domain}${path}`,
    getProductUrl: (handle: string) => `/product/${handle}`,
    getStoreUrl: () => "/store",
  };
}

/**
 * Dynamic script generation without hardcoded domains
 */
export const SCRIPT_TEMPLATES = {
  excited: (title: string, desc: string, domain?: string) => {
    const shopUrl = domain ? `Shop ${domain}!` : 'Link in bio!';
    return `OMG you NEED to try ${title}! ${desc} - I literally can't live without it! ${shopUrl}`;
  },
  calm: (title: string, desc: string, storeName?: string, domain?: string) => {
    const brand = storeName || 'our store';
    const shopUrl = domain ? `Shop now at ${domain}!` : 'Link in bio!';
    return `Discover ${title} from ${brand}. ${desc}. ${shopUrl}`;
  },
  urgent: (title: string, desc: string, domain?: string) => {
    const shopUrl = domain ? domain : 'Link in bio';
    return `STOP scrolling! ${title} is selling out fast. ${desc}. Get yours before it's gone - ${shopUrl}!`;
  },
};

/**
 * Generate ad script with dynamic store info
 */
export function generateAdScript(
  template: keyof typeof SCRIPT_TEMPLATES,
  product: { title: string; description?: string },
  store?: { name?: string; domain?: string }
) {
  const desc = product.description?.slice(0, 100) || 'Amazing product';
  
  switch (template) {
    case 'excited':
      return SCRIPT_TEMPLATES.excited(product.title, desc, store?.domain);
    case 'calm':
      return SCRIPT_TEMPLATES.calm(product.title, desc, store?.name, store?.domain);
    case 'urgent':
      return SCRIPT_TEMPLATES.urgent(product.title, desc, store?.domain);
    default:
      return SCRIPT_TEMPLATES.calm(product.title, desc, store?.name, store?.domain);
  }
}

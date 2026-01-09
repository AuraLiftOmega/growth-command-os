// AuraLift Essentials Store Configuration
export const STORE_CONFIG = {
  name: "AuraLift Essentials",
  shortName: "AuraLift",
  domain: "auraliftessentials.com",
  fullUrl: "https://auraliftessentials.com",
  tagline: "Premium Skincare Essentials",
  email: "hello@auraliftessentials.com",
  phone: "1-800-AURALIFT",
  description: "Premium skincare essentials for radiant, luminous skin. Science-backed formulas for your daily glow.",
  
  // Social sharing
  getShareUrl: (path: string = "") => `https://auraliftessentials.com${path}`,
  getProductUrl: (handle: string) => `https://auraliftessentials.com/product/${handle}`,
  getStoreUrl: () => "https://auraliftessentials.com/store",
} as const;

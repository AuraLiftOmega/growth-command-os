// AuraLift Essentials Store Configuration
// OFFICIAL DOMAIN: www.auraliftessentials.com
export const STORE_CONFIG = {
  name: "AuraLift Essentials",
  shortName: "AuraLift",
  domain: "www.auraliftessentials.com",
  fullUrl: "https://www.auraliftessentials.com",
  tagline: "Premium Skincare for Radiant Skin",
  email: "hello@auraliftessentials.com",
  phone: "1-800-AURALIFT",
  description: "Luxury skincare essentials for radiant, luminous skin. Science-backed formulas with natural botanicals for your daily glow.",
  
  // Social handles
  instagram: "@auraliftessentials",
  tiktok: "@auraliftessentials",
  pinterest: "auraliftessentials",
  
  // Social sharing
  getShareUrl: (path: string = "") => `https://www.auraliftessentials.com${path}`,
  getProductUrl: (handle: string) => `https://www.auraliftessentials.com/product/${handle}`,
  getStoreUrl: () => "https://www.auraliftessentials.com/store",
  
  // Product list (official names)
  products: [
    "Radiance Vitamin C Serum",
    "Hydra-Glow Retinol Night Cream", 
    "Ultra Hydration Hyaluronic Serum",
    "Omega Glow Collagen Peptide Moisturizer",
    "Luxe Rose Quartz Face Roller Set"
  ]
} as const;

// Dominion Platform Logo
export const DOMINION_LOGO_URL = "https://files.catbox.moe/0k2q8l.png";

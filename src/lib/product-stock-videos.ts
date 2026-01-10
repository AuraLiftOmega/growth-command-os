/**
 * PRODUCT-SPECIFIC STOCK VIDEO MAPPING
 * 
 * High-match fallback videos for AuraLift products:
 * - Visual similarity to real products (same category, color, premium feel)
 * - No random unrelated content
 * - Vertical 9:16 format for TikTok/Pinterest
 */

export interface ProductStockVideo {
  id: string;
  url: string;
  hd_url: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  match_quality: 'exact' | 'close' | 'category';
  keywords: string[];
}

export interface ProductFallbackConfig {
  product_handle: string;
  product_title: string;
  videos: ProductStockVideo[];
  static_image: string;
  color_palette: string[];
  product_type: string;
}

// AuraLift Product-Specific Stock Video Mapping
export const PRODUCT_STOCK_VIDEOS: Record<string, ProductFallbackConfig> = {
  'radiance-vitamin-c-serum': {
    product_handle: 'radiance-vitamin-c-serum',
    product_title: 'Radiance Vitamin C Serum',
    color_palette: ['#ff9800', '#ffb74d', '#fff3e0'], // Orange/yellow for Vitamin C
    product_type: 'serum',
    static_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
    videos: [
      {
        id: 'vitc-1',
        url: 'https://videos.pexels.com/video-files/6974595/6974595-uhd_1440_2560_25fps.mp4',
        hd_url: 'https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4',
        title: 'Woman applying vitamin C serum',
        description: 'Close-up of luxury serum application, orange glow',
        duration: 15,
        thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
        match_quality: 'close',
        keywords: ['vitamin c', 'serum', 'glow', 'brightening', 'orange']
      },
      {
        id: 'vitc-2',
        url: 'https://videos.pexels.com/video-files/5069610/5069610-uhd_1440_2560_30fps.mp4',
        hd_url: 'https://videos.pexels.com/video-files/5069610/5069610-hd_1080_1920_30fps.mp4',
        title: 'Skincare serum dropper application',
        description: 'Premium glass dropper bottle, serum texture',
        duration: 14,
        thumbnail: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400',
        match_quality: 'close',
        keywords: ['serum', 'dropper', 'luxury', 'skincare']
      }
    ]
  },
  
  'hydra-glow-retinol-night-cream': {
    product_handle: 'hydra-glow-retinol-night-cream',
    product_title: 'Hydra-Glow Retinol Night Cream',
    color_palette: ['#7c4dff', '#9575cd', '#ede7f6'], // Purple/violet for night cream
    product_type: 'cream',
    static_image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800',
    videos: [
      {
        id: 'retinol-1',
        url: 'https://videos.pexels.com/video-files/5069413/5069413-uhd_1440_2560_30fps.mp4',
        hd_url: 'https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4',
        title: 'Night skincare routine application',
        description: 'Soft lighting, cream jar, nighttime beauty ritual',
        duration: 12,
        thumbnail: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400',
        match_quality: 'close',
        keywords: ['night cream', 'retinol', 'anti-aging', 'luxury']
      },
      {
        id: 'retinol-2',
        url: 'https://videos.pexels.com/video-files/3997796/3997796-uhd_1440_2560_25fps.mp4',
        hd_url: 'https://videos.pexels.com/video-files/3997796/3997796-hd_1080_1920_25fps.mp4',
        title: 'Premium cream texture closeup',
        description: 'White/cream color jar, elegant packaging',
        duration: 10,
        thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        match_quality: 'category',
        keywords: ['cream', 'jar', 'texture', 'premium']
      }
    ]
  },
  
  'ultra-hydration-hyaluronic-serum': {
    product_handle: 'ultra-hydration-hyaluronic-serum',
    product_title: 'Ultra Hydration Hyaluronic Serum',
    color_palette: ['#03a9f4', '#4fc3f7', '#e1f5fe'], // Blue for hydration
    product_type: 'serum',
    static_image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800',
    videos: [
      {
        id: 'hyalu-1',
        url: 'https://videos.pexels.com/video-files/5069387/5069387-uhd_1440_2560_30fps.mp4',
        hd_url: 'https://videos.pexels.com/video-files/5069387/5069387-hd_1080_1920_30fps.mp4',
        title: 'Hyaluronic serum water droplets',
        description: 'Clear serum, water-based, hydrating aesthetic',
        duration: 11,
        thumbnail: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
        match_quality: 'close',
        keywords: ['hyaluronic', 'hydration', 'serum', 'water', 'clear']
      },
      {
        id: 'hyalu-2',
        url: 'https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4',
        hd_url: 'https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4',
        title: 'Serum application on skin',
        description: 'Dewy, hydrated skin, serum absorption',
        duration: 15,
        thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
        match_quality: 'category',
        keywords: ['serum', 'hydration', 'dewy', 'skincare']
      }
    ]
  },
  
  'omega-glow-collagen-peptide-moisturizer': {
    product_handle: 'omega-glow-collagen-peptide-moisturizer',
    product_title: 'Omega Glow Collagen Peptide Moisturizer',
    color_palette: ['#ffd700', '#fff9c4', '#fffde7'], // Gold for premium collagen
    product_type: 'moisturizer',
    static_image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
    videos: [
      {
        id: 'collagen-1',
        url: 'https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4',
        hd_url: 'https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4',
        title: 'Premium moisturizer cream application',
        description: 'White/gold packaging, rich cream texture',
        duration: 12,
        thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        match_quality: 'close',
        keywords: ['collagen', 'peptide', 'moisturizer', 'anti-aging']
      },
      {
        id: 'collagen-2',
        url: 'https://videos.pexels.com/video-files/3997796/3997796-hd_1080_1920_25fps.mp4',
        hd_url: 'https://videos.pexels.com/video-files/3997796/3997796-hd_1080_1920_25fps.mp4',
        title: 'Luxury skincare products display',
        description: 'Premium cream jars, elegant setup',
        duration: 10,
        thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        match_quality: 'category',
        keywords: ['cream', 'luxury', 'premium', 'moisturizer']
      }
    ]
  },
  
  'luxe-rose-quartz-face-roller-set': {
    product_handle: 'luxe-rose-quartz-face-roller-set',
    product_title: 'Luxe Rose Quartz Face Roller Set',
    color_palette: ['#f8bbd9', '#fce4ec', '#f48fb1'], // Pink for rose quartz
    product_type: 'tool',
    static_image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800',
    videos: [
      {
        id: 'roller-1',
        url: 'https://videos.pexels.com/video-files/5069610/5069610-hd_1080_1920_30fps.mp4',
        hd_url: 'https://videos.pexels.com/video-files/5069610/5069610-hd_1080_1920_30fps.mp4',
        title: 'Face massage with rose quartz roller',
        description: 'Pink stone roller, spa-like application',
        duration: 14,
        thumbnail: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=400',
        match_quality: 'close',
        keywords: ['rose quartz', 'face roller', 'gua sha', 'spa', 'pink']
      },
      {
        id: 'roller-2',
        url: 'https://videos.pexels.com/video-files/5069387/5069387-hd_1080_1920_30fps.mp4',
        hd_url: 'https://videos.pexels.com/video-files/5069387/5069387-hd_1080_1920_30fps.mp4',
        title: 'Skincare tools on marble',
        description: 'Luxury beauty tools, pink aesthetic',
        duration: 11,
        thumbnail: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=400',
        match_quality: 'category',
        keywords: ['beauty tools', 'roller', 'spa', 'self-care']
      }
    ]
  }
};

// Generic fallback for unknown products
export const GENERIC_SKINCARE_VIDEOS: ProductStockVideo[] = [
  {
    id: 'generic-1',
    url: 'https://videos.pexels.com/video-files/6974595/6974595-uhd_1440_2560_25fps.mp4',
    hd_url: 'https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4',
    title: 'Woman applying skincare',
    description: 'Generic skincare application, clean aesthetic',
    duration: 15,
    thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    match_quality: 'category',
    keywords: ['skincare', 'beauty', 'routine']
  },
  {
    id: 'generic-2',
    url: 'https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4',
    hd_url: 'https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4',
    title: 'Beauty routine',
    description: 'General skincare routine video',
    duration: 12,
    thumbnail: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400',
    match_quality: 'category',
    keywords: ['beauty', 'routine', 'skincare']
  }
];

/**
 * Get the best matching stock video for a product
 */
export function getProductStockVideo(
  productHandle: string, 
  preferQuality: 'exact' | 'close' | 'category' = 'close'
): ProductStockVideo {
  const productConfig = PRODUCT_STOCK_VIDEOS[productHandle];
  
  if (productConfig && productConfig.videos.length > 0) {
    // Try to find preferred quality match
    const preferred = productConfig.videos.find(v => v.match_quality === preferQuality);
    if (preferred) return preferred;
    
    // Return best available
    const sorted = [...productConfig.videos].sort((a, b) => {
      const qualityOrder = { exact: 0, close: 1, category: 2 };
      return qualityOrder[a.match_quality] - qualityOrder[b.match_quality];
    });
    return sorted[0];
  }
  
  // Fallback to generic
  return GENERIC_SKINCARE_VIDEOS[Math.floor(Math.random() * GENERIC_SKINCARE_VIDEOS.length)];
}

/**
 * Get static product image for quality check fallback
 */
export function getProductStaticImage(productHandle: string): string {
  const productConfig = PRODUCT_STOCK_VIDEOS[productHandle];
  return productConfig?.static_image || 
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800';
}

/**
 * Pinterest-optimized captions for each product
 */
export const PINTEREST_CAPTIONS: Record<string, { title: string; description: string; hashtags: string[] }> = {
  'radiance-vitamin-c-serum': {
    title: 'Radiance Vitamin C Serum – Brighten & Glow ✨',
    description: 'Transform your skin with pure Vitamin C power. Fights dark spots, boosts radiance, and gives you that coveted glow in weeks. Premium skincare from AuraLift Essentials.',
    hashtags: ['#VitaminCSerum', '#Skincare', '#GlowUp', '#BrighteningSkincare', '#SkincareRoutine', '#CleanBeauty']
  },
  'hydra-glow-retinol-night-cream': {
    title: 'Hydra-Glow Retinol Night Cream 🌙',
    description: 'Wake up to younger-looking skin. Our powerful retinol formula works overnight to reduce fine lines and restore your natural radiance. Beauty sleep just got an upgrade.',
    hashtags: ['#RetinolCream', '#NightCream', '#AntiAging', '#Skincare', '#BeautySleep', '#SkincareTips']
  },
  'ultra-hydration-hyaluronic-serum': {
    title: 'Ultra Hydration Hyaluronic Serum 💧',
    description: 'Deep hydration that lasts all day. Our hyaluronic acid formula plumps, smooths, and locks in moisture for dewy, healthy-looking skin. Your skin will thank you.',
    hashtags: ['#HyaluronicAcid', '#HydrationSerum', '#Skincare', '#DewyMakeup', '#SkincareEssentials', '#GlowingSkin']
  },
  'omega-glow-collagen-peptide-moisturizer': {
    title: 'Omega Glow Collagen Peptide Moisturizer ✨',
    description: 'Boost your skin\'s natural collagen production. This peptide-rich moisturizer firms, lifts, and restores youthful elasticity. Premium anti-aging care from AuraLift.',
    hashtags: ['#CollagenBoost', '#PeptideSkincare', '#AntiAging', '#Moisturizer', '#SkincareLuxury', '#YouthfulSkin']
  },
  'luxe-rose-quartz-face-roller-set': {
    title: 'Luxe Rose Quartz Face Roller Set 💎',
    description: 'Elevate your skincare ritual with genuine rose quartz. Depuffs, promotes circulation, and gives you that spa-quality experience at home. Self-care essential.',
    hashtags: ['#FaceRoller', '#RoseQuartz', '#GuaSha', '#SelfCare', '#SpaNight', '#BeautyTools']
  }
};

/**
 * Get Pinterest-optimized caption for a product
 */
export function getPinterestCaption(productHandle: string, productTitle?: string): { title: string; description: string; hashtags: string[] } {
  const cached = PINTEREST_CAPTIONS[productHandle];
  if (cached) return cached;
  
  // Generate generic caption
  const title = productTitle || 'AuraLift Premium Skincare';
  return {
    title: `${title} ✨`,
    description: `Discover premium skincare from AuraLift Essentials. Transform your routine with professional-grade formulas. Shop now at auraliftessentials.com`,
    hashtags: ['#Skincare', '#AuraLift', '#Beauty', '#GlowUp', '#SkincareRoutine', '#CleanBeauty']
  };
}

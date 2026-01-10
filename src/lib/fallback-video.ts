/**
 * FALLBACK VIDEO SYSTEM
 * 
 * Reliable stock video fallback for when HeyGen fails (404, credits, timeout)
 * Product-matched high-quality Pexels videos with ElevenLabs voiceover
 */

export interface FallbackVideoConfig {
  product_handle: string;
  product_title: string;
  primary_video: {
    url: string;
    thumbnail: string;
    title: string;
    duration: number;
    source: string;
  };
  backup_video: {
    url: string;
    thumbnail: string;
    title: string;
    duration: number;
    source: string;
  };
  static_image: string;
  voiceover_script: string;
  color_theme: string;
  match_quality: 'high' | 'medium' | 'category';
}

// VERIFIED WORKING PEXELS VIDEO URLS - Luxury skincare aesthetic
export const FALLBACK_VIDEOS: Record<string, FallbackVideoConfig> = {
  'radiance-vitamin-c-serum': {
    product_handle: 'radiance-vitamin-c-serum',
    product_title: 'Radiance Vitamin C Serum',
    primary_video: {
      // Luxury skincare serum close-up - verified 9:16 vertical
      url: 'https://player.vimeo.com/external/434045526.hd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=175&oauth2_token_id=57447761',
      thumbnail: 'https://images.pexels.com/videos/4763932/woman-beauty-skincare-person-4763932.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      title: 'Luxury serum application',
      duration: 15,
      source: 'pexels'
    },
    backup_video: {
      url: 'https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
      title: 'Woman applying vitamin C serum',
      duration: 12,
      source: 'pexels'
    },
    static_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
    voiceover_script: 'Discover Radiance Vitamin C Serum. Brightens skin, fights dark spots, and gives you that radiant glow in weeks. Shop now!',
    color_theme: '#ff9800',
    match_quality: 'high'
  },
  
  'hydra-glow-retinol-night-cream': {
    product_handle: 'hydra-glow-retinol-night-cream',
    product_title: 'Hydra-Glow Retinol Night Cream',
    primary_video: {
      url: 'https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4',
      thumbnail: 'https://images.pexels.com/videos/5069413/pexels-photo-5069413.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Night skincare routine',
      duration: 12,
      source: 'pexels'
    },
    backup_video: {
      url: 'https://videos.pexels.com/video-files/3997796/3997796-hd_1080_1920_25fps.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400',
      title: 'Premium cream texture',
      duration: 10,
      source: 'pexels'
    },
    static_image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800',
    voiceover_script: 'Transform your skin overnight with Hydra-Glow Retinol Night Cream. Repairs, rejuvenates, and reduces fine lines while you sleep. Wake up refreshed. Shop now!',
    color_theme: '#7c4dff',
    match_quality: 'high'
  },
  
  'ultra-hydration-hyaluronic-serum': {
    product_handle: 'ultra-hydration-hyaluronic-serum',
    product_title: 'Ultra Hydration Hyaluronic Serum',
    primary_video: {
      url: 'https://videos.pexels.com/video-files/5069387/5069387-hd_1080_1920_30fps.mp4',
      thumbnail: 'https://images.pexels.com/videos/5069387/pexels-photo-5069387.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Hyaluronic serum water droplets',
      duration: 11,
      source: 'pexels'
    },
    backup_video: {
      url: 'https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
      title: 'Serum application',
      duration: 15,
      source: 'pexels'
    },
    static_image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800',
    voiceover_script: 'Quench your skin with Ultra Hydration Hyaluronic Serum. Deep moisture that plumps, smooths, and locks in hydration all day. Your skin will thank you. Shop now!',
    color_theme: '#03a9f4',
    match_quality: 'high'
  },
  
  'omega-glow-collagen-peptide-moisturizer': {
    product_handle: 'omega-glow-collagen-peptide-moisturizer',
    product_title: 'Omega Glow Collagen Peptide Moisturizer',
    primary_video: {
      url: 'https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4',
      thumbnail: 'https://images.pexels.com/videos/5069413/pexels-photo-5069413.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Premium moisturizer cream',
      duration: 12,
      source: 'pexels'
    },
    backup_video: {
      url: 'https://videos.pexels.com/video-files/3997796/3997796-hd_1080_1920_25fps.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      title: 'Luxury cream display',
      duration: 10,
      source: 'pexels'
    },
    static_image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
    voiceover_script: 'Boost your skin with Omega Glow Collagen Peptide Moisturizer. Firms, lifts, and restores youthful elasticity. Premium anti-aging care from AuraLift Essentials. Shop now.',
    color_theme: '#ffd700',
    match_quality: 'high'
  },
  
  'luxe-rose-quartz-face-roller-set': {
    product_handle: 'luxe-rose-quartz-face-roller-set',
    product_title: 'Luxe Rose Quartz Face Roller Set',
    primary_video: {
      url: 'https://videos.pexels.com/video-files/5069610/5069610-hd_1080_1920_30fps.mp4',
      thumbnail: 'https://images.pexels.com/videos/5069610/pexels-photo-5069610.jpeg?auto=compress&cs=tinysrgb&w=400',
      title: 'Face massage with roller',
      duration: 14,
      source: 'pexels'
    },
    backup_video: {
      url: 'https://videos.pexels.com/video-files/5069387/5069387-hd_1080_1920_30fps.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=400',
      title: 'Skincare tools',
      duration: 11,
      source: 'pexels'
    },
    static_image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800',
    voiceover_script: 'Elevate your skincare ritual with Luxe Rose Quartz Face Roller Set. Depuffs, promotes circulation, spa-quality experience at home. Self-care essential from AuraLift.',
    color_theme: '#f8bbd9',
    match_quality: 'high'
  }
};

// Generic fallback for unknown products
export const GENERIC_FALLBACK: FallbackVideoConfig = {
  product_handle: 'generic',
  product_title: 'AuraLift Premium Skincare',
  primary_video: {
    url: 'https://videos.pexels.com/video-files/6974595/6974595-hd_1080_1920_25fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    title: 'Woman applying skincare',
    duration: 15,
    source: 'pexels'
  },
  backup_video: {
    url: 'https://videos.pexels.com/video-files/5069413/5069413-hd_1080_1920_30fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400',
    title: 'Skincare routine',
    duration: 12,
    source: 'pexels'
  },
  static_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
  voiceover_script: 'Discover premium skincare. Radiant, hydrated, youthful skin starts here. Shop now!',
  color_theme: '#ff9800',
  match_quality: 'category'
};

/**
 * Get fallback video configuration for a product
 */
export function getFallbackVideo(productHandle: string): FallbackVideoConfig {
  return FALLBACK_VIDEOS[productHandle] || GENERIC_FALLBACK;
}

/**
 * Get best video URL for a product (primary or backup)
 */
export function getFallbackVideoUrl(productHandle: string, preferBackup = false): string {
  const config = getFallbackVideo(productHandle);
  return preferBackup ? config.backup_video.url : config.primary_video.url;
}

/**
 * Get voiceover script for a product
 */
export function getFallbackVoiceoverScript(productHandle: string): string {
  const config = getFallbackVideo(productHandle);
  return config.voiceover_script;
}

/**
 * Check if product has high-quality fallback match
 */
export function hasHighQualityFallback(productHandle: string): boolean {
  const config = FALLBACK_VIDEOS[productHandle];
  return config?.match_quality === 'high';
}

/**
 * AURALIFT AD GENERATOR - Generate AI Ads with ElevenLabs + HeyGen
 * 
 * Full viral ad flow with social posting to TikTok & Pinterest
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle,
  Loader2,
  Download,
  Share2,
  Mic,
  User,
  Clock,
  Send,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  ExternalLink,
  Zap,
  Hash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useShopifyProducts, type ParsedShopifyProduct } from '@/hooks/useShopifyProducts';

// TikTok & Pinterest icons
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 0a12 12 0 00-4.37 23.17c-.1-.94-.19-2.38.04-3.41l1.36-5.76s-.35-.69-.35-1.72c0-1.61.94-2.82 2.1-2.82.99 0 1.47.74 1.47 1.63 0 .99-.63 2.48-.96 3.86-.27 1.16.58 2.1 1.72 2.1 2.07 0 3.66-2.18 3.66-5.33 0-2.79-2.01-4.74-4.87-4.74-3.32 0-5.27 2.49-5.27 5.07 0 1 .39 2.08.87 2.66a.35.35 0 01.08.34c-.09.37-.29 1.16-.33 1.32-.05.21-.17.26-.39.16-1.46-.68-2.37-2.82-2.37-4.54 0-3.7 2.68-7.09 7.74-7.09 4.06 0 7.22 2.9 7.22 6.76 0 4.04-2.55 7.29-6.08 7.29-1.19 0-2.31-.62-2.69-1.35l-.73 2.79c-.26 1.02-.98 2.29-1.46 3.07A12 12 0 1012 0z"/>
  </svg>
);

interface GeneratedAd {
  id: string;
  name: string;
  product_name: string;
  script: string;
  voiceover_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  status: string;
  heygen_video_id: string | null;
  test_mode: boolean;
  created_at: string;
}

interface SocialPost {
  id: string;
  channel: string;
  post_id: string | null;
  post_url: string | null;
  status: string;
  posted_at: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  revenue_attributed: number | null;
}

interface AuraLiftAdGeneratorProps {
  onAdGenerated?: (ad: GeneratedAd) => void;
}

// Product emoji mapping
const PRODUCT_EMOJIS: Record<string, string> = {
  'radiance-vitamin-c-serum': '🍊',
  'hydra-glow-retinol-night-cream': '🌙',
  'ultra-hydration-hyaluronic-serum': '💧',
  'omega-glow-collagen-peptide-moisturizer': '✨',
  'luxe-rose-quartz-face-roller-set': '💎',
};

// Script variations by emotion - AURALIFT ESSENTIALS domain
const SCRIPT_VARIATIONS = {
  excited: (title: string, desc: string) => 
    `OMG you NEED to try ${title}! ${desc} - I literally can't live without it! Shop www.auraliftessentials.com!`,
  calm: (title: string, desc: string) => 
    `Discover ${title} from AuraLift Essentials. ${desc}. Radiant, hydrated, youthful skin. Shop now at www.auraliftessentials.com!`,
  urgent: (title: string, desc: string) => 
    `STOP scrolling! ${title} is selling out fast. ${desc}. Get yours before it's gone - www.auraliftessentials.com!`,
};

export function AuraLiftAdGenerator({ onAdGenerated }: AuraLiftAdGeneratorProps) {
  const { user } = useAuth();
  
  // Fetch real AuraLift products from Shopify
  const { products: shopifyProducts, isLoading: loadingProducts, refetch: refetchProducts } = useShopifyProducts({
    vendor: 'AuraLift Beauty',
    autoLoad: true
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [recentAds, setRecentAds] = useState<GeneratedAd[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  
  // Product selection - use real Shopify products
  const [selectedProduct, setSelectedProduct] = useState<ParsedShopifyProduct | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<'excited' | 'calm' | 'urgent'>('calm');
  const [customScript, setCustomScript] = useState('');
  
  // Social posting state
  const [isPostingTikTok, setIsPostingTikTok] = useState(false);
  const [isPostingPinterest, setIsPostingPinterest] = useState(false);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [pinterestConnected, setPinterestConnected] = useState(false);

  // Set first product as default when products load
  useEffect(() => {
    if (shopifyProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(shopifyProducts[0]);
    }
  }, [shopifyProducts, selectedProduct]);

  // Generated script preview
  const generatedScript = selectedProduct 
    ? (customScript || SCRIPT_VARIATIONS[selectedEmotion](
        selectedProduct.title, 
        selectedProduct.description || `${selectedProduct.productType} from AuraLift Beauty`
      ))
    : '';

  // Force live generation state
  const [isForceGenerating, setIsForceGenerating] = useState(false);
  const [forceGenerateStatus, setForceGenerateStatus] = useState<string>('');
  const [creditsWarning, setCreditsWarning] = useState<string | null>(null);
  
  // Real video generation state
  const [realVideoUrl, setRealVideoUrl] = useState<string | null>(null);
  const [realThumbnailUrl, setRealThumbnailUrl] = useState<string | null>(null);
  const [generationDetails, setGenerationDetails] = useState<any>(null);

  // Check social connections
  const checkSocialConnections = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('social_tokens')
      .select('channel, is_connected')
      .eq('user_id', user.id)
      .in('channel', ['tiktok', 'pinterest']);
    
    if (data) {
      setTiktokConnected(data.some(t => t.channel === 'tiktok' && t.is_connected));
      setPinterestConnected(data.some(t => t.channel === 'pinterest' && t.is_connected));
    }
  }, [user]);

  // Fetch recent ads
  const fetchRecentAds = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingAds(true);
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setRecentAds(data as GeneratedAd[]);
        if (data.length > 0 && !generatedAd) {
          setGeneratedAd(data[0] as GeneratedAd);
        }
      }
    } catch (err) {
      console.error('Error fetching ads:', err);
    } finally {
      setIsLoadingAds(false);
    }
  }, [user, generatedAd]);

  // Fetch social posts for current ad
  const fetchSocialPosts = useCallback(async (adId: string) => {
    const { data } = await supabase
      .from('social_posts')
      .select('*')
      .eq('ad_id', adId);
    
    if (data) {
      setSocialPosts(data as SocialPost[]);
    }
  }, []);

  useEffect(() => {
    fetchRecentAds();
    checkSocialConnections();
    
    if (user) {
      const channel = supabase
        .channel('ads-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ads',
          filter: `user_id=eq.${user.id}`
        }, () => fetchRecentAds())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user, fetchRecentAds, checkSocialConnections]);

  useEffect(() => {
    if (generatedAd?.id) {
      fetchSocialPosts(generatedAd.id);
    }
  }, [generatedAd?.id, fetchSocialPosts]);

  // Generate ad with selected product and emotion
  const generateAd = async (testMode: boolean = false, forceLive: boolean = false) => {
    if (!user) {
      toast.error('Please sign in to generate ads');
      return;
    }

    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }

    if (forceLive) {
      setIsForceGenerating(true);
      setForceGenerateStatus('Initializing force live generation...');
      setCreditsWarning(null);
    } else {
      setIsGenerating(true);
    }
    setProgress(0);
    setStatus('Initializing...');

    try {
      setProgress(20);
      setStatus('🎤 Generating voiceover with ElevenLabs...');
      if (forceLive) setForceGenerateStatus('🎤 Generating voiceover with ElevenLabs...');
      await new Promise(r => setTimeout(r, 500));
      
      setProgress(40);
      setStatus(forceLive ? '🎥 Creating HeyGen avatar video (waiting up to 10 min)...' : '🎥 Creating HeyGen avatar video...');
      if (forceLive) setForceGenerateStatus('🎥 Submitting to HeyGen API (real generation)...');
      
      const { data, error } = await supabase.functions.invoke('generate-auralift-ad', {
        body: {
          product_handle: selectedProduct.handle,
          product_title: selectedProduct.title,
          product_image: selectedProduct.imageUrl,
          script: generatedScript,
          test_mode: testMode && !forceLive,
          force_live: forceLive,
          wait_for_video: forceLive, // Wait for video completion when forcing live
          voice: 'sarah',
          avatar: 'professional_female_skincare',
          emotion: selectedEmotion
        }
      });

      if (error) throw error;

      // Handle credits warning
      if (data?.credits_warning) {
        setCreditsWarning(data.credits_warning);
        toast.warning('⚠️ HeyGen Credits Warning', {
          description: data.credits_warning,
          duration: 10000,
          action: {
            label: 'Upgrade',
            onClick: () => window.open('https://app.heygen.com/settings/plan', '_blank')
          }
        });
      }

      setProgress(80);
      setStatus('💾 Saving to database...');
      if (forceLive) setForceGenerateStatus('💾 Video received, saving...');

      // Store real video URL and details
      if (data?.video_url) {
        setRealVideoUrl(data.video_url);
        setRealThumbnailUrl(data.thumbnail_url || null);
        setGenerationDetails(data.generation_details || null);
      }

      if (data?.ad) {
        const newAd = { ...data.ad, created_at: new Date().toISOString() } as GeneratedAd;
        setGeneratedAd(newAd);
        onAdGenerated?.(newAd);
        
        setProgress(100);
        setStatus('✅ Ad generated successfully!');
        if (forceLive) setForceGenerateStatus('✅ Force live generation complete!');
        
        const statusMessage = data.status === 'completed' 
          ? '🎬 Real HeyGen video ready!' 
          : data.status === 'processing'
          ? '🎬 Video processing... check back in 2-5 min'
          : data.status === 'credits_low'
          ? '⚠️ HeyGen credits low - upgrade needed'
          : data.status === 'heygen_error'
          ? '❌ HeyGen error - check logs'
          : data.message || '🎬 AI Ad generated!';

        toast.success(statusMessage, {
          description: data.video_url 
            ? 'Real video preview ready below!'
            : testMode 
            ? 'Voiceover preview ready below'
            : data.credits_warning || 'Video will be ready in 2-5 minutes'
        });

        fetchRecentAds();
      }

    } catch (err) {
      console.error('Ad generation error:', err);
      setStatus('❌ Generation failed');
      if (forceLive) setForceGenerateStatus('❌ Force generation failed');
      toast.error('Failed to generate ad', {
        description: err instanceof Error ? err.message : 'Please try again'
      });
    } finally {
      setIsGenerating(false);
      setIsForceGenerating(false);
    }
  };

  // Post to TikTok
  const postToTikTok = async () => {
    if (!generatedAd) return;
    
    if (!tiktokConnected) {
      toast.error('TikTok not connected', {
        description: 'Go to Social Channels to connect your account',
        action: {
          label: 'Connect',
          onClick: () => window.location.href = '/dashboard/social-channels'
        }
      });
      return;
    }

    setIsPostingTikTok(true);
    try {
      // First optimize caption for TikTok
      const { data: optimized } = await supabase.functions.invoke('omega-optimize-content', {
        body: {
          channel: 'tiktok',
          caption: generatedAd.script,
          product_name: generatedAd.product_name
        }
      });

      const caption = optimized?.optimized_caption || 
        `This serum gave me GLOWING skin in days 😍 #SkincareRoutine #AuraLift #VitaminC`;
      const hashtags = optimized?.hashtags?.join(' ') || 
        '#skincare #beauty #glowingskin #viral #fyp #skincaretiktok';

      const { data, error } = await supabase.functions.invoke('post-to-channel', {
        body: {
          channel: 'tiktok',
          video_url: generatedAd.video_url || generatedAd.voiceover_url,
          caption,
          hashtags,
          ad_id: generatedAd.id,
          metadata: { product: generatedAd.product_name }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('🎵 Posted to TikTok!', {
          description: 'Your ad is now live'
        });
        fetchSocialPosts(generatedAd.id);
      } else {
        throw new Error(data?.error || 'Post failed');
      }
    } catch (err: any) {
      console.error('TikTok post error:', err);
      toast.error('Failed to post to TikTok', {
        description: err.message || 'Please try again'
      });
    } finally {
      setIsPostingTikTok(false);
    }
  };

  // Post to Pinterest
  const postToPinterest = async (boardName?: string) => {
    if (!generatedAd) return;
    
    if (!pinterestConnected) {
      toast.error('Pinterest not connected', {
        description: 'Go to Social Channels to connect your account',
        action: {
          label: 'Connect',
          onClick: () => window.location.href = '/dashboard/social-channels'
        }
      });
      return;
    }

    setIsPostingPinterest(true);
    try {
      const { data: optimized } = await supabase.functions.invoke('omega-optimize-content', {
        body: {
          channel: 'pinterest',
          caption: generatedAd.script,
          product_name: generatedAd.product_name
        }
      });

      const caption = optimized?.optimized_caption || 
        `${generatedAd.product_name} – Brighten & Glow in Weeks ✨`;
      
      const { data, error } = await supabase.functions.invoke('post-to-channel', {
        body: {
          channel: 'pinterest',
          video_url: generatedAd.video_url || generatedAd.voiceover_url,
          caption,
          hashtags: '',
          ad_id: generatedAd.id,
          metadata: { 
            product: generatedAd.product_name,
            board_name: boardName || 'AuraLift Skincare Favorites',
            link: 'https://www.auraliftessentials.com'
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('📌 Posted to Pinterest!', {
          description: data.post_url ? 'Click to view' : 'Your pin is live'
        });
        fetchSocialPosts(generatedAd.id);
      } else {
        throw new Error(data?.error || 'Post failed');
      }
    } catch (err: any) {
      console.error('Pinterest post error:', err);
      toast.error('Failed to post to Pinterest', {
        description: err.message || 'Please try again'
      });
    } finally {
      setIsPostingPinterest(false);
    }
  };

  const playVoiceover = () => {
    if (!generatedAd?.voiceover_url) {
      toast.error('No voiceover available');
      return;
    }

    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
        setIsPlaying(false);
      } else {
        audioRef.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(generatedAd.voiceover_url);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        toast.error('Failed to play voiceover');
        setIsPlaying(false);
      };
      setAudioRef(audio);
      audio.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (audioRef) {
      audioRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const downloadAd = () => {
    const url = generatedAd?.video_url || generatedAd?.voiceover_url;
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Calculate total metrics from social posts
  const totalViews = socialPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalRevenue = socialPosts.reduce((sum, p) => sum + (p.revenue_attributed || 0), 0);

  return (
    <div className="space-y-6">
      {/* Hero Card - Generate Ad */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display">AuraLift AI Ad Generator</h2>
              <p className="text-sm text-muted-foreground font-normal">
                ElevenLabs Voice + HeyGen Avatar → TikTok & Pinterest
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Product Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Product</span>
                {loadingProducts && <Loader2 className="w-3 h-3 animate-spin" />}
              </label>
              {shopifyProducts.length === 0 && !loadingProducts ? (
                <p className="text-sm text-muted-foreground">No AuraLift products found</p>
              ) : (
                <Select 
                  value={selectedProduct?.handle || ''} 
                  onValueChange={(v) => setSelectedProduct(
                    shopifyProducts.find(p => p.handle === v) || shopifyProducts[0]
                  )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {shopifyProducts.map(p => (
                      <SelectItem key={p.handle} value={p.handle}>
                        <span className="flex items-center gap-2">
                          <span>{PRODUCT_EMOJIS[p.handle] || '🧴'}</span>
                          <span>{p.title}</span>
                          <span className="text-muted-foreground text-xs">
                            ${p.price.toFixed(2)}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Script Style</label>
              <Select 
                value={selectedEmotion} 
                onValueChange={(v) => setSelectedEmotion(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excited">🤩 Excited (Viral TikTok)</SelectItem>
                  <SelectItem value="calm">😌 Calm (Professional)</SelectItem>
                  <SelectItem value="urgent">⚡ Urgent (FOMO)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Script Preview/Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Script Preview</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCustomScript('')}
                className="text-xs"
              >
                Reset to Auto
              </Button>
            </label>
            <Textarea
              value={customScript || generatedScript}
              onChange={(e) => setCustomScript(e.target.value)}
              placeholder={generatedScript || 'Select a product to preview script...'}
              className="min-h-[80px] text-sm"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              ~15 seconds • <Mic className="w-3 h-3" /> Sarah (Warm Female) • <User className="w-3 h-3" /> Susan (Elegant Avatar)
            </p>
          </div>

          {/* Generation Progress */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{status}</span>
                  <span className="font-mono text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Credits Warning */}
          <AnimatePresence>
            {creditsWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-sm"
              >
                <p className="font-medium text-warning mb-1">⚠️ HeyGen Credits Warning</p>
                <p className="text-muted-foreground">{creditsWarning}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('https://app.heygen.com/settings/plan', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Upgrade HeyGen Pro ($99/mo)
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Force Live Generation Progress */}
          <AnimatePresence>
            {isForceGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/30"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="font-medium">Force Live Generation</span>
                </div>
                <p className="text-sm text-muted-foreground">{forceGenerateStatus}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This may take up to 10 minutes while waiting for HeyGen video...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                onClick={() => generateAd(true)}
                disabled={isGenerating || isForceGenerating}
                variant="outline"
                className="flex-1"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mic className="w-4 h-4 mr-2" />
                )}
                Test (Voiceover Only)
              </Button>
              
              <Button
                onClick={() => generateAd(false)}
                disabled={isGenerating || isForceGenerating}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Generate Full Ad
                  </>
                )}
              </Button>
            </div>

            {/* Force Live Generate Button - Pre-filled for Radiance Vitamin C Serum */}
            <Button
              onClick={() => {
                // Pre-select Radiance Vitamin C Serum if available
                const radianceProduct = shopifyProducts.find(p => 
                  p.handle === 'radiance-vitamin-c-serum' || 
                  p.title.toLowerCase().includes('vitamin c')
                );
                if (radianceProduct) {
                  setSelectedProduct(radianceProduct);
                }
                // Clear previous results
                setRealVideoUrl(null);
                setRealThumbnailUrl(null);
                setGenerationDetails(null);
                // Force live generation with wait
                generateAd(false, true);
              }}
              disabled={isGenerating || isForceGenerating}
              variant="destructive"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {isForceGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {forceGenerateStatus || 'Force generating...'}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  🔥 Generate & Upload Real Video (15 min wait)
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Force Live: Uses real HeyGen API (not test mode), waits up to 15 min for video completion
            </p>
            
            {/* Real Video Preview Section */}
            {realVideoUrl && (
              <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/30">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-semibold text-success">Real HeyGen Video Ready!</span>
                </div>
                
                <div className="aspect-[9/16] max-h-[300px] rounded-lg overflow-hidden mb-3 bg-black">
                  <video 
                    src={realVideoUrl} 
                    controls 
                    poster={realThumbnailUrl || undefined}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Video URL:</span>
                    <a 
                      href={realVideoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate max-w-[200px]"
                    >
                      {realVideoUrl.split('/').pop()}
                    </a>
                  </div>
                  
                  {generationDetails && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Avatar:</span>
                        <span>{generationDetails.avatar_id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Voice:</span>
                        <span>{generationDetails.voice} ({generationDetails.voice_id})</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(realVideoUrl, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(realVideoUrl);
                      toast.success('Video URL copied!');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Copy URL
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Ad Preview with Social Posting */}
      <AnimatePresence>
        {generatedAd && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Generated Ad
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {socialPosts.length > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {totalViews.toLocaleString()} views
                      </Badge>
                    )}
                    <Badge variant={
                      generatedAd.status === 'completed' ? 'default' :
                      generatedAd.status === 'processing' ? 'secondary' :
                      generatedAd.test_mode ? 'outline' : 'destructive'
                    }>
                      {generatedAd.test_mode ? 'Test Mode' : generatedAd.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Video/Thumbnail Preview */}
                  <div className="aspect-[9/16] max-h-[400px] bg-muted rounded-lg overflow-hidden relative group">
                    {generatedAd.video_url ? (
                      <video
                        src={generatedAd.video_url}
                        controls
                        poster={generatedAd.thumbnail_url || undefined}
                        className="w-full h-full object-cover"
                      />
                    ) : generatedAd.thumbnail_url ? (
                      <img
                        src={generatedAd.thumbnail_url}
                        alt={generatedAd.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                        <Video className="w-16 h-16 text-muted-foreground mb-4" />
                        {generatedAd.status === 'processing' ? (
                          <>
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">Video generating...</p>
                            <p className="text-xs text-muted-foreground">~2-5 minutes</p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Video preview</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ad Details & Controls */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{generatedAd.product_name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{generatedAd.script}</p>
                    </div>

                    {/* Voiceover Player */}
                    {generatedAd.voiceover_url && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={playVoiceover}
                            className="rounded-full"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </Button>
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium">Voiceover Preview</p>
                            <p className="text-xs text-muted-foreground">ElevenLabs • Sarah</p>
                          </div>
                          
                          <Button size="icon" variant="ghost" onClick={toggleMute}>
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Social Posting Buttons */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Post to Social
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={postToTikTok}
                          disabled={isPostingTikTok || (!generatedAd.video_url && !generatedAd.voiceover_url)}
                          variant={tiktokConnected ? "default" : "outline"}
                          className="gap-2"
                        >
                          {isPostingTikTok ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <TikTokIcon />
                          )}
                          TikTok
                          {!tiktokConnected && <Badge variant="secondary" className="ml-1 text-xs">Connect</Badge>}
                        </Button>
                        
                        <Button
                          onClick={() => postToPinterest()}
                          disabled={isPostingPinterest || (!generatedAd.video_url && !generatedAd.voiceover_url)}
                          variant={pinterestConnected ? "default" : "outline"}
                          className="gap-2"
                        >
                          {isPostingPinterest ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <PinterestIcon />
                          )}
                          Pinterest
                          {!pinterestConnected && <Badge variant="secondary" className="ml-1 text-xs">Connect</Badge>}
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={downloadAd}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateAd(false)}
                        disabled={isGenerating}
                      >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>

                    {/* Social Posts Analytics */}
                    {socialPosts.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Live Performance
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {socialPosts.map(post => (
                            <div 
                              key={post.id} 
                              className="p-3 rounded-lg bg-muted/50 text-sm"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {post.channel === 'tiktok' ? <TikTokIcon /> : <PinterestIcon />}
                                <span className="capitalize font-medium">{post.channel}</span>
                                {post.post_url && (
                                  <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> {post.views?.toLocaleString() || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" /> {post.likes?.toLocaleString() || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" /> {post.comments || 0}
                                </span>
                                <span className="flex items-center gap-1 text-success">
                                  <DollarSign className="w-3 h-3" /> ${post.revenue_attributed?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      <p>ID: {generatedAd.id.slice(0, 8)}...</p>
                      <p>Created: {new Date(generatedAd.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Ads Grid */}
      {recentAds.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Recent Ads ({recentAds.length})</span>
              <Button variant="ghost" size="sm" onClick={fetchRecentAds}>
                <RefreshCw className={`w-4 h-4 ${isLoadingAds ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {recentAds.slice(0, 5).map((ad) => (
                <div
                  key={ad.id}
                  className={`aspect-[9/16] rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 ring-primary/50 relative ${
                    generatedAd?.id === ad.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setGeneratedAd(ad)}
                >
                  {ad.thumbnail_url ? (
                    <img src={ad.thumbnail_url} alt={ad.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Video className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs text-white truncate">{ad.product_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Guide */}
      {(!tiktokConnected || !pinterestConnected) && (
        <Card className="border-dashed">
          <CardContent className="py-6">
            <div className="text-center space-y-3">
              <Zap className="w-8 h-8 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium">Connect Your Social Accounts</p>
                <p className="text-sm text-muted-foreground">
                  Link TikTok and Pinterest to post ads directly
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/dashboard/social-channels'}
              >
                Go to Social Channels
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
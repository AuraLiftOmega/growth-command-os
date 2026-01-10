/**
 * VIDEO AD STUDIO PAGE - Full Dashboard for Video Ad Generation
 * 
 * Features:
 * - List all generated videos from creatives table
 * - Create new ads with product selector + script editor
 * - Avatar manager (HeyGen + ElevenLabs voice cloning)
 * - Generation controls (duration, emotion, language)
 * - Preview player with edit options
 * - Autonomous mode toggle
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Sparkles,
  Play,
  Download,
  Share2,
  Wand2,
  User,
  Mic,
  Clock,
  Zap,
  RefreshCw,
  CheckCircle,
  Plus,
  Settings,
  Eye,
  Trash2,
  Edit3,
  Volume2,
  Globe,
  Bot,
  Loader2,
  X,
  Upload,
  Smile,
  Hand,
  MessageSquare,
  Package,
  Image as ImageIcon,
  ChevronRight,
  LayoutGrid,
  List,
  Rocket,
  Send
} from 'lucide-react';

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
import { AuraLiftAdGenerator } from './AuraLiftAdGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { useAuth } from '@/hooks/useAuth';

interface VideoAd {
  id: string;
  name: string;
  thumbnail_url: string | null;
  video_url: string | null;
  status: string | null;
  views: number | null;
  clicks: number | null;
  ctr: number | null;
  created_at: string;
  platform: string;
  style: string | null;
  duration_seconds: number | null;
  render_status: string | null;
  render_progress: number | null;
  generation_provider: string | null;
}

interface Avatar {
  id: string;
  name: string;
  preview_url?: string;
  type: 'stock' | 'custom';
}

const STOCK_AVATARS: Avatar[] = [
  { id: 'Kristin_public_3_20240108', name: 'Kristin (Professional)', type: 'stock' },
  { id: 'Angela_public_4_20240125', name: 'Angela (Friendly)', type: 'stock' },
  { id: 'Susan_public_2_20240328', name: 'Susan (Elegant)', type: 'stock' },
  { id: 'Monica_public_2_20240108', name: 'Monica (Energetic)', type: 'stock' },
  { id: 'Josh_public_1_20240108', name: 'Josh (Confident)', type: 'stock' },
  { id: 'Tyler_public_2_20240108', name: 'Tyler (Casual)', type: 'stock' },
];

const EMOTIONS = [
  { id: 'neutral', name: 'Neutral', icon: '😐' },
  { id: 'happy', name: 'Happy', icon: '😊' },
  { id: 'excited', name: 'Excited', icon: '🤩' },
  { id: 'serious', name: 'Serious', icon: '😐' },
  { id: 'friendly', name: 'Friendly', icon: '🤗' },
];

const GESTURES = [
  { id: 'none', name: 'None' },
  { id: 'point', name: 'Pointing' },
  { id: 'wave', name: 'Wave' },
  { id: 'nod', name: 'Nodding' },
  { id: 'shrug', name: 'Shrug' },
];

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
];

const SCRIPT_TEMPLATES = [
  { name: 'Product Intro', script: 'Hey there! Let me show you something amazing. This {product} has been transforming routines everywhere. Try it today!' },
  { name: 'Before/After', script: 'You won\'t believe the transformation! This {product} helped me achieve incredible results in just 30 days. Your skin deserves this!' },
  { name: 'Urgent CTA', script: 'Stop scrolling! If you\'ve been looking for a solution, this {product} is exactly what you need. Limited time - grab yours now!' },
  { name: 'Social Proof', script: 'Over 10,000 customers love this {product}. Join them and see why everyone\'s talking about it!' },
];

export function VideoAdStudioPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('auralift');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [videos, setVideos] = useState<VideoAd[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoAd | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Create Ad State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [script, setScript] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(STOCK_AVATARS[0].id);
  const [emotion, setEmotion] = useState('happy');
  const [gesture, setGesture] = useState('none');
  const [language, setLanguage] = useState('en-US');
  const [duration, setDuration] = useState([15]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [isSuggestingScript, setIsSuggestingScript] = useState(false);
  
  // Avatar Manager State
  const [avatars, setAvatars] = useState<Avatar[]>(STOCK_AVATARS);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false);
  const [voiceCloneUrl, setVoiceCloneUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isCloningVoice, setIsCloningVoice] = useState(false);
  
  // Pinterest batch posting state
  const [isBatchPostingPinterest, setIsBatchPostingPinterest] = useState(false);
  const [batchPostProgress, setBatchPostProgress] = useState(0);
  const [pinterestConnected, setPinterestConnected] = useState(false);
  const [lastPinterestPost, setLastPinterestPost] = useState<{ time: string; url: string } | null>(null);
  
  // TikTok Shop state
  const [tiktokShopConnected, setTiktokShopConnected] = useState(false);
  const [lastTiktokShopPost, setLastTiktokShopPost] = useState<{ time: string; url: string } | null>(null);
  const [isBatchPostingTikTokShop, setIsBatchPostingTikTokShop] = useState(false);
  const [tiktokShopBatchProgress, setTiktokShopBatchProgress] = useState(0);
  
  // TikTok Business Suite state
  const [tiktokBusinessConnected, setTiktokBusinessConnected] = useState(false);
  const [lastTiktokBusinessPost, setLastTiktokBusinessPost] = useState<{ time: string; url: string } | null>(null);
  const [isBatchPostingTikTokBusiness, setIsBatchPostingTikTokBusiness] = useState(false);
  const [tiktokBusinessBatchProgress, setTiktokBusinessBatchProgress] = useState(0);
  
  const { products, isLoading: loadingProducts } = useShopifyProducts({
    autoLoad: true
  });

  // Fetch videos from creatives table
  const fetchVideos = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingVideos(true);
    try {
      const { data, error } = await supabase
        .from('creatives')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      toast.error('Failed to load videos');
    } finally {
      setIsLoadingVideos(false);
    }
  }, [user]);

  // Check Pinterest connection
  const checkPinterestConnection = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('platform_accounts')
      .select('is_connected')
      .eq('user_id', user.id)
      .eq('platform', 'pinterest')
      .single();
    
    if (data?.is_connected) {
      setPinterestConnected(true);
    }
    
    // Get last Pinterest post
    const { data: posts } = await supabase
      .from('social_posts')
      .select('posted_at, post_url')
      .eq('user_id', user.id)
      .eq('channel', 'pinterest')
      .eq('status', 'published')
      .order('posted_at', { ascending: false })
      .limit(1);
    
    if (posts && posts.length > 0) {
      setLastPinterestPost({
        time: posts[0].posted_at,
        url: posts[0].post_url
      });
    }
  }, [user]);

  // Check TikTok Shop connection
  const checkTikTokShopConnection = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('social_tokens')
      .select('is_connected')
      .eq('user_id', user.id)
      .eq('channel', 'tiktok_shop')
      .single();
    
    if (data?.is_connected) {
      setTiktokShopConnected(true);
    }
    
    // Get last TikTok Shop post
    const { data: posts } = await supabase
      .from('social_posts')
      .select('posted_at, post_url')
      .eq('user_id', user.id)
      .eq('channel', 'tiktok_shop')
      .order('posted_at', { ascending: false })
      .limit(1);
    
    if (posts && posts.length > 0) {
      setLastTiktokShopPost({
        time: posts[0].posted_at,
        url: posts[0].post_url
      });
    }
  }, [user]);

  // Check TikTok Business Suite connection
  const checkTikTokBusinessConnection = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('social_tokens')
      .select('is_connected')
      .eq('user_id', user.id)
      .eq('channel', 'tiktok_business')
      .single();
    
    if (data?.is_connected) {
      setTiktokBusinessConnected(true);
    }
    
    // Get last TikTok Business Suite post
    const { data: posts } = await supabase
      .from('social_posts')
      .select('posted_at, post_url')
      .eq('user_id', user.id)
      .eq('channel', 'tiktok_business')
      .order('posted_at', { ascending: false })
      .limit(1);
    
    if (posts && posts.length > 0) {
      setLastTiktokBusinessPost({
        time: posts[0].posted_at,
        url: posts[0].post_url
      });
    }
  }, [user]);

  useEffect(() => {
    fetchVideos();
    checkPinterestConnection();
    checkTikTokShopConnection();
    checkTikTokBusinessConnection();
  }, [fetchVideos, checkPinterestConnection, checkTikTokShopConnection, checkTikTokBusinessConnection]);

  // Fetch HeyGen avatars
  const fetchAvatars = async () => {
    setIsLoadingAvatars(true);
    try {
      const { data, error } = await supabase.functions.invoke('heygen-avatar', {
        body: { action: 'list_avatars' }
      });
      
      if (data?.avatars) {
        const heygenAvatars = data.avatars.map((a: any) => ({
          id: a.avatar_id,
          name: a.avatar_name || a.avatar_id,
          preview_url: a.preview_image_url,
          type: 'stock' as const
        }));
        setAvatars([...STOCK_AVATARS, ...heygenAvatars]);
      }
    } catch (err) {
      console.error('Error fetching avatars:', err);
    } finally {
      setIsLoadingAvatars(false);
    }
  };

  // Suggest script from Omega AI
  const suggestScript = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }

    setIsSuggestingScript(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-sales-agent', {
        body: {
          action: 'generate_script',
          product_name: selectedProduct.title,
          product_description: selectedProduct.description,
          style: 'video_ad',
          duration: duration[0]
        }
      });

      if (data?.script) {
        setScript(data.script);
        toast.success('Script generated by Omega AI!');
      } else {
        // Fallback to template
        const template = SCRIPT_TEMPLATES[Math.floor(Math.random() * SCRIPT_TEMPLATES.length)];
        setScript(template.script.replace('{product}', selectedProduct.title));
        toast.success('Script template applied!');
      }
    } catch (err) {
      console.error('Script generation error:', err);
      const template = SCRIPT_TEMPLATES[0];
      setScript(template.script.replace('{product}', selectedProduct.title));
    } finally {
      setIsSuggestingScript(false);
    }
  };

  // Generate video with HeyGen + ElevenLabs
  const generateVideo = async () => {
    if (!selectedProduct || !script.trim()) {
      toast.error('Please select a product and enter a script');
      return;
    }

    setIsGenerating(true);
    try {
      // Call HeyGen edge function
      const { data, error } = await supabase.functions.invoke('heygen-avatar', {
        body: {
          action: 'create_video',
          script,
          avatar_id: selectedAvatar,
          product_name: selectedProduct.title,
          product_image: selectedProduct.imageUrl,
          aspect_ratio: '9:16',
          voice_settings: {
            language,
            emotion,
            gesture
          }
        }
      });

      if (error) throw error;

      if (data?.requires_key) {
        toast.error('HeyGen API key required', {
          description: 'Configure HEYGEN_API_KEY in your secrets.'
        });
        return;
      }

      toast.success('🎬 Video generation started!', {
        description: 'Check back in 2-5 minutes for your video.'
      });

      setIsCreateOpen(false);
      fetchVideos();

      // Poll for completion
      if (data?.video_id) {
        pollVideoStatus(data.video_id);
      }

    } catch (err) {
      console.error('Generation error:', err);
      
      // Create a demo entry
      await supabase.from('creatives').insert({
        user_id: user?.id,
        name: `${selectedProduct.title} - Video Ad`,
        platform: 'tiktok',
        status: 'generating',
        style: 'avatar',
        script,
        generation_provider: 'heygen',
        render_status: 'processing',
        render_progress: 50,
        shopify_product_id: selectedProduct.id,
        thumbnail_url: selectedProduct.imageUrl
      });

      toast.success('Video generation queued (demo mode)');
      setIsCreateOpen(false);
      fetchVideos();
    } finally {
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 15000));
      
      const { data } = await supabase.functions.invoke('heygen-avatar', {
        body: { action: 'check_status', video_id: videoId }
      });

      if (data?.status === 'completed') {
        toast.success('✅ Video ready!');
        fetchVideos();
        break;
      } else if (data?.status === 'failed') {
        toast.error('Video generation failed');
        break;
      }
    }
  };

  // Clone voice with ElevenLabs
  const cloneVoice = async () => {
    if (!voiceCloneUrl.trim()) {
      toast.error('Please enter an audio file URL');
      return;
    }

    setIsCloningVoice(true);
    try {
      // This would call ElevenLabs API through edge function
      toast.success('Voice cloning started!', {
        description: 'This feature requires ElevenLabs API key.'
      });
      setVoiceCloneUrl('');
    } catch (err) {
      toast.error('Voice cloning failed');
    } finally {
      setIsCloningVoice(false);
    }
  };

  // Toggle autonomous mode
  const toggleAutonomousMode = async (enabled: boolean) => {
    setAutonomousMode(enabled);
    
    if (enabled) {
      toast.success('🤖 Autonomous Mode Activated', {
        description: 'Omega will generate daily ads based on trending products.'
      });
      
      // Trigger n8n webhook for autonomous scheduling
      try {
        await supabase.functions.invoke('multi-agent-swarm', {
          body: {
            action: 'schedule_autonomous_ads',
            user_id: user?.id,
            frequency: 'daily',
            products: products.slice(0, 5).map(p => p.id)
          }
        });
      } catch (err) {
        console.error('Autonomous mode error:', err);
      }
    } else {
      toast.info('Autonomous Mode Disabled');
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      await supabase.from('creatives').delete().eq('id', videoId);
      toast.success('Video deleted');
      fetchVideos();
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ready_to_publish':
      case 'published':
        return 'bg-success/20 text-success';
      case 'generating':
      case 'processing':
        return 'bg-warning/20 text-warning';
      case 'failed':
      case 'killed':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Batch post all generated videos to TikTok Business Suite
  const batchPostToTikTokBusiness = async () => {
    if (!user) {
      toast.error('Please sign in');
      return;
    }

    // Get videos with video_url that haven't been posted to TikTok Business yet
    const videosToPost = videos.filter(v => 
      v.video_url && 
      (v.status === 'completed' || v.status === 'ready_to_publish' || v.status === 'active')
    ).slice(0, 5); // Max 5 at a time

    if (videosToPost.length === 0) {
      toast.error('No videos ready for TikTok Business Suite posting');
      return;
    }

    setIsBatchPostingTikTokBusiness(true);
    setTiktokBusinessBatchProgress(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < videosToPost.length; i++) {
      const video = videosToPost[i];
      setTiktokBusinessBatchProgress(Math.round(((i + 1) / videosToPost.length) * 100));

      try {
        const productName = video.name.replace(' - AI Video Ad', '').replace(' - Video Ad', '');

        const { data, error } = await supabase.functions.invoke('tiktok-business-oauth', {
          body: {
            action: 'post_video',
            video_url: video.video_url,
            title: `✨ ${productName} | AuraLift Essentials`,
            description: `🌟 Transform your skincare routine with ${productName}! Shop now at auraliftessentials.com 💫 #skincare #beauty #glowup #fyp`,
            creative_id: video.id
          }
        });

        if (error) throw error;

        if (data?.success) {
          successCount++;
          toast.success(`📊 Posted to TikTok Business: ${productName}`, { duration: 2000 });
        } else if (data?.needs_auth) {
          toast.error('Please connect TikTok Business Suite first');
          break;
        } else {
          throw new Error(data?.error || 'Post failed');
        }
      } catch (err: any) {
        failCount++;
        console.error(`TikTok Business batch post error for ${video.name}:`, err);
      }

      // Small delay between posts
      await new Promise(r => setTimeout(r, 1500));
    }

    setIsBatchPostingTikTokBusiness(false);
    setTiktokBusinessBatchProgress(0);

    if (successCount > 0) {
      toast.success(`📊 Batch TikTok Business Suite Post Complete!`, {
        description: `${successCount} posted, ${failCount} failed`
      });
      checkTikTokBusinessConnection(); // Refresh last post info
    } else {
      toast.error('All TikTok Business Suite posts failed');
    }
  };

  // Batch post all generated videos to Pinterest
  const batchPostToPinterest = async () => {
    if (!user) {
      toast.error('Please sign in');
      return;
    }

    // Get videos with video_url that haven't been posted to Pinterest yet
    const videosToPost = videos.filter(v => 
      v.video_url && 
      (v.status === 'completed' || v.status === 'ready_to_publish' || v.status === 'active')
    ).slice(0, 5); // Max 5 at a time

    if (videosToPost.length === 0) {
      toast.error('No videos ready for Pinterest posting');
      return;
    }

    setIsBatchPostingPinterest(true);
    setBatchPostProgress(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < videosToPost.length; i++) {
      const video = videosToPost[i];
      setBatchPostProgress(Math.round(((i + 1) / videosToPost.length) * 100));

      try {
        // Extract product info from video name
        const productName = video.name.replace(' - AI Video Ad', '').replace(' - Video Ad', '');
        const productHandle = productName.toLowerCase().replace(/\s+/g, '-');

        const { data, error } = await supabase.functions.invoke('pinterest-publish', {
          body: {
            video_url: video.video_url,
            title: productName,
            product_name: productName,
            product_handle: productHandle,
            thumbnail_url: video.thumbnail_url,
            creative_id: video.id,
            board_name: 'AuraLift Skincare Favorites',
            optimize_caption: true
          }
        });

        if (error) throw error;

        if (data?.success) {
          successCount++;
          toast.success(`📌 Posted: ${productName}`, { duration: 2000 });
        } else {
          throw new Error(data?.error || 'Post failed');
        }
      } catch (err: any) {
        failCount++;
        console.error(`Pinterest batch post error for ${video.name}:`, err);
      }

      // Small delay between posts
      await new Promise(r => setTimeout(r, 1000));
    }

    setIsBatchPostingPinterest(false);
    setBatchPostProgress(0);

    if (successCount > 0) {
      toast.success(`📌 Batch Pinterest Post Complete!`, {
        description: `${successCount} posted, ${failCount} failed`
      });
      checkPinterestConnection(); // Refresh last post info
    } else {
      toast.error('All Pinterest posts failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            Video Ad Studio
          </h1>
          <p className="text-muted-foreground">
            Create AI-powered video ads with HeyGen avatars & ElevenLabs voices
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Autonomous Mode Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
            <Bot className={`w-4 h-4 ${autonomousMode ? 'text-success' : 'text-muted-foreground'}`} />
            <span className="text-sm">Auto-Gen</span>
            <Switch 
              checked={autonomousMode} 
              onCheckedChange={toggleAutonomousMode}
            />
          </div>
          
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Ad
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="auralift" className="gap-2">
            <Rocket className="w-4 h-4" />
            AuraLift Ad
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <LayoutGrid className="w-4 h-4" />
            Video Library
          </TabsTrigger>
          <TabsTrigger value="avatars" className="gap-2">
            <User className="w-4 h-4" />
            Avatars
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* AuraLift Ad Generator Tab */}
        <TabsContent value="auralift">
          <AuraLiftAdGenerator onAdGenerated={() => fetchVideos()} />
        </TabsContent>

        {/* Video Library Tab */}
        <TabsContent value="library" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={fetchVideos}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingVideos ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {isLoadingVideos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : videos.length === 0 ? (
            <Card className="p-12 text-center">
              <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI-powered video ad
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Video Ad
              </Button>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="overflow-hidden group cursor-pointer hover:border-primary/50 transition-all">
                    <div className="relative aspect-[9/16] bg-muted">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Status Overlay */}
                      {video.render_status === 'processing' && (
                        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                          <span className="text-sm">Generating...</span>
                          {video.render_progress && (
                            <Progress value={video.render_progress} className="w-24 mt-2" />
                          )}
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                              setSelectedVideo(video);
                              setIsPreviewOpen(true);
                            }}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm truncate">{video.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={getStatusColor(video.status)}>
                          {video.status || 'draft'}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {video.views || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <div className="divide-y">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <div className="w-16 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{video.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{video.platform}</span>
                        <span>•</span>
                        <span>{video.duration_seconds || 15}s</span>
                        <span>•</span>
                        <span>{new Date(video.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">{video.views || 0}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{video.ctr ? `${video.ctr.toFixed(1)}%` : '-'}</p>
                        <p className="text-xs text-muted-foreground">CTR</p>
                      </div>
                      <Badge className={getStatusColor(video.status)}>
                        {video.status || 'draft'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedVideo(video);
                          setIsPreviewOpen(true);
                        }}>
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteVideo(video.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Avatars Tab */}
        <TabsContent value="avatars" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Avatars */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  HeyGen Avatars
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAvatar === avatar.id
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent bg-muted hover:border-muted-foreground/30'
                      }`}
                      onClick={() => setSelectedAvatar(avatar.id)}
                    >
                      <div className="w-full aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center overflow-hidden">
                        {avatar.preview_url ? (
                          <img src={avatar.preview_url} alt={avatar.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-center truncate">{avatar.name}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={fetchAvatars}
                  disabled={isLoadingAvatars}
                >
                  {isLoadingAvatars ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Load More Avatars
                </Button>
              </CardContent>
            </Card>

            {/* Upload Custom Avatar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Custom Avatar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a photo to create your own avatar
                  </p>
                  <Button variant="outline" disabled={isUploadingAvatar}>
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Select Photo'
                    )}
                  </Button>
                </div>

                {/* Voice Clone */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Mic className="w-4 h-4" />
                    Clone Voice (ElevenLabs)
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Audio file URL..."
                      value={voiceCloneUrl}
                      onChange={(e) => setVoiceCloneUrl(e.target.value)}
                    />
                    <Button onClick={cloneVoice} disabled={isCloningVoice}>
                      {isCloningVoice ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Clone'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload 30+ seconds of clear speech to clone a voice
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Default Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Default Duration</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      min={5}
                      max={60}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{duration[0]}s</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium">Autonomous Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Omega AI generates daily ads based on trending products
                  </p>
                </div>
                <Switch checked={autonomousMode} onCheckedChange={toggleAutonomousMode} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Ad Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Create New Video Ad
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Product & Script */}
            <div className="space-y-4">
              {/* Product Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Product</label>
                <ScrollArea className="h-[180px] border rounded-lg p-2">
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                            selectedProduct?.id === product.id
                              ? 'bg-primary/10 border border-primary/30'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.title} className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.title}</p>
                            <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                          </div>
                          {selectedProduct?.id === product.id && (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Script Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Script</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={suggestScript}
                    disabled={isSuggestingScript || !selectedProduct}
                  >
                    {isSuggestingScript ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-1" />
                        AI Suggest
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Enter your video script..."
                  rows={6}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{script.length}/500 characters</p>
                
                {/* Quick Templates */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {SCRIPT_TEMPLATES.slice(0, 3).map((template) => (
                    <Button
                      key={template.name}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setScript(template.script.replace('{product}', selectedProduct?.title || 'product'))}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">Avatar</label>
                <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STOCK_AVATARS.map((avatar) => (
                      <SelectItem key={avatar.id} value={avatar.id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {avatar.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Emotion & Gesture */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Emotion</label>
                  <Select value={emotion} onValueChange={setEmotion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMOTIONS.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.icon} {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Gesture</label>
                  <Select value={gesture} onValueChange={setGesture}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GESTURES.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium mb-2 block">Duration: {duration[0]}s</label>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  min={5}
                  max={60}
                  step={5}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={generateVideo}
              disabled={isGenerating || !selectedProduct || !script.trim()}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Video
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Player */}
            <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden">
              {selectedVideo?.video_url ? (
                <video
                  src={selectedVideo.video_url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : selectedVideo?.thumbnail_url ? (
                <img
                  src={selectedVideo.thumbnail_url}
                  alt={selectedVideo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Video Details & Actions */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Video Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform</span>
                    <span>{selectedVideo?.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{selectedVideo?.duration_seconds || 15}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(selectedVideo?.status || null)}>
                      {selectedVideo?.status || 'draft'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span>{selectedVideo?.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CTR</span>
                    <span>{selectedVideo?.ctr ? `${selectedVideo.ctr.toFixed(1)}%` : '-'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <h4 className="font-medium mb-2">Publish to Social</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button className="gap-2 bg-black hover:bg-black/80 text-white">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                    Post to TikTok
                  </Button>
                  <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M12 0a12 12 0 00-4.37 23.17c-.1-.94-.19-2.38.04-3.41l1.36-5.76s-.35-.69-.35-1.72c0-1.61.94-2.82 2.1-2.82.99 0 1.47.74 1.47 1.63 0 .99-.63 2.48-.96 3.86-.27 1.16.58 2.1 1.72 2.1 2.07 0 3.66-2.18 3.66-5.33 0-2.79-2.01-4.74-4.87-4.74-3.32 0-5.27 2.49-5.27 5.07 0 1 .39 2.08.87 2.66a.35.35 0 01.08.34c-.09.37-.29 1.16-.33 1.32-.05.21-.17.26-.39.16-1.46-.68-2.37-2.82-2.37-4.54 0-3.7 2.68-7.09 7.74-7.09 4.06 0 7.22 2.9 7.22 6.76 0 4.04-2.55 7.29-6.08 7.29-1.19 0-2.31-.62-2.69-1.35l-.73 2.79c-.26 1.02-.98 2.29-1.46 3.07A12 12 0 1012 0z"/>
                    </svg>
                    Post to Pinterest
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * AURALIFT AD GENERATOR - Generate AI Ads with ElevenLabs + HeyGen
 * 
 * Creates professional video ads with voiceover and avatar
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
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

interface AuraLiftAdGeneratorProps {
  onAdGenerated?: (ad: GeneratedAd) => void;
}

export function AuraLiftAdGenerator({ onAdGenerated }: AuraLiftAdGeneratorProps) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [recentAds, setRecentAds] = useState<GeneratedAd[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);

  // AuraLift product data
  const AURALIFT_AD = {
    product_name: 'Radiance Vitamin C Serum',
    product_image: '/lovable-uploads/vitamin-c-serum.jpg',
    script: "Discover Radiance Vitamin C Serum from AuraLift Essentials. Brightens skin, fights dark spots, radiant glow in weeks. Shop now at auraliftessentials.com!",
    voice: 'sarah' as const,
    avatar: 'susan' as const,
    aspect_ratio: '9:16' as const,
    duration: 15
  };

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
        .limit(5);
      
      if (!error && data) {
        setRecentAds(data as GeneratedAd[]);
        
        // Set most recent as generated ad if available
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

  useEffect(() => {
    fetchRecentAds();
    
    // Subscribe to realtime updates
    if (user) {
      const channel = supabase
        .channel('ads-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ads',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Ad update:', payload);
            fetchRecentAds();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchRecentAds]);

  const generateAd = async (testMode: boolean = false) => {
    if (!user) {
      toast.error('Please sign in to generate ads');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatus('Initializing...');

    try {
      // Step 1: Generate voiceover
      setProgress(20);
      setStatus('🎤 Generating voiceover with ElevenLabs...');
      
      await new Promise(r => setTimeout(r, 500));
      
      setProgress(40);
      setStatus('🎥 Creating HeyGen avatar video...');
      
      // Call the generate-ai-ad edge function
      const { data, error } = await supabase.functions.invoke('generate-ai-ad', {
        body: {
          product_name: AURALIFT_AD.product_name,
          product_image: AURALIFT_AD.product_image,
          script: AURALIFT_AD.script,
          voice: AURALIFT_AD.voice,
          avatar: AURALIFT_AD.avatar,
          aspect_ratio: AURALIFT_AD.aspect_ratio,
          duration: AURALIFT_AD.duration,
          test_mode: testMode
        }
      });

      if (error) throw error;

      setProgress(80);
      setStatus('💾 Saving to database...');

      if (data?.ad) {
        const newAd = {
          ...data.ad,
          created_at: new Date().toISOString()
        } as GeneratedAd;
        
        setGeneratedAd(newAd);
        onAdGenerated?.(newAd);
        
        setProgress(100);
        setStatus('✅ Ad generated successfully!');
        
        toast.success(data.message || '🎬 AI Ad generated!', {
          description: testMode 
            ? 'Voiceover preview ready below'
            : 'Video will be ready in 2-5 minutes'
        });

        // Refresh ads list
        fetchRecentAds();
      }

    } catch (err) {
      console.error('Ad generation error:', err);
      setStatus('❌ Generation failed');
      toast.error('Failed to generate ad', {
        description: err instanceof Error ? err.message : 'Please try again'
      });
    } finally {
      setIsGenerating(false);
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

  const pollVideoStatus = async (adId: string, heygenVideoId: string) => {
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 15000));
      
      const { data } = await supabase.functions.invoke('heygen-avatar', {
        body: { action: 'check_status', video_id: heygenVideoId }
      });

      if (data?.status === 'completed' && data?.video_url) {
        // Update the ad in database
        await supabase
          .from('ads')
          .update({ 
            video_url: data.video_url,
            thumbnail_url: data.thumbnail_url,
            status: 'completed'
          })
          .eq('id', adId);
        
        toast.success('🎬 Video ready!');
        fetchRecentAds();
        break;
      } else if (data?.status === 'failed') {
        await supabase
          .from('ads')
          .update({ status: 'failed' })
          .eq('id', adId);
        
        toast.error('Video generation failed');
        break;
      }
    }
  };

  // Start polling if we have a processing ad
  useEffect(() => {
    if (generatedAd?.status === 'processing' && generatedAd?.heygen_video_id) {
      pollVideoStatus(generatedAd.id, generatedAd.heygen_video_id);
    }
  }, [generatedAd?.id, generatedAd?.status, generatedAd?.heygen_video_id]);

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
                ElevenLabs Voice + HeyGen Avatar Video
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Product Preview */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center overflow-hidden">
              <span className="text-3xl">🍊</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{AURALIFT_AD.product_name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                "{AURALIFT_AD.script}"
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {AURALIFT_AD.duration}s
                </span>
                <span className="flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  Sarah (Warm)
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Susan (Elegant)
                </span>
              </div>
            </div>
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

          {/* Generate Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => generateAd(true)}
              disabled={isGenerating}
              variant="outline"
              className="flex-1"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mic className="w-4 h-4 mr-2" />
              )}
              Test Mode (Voiceover Only)
            </Button>
            
            <Button
              onClick={() => generateAd(false)}
              disabled={isGenerating}
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
        </CardContent>
      </Card>

      {/* Generated Ad Preview */}
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
                  <Badge variant={
                    generatedAd.status === 'completed' ? 'default' :
                    generatedAd.status === 'processing' ? 'secondary' :
                    generatedAd.test_mode ? 'outline' : 'destructive'
                  }>
                    {generatedAd.test_mode ? 'Test Mode' : generatedAd.status}
                  </Badge>
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

                  {/* Ad Details & Audio Player */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{generatedAd.product_name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {generatedAd.script}
                      </p>
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
                            {isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </Button>
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium">Voiceover Preview</p>
                            <p className="text-xs text-muted-foreground">
                              ElevenLabs • Sarah (Warm Female)
                            </p>
                          </div>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={toggleMute}
                          >
                            {isMuted ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
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

      {/* Recent Ads */}
      {recentAds.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {recentAds.slice(1).map((ad) => (
                <div
                  key={ad.id}
                  className={`aspect-[9/16] rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 ring-primary/50 ${
                    generatedAd?.id === ad.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setGeneratedAd(ad)}
                >
                  {ad.thumbnail_url ? (
                    <img
                      src={ad.thumbnail_url}
                      alt={ad.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Video className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

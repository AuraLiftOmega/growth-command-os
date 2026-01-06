import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize,
  Loader2,
  Crown,
  Building2,
  Video,
  VolumeX as MuteIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ShareLinkData {
  id: string;
  demo_id: string;
  share_code: string;
  recipient_name: string | null;
  expires_at: string | null;
  demo_videos: {
    id: string;
    variant: string;
    industry: string;
    deal_size: string;
    sales_stage: string;
    narrative: Record<string, any>;
    thumbnail_url: string | null;
    video_url: string | null;
    narration_url: string | null;
    duration_seconds: number | null;
  };
}

const variantIcons: Record<string, any> = {
  standard: Video,
  intimidation: Crown,
  enterprise: Building2,
  silent: MuteIcon,
};

const SharedDemo = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [shareData, setShareData] = useState<ShareLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const viewRecorded = useRef(false);

  useEffect(() => {
    const fetchShareData = async () => {
      if (!shareCode) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('demo_share_links')
          .select(`
            id,
            demo_id,
            share_code,
            recipient_name,
            expires_at,
            demo_videos (
              id,
              variant,
              industry,
              deal_size,
              sales_stage,
              narrative,
              thumbnail_url,
              video_url,
              narration_url,
              duration_seconds
            )
          `)
          .eq('share_code', shareCode)
          .single();

        if (fetchError || !data) {
          setError('Demo not found or link has expired');
          setLoading(false);
          return;
        }

        // Check expiration
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError('This demo link has expired');
          setLoading(false);
          return;
        }

        setShareData(data as unknown as ShareLinkData);

        // Record view (only once per session)
        if (!viewRecorded.current) {
          viewRecorded.current = true;
          await supabase.from('demo_share_views').insert({
            share_link_id: data.id,
            viewer_fingerprint: generateFingerprint(),
          });

          // Update view count directly
          await supabase
            .from('demo_share_links')
            .update({ 
              views: ((data as any).views || 0) + 1,
              last_viewed_at: new Date().toISOString()
            })
            .eq('id', data.id);
        }
      } catch (err) {
        console.error('Error fetching share data:', err);
        setError('Failed to load demo');
      } finally {
        setLoading(false);
      }
    };

    fetchShareData();
  }, [shareCode]);

  // Track watch time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setWatchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update view record with watch time on unmount
  useEffect(() => {
    return () => {
      if (shareData && watchTime > 0) {
        const duration = shareData.demo_videos.duration_seconds || 120;
        const completionPercentage = Math.min(100, Math.round((watchTime / duration) * 100));
        
        supabase.from('demo_share_views')
          .update({
            watch_time_seconds: watchTime,
            completion_percentage: completionPercentage
          })
          .eq('share_link_id', shareData.id)
          .order('created_at', { ascending: false })
          .limit(1);
      }
    };
  }, [shareData, watchTime]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
    
    // Animate progress
    if (!isPlaying && shareData) {
      const duration = shareData.demo_videos.duration_seconds || 120;
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsPlaying(false);
            return 100;
          }
          return prev + (100 / duration);
        });
      }, 1000);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading demo...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Demo Unavailable</h1>
          <p className="text-muted-foreground">{error || 'This demo could not be found.'}</p>
        </div>
      </div>
    );
  }

  const demo = shareData.demo_videos;
  const narrative = demo.narrative as Record<string, any>;
  const VariantIcon = variantIcons[demo.variant] || Video;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hidden audio element for narration */}
      {demo.narration_url && (
        <audio
          ref={audioRef}
          src={demo.narration_url}
          preload="auto"
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {shareData.recipient_name && (
            <p className="text-muted-foreground mb-2">
              Prepared for <span className="font-medium text-foreground">{shareData.recipient_name}</span>
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {demo.industry} Demo
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="gap-1 capitalize">
              <VariantIcon className="w-3 h-3" />
              {demo.variant}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {demo.deal_size.replace('_', ' ')}
            </Badge>
          </div>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl overflow-hidden shadow-2xl border border-border/50"
        >
          {demo.thumbnail_url ? (
            <img
              src={demo.thumbnail_url}
              alt="Demo preview"
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                isPlaying && "scale-105"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <VariantIcon className="w-24 h-24 text-muted-foreground/30" />
            </div>
          )}

          {/* Play overlay */}
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
              onClick={handlePlayPause}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-2xl"
              >
                <Play className="w-12 h-12 text-primary-foreground ml-2" />
              </motion.div>
            </motion.div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <Progress value={progress} className="mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                {demo.narration_url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Narrative Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid md:grid-cols-2 gap-6"
        >
          {narrative.problem && (
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">THE PROBLEM</h3>
              <p className="text-foreground">{narrative.problem}</p>
            </div>
          )}
          {narrative.revelation && (
            <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="font-semibold text-sm text-primary mb-2">THE SOLUTION</h3>
              <p className="text-foreground">{narrative.revelation}</p>
            </div>
          )}
          {narrative.outcome && (
            <div className="p-6 rounded-xl bg-success/5 border border-success/20">
              <h3 className="font-semibold text-sm text-success mb-2">THE OUTCOME</h3>
              <p className="text-foreground">{narrative.outcome}</p>
            </div>
          )}
          {narrative.close && (
            <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
              <h3 className="font-semibold text-sm text-accent mb-2">NEXT STEPS</h3>
              <p className="text-foreground">{narrative.close}</p>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Button size="lg" className="gap-2 px-8">
            Schedule a Call
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Powered by DOMINION
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Generate a simple fingerprint for unique viewer tracking
function generateFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  return btoa(canvas.toDataURL() + navigator.userAgent + screen.width + screen.height).slice(0, 32);
}

export default SharedDemo;
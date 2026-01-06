import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  SkipBack,
  SkipForward,
  Loader2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * DEMO EMBED PLAYER
 * 
 * Embeddable demo video player with:
 * - Playback controls
 * - Progress tracking
 * - Analytics recording
 * - Variant-specific styling
 * - CTA integration
 */

interface DemoData {
  id: string;
  industry: string;
  variant: string;
  deal_size: string;
  sales_stage: string;
  length: string;
  capabilities: string[];
  narrative: Record<string, any>;
  status: string;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  frames_generated: number | null;
  total_frames: number | null;
}

interface FrameData {
  url: string;
  caption: string;
  duration: number;
}

export default function DemoEmbed() {
  const { demoId } = useParams();
  const [searchParams] = useSearchParams();
  const autoPlay = searchParams.get('autoplay') === 'true';
  const hideControls = searchParams.get('minimal') === 'true';
  const ctaUrl = searchParams.get('cta') || null;
  const ctaText = searchParams.get('cta_text') || 'Get Started';

  const [demo, setDemo] = useState<DemoData | null>(null);
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [viewRecorded, setViewRecorded] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const playbackRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch demo data
  useEffect(() => {
    if (!demoId) {
      setError('Demo ID not provided');
      setLoading(false);
      return;
    }

    const fetchDemo = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('demo_videos')
          .select('*')
          .eq('id', demoId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Demo not found');

        setDemo(data as unknown as DemoData);

        // Fetch frames from storage if available
        const { data: files } = await supabase
          .storage
          .from('demo-videos')
          .list(`${demoId}/frames`);

        if (files && files.length > 0) {
          const frameUrls = await Promise.all(
            files
              .filter(f => f.name.endsWith('.png') || f.name.endsWith('.jpg'))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(async (file) => {
                const { data: urlData } = supabase
                  .storage
                  .from('demo-videos')
                  .getPublicUrl(`${demoId}/frames/${file.name}`);
                
                return {
                  url: urlData.publicUrl,
                  caption: '',
                  duration: 3000 // 3 seconds per frame
                };
              })
          );
          setFrames(frameUrls);
        } else {
          // Generate placeholder frames from narrative
          const narrative = data.narrative as Record<string, any>;
          const placeholderFrames: FrameData[] = [
            { url: '', caption: narrative?.problem || 'The Challenge', duration: 4000 },
            { url: '', caption: narrative?.revelation || 'The Solution', duration: 4000 },
            { url: '', caption: narrative?.mechanism || 'How It Works', duration: 4000 },
            { url: '', caption: narrative?.outcome || 'The Results', duration: 4000 },
            { url: '', caption: narrative?.close || 'Take Action', duration: 4000 }
          ].filter(f => f.caption);
          setFrames(placeholderFrames);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching demo:', err);
        setError(err instanceof Error ? err.message : 'Failed to load demo');
        setLoading(false);
      }
    };

    fetchDemo();
  }, [demoId]);

  // Record view analytics
  useEffect(() => {
    if (!demo || viewRecorded) return;

    const recordView = async () => {
      try {
        // Check for existing analytics record
        const { data: existing } = await supabase
          .from('demo_analytics')
          .select('id, views')
          .eq('demo_id', demo.id)
          .single();

        if (existing) {
          await supabase
            .from('demo_analytics')
            .update({ views: (existing.views || 0) + 1 })
            .eq('id', existing.id);
        }

        setViewRecorded(true);
      } catch (err) {
        console.error('Error recording view:', err);
      }
    };

    recordView();
  }, [demo, viewRecorded]);

  // Playback control
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      const currentFrame = frames[currentFrameIndex];
      const duration = currentFrame?.duration || 3000;

      playbackRef.current = setTimeout(() => {
        if (currentFrameIndex < frames.length - 1) {
          setCurrentFrameIndex(prev => prev + 1);
          setProgress(((currentFrameIndex + 1) / frames.length) * 100);
        } else {
          setIsPlaying(false);
          setHasEnded(true);
          setProgress(100);
        }
      }, duration);
    }

    return () => {
      if (playbackRef.current) {
        clearTimeout(playbackRef.current);
      }
    };
  }, [isPlaying, currentFrameIndex, frames]);

  // Auto-play on load
  useEffect(() => {
    if (autoPlay && frames.length > 0 && !loading) {
      setIsPlaying(true);
    }
  }, [autoPlay, frames.length, loading]);

  // Hide controls on inactivity
  useEffect(() => {
    if (hideControls) return;

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, hideControls]);

  const togglePlay = () => {
    if (hasEnded) {
      setCurrentFrameIndex(0);
      setProgress(0);
      setHasEnded(false);
    }
    setIsPlaying(!isPlaying);
  };

  const skipBack = () => {
    setCurrentFrameIndex(prev => Math.max(0, prev - 1));
    setProgress((Math.max(0, currentFrameIndex - 1) / frames.length) * 100);
  };

  const skipForward = () => {
    if (currentFrameIndex < frames.length - 1) {
      setCurrentFrameIndex(prev => prev + 1);
      setProgress(((currentFrameIndex + 1) / frames.length) * 100);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const frameIndex = Math.floor(percentage * frames.length);
    setCurrentFrameIndex(Math.min(frameIndex, frames.length - 1));
    setProgress(percentage * 100);
    setHasEnded(false);
  };

  // Get variant-specific styling
  const getVariantStyles = () => {
    switch (demo?.variant) {
      case 'intimidation':
        return { 
          accent: 'hsl(0 84% 60%)', 
          bg: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a0a 100%)',
          border: 'rgba(220, 38, 38, 0.2)'
        };
      case 'enterprise':
        return { 
          accent: 'hsl(217 91% 60%)', 
          bg: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          border: 'rgba(59, 130, 246, 0.2)'
        };
      case 'silent':
        return { 
          accent: 'hsl(240 5% 45%)', 
          bg: 'linear-gradient(180deg, #18181b 0%, #27272a 100%)',
          border: 'rgba(113, 113, 122, 0.2)'
        };
      default:
        return { 
          accent: 'hsl(270 95% 60%)', 
          bg: 'linear-gradient(180deg, #0a0a0b 0%, #18181b 100%)',
          border: 'rgba(168, 85, 247, 0.2)'
        };
    }
  };

  const styles = getVariantStyles();

  if (loading) {
    return (
      <div 
        className="w-full h-full min-h-[400px] flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #0a0a0b 0%, #18181b 100%)' }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !demo) {
    return (
      <div 
        className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(180deg, #0a0a0b 0%, #18181b 100%)' }}
      >
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">{error || 'Demo not found'}</p>
      </div>
    );
  }

  const currentFrame = frames[currentFrameIndex];

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] overflow-hidden"
      style={{ 
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: isFullscreen ? 0 : '16px'
      }}
    >
      {/* Frame Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFrameIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center"
          >
            {currentFrame?.url ? (
              <img 
                src={currentFrame.url} 
                alt={`Frame ${currentFrameIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center px-8">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-4xl font-bold text-foreground leading-tight"
                  style={{ color: '#ffffff' }}
                >
                  {currentFrame?.caption || 'Loading...'}
                </motion.p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Ended Overlay with CTA */}
      <AnimatePresence>
        {hasEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-6 z-20"
          >
            <Button
              size="lg"
              onClick={togglePlay}
              className="gap-2"
              style={{ background: styles.accent }}
            >
              <Play className="w-5 h-5" />
              Replay Demo
            </Button>

            {ctaUrl && (
              <a 
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-lg font-semibold hover:underline"
                style={{ color: styles.accent }}
              >
                {ctaText}
                <ChevronRight className="w-5 h-5" />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      {!hideControls && (
        <motion.div
          initial={false}
          animate={{ opacity: showControls ? 1 : 0 }}
          className="absolute inset-x-0 bottom-0 z-10"
          style={{ 
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            padding: '32px 16px 16px'
          }}
        >
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-4"
            onClick={handleProgressClick}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ 
                width: `${progress}%`,
                background: styles.accent
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={skipBack}
                className="text-white hover:bg-white/10"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/10"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={skipForward}
                className="text-white hover:bg-white/10"
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              <span className="text-sm text-white/60 ml-2">
                {currentFrameIndex + 1} / {frames.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/10"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/10"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Play Button Overlay (when paused) */}
      <AnimatePresence>
        {!isPlaying && !hasEnded && !loading && showControls && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ 
                background: `${styles.accent}cc`,
                boxShadow: `0 0 40px ${styles.accent}66`
              }}
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Industry Badge */}
      <div 
        className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium"
        style={{ 
          background: `${styles.accent}22`,
          color: styles.accent,
          border: `1px solid ${styles.accent}44`
        }}
      >
        {demo.industry}
      </div>
    </div>
  );
}

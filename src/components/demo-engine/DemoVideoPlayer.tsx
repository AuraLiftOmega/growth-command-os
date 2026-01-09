/**
 * DEMO VIDEO PLAYER
 * 
 * Plays demo videos with:
 * - Animated scene transitions
 * - AI narration audio
 * - Progress tracking
 * - Fullscreen support
 * - Always works (fallback to animated scenes if no real video)
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
// Production mode - no demo fallbacks, generate from narrative

interface DemoVideoPlayerProps {
  thumbnail?: string | null;
  narrationUrl?: string | null;
  narrative?: Record<string, any>;
  durationSeconds?: number;
  variant?: string;
  industry?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  onProgress?: (progress: number, watchTime: number) => void;
  className?: string;
}

export const DemoVideoPlayer = ({
  thumbnail,
  narrationUrl,
  narrative,
  durationSeconds = 120,
  variant = 'standard',
  industry = 'E-commerce',
  autoPlay = false,
  onComplete,
  onProgress,
  className,
}: DemoVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate scenes from narrative or use production defaults
  const scenes = narrative?.scenes || [
    { title: 'DOMINION Overview', subtitle: 'Your autonomous revenue engine', gradient: 'from-primary/30 to-chart-2/30', duration: 30, metrics: [] },
    { title: 'Revenue Performance', subtitle: 'Real-time metrics', gradient: 'from-success/30 to-chart-1/30', duration: 30, metrics: [] },
    { title: 'Autonomous Operations', subtitle: 'Zero manual intervention', gradient: 'from-chart-2/30 to-chart-3/30', duration: 30, metrics: [] },
    { title: 'Scale Without Limits', subtitle: 'Production-ready infrastructure', gradient: 'from-chart-4/30 to-primary/30', duration: 30, metrics: [] },
  ];
  const currentScene = scenes[currentSceneIndex] || scenes[0];
  const totalProgress = scenes.length > 0 ? ((currentSceneIndex * 100) + sceneProgress) / scenes.length : 0;
  const sceneDuration = scenes.length > 0 ? durationSeconds / scenes.length : durationSeconds;

  // Handle audio loading
  useEffect(() => {
    if (narrationUrl) {
      const audio = new Audio(narrationUrl);
      audio.preload = 'auto';
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [narrationUrl]);

  // Scene progression
  useEffect(() => {
    if (!isPlaying) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    const tickRate = 100;
    const progressPerTick = (100 / (sceneDuration * 1000 / tickRate));

    progressIntervalRef.current = setInterval(() => {
      setSceneProgress(prev => {
        if (prev >= 100) {
          setCurrentSceneIndex(i => {
            if (i >= scenes.length - 1) {
              setIsPlaying(false);
              onComplete?.();
              return 0;
            }
            return i + 1;
          });
          return 0;
        }
        return prev + progressPerTick;
      });
      
      setWatchTime(prev => {
        const newTime = prev + (tickRate / 1000);
        onProgress?.(totalProgress, newTime);
        return newTime;
      });
    }, tickRate);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentSceneIndex, sceneDuration, scenes.length, onComplete, onProgress, totalProgress]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handlePrevScene = () => {
    setCurrentSceneIndex(prev => Math.max(0, prev - 1));
    setSceneProgress(0);
  };

  const handleNextScene = () => {
    setCurrentSceneIndex(prev => Math.min(scenes.length - 1, prev + 1));
    setSceneProgress(0);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "aspect-video",
        className
      )}
    >
      {/* Scene Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSceneIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            currentScene?.gradient || "from-purple-500/20 to-pink-500/20"
          )}
        />
      </AnimatePresence>

      {/* Thumbnail overlay (when paused at start) */}
      {thumbnail && !isPlaying && watchTime === 0 && (
        <img 
          src={thumbnail}
          alt="Demo thumbnail"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Scene Content */}
      <div className={cn(
        "relative h-full p-6 flex flex-col justify-between",
        isFullscreen && "min-h-screen"
      )}>
        {/* Top: Scene Info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`title-${currentSceneIndex}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-1"
          >
            <Badge variant="secondary" className="mb-2">
              Scene {currentSceneIndex + 1} of {scenes.length}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold">{currentScene?.title}</h2>
            <p className="text-muted-foreground">{currentScene?.subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {/* Center: Metrics */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`metrics-${currentSceneIndex}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-3 gap-4 py-8"
          >
            {(currentScene?.metrics || []).map((metric: { label: string; value: string; change?: string }, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-4 rounded-xl bg-background/60 backdrop-blur text-center"
              >
                <div className="text-2xl md:text-3xl font-mono font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
                {metric.change && (
                  <div className="text-sm text-success">{metric.change}</div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Narrative text if available */}
        {narrative && (
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="text-center max-w-2xl mx-auto"
              >
                <p className="text-lg italic text-foreground/80">
                  "{currentSceneIndex === 0 ? narrative.hook :
                    currentSceneIndex === 1 ? narrative.problem :
                    currentSceneIndex === 2 ? narrative.revelation :
                    currentSceneIndex === 3 ? narrative.proof :
                    narrative.close}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Bottom: Controls */}
        <div className="space-y-3">
          <Progress value={totalProgress} className="h-1" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-10 w-10 p-0"
                onClick={handlePrevScene}
                disabled={currentSceneIndex === 0}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-10 w-10 p-0"
                onClick={handleNextScene}
                disabled={currentSceneIndex === scenes.length - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {Math.floor(watchTime)}s / {durationSeconds}s
              </span>
              
              {narrationUrl && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0"
                  onClick={handleMuteToggle}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0"
                onClick={handleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Play overlay when paused */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={handlePlayPause}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl"
          >
            <Play className="w-10 h-10 text-primary-foreground ml-1" />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DemoVideoPlayer;

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AutoDemoPlayerProps {
  autoPlay?: boolean;
  showAfterDelay?: number; // ms delay before showing
  className?: string;
}

// Demo scenes with timing
const DEMO_SCENES = [
  {
    title: "Revenue Command Center",
    subtitle: "One dashboard to rule them all",
    duration: 5000,
    gradient: "from-purple-500/20 to-pink-500/20",
    metrics: [
      { label: "Revenue", value: "$847,291", change: "+24%" },
      { label: "ROAS", value: "4.8x", change: "+18%" },
      { label: "Orders", value: "3,421", change: "+31%" },
    ]
  },
  {
    title: "AI Video Generation",
    subtitle: "Scroll-stopping content in seconds",
    duration: 5000,
    gradient: "from-blue-500/20 to-cyan-500/20",
    metrics: [
      { label: "Videos Generated", value: "156", change: "+89" },
      { label: "Avg CTR", value: "4.2%", change: "+1.8%" },
      { label: "Time Saved", value: "240hrs", change: "" },
    ]
  },
  {
    title: "Traffic Engine",
    subtitle: "Platform-independent demand generation",
    duration: 5000,
    gradient: "from-green-500/20 to-emerald-500/20",
    metrics: [
      { label: "Organic Traffic", value: "45%", change: "+12%" },
      { label: "Referral Revenue", value: "$124K", change: "+67%" },
      { label: "Email Subs", value: "18.4K", change: "+2.3K" },
    ]
  },
  {
    title: "Self-Learning AI",
    subtitle: "Gets smarter with every campaign",
    duration: 5000,
    gradient: "from-orange-500/20 to-red-500/20",
    metrics: [
      { label: "Patterns Learned", value: "847", change: "+156" },
      { label: "Accuracy", value: "94%", change: "+8%" },
      { label: "Auto-Optimized", value: "1,234", change: "+389" },
    ]
  },
];

export const AutoDemoPlayer = ({ 
  autoPlay = true, 
  showAfterDelay = 3000,
  className 
}: AutoDemoPlayerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentScene = DEMO_SCENES[currentSceneIndex];
  const totalProgress = ((currentSceneIndex * 100) + sceneProgress) / DEMO_SCENES.length;

  // Show after delay
  useEffect(() => {
    if (isDismissed) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (autoPlay) {
        setIsPlaying(true);
      }
    }, showAfterDelay);

    return () => clearTimeout(timer);
  }, [autoPlay, showAfterDelay, isDismissed]);

  // Scene progression
  useEffect(() => {
    if (!isPlaying) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      return;
    }

    const sceneDuration = currentScene.duration;
    const tickRate = 50; // Update every 50ms
    const progressPerTick = (100 / (sceneDuration / tickRate));

    progressInterval.current = setInterval(() => {
      setSceneProgress(prev => {
        if (prev >= 100) {
          // Move to next scene
          setCurrentSceneIndex(i => {
            if (i >= DEMO_SCENES.length - 1) {
              setIsPlaying(false);
              return 0;
            }
            return i + 1;
          });
          return 0;
        }
        return prev + progressPerTick;
      });
    }, tickRate);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, currentSceneIndex, currentScene.duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDismiss = () => {
    setIsPlaying(false);
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: isMinimized ? 0.6 : 1,
          x: isMinimized ? 200 : 0
        }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          "fixed z-50 transition-all duration-300",
          isMinimized 
            ? "bottom-4 right-4 w-80" 
            : "bottom-8 right-8 w-[480px]",
          className
        )}
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card/95 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/50">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Sparkles className="w-3 h-3" />
                Live Demo
              </Badge>
              <span className="text-xs text-muted-foreground">
                Scene {currentSceneIndex + 1}/{DEMO_SCENES.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleMinimize}
              >
                {isMinimized ? <Maximize className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDismiss}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Demo Content */}
          <div className={cn(
            "relative aspect-video transition-all",
            isMinimized && "aspect-[4/3]"
          )}>
            {/* Scene Background */}
            <motion.div
              key={currentSceneIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                currentScene.gradient
              )}
            />

            {/* Scene Content */}
            <div className="relative h-full p-4 flex flex-col justify-between">
              <motion.div
                key={`title-${currentSceneIndex}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-bold">{currentScene.title}</h3>
                <p className="text-sm text-muted-foreground">{currentScene.subtitle}</p>
              </motion.div>

              {/* Metrics */}
              <motion.div
                key={`metrics-${currentSceneIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-3 gap-2"
              >
                {currentScene.metrics.map((metric, i) => (
                  <div key={i} className="p-2 rounded-lg bg-background/50 backdrop-blur text-center">
                    <div className="text-lg font-mono font-bold">{metric.value}</div>
                    <div className="text-xs text-muted-foreground">{metric.label}</div>
                    {metric.change && (
                      <div className="text-xs text-success">{metric.change}</div>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                onClick={handlePlayPause}
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-3 border-t border-border/50 bg-muted/30">
            <Progress value={totalProgress} className="h-1 mb-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              <Button size="sm" variant="default" className="gap-1 text-xs">
                Try Free
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AutoDemoPlayer;
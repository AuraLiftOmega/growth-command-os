/**
 * Live Pin Carousel
 * Recently posted Pins with saves/clicks metrics
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MousePointerClick,
  ExternalLink,
  Play,
  Clock,
} from 'lucide-react';

interface Pin {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  saves: number;
  clicks: number;
  postedAt: string;
  status: 'live' | 'processing' | 'scheduled';
  performance: 'hot' | 'warm' | 'new';
}

const demoPins: Pin[] = [
  {
    id: '1',
    title: 'Summer Skincare Essentials',
    thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
    views: 12500,
    saves: 890,
    clicks: 234,
    postedAt: '2h ago',
    status: 'live',
    performance: 'hot',
  },
  {
    id: '2',
    title: 'Morning Glow Routine',
    thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    views: 8700,
    saves: 456,
    clicks: 178,
    postedAt: '4h ago',
    status: 'live',
    performance: 'hot',
  },
  {
    id: '3',
    title: 'Night Repair Secrets',
    thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
    views: 5400,
    saves: 234,
    clicks: 98,
    postedAt: '6h ago',
    status: 'live',
    performance: 'warm',
  },
  {
    id: '4',
    title: 'Vitamin C Benefits',
    thumbnail: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    views: 3200,
    saves: 123,
    clicks: 67,
    postedAt: '8h ago',
    status: 'live',
    performance: 'warm',
  },
  {
    id: '5',
    title: 'Hydration Tips',
    thumbnail: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400',
    views: 1200,
    saves: 45,
    clicks: 23,
    postedAt: '12h ago',
    status: 'live',
    performance: 'new',
  },
];

export function LivePinCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const visiblePins = 3;

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (demoPins.length - visiblePins + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => Math.min(demoPins.length - visiblePins, prev + 1));
  };

  const getPerformanceBadge = (performance: Pin['performance']) => {
    switch (performance) {
      case 'hot':
        return (
          <Badge className="bg-primary text-primary-foreground animate-pulse">
            🔥 HOT
          </Badge>
        );
      case 'warm':
        return (
          <Badge variant="outline" className="text-warning border-warning/30">
            📈 Trending
          </Badge>
        );
      case 'new':
        return (
          <Badge variant="outline" className="text-accent border-accent/30">
            ✨ New
          </Badge>
        );
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Live Pin Carousel</h3>
            <p className="text-sm text-muted-foreground">
              Recently posted • Real-time metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= demoPins.length - visiblePins}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: -currentIndex * (100 / visiblePins + 1.5) + '%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {demoPins.map((pin, index) => (
            <motion.div
              key={pin.id}
              className="flex-shrink-0 w-[calc(33.333%-11px)]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                {/* Thumbnail */}
                <div className="relative aspect-[4/5] bg-muted">
                  <img
                    src={pin.thumbnail}
                    alt={pin.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button size="sm" className="w-full gap-2">
                        <ExternalLink className="w-3 h-3" />
                        View on Pinterest
                      </Button>
                    </div>
                  </div>

                  {/* Performance badge */}
                  <div className="absolute top-3 left-3">
                    {getPerformanceBadge(pin.performance)}
                  </div>

                  {/* Live indicator */}
                  {pin.status === 'live' && (
                    <div className="absolute top-3 right-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 bg-card">
                  <h4 className="font-medium text-sm mb-2 truncate">{pin.title}</h4>
                  
                  {/* Metrics */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {(pin.views / 1000).toFixed(1)}K
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <Heart className="w-3 h-3" />
                        {pin.saves}
                      </span>
                      <span className="flex items-center gap-1 text-success">
                        <MousePointerClick className="w-3 h-3" />
                        {pin.clicks}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {pin.postedAt}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: demoPins.length - visiblePins + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === index
                ? 'bg-primary w-6'
                : 'bg-muted hover:bg-muted-foreground'
            }`}
          />
        ))}
      </div>
    </Card>
  );
}

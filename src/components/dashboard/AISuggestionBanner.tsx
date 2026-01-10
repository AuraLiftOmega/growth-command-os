import { motion } from "framer-motion";
import { Sparkles, ArrowRight, X, Store, TrendingUp, Zap, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AISuggestionBannerProps {
  message: string;
  type?: 'shopify' | 'growth' | 'video' | 'social' | 'default';
  ctaLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
}

const typeConfig = {
  shopify: {
    icon: Store,
    gradient: 'from-green-500/10 via-emerald-500/10 to-cyan-500/10',
    border: 'border-green-500/30',
    iconColor: 'text-green-500',
  },
  growth: {
    icon: TrendingUp,
    gradient: 'from-primary/10 via-chart-2/10 to-accent/10',
    border: 'border-primary/30',
    iconColor: 'text-primary',
  },
  video: {
    icon: Video,
    gradient: 'from-purple-500/10 via-pink-500/10 to-red-500/10',
    border: 'border-purple-500/30',
    iconColor: 'text-purple-500',
  },
  social: {
    icon: Users,
    gradient: 'from-blue-500/10 via-cyan-500/10 to-teal-500/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-500',
  },
  default: {
    icon: Sparkles,
    gradient: 'from-primary/10 to-chart-2/10',
    border: 'border-primary/30',
    iconColor: 'text-primary',
  },
};

export function AISuggestionBanner({ 
  message, 
  type = 'default', 
  ctaLabel,
  onAction,
  dismissible = true 
}: AISuggestionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = typeConfig[type];
  const Icon = config.icon;

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${config.gradient} border ${config.border} p-4`}
    >
      {/* Animated sparkle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative flex items-center gap-4">
        <div className={`p-2.5 rounded-xl bg-background/80 shadow-sm ${config.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className={`w-4 h-4 ${config.iconColor}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              AI Suggestion
            </span>
          </div>
          <p className="text-sm font-medium">{message}</p>
        </div>

        <div className="flex items-center gap-2">
          {ctaLabel && onAction && (
            <Button 
              size="sm" 
              onClick={onAction}
              className="gap-2"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          {dismissible && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setDismissed(true)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

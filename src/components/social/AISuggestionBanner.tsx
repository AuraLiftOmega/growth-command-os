/**
 * AI Suggestion Banner - Contextual AI tips and recommendations
 */

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight, Lightbulb, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AISuggestion {
  id: string;
  type: "tip" | "action" | "insight";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority?: "high" | "medium" | "low";
}

interface AISuggestionBannerProps {
  suggestions: AISuggestion[];
  context?: string;
  onDismiss?: (id: string) => void;
}

const typeIcons = {
  tip: Lightbulb,
  action: Zap,
  insight: TrendingUp,
};

const typeColors = {
  tip: "from-amber-500/10 to-yellow-500/10 border-amber-500/20",
  action: "from-primary/10 to-accent/10 border-primary/20",
  insight: "from-success/10 to-emerald-500/10 border-success/20",
};

export function AISuggestionBanner({ 
  suggestions, 
  context,
  onDismiss 
}: AISuggestionBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  
  const visibleSuggestions = suggestions.filter(s => !dismissedIds.has(s.id));
  
  if (visibleSuggestions.length === 0) return null;

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
    onDismiss?.(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <AnimatePresence>
        {visibleSuggestions.map((suggestion, index) => {
          const Icon = typeIcons[suggestion.type];
          const colorClass = typeColors[suggestion.type];
          
          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg bg-gradient-to-r ${colorClass} border`}
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-background/50">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">{suggestion.title}</span>
                    {suggestion.priority === "high" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {suggestion.description}
                  </p>
                  {suggestion.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 mt-2 text-xs"
                      onClick={suggestion.action.onClick}
                    >
                      {suggestion.action.label}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-50 hover:opacity-100"
                  onClick={() => handleDismiss(suggestion.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper hook for generating context-aware suggestions
export function useAISuggestions(context: {
  hasShopify?: boolean;
  hasSocialConnected?: boolean;
  hasVideos?: boolean;
  totalProducts?: number;
  connectedChannels?: number;
}) {
  const suggestions: AISuggestion[] = [];

  if (!context.hasShopify) {
    suggestions.push({
      id: "connect-shopify",
      type: "action",
      title: "Connect Shopify",
      description: "Sync products automatically and enable AI-powered video ad generation for your store.",
      priority: "high",
    });
  }

  if (context.hasShopify && !context.hasSocialConnected) {
    suggestions.push({
      id: "connect-social",
      type: "action",
      title: "Connect Social Channels",
      description: "Link your TikTok, Instagram, or Pinterest to start autonomous posting.",
      priority: "high",
    });
  }

  if (context.hasShopify && context.hasSocialConnected && !context.hasVideos) {
    suggestions.push({
      id: "create-video",
      type: "tip",
      title: "Generate Your First Video Ad",
      description: "Use AI to create professional video ads from your products in under 60 seconds.",
      priority: "medium",
    });
  }

  if (context.totalProducts && context.totalProducts > 5) {
    suggestions.push({
      id: "bestseller-focus",
      type: "insight",
      title: "Focus on Bestsellers",
      description: `You have ${context.totalProducts} products. Consider creating targeted ads for your top 3 performers.`,
      priority: "low",
    });
  }

  if (context.connectedChannels && context.connectedChannels >= 3) {
    suggestions.push({
      id: "cross-post",
      type: "tip",
      title: "Enable Cross-Posting",
      description: "Post to all your channels simultaneously for maximum reach with one click.",
      priority: "medium",
    });
  }

  return suggestions;
}

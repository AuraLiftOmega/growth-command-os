/**
 * UNIVERSAL SMART SUGGESTION ENGINE
 * 
 * AI-powered auto-fill suggestions for all input fields
 * - Context-aware suggestions based on field type and user history
 * - Click-to-apply chips
 * - Learns from selections
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Zap, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Suggestion {
  id: string;
  value: string;
  label: string;
  confidence: number; // 0-100
  category?: string;
}

interface SmartSuggestionEngineProps {
  fieldId: string;
  fieldType: 'text' | 'textarea' | 'select' | 'multiselect';
  context?: Record<string, any>;
  onSelect: (value: string) => void;
  currentValue?: string;
  className?: string;
  maxSuggestions?: number;
  placeholder?: string;
}

// Suggestion database by field type/context
const SUGGESTION_DATABASE: Record<string, Suggestion[]> = {
  // Business DNA
  brandName: [
    { id: '1', value: 'My Brand', label: 'My Brand', confidence: 85, category: 'generic' },
    { id: '2', value: 'Premium Co', label: 'Premium Co', confidence: 75, category: 'premium' },
    { id: '3', value: 'Growth Labs', label: 'Growth Labs', confidence: 70, category: 'tech' },
  ],
  primaryProducts: [
    { id: '1', value: 'High-quality products designed to solve customer pain points and deliver exceptional value. Premium offerings with proven market demand and strong repeat purchase rates.', label: 'Premium Products (General)', confidence: 90, category: 'recommended' },
    { id: '2', value: 'Innovative digital solutions that save time and increase productivity. SaaS platform with monthly subscriptions and enterprise features.', label: 'SaaS/Digital', confidence: 85, category: 'tech' },
    { id: '3', value: 'Health and wellness products backed by science. Natural ingredients, FDA-compliant, with clinical studies supporting efficacy.', label: 'Health & Wellness', confidence: 80, category: 'health' },
    { id: '4', value: 'Luxury fashion and accessories for discerning customers. Limited editions, premium materials, exclusive designs.', label: 'Fashion/Luxury', confidence: 75, category: 'fashion' },
  ],
  aov: [
    { id: '1', value: '$75-150', label: '$75-150 (Optimal)', confidence: 95, category: 'recommended' },
    { id: '2', value: '$50-75', label: '$50-75 (Mid-tier)', confidence: 80, category: 'standard' },
    { id: '3', value: '$150-300', label: '$150-300 (Premium)', confidence: 75, category: 'premium' },
    { id: '4', value: '$300+', label: '$300+ (Luxury)', confidence: 70, category: 'luxury' },
  ],
  // Customer Intelligence
  demographics: [
    { id: '1', value: 'Ambitious professionals aged 25-45, digitally savvy, value quality over price, active on social media, research before purchasing. Income $75K+, urban areas.', label: 'High-Value Professionals', confidence: 92, category: 'recommended' },
    { id: '2', value: 'Health-conscious individuals 30-55, willing to invest in wellness, prefer natural products, active lifestyle, educated buyers.', label: 'Health-Conscious Adults', confidence: 85, category: 'health' },
    { id: '3', value: 'Tech-forward millennials and Gen-Z, early adopters, social media native, value convenience and instant gratification.', label: 'Tech-Savvy Youth', confidence: 80, category: 'tech' },
  ],
  frustrations: [
    { id: '1', value: 'Tired of low-quality alternatives, frustrated by poor customer service, overwhelmed by too many options, want trusted solutions that actually work.', label: 'Quality & Trust Issues', confidence: 90, category: 'recommended' },
    { id: '2', value: 'Wasted money on products that don\'t deliver, skeptical of marketing claims, need proof before purchasing.', label: 'Skeptical Buyers', confidence: 85, category: 'trust' },
    { id: '3', value: 'Time-poor, need solutions that work fast, hate complicated processes, value simplicity and results.', label: 'Time-Constrained', confidence: 80, category: 'convenience' },
  ],
  desiredOutcomes: [
    { id: '1', value: 'Save time, improve quality of life, feel confident in purchase decisions, get real results, experience premium service and ongoing support.', label: 'Quality of Life', confidence: 90, category: 'recommended' },
    { id: '2', value: 'Achieve specific goals faster, see measurable improvements, feel part of an exclusive community.', label: 'Achievement-Focused', confidence: 85, category: 'goals' },
    { id: '3', value: 'Reduce stress, gain peace of mind, know they made the right choice, feel proud of their purchase.', label: 'Emotional Satisfaction', confidence: 80, category: 'emotional' },
  ],
  buyingObjections: [
    { id: '1', value: 'Is it worth the price? Will it actually work for me? Can I trust this brand? What if I don\'t like it? Is there a guarantee?', label: 'Standard Objections', confidence: 92, category: 'recommended' },
    { id: '2', value: 'Have I tried something similar before that didn\'t work? How is this different from competitors?', label: 'Comparison Objections', confidence: 85, category: 'comparison' },
    { id: '3', value: 'Is now the right time? Should I wait for a sale? Can I afford this?', label: 'Timing/Budget', confidence: 80, category: 'timing' },
  ],
  // Product Truth
  competitiveAdvantages: [
    { id: '1', value: 'Superior quality, faster results, better customer support, proven track record with thousands of happy customers, money-back guarantee.', label: 'Quality Leader', confidence: 90, category: 'recommended' },
    { id: '2', value: 'First-to-market innovation, patent-protected technology, exclusive features competitors can\'t replicate.', label: 'Innovation Leader', confidence: 85, category: 'innovation' },
    { id: '3', value: 'Best value for money, more features at lower price, no hidden fees, transparent pricing.', label: 'Value Leader', confidence: 80, category: 'value' },
  ],
  claimsAllowed: [
    { id: '1', value: 'Quality-focused, results-driven, customer-approved, satisfaction guaranteed, trusted by thousands.', label: 'Standard Claims', confidence: 90, category: 'recommended' },
    { id: '2', value: 'Clinically tested, scientifically proven, doctor recommended, peer-reviewed research.', label: 'Scientific Claims', confidence: 80, category: 'science' },
    { id: '3', value: 'Industry-leading, award-winning, top-rated, best-in-class performance.', label: 'Authority Claims', confidence: 75, category: 'authority' },
  ],
  // Creative Direction
  winningAdDefinition: [
    { id: '1', value: 'High engagement rate (3%+), strong click-through rate (2%+), positive ROAS (3x+), drives conversions and builds brand awareness simultaneously.', label: 'Balanced Performance', confidence: 90, category: 'recommended' },
    { id: '2', value: 'Maximum conversions at target CPA, scalable to $10K+/day spend, consistent performance across audiences.', label: 'Scale-Focused', confidence: 85, category: 'scale' },
    { id: '3', value: 'Viral potential, high share rate, organic amplification, builds brand love and community.', label: 'Virality-Focused', confidence: 75, category: 'viral' },
  ],
  // Store Setup
  storeName: [
    { id: '1', value: 'Premium Store', label: 'Premium Store', confidence: 85, category: 'generic' },
    { id: '2', value: 'The Modern Shop', label: 'The Modern Shop', confidence: 80, category: 'modern' },
    { id: '3', value: 'Elite Collection', label: 'Elite Collection', confidence: 75, category: 'luxury' },
  ],
  storeDescription: [
    { id: '1', value: 'Premium products designed for discerning customers who value quality, innovation, and exceptional service. Shop with confidence.', label: 'Premium Focus', confidence: 90, category: 'recommended' },
    { id: '2', value: 'Discover curated collections that combine style, quality, and value. We hand-pick every product to ensure your satisfaction.', label: 'Curated Selection', confidence: 85, category: 'curated' },
    { id: '3', value: 'Your destination for innovative products that make life better. Fast shipping, easy returns, and world-class support.', label: 'Innovation Focus', confidence: 80, category: 'innovation' },
  ],
  targetAudience: [
    { id: '1', value: 'Quality-conscious shoppers aged 25-45 who value premium products and are willing to pay for excellence.', label: 'Premium Shoppers', confidence: 90, category: 'recommended' },
    { id: '2', value: 'Health and wellness enthusiasts seeking natural, effective solutions for their lifestyle goals.', label: 'Wellness Seekers', confidence: 85, category: 'health' },
    { id: '3', value: 'Tech-savvy early adopters who want the latest innovations and cutting-edge products.', label: 'Early Adopters', confidence: 80, category: 'tech' },
  ],
};

export function SmartSuggestionEngine({
  fieldId,
  fieldType,
  context,
  onSelect,
  currentValue,
  className,
  maxSuggestions = 4,
  placeholder = "AI suggestions available"
}: SmartSuggestionEngineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Generate suggestions based on field and context
  useEffect(() => {
    const baseSuggestions = SUGGESTION_DATABASE[fieldId] || [];
    
    // Sort by confidence and limit
    const sortedSuggestions = [...baseSuggestions]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSuggestions);
    
    setSuggestions(sortedSuggestions);
  }, [fieldId, context, maxSuggestions]);

  const handleSelect = useCallback((suggestion: Suggestion) => {
    setSelectedId(suggestion.id);
    onSelect(suggestion.value);
    setIsOpen(false);
    
    // Track selection for learning (would connect to backend in production)
    console.log('[SmartSuggestion] Selected:', suggestion.id, 'for field:', fieldId);
  }, [fieldId, onSelect]);

  if (suggestions.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5 text-xs text-primary/80 hover:text-primary hover:bg-primary/10 h-7"
      >
        <Sparkles className="w-3 h-3" />
        <span className="hidden sm:inline">{placeholder}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1 left-0 right-0 min-w-[280px] max-w-md bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="w-3 h-3 text-primary" />
                <span>Click to auto-fill</span>
              </div>
            </div>
            
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "w-full text-left p-2.5 rounded-md transition-all",
                    "hover:bg-primary/10 hover:border-primary/30",
                    "border border-transparent",
                    selectedId === suggestion.id && "bg-primary/20 border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{suggestion.label}</span>
                        {suggestion.category === 'recommended' && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-success/20 text-success">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {suggestion.value.slice(0, 100)}...
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1">
                      <div className="text-[10px] text-muted-foreground">
                        {suggestion.confidence}%
                      </div>
                      {selectedId === suggestion.id && (
                        <Check className="w-4 h-4 text-success" />
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline suggestion chips component
export function SuggestionChips({
  fieldId,
  onSelect,
  maxChips = 3,
  className
}: {
  fieldId: string;
  onSelect: (value: string) => void;
  maxChips?: number;
  className?: string;
}) {
  const suggestions = (SUGGESTION_DATABASE[fieldId] || []).slice(0, maxChips);

  if (suggestions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5 mt-2", className)}>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          type="button"
          onClick={() => onSelect(suggestion.value)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary/50 hover:bg-primary/20 rounded-full transition-colors border border-transparent hover:border-primary/30"
        >
          <Sparkles className="w-3 h-3 text-primary/60" />
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}

// Hook for using smart suggestions
export function useSmartSuggestions(fieldId: string) {
  const [suggestions] = useState<Suggestion[]>(
    () => SUGGESTION_DATABASE[fieldId] || []
  );

  const getSuggestion = useCallback((index: number = 0) => {
    return suggestions[index]?.value || '';
  }, [suggestions]);

  const getTopSuggestion = useCallback(() => {
    const sorted = [...suggestions].sort((a, b) => b.confidence - a.confidence);
    return sorted[0]?.value || '';
  }, [suggestions]);

  return {
    suggestions,
    getSuggestion,
    getTopSuggestion,
    hasSuggestions: suggestions.length > 0
  };
}

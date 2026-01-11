/**
 * VIRAL TEMPLATES - TikTok/Reels style ad templates
 */

import { motion } from 'framer-motion';
import { Sparkles, Zap, Eye, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface ViralTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  hook: string;
  style: string;
  viralScore: number;
  bestFor: string[];
  scriptTemplate: string;
  tags: string[];
}

export const VIRAL_TEMPLATES: ViralTemplate[] = [
  {
    id: 'pov-glow-up',
    name: 'POV Glow Up',
    emoji: '✨',
    description: 'First-person transformation story',
    hook: 'POV: You finally found THE product...',
    style: 'pov',
    viralScore: 95,
    bestFor: ['skincare', 'beauty', 'wellness'],
    scriptTemplate: 'POV: You finally found THE product that actually works. {product} changed my entire routine. Day 1 vs Day 30... the glow is REAL. Link in bio!',
    tags: ['fyp', 'skincare', 'glowup', 'povstyle', 'viral']
  },
  {
    id: 'before-after',
    name: 'Before/After Reveal',
    emoji: '🔄',
    description: 'Dramatic transformation reveal',
    hook: 'Wait for it...',
    style: 'before-after',
    viralScore: 92,
    bestFor: ['skincare', 'fitness', 'beauty'],
    scriptTemplate: 'Everyone asked what I\'m doing differently... The secret? {product}. Before vs After - the results speak for themselves! Shop now 👇',
    tags: ['transformation', 'beforeafter', 'results', 'skincareroutine']
  },
  {
    id: 'grwm',
    name: 'GRWM (Get Ready With Me)',
    emoji: '💄',
    description: 'Morning/evening routine format',
    hook: 'Get ready with me using only...',
    style: 'grwm',
    viralScore: 88,
    bestFor: ['beauty', 'skincare', 'lifestyle'],
    scriptTemplate: 'GRWM using my holy grail products 💫 Starting with {product} - watch how it absorbs! This is your sign to try it. Link in bio!',
    tags: ['grwm', 'morningroutine', 'skincare', 'beauty']
  },
  {
    id: 'aesthetic-routine',
    name: 'Aesthetic Routine',
    emoji: '🌸',
    description: 'Calming, satisfying product application',
    hook: 'Your daily dose of skincare ASMR...',
    style: 'aesthetic',
    viralScore: 85,
    bestFor: ['luxury', 'skincare', 'self-care'],
    scriptTemplate: 'The most satisfying skincare routine 🌙 {product} glides on like a dream. Pure luxury. Shop the glow ✨',
    tags: ['asmr', 'satisfying', 'skincare', 'aesthetic', 'selfcare']
  },
  {
    id: 'unboxing-reveal',
    name: 'Unboxing Reveal',
    emoji: '📦',
    description: 'Exciting product unboxing experience',
    hook: 'It finally arrived!',
    style: 'unboxing',
    viralScore: 82,
    bestFor: ['new products', 'bundles', 'gifts'],
    scriptTemplate: 'UNBOXING TIME! 📦 Finally got my hands on {product}! The packaging is *chef\'s kiss* and look at that texture! Run don\'t walk 🏃‍♀️',
    tags: ['unboxing', 'haul', 'newproduct', 'review']
  },
  {
    id: 'duet-react',
    name: 'Duet/React Style',
    emoji: '🎭',
    description: 'Reaction to testimonial/before-after',
    hook: 'Wait, THIS is the same person?!',
    style: 'duet',
    viralScore: 90,
    bestFor: ['testimonials', 'transformations'],
    scriptTemplate: 'When I saw these results I HAD to try {product} myself... And OMG the hype is REAL! You need this in your life!',
    tags: ['duet', 'reaction', 'storytime', 'viral']
  },
  {
    id: 'storytime',
    name: 'Storytime',
    emoji: '📖',
    description: 'Personal story with product tie-in',
    hook: 'Story time: How I fixed my skin...',
    style: 'storytime',
    viralScore: 87,
    bestFor: ['personal stories', 'testimonials'],
    scriptTemplate: 'Story time: I tried EVERYTHING for my skin. Nothing worked until I found {product}. This is my honest 30-day experience... the ending will shock you!',
    tags: ['storytime', 'skincare', 'journey', 'honest']
  },
  {
    id: 'ai-custom',
    name: 'AI Custom Script',
    emoji: '🤖',
    description: 'Grok-generated viral content',
    hook: 'AI-optimized for maximum engagement',
    style: 'ai-custom',
    viralScore: 93,
    bestFor: ['all products'],
    scriptTemplate: '[AI will generate a custom viral script based on your product and trending content]',
    tags: ['fyp', 'viral', 'trending', 'foryou']
  }
];

interface ViralTemplatesProps {
  selectedTemplate: ViralTemplate | null;
  onSelectTemplate: (template: ViralTemplate) => void;
}

export function ViralTemplates({ selectedTemplate, onSelectTemplate }: ViralTemplatesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-chart-3" />
        <h4 className="font-semibold text-sm">Viral Templates</h4>
        <Badge variant="secondary" className="text-[10px]">
          TikTok Optimized
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {VIRAL_TEMPLATES.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              onClick={() => onSelectTemplate(template)}
              className={`p-3 cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? 'ring-2 ring-primary bg-primary/10'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">{template.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-xs truncate">{template.name}</p>
                    {template.viralScore >= 90 && (
                      <Zap className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-chart-3" />
                      <span className="text-[10px] font-medium text-chart-3">
                        {template.viralScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

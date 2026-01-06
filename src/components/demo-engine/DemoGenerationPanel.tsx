import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Play, 
  Loader2,
  Clock,
  Target,
  Users,
  Building2,
  TrendingUp,
  Check,
  Sparkles,
  Video
} from 'lucide-react';
import { useDemoEngineStore, DemoLength, DealSize, SalesStage } from '@/stores/demo-engine-store';
import { useDominionStore, INDUSTRY_TEMPLATES } from '@/stores/dominion-core-store';
import { useDemoEngine } from '@/hooks/useDemoEngine';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * DEMO VIDEO GENERATION ENGINE
 * 
 * Automatically generates demo videos with:
 * - Clean UI walkthroughs
 * - Animated system flows
 * - Before/after business states
 * - Visual proof loops
 */

const DEMO_LENGTHS: { id: DemoLength; label: string; duration: string; useCase: string }[] = [
  { id: 'short', label: '60-120 Seconds', duration: '1-2 min', useCase: 'Sales & Outbound' },
  { id: 'long', label: '3-5 Minutes', duration: '3-5 min', useCase: 'Deep Demos & Enterprise' },
];

const DEAL_SIZES: { id: DealSize; label: string; range: string }[] = [
  { id: 'smb', label: 'SMB', range: '$1K-$10K' },
  { id: 'mid_market', label: 'Mid-Market', range: '$10K-$50K' },
  { id: 'enterprise', label: 'Enterprise', range: '$50K+' },
];

const SALES_STAGES: { id: SalesStage; label: string; description: string }[] = [
  { id: 'cold', label: 'Cold', description: 'First touch, awareness' },
  { id: 'warm', label: 'Warm', description: 'Engaged, considering' },
  { id: 'close', label: 'Close', description: 'Decision stage' },
];

export const DemoGenerationPanel = () => {
  const {
    currentVariant,
    targetIndustry,
    setTargetIndustry,
    targetDealSize,
    setTargetDealSize,
    targetSalesStage,
    setTargetSalesStage,
    selectedLength,
    setSelectedLength,
    selectedCapabilities,
  } = useDemoEngineStore();

  const { industry: currentIndustry } = useDominionStore();
  const { generateDemo, isGenerating, generationProgress } = useDemoEngine();

  const industries = Object.entries(INDUSTRY_TEMPLATES).map(([id, config]) => ({
    id,
    name: config.name,
  }));

  const handleGenerate = async () => {
    await generateDemo({
      variant: currentVariant,
      industry: targetIndustry,
      dealSize: targetDealSize,
      salesStage: targetSalesStage,
      length: selectedLength,
      capabilities: selectedCapabilities,
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Industry Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Target Industry
          </label>
          <div className="grid grid-cols-2 gap-2">
            {industries.slice(0, 6).map((ind) => (
              <button
                key={ind.id}
                onClick={() => setTargetIndustry(ind.id)}
                className={cn(
                  "p-3 rounded-lg border text-left text-sm transition-all",
                  targetIndustry === ind.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-card/50 border-border/50 hover:border-border"
                )}
              >
                {ind.name}
              </button>
            ))}
          </div>
        </div>

        {/* Deal Size */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            Deal Size
          </label>
          <div className="space-y-2">
            {DEAL_SIZES.map((size) => (
              <button
                key={size.id}
                onClick={() => setTargetDealSize(size.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between",
                  targetDealSize === size.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-card/50 border-border/50 hover:border-border"
                )}
              >
                <span className="font-medium">{size.label}</span>
                <span className="text-sm text-muted-foreground">{size.range}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sales Stage */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Sales Stage
          </label>
          <div className="flex gap-2">
            {SALES_STAGES.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setTargetSalesStage(stage.id)}
                className={cn(
                  "flex-1 p-3 rounded-lg border text-center transition-all",
                  targetSalesStage === stage.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-card/50 border-border/50 hover:border-border"
                )}
              >
                <p className="font-medium">{stage.label}</p>
                <p className="text-xs text-muted-foreground">{stage.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Length */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Demo Length
          </label>
          <div className="space-y-2">
            {DEMO_LENGTHS.map((length) => (
              <button
                key={length.id}
                onClick={() => setSelectedLength(length.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between",
                  selectedLength === length.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-card/50 border-border/50 hover:border-border"
                )}
              >
                <div>
                  <span className="font-medium">{length.label}</span>
                  <p className="text-xs text-muted-foreground">{length.useCase}</p>
                </div>
                {selectedLength === length.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Summary */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <h4 className="font-medium">Demo Configuration</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Variant</p>
            <p className="font-medium capitalize">{currentVariant}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Industry</p>
            <p className="font-medium">{INDUSTRY_TEMPLATES[targetIndustry]?.name || targetIndustry}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Capabilities</p>
            <p className="font-medium">{selectedCapabilities.length} selected</p>
          </div>
          <div>
            <p className="text-muted-foreground">Length</p>
            <p className="font-medium">{selectedLength === 'short' ? '1-2 min' : '3-5 min'}</p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex flex-col items-center gap-4">
        {isGenerating && (
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Generating demo...</span>
              <span className="font-mono">{Math.round(generationProgress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${generationProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating || selectedCapabilities.length === 0}
          className="gap-2 px-8"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              Generate Demo Video
            </>
          )}
        </Button>

        {selectedCapabilities.length === 0 && (
          <p className="text-sm text-destructive">
            Select capabilities in the Capabilities tab first
          </p>
        )}
      </div>
    </div>
  );
};

export default DemoGenerationPanel;

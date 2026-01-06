import { motion } from 'framer-motion';
import { 
  Target, 
  Check, 
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  Globe,
  Link2,
  DollarSign,
  Radio
} from 'lucide-react';
import { useDemoEngineStore, DemoCapability } from '@/stores/demo-engine-store';
import { useDominionStore, INDUSTRY_TEMPLATES } from '@/stores/dominion-core-store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * SELF-AWARE CAPABILITY MAPPING
 * 
 * DOMINION understands its own modules and dynamically selects
 * which features to showcase based on context.
 */

const CAPABILITY_ICONS: Record<string, any> = {
  traffic_engine: Radio,
  cash_engine: DollarSign,
  automation_replacement: Zap,
  proof_loop: TrendingUp,
  governance: Shield,
  industry_adaptation: Globe,
  self_marketing: Sparkles,
  integration_sovereignty: Link2,
};

export const DemoCapabilityMapper = () => {
  const { 
    capabilities, 
    selectedCapabilities, 
    toggleCapability,
    targetIndustry,
    targetDealSize,
    targetSalesStage 
  } = useDemoEngineStore();
  const { industry: currentIndustry } = useDominionStore();

  const effectiveIndustry = targetIndustry || currentIndustry || 'ecommerce';

  // Auto-recommend capabilities based on context
  const getRecommendedCapabilities = () => {
    const recommended: string[] = [];
    
    // Industry-based recommendations
    capabilities.forEach(cap => {
      if (cap.industryRelevance.includes(effectiveIndustry)) {
        recommended.push(cap.id);
      }
    });

    // Deal size adjustments
    if (targetDealSize === 'enterprise') {
      recommended.push('governance', 'integration_sovereignty');
    }
    if (targetDealSize === 'smb') {
      recommended.push('automation_replacement', 'traffic_engine');
    }

    // Sales stage adjustments
    if (targetSalesStage === 'cold') {
      recommended.push('proof_loop');
    }
    if (targetSalesStage === 'close') {
      recommended.push('cash_engine', 'governance');
    }

    return [...new Set(recommended)];
  };

  const recommendedIds = getRecommendedCapabilities();

  const applyRecommended = () => {
    recommendedIds.forEach(id => {
      if (!selectedCapabilities.includes(id)) {
        toggleCapability(id);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Capability Mapping</h3>
            <p className="text-sm text-muted-foreground">
              Select which DOMINION capabilities to showcase in demos
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={applyRecommended}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Apply Recommended
        </Button>
      </div>

      {/* Context Display */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1">
          <Globe className="w-3 h-3" />
          {INDUSTRY_TEMPLATES[effectiveIndustry]?.name || effectiveIndustry}
        </Badge>
        <Badge variant="outline" className="gap-1 capitalize">
          {targetDealSize.replace('_', ' ')}
        </Badge>
        <Badge variant="outline" className="gap-1 capitalize">
          {targetSalesStage} Stage
        </Badge>
      </div>

      {/* Capability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {capabilities.map((capability, index) => {
          const isSelected = selectedCapabilities.includes(capability.id);
          const isRecommended = recommendedIds.includes(capability.id);
          const Icon = CAPABILITY_ICONS[capability.id] || Zap;

          return (
            <motion.button
              key={capability.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleCapability(capability.id)}
              className={cn(
                "p-4 rounded-lg border text-left transition-all relative",
                isSelected
                  ? "bg-primary/10 border-primary/50"
                  : "bg-card/50 border-border/50 hover:border-border"
              )}
            >
              {/* Recommended Badge */}
              {isRecommended && !isSelected && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0">
                    Recommended
                  </Badge>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isSelected ? "bg-primary/20" : "bg-secondary"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isSelected && "text-primary"
                    )}>
                      {capability.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{capability.module}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-3 mb-2">
                {capability.description}
              </p>

              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-success">{capability.outcomeMetric}</span>
              </div>

              {/* Industry Relevance */}
              <div className="mt-3 pt-3 border-t border-border/30">
                <div className="flex flex-wrap gap-1">
                  {capability.industryRelevance.slice(0, 3).map((ind) => (
                    <span
                      key={ind}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded capitalize",
                        ind === effectiveIndustry
                          ? "bg-success/20 text-success"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {ind.replace('_', ' ')}
                    </span>
                  ))}
                  {capability.industryRelevance.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{capability.industryRelevance.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Selected Capabilities</p>
            <p className="text-xs text-muted-foreground">
              {selectedCapabilities.length} of {capabilities.length} will be showcased
            </p>
          </div>
          <div className="flex gap-1">
            {selectedCapabilities.map((id) => {
              const Icon = CAPABILITY_ICONS[id] || Zap;
              return (
                <div
                  key={id}
                  className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"
                >
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoCapabilityMapper;

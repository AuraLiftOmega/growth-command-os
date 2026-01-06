import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Sparkles, 
  Target, 
  BarChart3, 
  Settings2,
  Crown,
  Building2,
  VolumeX,
  Zap,
  RefreshCw,
  Send,
  FlaskConical,
} from 'lucide-react';
import { useDemoEngineStore } from '@/stores/demo-engine-store';
import { useDemoEngine } from '@/hooks/useDemoEngine';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DemoGenerationPanel } from './DemoGenerationPanel';
import { DemoVariantSelector } from './DemoVariantSelector';
import { DemoCapabilityMapper } from './DemoCapabilityMapper';
import { DemoAnalyticsPanel } from './DemoAnalyticsPanel';
import { DemoLibrary } from './DemoLibrary';
import { DemoSalesAutomation } from './DemoSalesAutomation';
import { ABTestingPanel } from './ABTestingPanel';
import { cn } from '@/lib/utils';

/**
 * SELF-DEMO VIDEO ENGINE
 * 
 * Enables DOMINION to automatically create cinematic, high-conversion
 * demo videos showcasing itself across industries and deal sizes.
 */

export const SelfDemoEngine = () => {
  const { isActive, setActive, currentVariant } = useDemoEngineStore();
  const { demos, analytics, refreshData, isLoading } = useDemoEngine();
  const [activeTab, setActiveTab] = useState('generate');

  const variantLabels = {
    standard: { label: 'Standard', icon: Video, color: 'text-primary' },
    intimidation: { label: 'Intimidation', icon: Crown, color: 'text-warning' },
    enterprise: { label: 'Enterprise', icon: Building2, color: 'text-accent' },
    silent: { label: 'Silent Close', icon: VolumeX, color: 'text-muted-foreground' },
  };

  const CurrentVariantIcon = variantLabels[currentVariant].icon;

  // Calculate real stats
  const totalViews = Object.values(analytics).reduce((sum, a) => sum + (a?.views || 0), 0);
  const avgCompletionRate = Object.values(analytics).length > 0
    ? Object.values(analytics).reduce((sum, a) => sum + (a?.completion_rate || 0), 0) / Object.values(analytics).length
    : 0;
  const avgCloseRate = Object.values(analytics).length > 0
    ? Object.values(analytics).reduce((sum, a) => sum + (a?.close_rate || 0), 0) / Object.values(analytics).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isActive ? "bg-primary/20" : "bg-secondary"
          )}>
            <Video className={cn(
              "w-6 h-6",
              isActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Self-Demo Video Engine</h2>
            <p className="text-sm text-muted-foreground">
              Automatic cinematic demos that pre-close buyers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Sync
          </Button>

          {/* Current Variant Badge */}
          <Badge variant="outline" className={cn("gap-2", variantLabels[currentVariant].color)}>
            <CurrentVariantIcon className="w-3 h-3" />
            {variantLabels[currentVariant].label} Mode
          </Badge>

          {/* Engine Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Engine</span>
            <Switch checked={isActive} onCheckedChange={setActive} />
          </div>

          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20"
            >
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-success">ACTIVE</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Core Philosophy */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Demo Philosophy</p>
            <p className="text-sm text-muted-foreground">
              Every demo makes it immediately obvious: DOMINION is not a tool. DOMINION is not an agency. 
              DOMINION is infrastructure for revenue control. Reduce explanation, increase certainty, shorten sales cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Demos Generated</p>
          <p className="text-2xl font-mono font-bold">{demos.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Views</p>
          <p className="text-2xl font-mono font-bold">
            {totalViews.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Avg Completion</p>
          <p className="text-2xl font-mono font-bold text-success">
            {demos.length > 0 ? `${Math.round(avgCompletionRate)}%` : '—'}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Demo Close Rate</p>
          <p className="text-2xl font-mono font-bold text-accent">
            {demos.length > 0 ? `${Math.round(avgCloseRate)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/60 border border-border">
          <TabsTrigger value="generate" className="gap-2">
            <Zap className="w-4 h-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="variants" className="gap-2">
            <Crown className="w-4 h-4" />
            Variants
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="gap-2">
            <Target className="w-4 h-4" />
            Capabilities
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <Video className="w-4 h-4" />
            Library ({demos.length})
          </TabsTrigger>
          <TabsTrigger value="deploy" className="gap-2">
            <Send className="w-4 h-4" />
            Deploy
          </TabsTrigger>
          <TabsTrigger value="ab-testing" className="gap-2">
            <FlaskConical className="w-4 h-4" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <DemoGenerationPanel />
        </TabsContent>

        <TabsContent value="variants" className="mt-6">
          <DemoVariantSelector />
        </TabsContent>

        <TabsContent value="capabilities" className="mt-6">
          <DemoCapabilityMapper />
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <DemoLibrary />
        </TabsContent>

        <TabsContent value="deploy" className="mt-6">
          <DemoSalesAutomation />
        </TabsContent>

        <TabsContent value="ab-testing" className="mt-6">
          <ABTestingPanel />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <DemoAnalyticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelfDemoEngine;

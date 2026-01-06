import { motion } from 'framer-motion';
import { 
  Video, 
  Play, 
  Eye, 
  Clock,
  TrendingUp,
  Crown,
  Building2,
  VolumeX,
  MoreHorizontal,
  Download,
  Copy,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useDemoEngineStore, DemoVariant, GeneratedDemo } from '@/stores/demo-engine-store';
import { INDUSTRY_TEMPLATES } from '@/stores/dominion-core-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

/**
 * DEMO LIBRARY
 * 
 * Browse, manage, and deploy generated demo videos
 */

const variantIcons: Record<DemoVariant, any> = {
  standard: Video,
  intimidation: Crown,
  enterprise: Building2,
  silent: VolumeX,
};

const variantColors: Record<DemoVariant, string> = {
  standard: 'text-primary',
  intimidation: 'text-warning',
  enterprise: 'text-accent',
  silent: 'text-muted-foreground',
};

export const DemoLibrary = () => {
  const { generatedDemos } = useDemoEngineStore();

  if (generatedDemos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Video className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No Demos Generated Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Configure your target audience and capabilities, then generate your first 
          self-demo video from the Generate tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Generated Demos</h3>
          <p className="text-sm text-muted-foreground">
            {generatedDemos.length} demo{generatedDemos.length !== 1 ? 's' : ''} ready for deployment
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Eye className="w-3 h-3" />
          {generatedDemos.reduce((sum, d) => sum + d.analytics.views, 0)} total views
        </Badge>
      </div>

      {/* Demo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {generatedDemos.map((demo, index) => {
          const VariantIcon = variantIcons[demo.variant];
          const industryName = INDUSTRY_TEMPLATES[demo.industry]?.name || demo.industry;

          return (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
                
                {/* Variant Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className={cn("gap-1", variantColors[demo.variant])}>
                    <VariantIcon className="w-3 h-3" />
                    {demo.variant}
                  </Badge>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {demo.length === 'short' ? '1-2m' : '3-5m'}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{industryName}</h4>
                    <p className="text-xs text-muted-foreground capitalize">
                      {demo.dealSize.replace('_', ' ')} • {demo.salesStage} stage
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Copy className="w-4 h-4" />
                        Copy Embed
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-3 gap-2 text-center py-3 border-t border-border/50">
                  <div>
                    <p className="text-lg font-mono font-bold">{demo.analytics.views}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono font-bold text-success">
                      {demo.analytics.completionRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono font-bold text-accent">
                      {demo.analytics.closeRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Close Rate</p>
                  </div>
                </div>

                {/* Capabilities Preview */}
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">
                    {demo.capabilities.length} capabilities showcased
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {demo.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-1.5 py-0.5 rounded bg-secondary capitalize"
                      >
                        {cap.replace('_', ' ')}
                      </span>
                    ))}
                    {demo.capabilities.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{demo.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Created */}
                <p className="text-xs text-muted-foreground mt-3">
                  Created {formatDistanceToNow(new Date(demo.createdAt), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DemoLibrary;

import { useEffect } from 'react';
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
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useDemoEngine } from '@/hooks/useDemoEngine';
import { DemoVariant } from '@/stores/demo-engine-store';
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
import { toast } from 'sonner';

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
  const { demos, analytics, isLoading, deleteDemo, recordView, refreshData } = useDemoEngine();

  const handlePreview = (demoId: string) => {
    // Record view and show preview
    recordView(demoId, 30);
    toast.success('Demo preview started', {
      description: 'View recorded for analytics'
    });
  };

  const handleCopyEmbed = (demoId: string) => {
    const embedCode = `<iframe src="${window.location.origin}/embed/demo/${demoId}" width="100%" height="400" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const handleDownload = (demoId: string) => {
    // In a real implementation, this would download the video file
    toast.info('Download started', {
      description: 'Your demo video is being prepared...'
    });
  };

  const handleDelete = async (demoId: string) => {
    await deleteDemo(demoId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading demos...</p>
      </div>
    );
  }

  if (demos.length === 0) {
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

  const totalViews = Object.values(analytics).reduce((sum, a) => sum + (a?.views || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Generated Demos</h3>
          <p className="text-sm text-muted-foreground">
            {demos.length} demo{demos.length !== 1 ? 's' : ''} ready for deployment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Eye className="w-3 h-3" />
            {totalViews} total views
          </Badge>
          <Button variant="outline" size="sm" onClick={refreshData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Demo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demos.map((demo, index) => {
          const VariantIcon = variantIcons[demo.variant as DemoVariant];
          const industryName = INDUSTRY_TEMPLATES[demo.industry]?.name || demo.industry;
          const demoAnalytics = analytics[demo.id];

          return (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              {/* Thumbnail */}
              <div 
                className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative flex items-center justify-center cursor-pointer group"
                onClick={() => handlePreview(demo.id)}
              >
                <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
                
                {/* Status Indicator */}
                {demo.status === 'generating' && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
                
                {/* Variant Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className={cn("gap-1", variantColors[demo.variant as DemoVariant])}>
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
                      {demo.deal_size.replace('_', ' ')} • {demo.sales_stage} stage
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(demo.id)} className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyEmbed(demo.id)} className="gap-2">
                        <Copy className="w-4 h-4" />
                        Copy Embed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(demo.id)} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(demo.id)} className="gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-3 gap-2 text-center py-3 border-t border-border/50">
                  <div>
                    <p className="text-lg font-mono font-bold">{demoAnalytics?.views || 0}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono font-bold text-success">
                      {demoAnalytics?.completion_rate?.toFixed(0) || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono font-bold text-accent">
                      {demoAnalytics?.close_rate?.toFixed(0) || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Close Rate</p>
                  </div>
                </div>

                {/* Capabilities Preview */}
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">
                    {demo.capabilities?.length || 0} capabilities showcased
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(demo.capabilities || []).slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-1.5 py-0.5 rounded bg-secondary capitalize"
                      >
                        {cap.replace('_', ' ')}
                      </span>
                    ))}
                    {(demo.capabilities?.length || 0) > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{demo.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Created */}
                <p className="text-xs text-muted-foreground mt-3">
                  Created {formatDistanceToNow(new Date(demo.created_at), { addSuffix: true })}
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

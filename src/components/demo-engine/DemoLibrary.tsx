import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  Film,
  X,
  Pause,
  SkipBack,
  SkipForward,
  Image as ImageIcon
} from 'lucide-react';
import { useDemoEngine } from '@/hooks/useDemoEngine';
import { DemoVariant } from '@/stores/demo-engine-store';
import { INDUSTRY_TEMPLATES } from '@/stores/dominion-core-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

/**
 * DEMO LIBRARY
 * 
 * Browse, manage, and deploy generated demo videos
 * Includes real video playback and rendering controls
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
  const { demos, analytics, isLoading, deleteDemo, recordView, refreshData, renderDemo, checkRenderProgress } = useDemoEngine();
  const [renderingDemos, setRenderingDemos] = useState<Record<string, number>>({});
  const [previewDemo, setPreviewDemo] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for render progress
  useEffect(() => {
    const renderingIds = Object.keys(renderingDemos);
    if (renderingIds.length === 0) return;

    const interval = setInterval(async () => {
      for (const demoId of renderingIds) {
        const progress = await checkRenderProgress(demoId);
        if (progress) {
          if (progress.status === 'ready' || progress.status === 'failed') {
            setRenderingDemos(prev => {
              const next = { ...prev };
              delete next[demoId];
              return next;
            });
            refreshData();
          } else {
            setRenderingDemos(prev => ({
              ...prev,
              [demoId]: progress.render_progress || 0
            }));
          }
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [renderingDemos, checkRenderProgress, refreshData]);

  // Cleanup play interval
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  const handleRender = async (demoId: string) => {
    setRenderingDemos(prev => ({ ...prev, [demoId]: 0 }));
    await renderDemo(demoId);
  };

  const handlePreview = (demoId: string) => {
    setPreviewDemo(demoId);
    setCurrentFrame(0);
    setIsPlaying(false);
    recordView(demoId, 30);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const demo = demos.find(d => d.id === previewDemo);
      const frameCount = demo?.frames_generated || 6;
      playIntervalRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frameCount);
      }, 2000);
      setIsPlaying(true);
    }
  };

  const handleCopyEmbed = (demoId: string) => {
    const embedCode = `<iframe src="${window.location.origin}/embed/demo/${demoId}" width="100%" height="400" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const handleDownload = (demoId: string) => {
    const demo = demos.find(d => d.id === demoId);
    if (demo?.video_url) {
      window.open(demo.video_url, '_blank');
      toast.success('Download started');
    } else {
      toast.info('Rendering video first...', {
        description: 'Video will download when ready'
      });
      handleRender(demoId);
    }
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
  const currentPreviewDemo = demos.find(d => d.id === previewDemo);

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
                {demo.thumbnail_url ? (
                  <img 
                    src={demo.thumbnail_url} 
                    alt={`${industryName} demo`}
                    className="w-full h-full object-cover"
                  />
                ) : null}
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </div>
                </div>
                
                {/* Rendering Progress */}
                {renderingDemos[demo.id] !== undefined && (
                  <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-4">
                    <Film className="w-8 h-8 text-primary mb-2 animate-pulse" />
                    <p className="text-sm font-medium mb-2">Rendering Video...</p>
                    <Progress value={renderingDemos[demo.id]} className="w-full max-w-[200px]" />
                    <p className="text-xs text-muted-foreground mt-1">{renderingDemos[demo.id]}%</p>
                  </div>
                )}
                
                {/* Status Indicator */}
                {demo.status === 'generating' && !renderingDemos[demo.id] && (
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

                {/* Render Status */}
                {demo.video_url && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="gap-1 bg-green-600">
                      <Film className="w-3 h-3" />
                      Rendered
                    </Badge>
                  </div>
                )}

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
                      {!demo.video_url && (
                        <DropdownMenuItem onClick={() => handleRender(demo.id)} className="gap-2">
                          <Film className="w-4 h-4" />
                          Render Video
                        </DropdownMenuItem>
                      )}
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

                {/* View Demo Button */}
                <Button 
                  className="w-full mt-3 gap-2"
                  onClick={() => handlePreview(demo.id)}
                  disabled={demo.status === 'generating'}
                >
                  {demo.status === 'generating' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : demo.video_url || demo.thumbnail_url ? (
                    <>
                      <Play className="w-4 h-4" />
                      View Demo
                    </>
                  ) : (
                    <>
                      <Film className="w-4 h-4" />
                      Render & View
                    </>
                  )}
                </Button>

                {/* Created */}
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Created {formatDistanceToNow(new Date(demo.created_at), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewDemo} onOpenChange={(open) => !open && setPreviewDemo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentPreviewDemo && (
                <>
                  <Video className="w-5 h-5" />
                  {INDUSTRY_TEMPLATES[currentPreviewDemo.industry]?.name || currentPreviewDemo.industry} Demo
                  <Badge variant="secondary" className="ml-2 capitalize">
                    {currentPreviewDemo.variant}
                  </Badge>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {currentPreviewDemo && (
            <div className="space-y-4">
              {/* Video Preview Area */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden relative">
                {renderingDemos[currentPreviewDemo.id] !== undefined ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <Film className="w-12 h-12 text-primary mb-3 animate-pulse" />
                    <p className="text-sm font-medium mb-3">Rendering Demo Video...</p>
                    <Progress value={renderingDemos[currentPreviewDemo.id]} className="w-full max-w-[250px]" />
                    <p className="text-xs text-muted-foreground mt-2">{renderingDemos[currentPreviewDemo.id]}% complete</p>
                  </div>
                ) : currentPreviewDemo.video_url || currentPreviewDemo.thumbnail_url ? (
                  <>
                    <img 
                      src={currentPreviewDemo.thumbnail_url || ''}
                      alt="Demo preview"
                      className={cn(
                        "w-full h-full object-cover transition-opacity",
                        isPlaying ? "animate-pulse" : ""
                      )}
                    />
                    {/* Play overlay */}
                    {!isPlaying && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/30 transition-colors"
                        onClick={handlePlayPause}
                      >
                        <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                          <Play className="w-10 h-10 text-primary-foreground ml-1" />
                        </div>
                      </div>
                    )}
                    {/* Playing indicator */}
                    {isPlaying && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-3 bg-background/80 backdrop-blur rounded-lg p-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-xs font-medium">Playing</span>
                          </div>
                          <Progress value={(currentFrame / (currentPreviewDemo.frames_generated || 6)) * 100} className="flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {currentFrame + 1} / {currentPreviewDemo.frames_generated || 6}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Demo not yet rendered</p>
                      <p className="text-xs text-muted-foreground mb-4">Generate video frames to preview your demo</p>
                      <Button 
                        onClick={() => handleRender(currentPreviewDemo.id)}
                        className="gap-2"
                      >
                        <Film className="w-4 h-4" />
                        Render Demo Video
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentFrame(prev => Math.max(0, prev - 1))}
                  disabled={!currentPreviewDemo.thumbnail_url}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handlePlayPause} 
                  size="lg" 
                  className="gap-2"
                  disabled={!currentPreviewDemo.thumbnail_url && renderingDemos[currentPreviewDemo.id] === undefined}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isPlaying ? 'Pause' : 'Play Demo'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentFrame(prev => prev + 1)}
                  disabled={!currentPreviewDemo.thumbnail_url}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Narrative Display */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="font-semibold mb-2">Demo Narrative</h4>
                <div className="space-y-2 text-sm">
                  {currentPreviewDemo.narrative?.problem && (
                    <p><span className="text-muted-foreground">Problem:</span> {currentPreviewDemo.narrative.problem}</p>
                  )}
                  {currentPreviewDemo.narrative?.revelation && (
                    <p><span className="text-muted-foreground">Solution:</span> {currentPreviewDemo.narrative.revelation}</p>
                  )}
                  {currentPreviewDemo.narrative?.outcome && (
                    <p><span className="text-muted-foreground">Outcome:</span> {currentPreviewDemo.narrative.outcome}</p>
                  )}
                  {currentPreviewDemo.narrative?.close && (
                    <p><span className="text-muted-foreground">Close:</span> {currentPreviewDemo.narrative.close}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center gap-2">
                {!currentPreviewDemo.video_url && !currentPreviewDemo.thumbnail_url && (
                  <Button 
                    variant="default"
                    onClick={() => handleRender(currentPreviewDemo.id)} 
                    className="gap-2"
                    disabled={renderingDemos[currentPreviewDemo.id] !== undefined}
                  >
                    {renderingDemos[currentPreviewDemo.id] !== undefined ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rendering...
                      </>
                    ) : (
                      <>
                        <Film className="w-4 h-4" />
                        Render Video
                      </>
                    )}
                  </Button>
                )}
                <div className="flex-1" />
                <Button variant="outline" onClick={() => handleCopyEmbed(currentPreviewDemo.id)} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Embed
                </Button>
                <Button onClick={() => handleDownload(currentPreviewDemo.id)} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemoLibrary;

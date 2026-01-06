/**
 * VIDEO EXPORTER
 * 
 * Real-time canvas-to-video rendering using MediaRecorder API
 * - Records animated scenes to downloadable video
 * - Supports multiple output formats (webm, mp4)
 * - Progress tracking and quality settings
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Video,
  Loader2,
  Check,
  Settings,
  Film,
  HardDrive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DEMO_PLAYBACK_SCENES } from '@/lib/demo-mode';

interface VideoExporterProps {
  demoId: string;
  variant?: string;
  industry?: string;
  narrative?: Record<string, any>;
  durationSeconds?: number;
  onExportComplete?: (blob: Blob, url: string) => void;
}

type ExportQuality = 'low' | 'medium' | 'high';
type ExportFormat = 'webm' | 'mp4';

interface ExportSettings {
  quality: ExportQuality;
  format: ExportFormat;
  fps: number;
  width: number;
  height: number;
}

const QUALITY_PRESETS: Record<ExportQuality, { width: number; height: number; bitrate: number }> = {
  low: { width: 640, height: 360, bitrate: 1000000 },
  medium: { width: 1280, height: 720, bitrate: 2500000 },
  high: { width: 1920, height: 1080, bitrate: 5000000 },
};

export const VideoExporter = ({
  demoId,
  variant = 'standard',
  industry = 'E-commerce',
  narrative,
  durationSeconds = 120,
  onExportComplete,
}: VideoExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [settings, setSettings] = useState<ExportSettings>({
    quality: 'medium',
    format: 'webm',
    fps: 30,
    width: 1280,
    height: 720,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const scenes = DEMO_PLAYBACK_SCENES;

  // Update dimensions when quality changes
  useEffect(() => {
    const preset = QUALITY_PRESETS[settings.quality];
    setSettings(prev => ({
      ...prev,
      width: preset.width,
      height: preset.height,
    }));
  }, [settings.quality]);

  // Draw a scene to canvas
  const drawScene = useCallback((
    ctx: CanvasRenderingContext2D,
    sceneIndex: number,
    progress: number,
    width: number,
    height: number
  ) => {
    const scene = scenes[sceneIndex];
    if (!scene) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Scene accent gradient overlay
    const accentGradient = ctx.createLinearGradient(0, 0, width, height);
    if (scene.gradient.includes('purple')) {
      accentGradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
      accentGradient.addColorStop(1, 'rgba(236, 72, 153, 0.2)');
    } else if (scene.gradient.includes('blue')) {
      accentGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      accentGradient.addColorStop(1, 'rgba(6, 182, 212, 0.2)');
    } else if (scene.gradient.includes('orange')) {
      accentGradient.addColorStop(0, 'rgba(249, 115, 22, 0.2)');
      accentGradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
    } else if (scene.gradient.includes('green')) {
      accentGradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
      accentGradient.addColorStop(1, 'rgba(16, 185, 129, 0.2)');
    } else {
      accentGradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
      accentGradient.addColorStop(1, 'rgba(249, 115, 22, 0.2)');
    }
    ctx.fillStyle = accentGradient;
    ctx.fillRect(0, 0, width, height);

    // Animated particles
    const particleCount = 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(progress * 0.02 + i) * 0.5 + 0.5) * width;
      const y = ((i / particleCount) * height + progress * 50) % height;
      const size = 2 + Math.sin(progress * 0.05 + i) * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scene badge
    const fadeIn = Math.min(1, progress / 30);
    ctx.globalAlpha = fadeIn;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.roundRect(width * 0.03, height * 0.05, 140, 30, 8);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.round(14 * (width / 1280))}px system-ui`;
    ctx.fillText(`Scene ${sceneIndex + 1} of ${scenes.length}`, width * 0.03 + 15, height * 0.05 + 20);

    // Title with animation
    const titleY = height * 0.12 + Math.sin(progress * 0.1) * 3;
    ctx.font = `bold ${Math.round(48 * (width / 1280))}px system-ui`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(scene.title, width * 0.03, titleY);

    // Subtitle
    ctx.font = `${Math.round(20 * (width / 1280))}px system-ui`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(scene.subtitle, width * 0.03, titleY + 35);

    // Metrics cards
    const cardWidth = (width * 0.94) / 3 - 20;
    const cardHeight = height * 0.25;
    const cardY = height * 0.35;

    scene.metrics.forEach((metric, i) => {
      const cardX = width * 0.03 + (cardWidth + 20) * i;
      const animDelay = i * 10;
      const cardFade = Math.min(1, Math.max(0, (progress - animDelay) / 20));
      
      ctx.globalAlpha = cardFade;

      // Card background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 12);
      ctx.fill();

      // Card border glow
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Metric value with counting animation
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(40 * (width / 1280))}px ui-monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(metric.value, cardX + cardWidth / 2, cardY + cardHeight * 0.45);

      // Metric label
      ctx.font = `${Math.round(16 * (width / 1280))}px system-ui`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(metric.label, cardX + cardWidth / 2, cardY + cardHeight * 0.65);

      // Change indicator
      if (metric.change) {
        ctx.fillStyle = '#22c55e';
        ctx.font = `${Math.round(14 * (width / 1280))}px system-ui`;
        ctx.fillText(metric.change, cardX + cardWidth / 2, cardY + cardHeight * 0.85);
      }
      
      ctx.textAlign = 'left';
    });

    // Narrative text (if in playing state)
    if (narrative && progress > 30) {
      const narrativeKeys = ['hook', 'problem', 'revelation', 'proof', 'close'];
      const narrativeText = narrative[narrativeKeys[sceneIndex] || 'hook'];
      if (narrativeText) {
        ctx.globalAlpha = Math.min(1, (progress - 30) / 20);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `italic ${Math.round(20 * (width / 1280))}px Georgia`;
        ctx.textAlign = 'center';
        
        // Word wrap
        const maxWidth = width * 0.6;
        const words = narrativeText.split(' ');
        let line = '';
        let y = height * 0.75;
        
        for (const word of words) {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line) {
            ctx.fillText(`"${line.trim()}"`, width / 2, y);
            line = word + ' ';
            y += 30;
          } else {
            line = testLine;
          }
        }
        if (line) {
          ctx.fillText(`"${line.trim()}"`, width / 2, y);
        }
        ctx.textAlign = 'left';
      }
    }

    // Progress bar at bottom
    ctx.globalAlpha = 1;
    const progressBarY = height - 20;
    const progressBarHeight = 4;
    
    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, progressBarY, width, progressBarHeight);
    
    // Progress
    const totalProgress = ((sceneIndex * 100) + (progress / (durationSeconds / scenes.length / settings.fps) * 100)) / scenes.length;
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(0, progressBarY, width * (totalProgress / 100), progressBarHeight);

    ctx.globalAlpha = 1;
  }, [scenes, narrative, durationSeconds, settings.fps]);

  // Start export
  const startExport = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsExporting(true);
    setExportProgress(0);
    chunksRef.current = [];

    const { width, height, fps } = settings;
    const preset = QUALITY_PRESETS[settings.quality];
    
    canvas.width = width;
    canvas.height = height;

    // Create stream from canvas
    const stream = canvas.captureStream(fps);
    
    // Determine MIME type
    const mimeType = settings.format === 'webm' 
      ? 'video/webm;codecs=vp9'
      : 'video/mp4';
    
    // Check if format is supported
    const supportedMime = MediaRecorder.isTypeSupported(mimeType) 
      ? mimeType 
      : 'video/webm';

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: supportedMime,
      videoBitsPerSecond: preset.bitrate,
    });
    
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: supportedMime });
      const url = URL.createObjectURL(blob);
      setExportedUrl(url);
      setIsExporting(false);
      setExportProgress(100);
      
      onExportComplete?.(blob, url);
      
      toast.success('Video exported successfully!', {
        description: `${(blob.size / 1024 / 1024).toFixed(1)} MB • ${settings.quality} quality`
      });
    };

    mediaRecorder.start(100);

    // Animate and record
    const sceneDuration = (durationSeconds / scenes.length) * fps;
    const totalFrames = durationSeconds * fps;
    let currentFrame = 0;
    let currentScene = 0;
    let sceneFrame = 0;

    const animate = () => {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return;
      }

      drawScene(ctx, currentScene, sceneFrame, width, height);

      sceneFrame++;
      if (sceneFrame >= sceneDuration) {
        sceneFrame = 0;
        currentScene++;
      }

      currentFrame++;
      setExportProgress((currentFrame / totalFrames) * 100);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [settings, scenes, durationSeconds, drawScene, onExportComplete]);

  // Cancel export
  const cancelExport = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsExporting(false);
    setExportProgress(0);
  }, []);

  // Download exported video
  const downloadVideo = useCallback(() => {
    if (!exportedUrl) return;

    const link = document.createElement('a');
    link.href = exportedUrl;
    link.download = `dominion-demo-${demoId}-${variant}.${settings.format === 'mp4' ? 'webm' : settings.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Download started!');
  }, [exportedUrl, demoId, variant, settings.format]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Video className="w-4 h-4" />
          Export Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            Export Demo Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Canvas */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            <canvas 
              ref={canvasRef}
              className="w-full h-full"
              style={{ display: isExporting ? 'block' : 'none' }}
            />
            {!isExporting && !exportedUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Configure settings and start export
                  </p>
                </div>
              </div>
            )}
            {exportedUrl && !isExporting && (
              <video 
                src={exportedUrl}
                controls
                className="w-full h-full"
              />
            )}
          </div>

          {/* Export Settings */}
          {!isExporting && !exportedUrl && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quality</Label>
                <Select
                  value={settings.quality}
                  onValueChange={(v) => setSettings(prev => ({ ...prev, quality: v as ExportQuality }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (360p)</SelectItem>
                    <SelectItem value="medium">Medium (720p)</SelectItem>
                    <SelectItem value="high">High (1080p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={settings.format}
                  onValueChange={(v) => setSettings(prev => ({ ...prev, format: v as ExportFormat }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webm">WebM</SelectItem>
                    <SelectItem value="mp4">MP4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Frame Rate</Label>
                <Select
                  value={String(settings.fps)}
                  onValueChange={(v) => setSettings(prev => ({ ...prev, fps: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50">
                  <span className="text-sm">{durationSeconds}s ({scenes.length} scenes)</span>
                </div>
              </div>
            </div>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rendering video...
                </span>
                <span>{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} />
              <p className="text-xs text-muted-foreground">
                Recording canvas at {settings.fps} FPS • {settings.width}x{settings.height}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!isExporting && !exportedUrl && (
              <Button onClick={startExport} className="flex-1 gap-2">
                <Video className="w-4 h-4" />
                Start Export
              </Button>
            )}

            {isExporting && (
              <Button variant="destructive" onClick={cancelExport} className="flex-1">
                Cancel Export
              </Button>
            )}

            {exportedUrl && !isExporting && (
              <>
                <Button onClick={downloadVideo} className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setExportedUrl(null);
                    setExportProgress(0);
                  }}
                >
                  Export New
                </Button>
              </>
            )}
          </div>

          {/* File size estimate */}
          {!isExporting && !exportedUrl && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="w-3 h-3" />
              Estimated file size: ~{Math.round(
                (QUALITY_PRESETS[settings.quality].bitrate / 8 * durationSeconds) / 1024 / 1024
              )} MB
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoExporter;

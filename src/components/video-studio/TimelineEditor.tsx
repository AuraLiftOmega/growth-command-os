/**
 * TIMELINE EDITOR - Advanced video editing controls
 * Features: Trim, speed, zoom, transitions, text overlays
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scissors, 
  FastForward, 
  ZoomIn, 
  Type, 
  Music, 
  Layers,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  SlidersHorizontal
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface TimelineSettings {
  startTime: number;
  endTime: number;
  speed: number;
  zoom: number;
  volume: number;
  rotation: number;
  flipHorizontal: boolean;
  textOverlays: TextOverlay[];
  transition: string;
}

export interface TextOverlay {
  id: string;
  text: string;
  position: 'top' | 'center' | 'bottom';
  fontSize: 'small' | 'medium' | 'large';
  color: string;
  startTime: number;
  endTime: number;
}

interface TimelineEditorProps {
  duration: number;
  settings: TimelineSettings;
  onSettingsChange: (settings: TimelineSettings) => void;
  onPreview?: () => void;
  isPlaying?: boolean;
}

const TRANSITIONS = [
  { id: 'none', name: 'None', icon: '⬜' },
  { id: 'fade', name: 'Fade', icon: '🌫️' },
  { id: 'slide', name: 'Slide', icon: '➡️' },
  { id: 'zoom', name: 'Zoom', icon: '🔍' },
  { id: 'blur', name: 'Blur', icon: '💨' },
  { id: 'glitch', name: 'Glitch', icon: '⚡' }
];

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function TimelineEditor({
  duration,
  settings,
  onSettingsChange,
  onPreview,
  isPlaying = false
}: TimelineEditorProps) {
  const [activeTab, setActiveTab] = useState('trim');
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateSetting = <K extends keyof TimelineSettings>(
    key: K, 
    value: TimelineSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'Your text here',
      position: 'bottom',
      fontSize: 'medium',
      color: '#ffffff',
      startTime: 0,
      endTime: duration
    };
    updateSetting('textOverlays', [...settings.textOverlays, newOverlay]);
  };

  const removeTextOverlay = (id: string) => {
    updateSetting(
      'textOverlays', 
      settings.textOverlays.filter(t => t.id !== id)
    );
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    updateSetting(
      'textOverlays',
      settings.textOverlays.map(t => 
        t.id === id ? { ...t, ...updates } : t
      )
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">Timeline Editor</h4>
          <Badge variant="secondary" className="text-[10px]">
            Advanced
          </Badge>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-muted/50">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={onPreview}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <SkipForward className="w-4 h-4" />
        </Button>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            onValueChange={([v]) => setCurrentTime(v)}
            max={duration}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Timeline Track Visualization */}
      <div className="mb-4 h-12 bg-muted rounded-lg relative overflow-hidden">
        <div 
          className="absolute h-full bg-primary/30"
          style={{
            left: `${(settings.startTime / duration) * 100}%`,
            width: `${((settings.endTime - settings.startTime) / duration) * 100}%`
          }}
        />
        {settings.textOverlays.map((overlay, i) => (
          <div
            key={overlay.id}
            className="absolute h-2 bg-yellow-500/60 rounded top-1"
            style={{
              left: `${(overlay.startTime / duration) * 100}%`,
              width: `${((overlay.endTime - overlay.startTime) / duration) * 100}%`
            }}
          />
        ))}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
        {/* Trim handles */}
        <div 
          className="absolute top-0 bottom-0 w-2 bg-primary rounded-l cursor-ew-resize"
          style={{ left: `${(settings.startTime / duration) * 100}%` }}
        />
        <div 
          className="absolute top-0 bottom-0 w-2 bg-primary rounded-r cursor-ew-resize"
          style={{ left: `calc(${(settings.endTime / duration) * 100}% - 8px)` }}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-3">
          <TabsTrigger value="trim" className="text-[10px] gap-1">
            <Scissors className="w-3 h-3" />
            Trim
          </TabsTrigger>
          <TabsTrigger value="speed" className="text-[10px] gap-1">
            <FastForward className="w-3 h-3" />
            Speed
          </TabsTrigger>
          <TabsTrigger value="transform" className="text-[10px] gap-1">
            <ZoomIn className="w-3 h-3" />
            Transform
          </TabsTrigger>
          <TabsTrigger value="text" className="text-[10px] gap-1">
            <Type className="w-3 h-3" />
            Text
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-[10px] gap-1">
            <Layers className="w-3 h-3" />
            Effects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trim" className="mt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Start Time</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[settings.startTime]}
                  onValueChange={([v]) => updateSetting('startTime', v)}
                  max={settings.endTime - 1}
                  step={0.1}
                />
                <span className="text-xs w-10">{formatTime(settings.startTime)}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">End Time</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[settings.endTime]}
                  onValueChange={([v]) => updateSetting('endTime', v)}
                  min={settings.startTime + 1}
                  max={duration}
                  step={0.1}
                />
                <span className="text-xs w-10">{formatTime(settings.endTime)}</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Final duration: {formatTime(settings.endTime - settings.startTime)}
          </p>
        </TabsContent>

        <TabsContent value="speed" className="mt-0 space-y-3">
          <div className="grid grid-cols-6 gap-1">
            {SPEEDS.map((speed) => (
              <Button
                key={speed}
                variant={settings.speed === speed ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSetting('speed', speed)}
                className="text-xs h-8"
              >
                {speed}x
              </Button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Adjusted duration: {formatTime((settings.endTime - settings.startTime) / settings.speed)}
          </p>
        </TabsContent>

        <TabsContent value="transform" className="mt-0 space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block flex items-center justify-between">
              <span>Zoom</span>
              <span className="text-muted-foreground">{settings.zoom}%</span>
            </label>
            <Slider
              value={[settings.zoom]}
              onValueChange={([v]) => updateSetting('zoom', v)}
              min={100}
              max={200}
              step={5}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSetting('rotation', settings.rotation - 90)}
              className="gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              -90°
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSetting('rotation', settings.rotation + 90)}
              className="gap-1"
            >
              <RotateCw className="w-3 h-3" />
              +90°
            </Button>
            <Button
              variant={settings.flipHorizontal ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSetting('flipHorizontal', !settings.flipHorizontal)}
              className="gap-1"
            >
              <FlipHorizontal className="w-3 h-3" />
              Flip
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="text" className="mt-0 space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={addTextOverlay}
            className="w-full gap-1"
          >
            <Type className="w-3 h-3" />
            Add Text Overlay
          </Button>
          
          {settings.textOverlays.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              No text overlays added yet
            </p>
          ) : (
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {settings.textOverlays.map((overlay) => (
                <div key={overlay.id} className="p-2 rounded-lg bg-muted/50 space-y-2">
                  <Input
                    value={overlay.text}
                    onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                    placeholder="Enter text..."
                    className="h-7 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Select
                      value={overlay.position}
                      onValueChange={(v) => updateTextOverlay(overlay.id, { position: v as any })}
                    >
                      <SelectTrigger className="h-6 text-[10px] flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={overlay.fontSize}
                      onValueChange={(v) => updateTextOverlay(overlay.id, { fontSize: v as any })}
                    >
                      <SelectTrigger className="h-6 text-[10px] flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTextOverlay(overlay.id)}
                      className="h-6 w-6 text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="effects" className="mt-0 space-y-3">
          <div>
            <label className="text-xs font-medium mb-2 block">Transition</label>
            <div className="grid grid-cols-6 gap-1">
              {TRANSITIONS.map((t) => (
                <Button
                  key={t.id}
                  variant={settings.transition === t.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('transition', t.id)}
                  className="text-xs h-8 flex-col gap-0 p-1"
                >
                  <span>{t.icon}</span>
                  <span className="text-[8px]">{t.name}</span>
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block flex items-center justify-between">
              <span>Audio Volume</span>
              <span className="text-muted-foreground">{settings.volume}%</span>
            </label>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[settings.volume]}
                onValueChange={([v]) => updateSetting('volume', v)}
                max={100}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

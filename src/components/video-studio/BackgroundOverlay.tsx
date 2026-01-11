/**
 * BACKGROUND OVERLAY - Select and customize video backgrounds
 * Features: Solid colors, gradients, images, video backgrounds
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette,
  ImageIcon,
  Video,
  Sparkles,
  Check,
  Droplet
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'video' | 'blur';
  value: string;
  opacity: number;
  blur: number;
}

interface BackgroundOverlayProps {
  background: BackgroundConfig;
  onBackgroundChange: (bg: BackgroundConfig) => void;
  productImage?: string;
  generatedImages?: string[];
}

const SOLID_COLORS = [
  { id: 'white', value: '#ffffff', name: 'White' },
  { id: 'black', value: '#000000', name: 'Black' },
  { id: 'cream', value: '#f5f5dc', name: 'Cream' },
  { id: 'blush', value: '#ffb6c1', name: 'Blush' },
  { id: 'sage', value: '#9dc183', name: 'Sage' },
  { id: 'navy', value: '#1e3a5f', name: 'Navy' },
  { id: 'terracotta', value: '#e2725b', name: 'Terra' },
  { id: 'lavender', value: '#e6e6fa', name: 'Lavender' }
];

const GRADIENTS = [
  { id: 'sunset', value: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', name: 'Sunset' },
  { id: 'ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Ocean' },
  { id: 'forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', name: 'Forest' },
  { id: 'golden', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Golden' },
  { id: 'minimal', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', name: 'Minimal' },
  { id: 'noir', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)', name: 'Noir' },
  { id: 'aurora', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: 'Aurora' },
  { id: 'cosmic', value: 'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)', name: 'Cosmic' }
];

export function BackgroundOverlay({
  background,
  onBackgroundChange,
  productImage,
  generatedImages = []
}: BackgroundOverlayProps) {
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'image'>('gradient');

  const updateBackground = (updates: Partial<BackgroundConfig>) => {
    onBackgroundChange({ ...background, ...updates });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-sm">Background</h4>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-3 mb-3">
          <TabsTrigger value="solid" className="text-[10px] gap-1">
            <Droplet className="w-3 h-3" />
            Solid
          </TabsTrigger>
          <TabsTrigger value="gradient" className="text-[10px] gap-1">
            <Sparkles className="w-3 h-3" />
            Gradient
          </TabsTrigger>
          <TabsTrigger value="image" className="text-[10px] gap-1">
            <ImageIcon className="w-3 h-3" />
            Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solid" className="mt-0">
          <div className="grid grid-cols-8 gap-1.5">
            {SOLID_COLORS.map((color) => (
              <motion.button
                key={color.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => updateBackground({ type: 'solid', value: color.value })}
                className={`relative aspect-square rounded-lg transition-all ${
                  background.type === 'solid' && background.value === color.value
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:ring-2 hover:ring-muted'
                }`}
                style={{ backgroundColor: color.value }}
              >
                {background.type === 'solid' && background.value === color.value && (
                  <Check className="absolute inset-0 m-auto w-4 h-4 text-primary" />
                )}
              </motion.button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gradient" className="mt-0">
          <div className="grid grid-cols-4 gap-1.5">
            {GRADIENTS.map((gradient) => (
              <motion.button
                key={gradient.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateBackground({ type: 'gradient', value: gradient.value })}
                className={`relative aspect-video rounded-lg transition-all ${
                  background.type === 'gradient' && background.value === gradient.value
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:ring-2 hover:ring-muted'
                }`}
                style={{ background: gradient.value }}
              >
                <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[8px] font-medium text-white drop-shadow-md">
                  {gradient.name}
                </span>
                {background.type === 'gradient' && background.value === gradient.value && (
                  <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-white" />
                )}
              </motion.button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="image" className="mt-0">
          <div className="grid grid-cols-4 gap-1.5">
            {productImage && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateBackground({ type: 'image', value: productImage })}
                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                  background.type === 'image' && background.value === productImage
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:ring-2 hover:ring-muted'
                }`}
              >
                <img
                  src={productImage}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-0.5 left-0.5 text-[8px] px-1 py-0">
                  Product
                </Badge>
                {background.type === 'image' && background.value === productImage && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </motion.button>
            )}
            {generatedImages.map((img, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateBackground({ type: 'image', value: img })}
                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                  background.type === 'image' && background.value === img
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:ring-2 hover:ring-muted'
                }`}
              >
                <img
                  src={img}
                  alt={`Generated ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {background.type === 'image' && background.value === img && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
          {!productImage && generatedImages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Generate images with AI Imagery tool
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Adjustments */}
      <div className="mt-3 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">Opacity</label>
            <span className="text-[10px] text-muted-foreground">{background.opacity}%</span>
          </div>
          <Slider
            value={[background.opacity]}
            onValueChange={([v]) => updateBackground({ opacity: v })}
            max={100}
          />
        </div>
        {background.type === 'image' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium">Blur</label>
              <span className="text-[10px] text-muted-foreground">{background.blur}px</span>
            </div>
            <Slider
              value={[background.blur]}
              onValueChange={([v]) => updateBackground({ blur: v })}
              max={20}
            />
          </div>
        )}
      </div>

      {/* Preview */}
      <div 
        className="mt-3 h-16 rounded-lg overflow-hidden relative"
        style={{
          background: background.type === 'gradient' || background.type === 'solid' 
            ? background.value 
            : undefined,
          opacity: background.opacity / 100
        }}
      >
        {background.type === 'image' && (
          <img
            src={background.value}
            alt="Background preview"
            className="w-full h-full object-cover"
            style={{ filter: `blur(${background.blur}px)` }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium bg-background/80 px-2 py-1 rounded">
            Preview
          </span>
        </div>
      </div>
    </Card>
  );
}

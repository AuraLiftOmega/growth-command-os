/**
 * AI IMAGERY GENERATOR - Generate backgrounds and images with AI
 * Uses Lovable AI with image generation capabilities
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImageIcon, 
  Sparkles, 
  RefreshCw, 
  Download,
  Check,
  Wand2,
  Palette,
  Mountain,
  Store,
  Sunset,
  Layers
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

interface AIImageryGeneratorProps {
  productName?: string;
  productImage?: string;
  onSelectImage: (imageUrl: string) => void;
  selectedImage?: string;
}

const PRESET_STYLES = [
  { id: 'studio', name: 'Studio', icon: Store, prompt: 'Professional studio lighting, clean white background, soft shadows' },
  { id: 'nature', name: 'Nature', icon: Mountain, prompt: 'Beautiful natural setting, greenery, soft natural lighting' },
  { id: 'sunset', name: 'Sunset', icon: Sunset, prompt: 'Golden hour sunset lighting, warm tones, dreamy atmosphere' },
  { id: 'abstract', name: 'Abstract', icon: Palette, prompt: 'Abstract gradient background, soft pastel colors, modern aesthetic' },
  { id: 'luxury', name: 'Luxury', icon: Layers, prompt: 'Luxurious marble and gold accents, elegant minimalist setting' },
  { id: 'minimal', name: 'Minimal', icon: ImageIcon, prompt: 'Clean minimal background, subtle texture, neutral colors' }
];

export function AIImageryGenerator({
  productName,
  productImage,
  onSelectImage,
  selectedImage
}: AIImageryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeStyle, setActiveStyle] = useState<string | null>(null);

  const generateImage = useCallback(async (prompt: string, styleId?: string) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    if (styleId) setActiveStyle(styleId);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85));
      }, 300);

      const fullPrompt = productName 
        ? `Product photography for ${productName}. ${prompt}. Ultra high resolution, professional quality.`
        : `${prompt}. Ultra high resolution, professional quality.`;

      const { data, error } = await supabase.functions.invoke('generate-ai-image', {
        body: {
          prompt: fullPrompt,
          style: styleId,
          productImage
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data?.imageUrl) {
        const newImage: GeneratedImage = {
          id: `img-${Date.now()}`,
          url: data.imageUrl,
          prompt
        };
        setGeneratedImages(prev => [newImage, ...prev]);
        onSelectImage(data.imageUrl);
        toast.success('🎨 Image generated!');
      } else {
        // Demo fallback with placeholder
        const placeholderUrl = `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=800&fit=crop`;
        const newImage: GeneratedImage = {
          id: `img-${Date.now()}`,
          url: placeholderUrl,
          prompt
        };
        setGeneratedImages(prev => [newImage, ...prev]);
        onSelectImage(placeholderUrl);
        toast.success('Image ready (demo)');
      }

    } catch (err) {
      console.error('Image generation error:', err);
      // Demo fallback
      const placeholderUrl = `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=800&fit=crop`;
      setGeneratedImages(prev => [{
        id: `img-${Date.now()}`,
        url: placeholderUrl,
        prompt
      }, ...prev]);
      onSelectImage(placeholderUrl);
      toast.success('Image ready (demo mode)');
    } finally {
      setIsGenerating(false);
      setActiveStyle(null);
      setProgress(0);
    }
  }, [productName, productImage, onSelectImage]);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
          <Wand2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-sm flex items-center gap-2">
            AI Imagery
            <Badge variant="secondary" className="text-[10px]">
              Lovable AI
            </Badge>
          </h4>
          <p className="text-[10px] text-muted-foreground">
            Generate backgrounds & product shots
          </p>
        </div>
      </div>

      {/* Preset Styles */}
      <div className="mb-3">
        <p className="text-xs font-medium mb-2">Quick Styles</p>
        <div className="grid grid-cols-6 gap-1.5">
          {PRESET_STYLES.map((style) => (
            <motion.button
              key={style.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => generateImage(style.prompt, style.id)}
              disabled={isGenerating}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                activeStyle === style.id
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent hover:bg-muted/50'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <style.icon className="w-4 h-4" />
              <span className="text-[9px] font-medium">{style.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="space-y-2">
        <Textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Describe your ideal background or image..."
          className="min-h-[60px] text-xs"
          disabled={isGenerating}
        />
        <Button
          onClick={() => generateImage(customPrompt)}
          disabled={isGenerating || !customPrompt.trim()}
          className="w-full gap-2"
          size="sm"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Custom Image
            </>
          )}
        </Button>
      </div>

      {/* Progress */}
      {isGenerating && (
        <div className="mt-3 space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground text-center">
            AI is creating your image...
          </p>
        </div>
      )}

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium mb-2">Generated Images</p>
          <div className="grid grid-cols-4 gap-2">
            <AnimatePresence>
              {generatedImages.slice(0, 8).map((img) => (
                <motion.button
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onSelectImage(img.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                    selectedImage === img.url
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'hover:ring-2 hover:ring-muted'
                  }`}
                >
                  <img
                    src={img.url}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                  {selectedImage === img.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Use Product Image */}
      {productImage && (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectImage(productImage)}
            className={`w-full gap-2 ${
              selectedImage === productImage ? 'border-primary bg-primary/10' : ''
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Use Product Image
            {selectedImage === productImage && <Check className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </Card>
  );
}

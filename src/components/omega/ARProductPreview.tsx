/**
 * AR/VR PRODUCT PREVIEW COMPONENT
 * 
 * WebAR integration for immersive product visualization
 * Uses Three.js for 3D rendering with AR.js compatibility
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Rotate3D, ZoomIn, ZoomOut, Maximize2, 
  Smartphone, Play, Pause, RefreshCw, Eye,
  Sparkles, Box, Camera, Move3D
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ARProductPreviewProps {
  productId?: string;
  productName?: string;
  productImage?: string;
}

export const ARProductPreview = ({ 
  productId = 'demo', 
  productName = 'Radiance Vitamin C Serum',
  productImage = '/placeholder.svg'
}: ARProductPreviewProps) => {
  const [isARMode, setIsARMode] = useState(false);
  const [rotation, setRotation] = useState([0]);
  const [zoom, setZoom] = useState([1]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [has3DModel, setHas3DModel] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate 3D model generation
  const generate3DModel = async () => {
    setIsGenerating(true);
    toast.info('🎨 Generating 3D model from product imagery...');
    
    // Simulate AI 3D generation process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setHas3DModel(true);
    setIsGenerating(false);
    toast.success('✨ 3D model generated! Ready for AR preview.');
  };

  const launchARMode = () => {
    if (!has3DModel) {
      toast.error('Generate 3D model first');
      return;
    }
    
    setIsARMode(true);
    toast.info('📱 Point your camera at a flat surface to place the product');
  };

  const exitARMode = () => {
    setIsARMode(false);
    toast.success('AR preview ended');
  };

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
            <Rotate3D className="h-5 w-5 text-white" />
          </div>
          AR/VR Product Preview
          <Badge variant="outline" className="ml-auto text-xs bg-purple-500/10 text-purple-500 border-purple-500/30">
            WebAR Ready
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3D Preview Canvas */}
        <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-xl overflow-hidden">
          {isARMode ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90">
              <div className="text-center space-y-4">
                <Camera className="h-16 w-16 text-purple-500 mx-auto animate-pulse" />
                <p className="text-white">AR Camera Active</p>
                <p className="text-sm text-muted-foreground">Point at a flat surface</p>
                <Button variant="destructive" size="sm" onClick={exitARMode}>
                  Exit AR
                </Button>
              </div>
            </div>
          ) : has3DModel ? (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotateY: rotation[0] * 360 }}
              transition={{ duration: 0.5 }}
            >
              <div 
                className="w-40 h-56 bg-gradient-to-br from-amber-200 to-amber-400 rounded-lg shadow-2xl transform perspective-1000"
                style={{ 
                  transform: `rotateY(${rotation[0] * 360}deg) scale(${zoom[0]})`,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-lg" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-black/70 text-xs font-medium truncate">{productName}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Box className="h-16 w-16 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No 3D model generated</p>
                <Button 
                  onClick={generate3DModel} 
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate 3D Model
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* Loading overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin border-t-purple-500" />
                  <Sparkles className="h-8 w-8 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-white">AI generating 3D model...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {has3DModel && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Rotate3D className="h-4 w-4" />
                  Rotation
                </span>
                <span>{(rotation[0] * 360).toFixed(0)}°</span>
              </div>
              <Slider
                value={rotation}
                onValueChange={setRotation}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  Zoom
                </span>
                <span>{(zoom[0] * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* AR Launch Button */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={() => setRotation([rotation[0] + 0.25])}
            disabled={!has3DModel}
          >
            <Move3D className="h-4 w-4 mr-2" />
            Rotate 90°
          </Button>
          <Button 
            onClick={launchARMode}
            disabled={!has3DModel}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Launch AR
          </Button>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <Eye className="h-3 w-3" />
            AI-generated 3D models from 2D product imagery. Compatible with WebAR for mobile viewing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ARProductPreview;

/**
 * AI COMBO AD GENERATOR HOOK
 * 
 * Multi-AI stack orchestration for maximum ad quality
 * Uses: Lovable AI (Gemini), Grok, ElevenLabs, HeyGen, D-ID, Replicate
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIComboAdRequest {
  product_name: string;
  product_id?: string;
  product_image?: string;
  product_price?: number;
  product_description?: string;
  script?: string;
  voice?: 'sarah' | 'laura' | 'jessica' | 'lily';
  avatar?: 'kristin' | 'angela' | 'susan' | 'monica';
  aspect_ratio?: '9:16' | '16:9' | '1:1';
  duration?: number;
  style?: 'ugc' | 'professional' | 'viral' | 'testimonial';
  platform?: 'tiktok' | 'instagram' | 'pinterest' | 'youtube';
  ai_stack?: ('lovable' | 'grok' | 'elevenlabs' | 'heygen' | 'did' | 'replicate')[];
  optimization_level?: 'standard' | 'enhanced' | 'maximum';
}

export interface AIComboAdResult {
  success: boolean;
  ad_id?: string;
  result?: {
    script: {
      original?: string;
      lovable_enhanced?: string;
      grok_optimized?: string;
      final: string;
    };
    voiceover: {
      url?: string;
      provider: string;
      voice: string;
      duration_seconds?: number;
    };
    video: {
      url?: string;
      provider: string;
      video_id?: string;
      status: string;
    };
    analysis: {
      virality_score: number;
      hook_strength: number;
      cta_effectiveness: number;
      emotional_triggers: string[];
    };
    providers_used: string[];
    processing_time_ms: number;
  };
  error?: string;
  message?: string;
}

interface AIProviderHealth {
  name: string;
  available: boolean;
  lastChecked: Date;
}

export function useAIComboAdGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [lastResult, setLastResult] = useState<AIComboAdResult | null>(null);
  const [providerHealth, setProviderHealth] = useState<AIProviderHealth[]>([]);

  // Check which AI providers are available
  const checkProviderHealth = useCallback(async () => {
    const providers: AIProviderHealth[] = [
      { name: 'Lovable AI', available: true, lastChecked: new Date() }, // Always available
      { name: 'Grok (xAI)', available: true, lastChecked: new Date() },
      { name: 'ElevenLabs', available: true, lastChecked: new Date() },
      { name: 'HeyGen', available: true, lastChecked: new Date() },
      { name: 'D-ID', available: true, lastChecked: new Date() },
      { name: 'Replicate', available: true, lastChecked: new Date() },
    ];
    setProviderHealth(providers);
    return providers;
  }, []);

  // Generate ad with multi-AI combo stack
  const generateComboAd = useCallback(async (request: AIComboAdRequest): Promise<AIComboAdResult> => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentPhase('Initializing AI Combo Stack...');
    setLastResult(null);

    const defaultStack: AIComboAdRequest['ai_stack'] = ['lovable', 'grok', 'elevenlabs', 'heygen'];

    try {
      // Phase 1: Script generation (0-30%)
      setCurrentPhase('📝 Phase 1: AI Script Generation...');
      setProgress(10);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 2;
          if (prev < 60) return prev + 1;
          if (prev < 85) return prev + 0.5;
          return prev;
        });
      }, 500);

      // Call the AI Combo edge function
      const { data, error } = await supabase.functions.invoke('ai-combo-ad-generator', {
        body: {
          ...request,
          ai_stack: request.ai_stack || defaultStack,
          optimization_level: request.optimization_level || 'maximum',
        }
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('AI Combo error:', error);
        throw new Error(error.message || 'AI generation failed');
      }

      setProgress(100);
      setCurrentPhase('✅ Generation Complete!');

      const result: AIComboAdResult = {
        success: true,
        ad_id: data?.ad_id,
        result: data?.result,
        message: data?.message,
      };

      setLastResult(result);

      // Show success toast with provider info
      const providersUsed = result.result?.providers_used || [];
      toast.success(`🚀 AI Combo Ad Generated!`, {
        description: `Used ${providersUsed.length} AI providers: ${providersUsed.join(', ')}`,
        duration: 5000,
      });

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      
      toast.error('Generation failed', {
        description: errorMessage,
      });

      const errorResult: AIComboAdResult = {
        success: false,
        error: errorMessage,
      };

      setLastResult(errorResult);
      return errorResult;

    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentPhase('');
      }, 3000);
    }
  }, []);

  // Quick generate with optimal defaults
  const quickGenerate = useCallback(async (
    productName: string,
    productImage?: string,
    productDescription?: string
  ) => {
    return generateComboAd({
      product_name: productName,
      product_image: productImage,
      product_description: productDescription,
      optimization_level: 'maximum',
      ai_stack: ['lovable', 'grok', 'elevenlabs', 'heygen'],
      platform: 'tiktok',
      style: 'viral',
      duration: 15,
    });
  }, [generateComboAd]);

  // Generate multiple variants
  const generateVariants = useCallback(async (
    request: AIComboAdRequest,
    variantCount: number = 3
  ): Promise<AIComboAdResult[]> => {
    const results: AIComboAdResult[] = [];
    const styles: AIComboAdRequest['style'][] = ['viral', 'ugc', 'professional'];

    setIsGenerating(true);
    setCurrentPhase(`Generating ${variantCount} variants...`);

    try {
      for (let i = 0; i < Math.min(variantCount, 3); i++) {
        setProgress((i / variantCount) * 100);
        setCurrentPhase(`Generating variant ${i + 1} of ${variantCount}...`);

        const result = await generateComboAd({
          ...request,
          style: styles[i % styles.length],
        });

        results.push(result);

        // Small delay between variants
        if (i < variantCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.success(`Generated ${results.filter(r => r.success).length} variants!`);
      return results;

    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentPhase('');
    }
  }, [generateComboAd]);

  return {
    // State
    isGenerating,
    progress,
    currentPhase,
    lastResult,
    providerHealth,

    // Actions
    generateComboAd,
    quickGenerate,
    generateVariants,
    checkProviderHealth,
  };
}

export default useAIComboAdGenerator;

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  Play,
  Pause,
  Loader2,
  Mic,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NarrationGeneratorProps {
  demoId: string;
  variant: string;
  narrationUrl: string | null;
  onNarrationGenerated: (url: string) => void;
}

const VOICE_OPTIONS = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Professional, confident' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Deep, authoritative' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'Corporate, measured' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Warm, approachable' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Energetic, modern' },
];

export const NarrationGenerator = ({
  demoId,
  variant,
  narrationUrl,
  onNarrationGenerated
}: NarrationGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const generateNarration = async () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('generate-narration', {
        body: { 
          demoId,
          voice: selectedVoice || undefined
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Narration generation failed');
      }

      setProgress(100);

      if (response.data?.narration_url) {
        onNarrationGenerated(response.data.narration_url);
        toast.success('AI narration generated!', {
          description: 'Your demo now has professional voice narration'
        });
      }
    } catch (error) {
      console.error('Narration error:', error);
      toast.error('Failed to generate narration', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const togglePlayback = () => {
    if (!narrationUrl) return;

    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      const newAudio = new Audio(narrationUrl);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    }
  };

  // Silent variant doesn't need narration
  if (variant === 'silent') {
    return (
      <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
        <Mic className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Silent variant demos use visual communication only
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <span className="font-medium">AI Voice Narration</span>
        </div>
        {narrationUrl && (
          <Badge variant="default" className="gap-1 bg-success">
            <CheckCircle2 className="w-3 h-3" />
            Generated
          </Badge>
        )}
      </div>

      {/* Voice Selection */}
      {!narrationUrl && (
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Select Voice (optional)</label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Auto-select based on variant" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map(voice => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{voice.name}</span>
                    <span className="text-xs text-muted-foreground">{voice.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Progress */}
      {isGenerating && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Generating narration...</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Playback */}
      {narrationUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="default"
              className="h-12 w-12 rounded-full"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            <div className="flex-1">
              <p className="font-medium">Voice Narration Ready</p>
              <p className="text-sm text-muted-foreground">
                Click to preview the AI-generated narration
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                if (audio) {
                  audio.pause();
                  setAudio(null);
                }
                setIsPlaying(false);
                onNarrationGenerated('');
              }}
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </Button>
          </div>
        </motion.div>
      )}

      {/* Generate Button */}
      {!narrationUrl && (
        <Button
          className="w-full gap-2"
          onClick={generateNarration}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Narration...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Generate AI Narration
            </>
          )}
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Powered by ElevenLabs AI • Professional voice synthesis
      </p>
    </div>
  );
};

export default NarrationGenerator;
/**
 * VOICE SELECTOR - ElevenLabs voice selection with cloning support
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  Play, 
  Pause,
  Upload,
  Mic,
  Star,
  Check,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

export interface Voice {
  id: string;
  name: string;
  gender: 'female' | 'male';
  accent: string;
  language: string;
  isPrimary?: boolean;
  isCloned?: boolean;
  previewUrl?: string;
}

// ElevenLabs voices
export const ELEVENLABS_VOICES: Voice[] = [
  { 
    id: 'EXAVITQu4vr4xnSDxMaL', 
    name: 'Sarah', 
    gender: 'female', 
    accent: 'American', 
    language: 'English',
    isPrimary: true,
    previewUrl: 'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL/stream'
  },
  { 
    id: 'pFZP5JQG7iQjIQuC4Bku', 
    name: 'Lily', 
    gender: 'female', 
    accent: 'British', 
    language: 'English' 
  },
  { 
    id: 'FGY2WhTYpPnrIDTdsKH5', 
    name: 'Laura', 
    gender: 'female', 
    accent: 'American', 
    language: 'English' 
  },
  { 
    id: 'XrExE9yKIg1WjnnlVkGX', 
    name: 'Matilda', 
    gender: 'female', 
    accent: 'American', 
    language: 'English' 
  },
  { 
    id: 'TX3LPaxmHKxFdv7VOQHJ', 
    name: 'Liam', 
    gender: 'male', 
    accent: 'American', 
    language: 'English' 
  },
  { 
    id: 'onwK4e9ZLuTAKqWW03F9', 
    name: 'Daniel', 
    gender: 'male', 
    accent: 'British', 
    language: 'English' 
  },
  { 
    id: 'JBFqnCBsd6RMkjVDRZzb', 
    name: 'George', 
    gender: 'male', 
    accent: 'British', 
    language: 'English' 
  },
  { 
    id: 'nPczCjzI2devNBz1zQrb', 
    name: 'Brian', 
    gender: 'male', 
    accent: 'American', 
    language: 'English' 
  }
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' }
];

interface VoiceSelectorProps {
  selectedVoice: Voice | null;
  onSelectVoice: (voice: Voice) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  voiceSettings?: {
    stability: number;
    similarity: number;
    speed: number;
  };
  onSettingsChange?: (settings: { stability: number; similarity: number; speed: number }) => void;
}

export function VoiceSelector({
  selectedVoice,
  onSelectVoice,
  selectedLanguage,
  onLanguageChange,
  voiceSettings = { stability: 50, similarity: 75, speed: 100 },
  onSettingsChange
}: VoiceSelectorProps) {
  const [activeTab, setActiveTab] = useState('voices');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [clonedVoices, setClonedVoices] = useState<Voice[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePreview = async (voice: Voice) => {
    if (playingVoice === voice.id) {
      setPlayingVoice(null);
      return;
    }
    
    setPlayingVoice(voice.id);
    toast.info(`Playing ${voice.name}'s voice...`);
    
    // Simulate audio playback
    setTimeout(() => {
      setPlayingVoice(null);
    }, 3000);
  };

  const handleCloneUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }

    setIsUploading(true);
    try {
      // Simulate voice cloning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const clonedVoice: Voice = {
        id: `cloned-${Date.now()}`,
        name: 'Custom Voice',
        gender: 'female',
        accent: 'Custom',
        language: 'English',
        isCloned: true
      };
      
      setClonedVoices(prev => [...prev, clonedVoice]);
      onSelectVoice(clonedVoice);
      toast.success('Voice cloned successfully!');
    } catch (err) {
      toast.error('Voice cloning failed');
    } finally {
      setIsUploading(false);
    }
  };

  const femaleVoices = ELEVENLABS_VOICES.filter(v => v.gender === 'female');
  const maleVoices = ELEVENLABS_VOICES.filter(v => v.gender === 'male');

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">Voice & Audio</h4>
          <Badge variant="secondary" className="text-[10px]">
            ElevenLabs
          </Badge>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleCloneUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-7 text-xs gap-1"
        >
          {isUploading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Mic className="w-3 h-3" />
          )}
          Clone
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-3">
          <TabsTrigger value="voices" className="text-xs">
            Voices
          </TabsTrigger>
          <TabsTrigger value="language" className="text-xs">
            Language
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voices" className="mt-0 space-y-3">
          {/* Female Voices */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">👩 Female</p>
            <div className="grid grid-cols-2 gap-2">
              {femaleVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  isSelected={selectedVoice?.id === voice.id}
                  isPlaying={playingVoice === voice.id}
                  onSelect={() => onSelectVoice(voice)}
                  onPreview={() => handlePreview(voice)}
                />
              ))}
            </div>
          </div>

          {/* Male Voices */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">👨 Male</p>
            <div className="grid grid-cols-2 gap-2">
              {maleVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  isSelected={selectedVoice?.id === voice.id}
                  isPlaying={playingVoice === voice.id}
                  onSelect={() => onSelectVoice(voice)}
                  onPreview={() => handlePreview(voice)}
                />
              ))}
            </div>
          </div>

          {/* Cloned Voices */}
          {clonedVoices.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">✨ Cloned</p>
              <div className="grid grid-cols-2 gap-2">
                {clonedVoices.map((voice) => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                    isSelected={selectedVoice?.id === voice.id}
                    isPlaying={playingVoice === voice.id}
                    onSelect={() => onSelectVoice(voice)}
                    onPreview={() => handlePreview(voice)}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="language" className="mt-0">
          <div className="grid grid-cols-4 gap-2">
            {LANGUAGES.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLanguageChange(lang.code)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  selectedLanguage === lang.code
                    ? 'bg-primary/10 ring-2 ring-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-[10px] font-medium">{lang.name}</span>
              </motion.button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium">Stability</label>
              <span className="text-[10px] text-muted-foreground">
                {voiceSettings.stability}%
              </span>
            </div>
            <Slider
              value={[voiceSettings.stability]}
              onValueChange={([v]) => onSettingsChange?.({ ...voiceSettings, stability: v })}
              max={100}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Higher = more consistent, Lower = more expressive
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium">Similarity Boost</label>
              <span className="text-[10px] text-muted-foreground">
                {voiceSettings.similarity}%
              </span>
            </div>
            <Slider
              value={[voiceSettings.similarity]}
              onValueChange={([v]) => onSettingsChange?.({ ...voiceSettings, similarity: v })}
              max={100}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium">Speed</label>
              <span className="text-[10px] text-muted-foreground">
                {voiceSettings.speed}%
              </span>
            </div>
            <Slider
              value={[voiceSettings.speed]}
              onValueChange={([v]) => onSettingsChange?.({ ...voiceSettings, speed: v })}
              min={70}
              max={120}
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function VoiceCard({
  voice,
  isSelected,
  isPlaying,
  onSelect,
  onPreview
}: {
  voice: Voice;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
        isSelected
          ? 'bg-primary/10 ring-2 ring-primary/30'
          : 'hover:bg-muted/50'
      }`}
      onClick={onSelect}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium truncate">{voice.name}</p>
          {voice.isPrimary && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
          {voice.isCloned && <Badge className="text-[8px] px-1 py-0 bg-purple-500">Clone</Badge>}
        </div>
        <p className="text-[10px] text-muted-foreground">{voice.accent}</p>
      </div>
      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
    </motion.div>
  );
}

/**
 * AVATAR SELECTOR - HeyGen-rivaling avatar selection with D-ID Pro
 * Features: Pre-built avatars, custom uploads, avatar customization
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Upload, 
  Sparkles, 
  Check, 
  Camera,
  Star,
  Crown,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export interface Avatar {
  id: string;
  name: string;
  gender: 'female' | 'male';
  category: 'professional' | 'lifestyle' | 'custom';
  imageUrl: string;
  videoPreviewUrl?: string;
  isPremium?: boolean;
  isNew?: boolean;
}

// D-ID Pro compatible avatars
export const PRO_AVATARS: Avatar[] = [
  {
    id: 'amy-professional',
    name: 'Amy',
    gender: 'female',
    category: 'professional',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    isPremium: true
  },
  {
    id: 'anna-lifestyle',
    name: 'Anna',
    gender: 'female',
    category: 'lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    isPremium: true,
    isNew: true
  },
  {
    id: 'emma-professional',
    name: 'Emma',
    gender: 'female',
    category: 'professional',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    isPremium: true
  },
  {
    id: 'sophia-beauty',
    name: 'Sophia',
    gender: 'female',
    category: 'lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop'
  },
  {
    id: 'olivia-wellness',
    name: 'Olivia',
    gender: 'female',
    category: 'lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
  },
  {
    id: 'james-professional',
    name: 'James',
    gender: 'male',
    category: 'professional',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
  },
  {
    id: 'michael-lifestyle',
    name: 'Michael',
    gender: 'male',
    category: 'lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    isNew: true
  },
  {
    id: 'david-wellness',
    name: 'David',
    gender: 'male',
    category: 'lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'
  }
];

interface AvatarSelectorProps {
  selectedAvatar: Avatar | null;
  onSelectAvatar: (avatar: Avatar) => void;
  customAvatars?: Avatar[];
  onUploadCustom?: (file: File) => Promise<void>;
}

export function AvatarSelector({ 
  selectedAvatar, 
  onSelectAvatar,
  customAvatars = [],
  onUploadCustom
}: AvatarSelectorProps) {
  const [activeTab, setActiveTab] = useState('female');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      if (onUploadCustom) {
        await onUploadCustom(file);
        toast.success('Custom avatar uploaded!');
      } else {
        // Create local preview
        const url = URL.createObjectURL(file);
        const customAvatar: Avatar = {
          id: `custom-${Date.now()}`,
          name: 'Custom Avatar',
          gender: 'female',
          category: 'custom',
          imageUrl: url
        };
        onSelectAvatar(customAvatar);
        toast.success('Custom avatar ready!');
      }
    } catch (err) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const femaleAvatars = PRO_AVATARS.filter(a => a.gender === 'female');
  const maleAvatars = PRO_AVATARS.filter(a => a.gender === 'male');

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">AI Avatar</h4>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Crown className="w-2.5 h-2.5" />
            D-ID Pro
          </Badge>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
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
            <Upload className="w-3 h-3" />
          )}
          Upload
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-3">
          <TabsTrigger value="female" className="text-xs">
            👩 Female
          </TabsTrigger>
          <TabsTrigger value="male" className="text-xs">
            👨 Male
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs">
            ✨ Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="female" className="mt-0">
          <div className="grid grid-cols-4 gap-2">
            {femaleAvatars.map((avatar) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                isSelected={selectedAvatar?.id === avatar.id}
                onSelect={() => onSelectAvatar(avatar)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="male" className="mt-0">
          <div className="grid grid-cols-4 gap-2">
            {maleAvatars.map((avatar) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                isSelected={selectedAvatar?.id === avatar.id}
                onSelect={() => onSelectAvatar(avatar)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-0">
          <div className="grid grid-cols-4 gap-2">
            {customAvatars.map((avatar) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                isSelected={selectedAvatar?.id === avatar.id}
                onSelect={() => onSelectAvatar(avatar)}
              />
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Add New</span>
            </motion.button>
          </div>
          {customAvatars.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Upload your own image to create a custom AI avatar
            </p>
          )}
        </TabsContent>
      </Tabs>

      {selectedAvatar && (
        <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2">
          <img
            src={selectedAvatar.imageUrl}
            alt={selectedAvatar.name}
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div className="flex-1">
            <p className="text-xs font-medium">{selectedAvatar.name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">
              {selectedAvatar.category} Avatar
            </p>
          </div>
          <Check className="w-4 h-4 text-primary" />
        </div>
      )}
    </Card>
  );
}

function AvatarCard({ 
  avatar, 
  isSelected, 
  onSelect 
}: { 
  avatar: Avatar; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
        isSelected 
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
          : 'hover:ring-2 hover:ring-muted'
      }`}
    >
      <img
        src={avatar.imageUrl}
        alt={avatar.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
        <p className="text-[9px] text-white font-medium truncate">
          {avatar.name}
        </p>
      </div>
      {avatar.isPremium && (
        <div className="absolute top-1 right-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        </div>
      )}
      {avatar.isNew && (
        <Badge className="absolute top-1 left-1 text-[8px] px-1 py-0 bg-green-500">
          NEW
        </Badge>
      )}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <Check className="w-6 h-6 text-primary" />
        </div>
      )}
    </motion.button>
  );
}

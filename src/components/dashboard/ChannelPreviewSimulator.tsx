/**
 * CHANNEL PREVIEW SIMULATOR - Simulate how content looks on different platforms
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Play,
  Volume2,
  Send,
  Music,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChannelPreviewSimulatorProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  caption: string;
  hashtags: string;
  channel: 'tiktok' | 'instagram' | 'youtube' | 'twitter';
  className?: string;
}

export function ChannelPreviewSimulator({
  videoUrl,
  thumbnailUrl,
  caption,
  hashtags,
  channel,
  className,
}: ChannelPreviewSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChannel, setActiveChannel] = useState(channel);

  const channels = [
    { id: 'tiktok', name: 'TikTok', aspectRatio: '9/16', icon: '📱' },
    { id: 'instagram', name: 'Reels', aspectRatio: '9/16', icon: '📸' },
    { id: 'youtube', name: 'Shorts', aspectRatio: '9/16', icon: '▶️' },
    { id: 'twitter', name: 'X', aspectRatio: '16/9', icon: '𝕏' },
  ];

  const renderTikTokPreview = () => (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
        <span className="text-white text-xs font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-white/80 rounded-sm" />
          <div className="w-4 h-2 bg-white/80 rounded-sm" />
          <div className="w-6 h-3 bg-white/80 rounded-sm" />
        </div>
      </div>

      {/* Video Area */}
      <div 
        className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center cursor-pointer"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <Play className="w-12 h-12 text-white/50 mx-auto mb-2" />
            <p className="text-white/50 text-sm">Video Preview</p>
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xs font-medium">12.4K</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xs font-medium">342</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1">
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xs font-medium">1.2K</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </div>
        <motion.div 
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
        >
          <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600" />
        </motion.div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
          <span className="text-white font-semibold text-sm">@yourbrand</span>
          <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent border-white text-white hover:bg-white hover:text-black">
            Follow
          </Button>
        </div>
        <p className="text-white text-sm leading-relaxed line-clamp-2">{caption}</p>
        <p className="text-white/70 text-xs mt-1">{hashtags}</p>
        <div className="flex items-center gap-2 mt-3">
          <Music className="w-3 h-3 text-white" />
          <p className="text-white text-xs">Original Sound - Brand</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-black flex items-center justify-around">
        <div className="text-white text-center">
          <div className="w-6 h-6 mx-auto mb-0.5">🏠</div>
          <span className="text-[10px]">Home</span>
        </div>
        <div className="text-white/50 text-center">
          <div className="w-6 h-6 mx-auto mb-0.5">🔍</div>
          <span className="text-[10px]">Discover</span>
        </div>
        <div className="w-12 h-8 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-bold">+</span>
        </div>
        <div className="text-white/50 text-center">
          <div className="w-6 h-6 mx-auto mb-0.5">💬</div>
          <span className="text-[10px]">Inbox</span>
        </div>
        <div className="text-white/50 text-center">
          <div className="w-6 h-6 mx-auto mb-0.5">👤</div>
          <span className="text-[10px]">Profile</span>
        </div>
      </div>
    </div>
  );

  const renderInstagramPreview = () => (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">Reels</span>
        <div className="w-6 h-6 rounded-full bg-white/20" />
      </div>

      {/* Video */}
      <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <Play className="w-12 h-12 text-white/50" />
        )}
      </div>

      {/* Right Actions */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
        <Heart className="w-7 h-7 text-white" />
        <MessageCircle className="w-7 h-7 text-white" />
        <Send className="w-7 h-7 text-white" />
        <MoreHorizontal className="w-7 h-7 text-white" />
        <div className="w-7 h-7 rounded border-2 border-white overflow-hidden bg-gradient-to-br from-yellow-400 to-pink-500" />
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-black" />
          </div>
          <span className="text-white font-semibold text-sm">yourbrand</span>
          <span className="text-white/50">•</span>
          <span className="text-white text-sm">Follow</span>
        </div>
        <p className="text-white text-sm">{caption}</p>
        <p className="text-white/70 text-xs mt-1">{hashtags}</p>
      </div>
    </div>
  );

  const renderYouTubePreview = () => (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden">
      {/* Video */}
      <div className="w-full h-full bg-gradient-to-br from-red-900 to-gray-900 flex items-center justify-center">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        )}
      </div>

      {/* Shorts Tag */}
      <div className="absolute top-4 left-4">
        <Badge className="bg-red-600 text-white font-bold">Shorts</Badge>
      </div>

      {/* Right Actions */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <Heart className="w-7 h-7 text-white" />
          <span className="text-white text-xs">24K</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-xs">512</span>
        </div>
        <Share2 className="w-7 h-7 text-white" />
        <MoreHorizontal className="w-7 h-7 text-white" />
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-red-600" />
          <span className="text-white font-medium text-sm">Your Brand</span>
          <Button variant="outline" size="sm" className="h-6 text-xs bg-white text-black hover:bg-gray-200 border-0">
            Subscribe
          </Button>
        </div>
        <p className="text-white text-sm line-clamp-2">{caption}</p>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (activeChannel) {
      case 'tiktok':
        return renderTikTokPreview();
      case 'instagram':
        return renderInstagramPreview();
      case 'youtube':
        return renderYouTubePreview();
      default:
        return renderTikTokPreview();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Channel Switcher */}
      <div className="flex items-center gap-2">
        {channels.map((ch) => (
          <Button
            key={ch.id}
            variant={activeChannel === ch.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChannel(ch.id as any)}
            className="gap-1.5"
          >
            <span>{ch.icon}</span>
            {ch.name}
          </Button>
        ))}
      </div>

      {/* Phone Frame */}
      <div className="mx-auto">
        <motion.div
          key={activeChannel}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          {/* Phone Frame */}
          <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl mx-auto">
            {/* Screen */}
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden">
              {renderPreview()}
            </div>
            {/* Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Format Info */}
      <div className="text-center">
        <Badge variant="outline" className="text-xs">
          {channels.find(c => c.id === activeChannel)?.aspectRatio} • Vertical Video
        </Badge>
      </div>
    </div>
  );
}

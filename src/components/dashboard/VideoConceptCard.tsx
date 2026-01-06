import { motion } from "framer-motion";
import { 
  Play, 
  Clock, 
  Target, 
  Music, 
  Zap, 
  Heart,
  Copy,
  Sparkles
} from "lucide-react";
import { VideoConcept } from "@/hooks/useVideoGenerator";
import { toast } from "sonner";

interface VideoConceptCardProps {
  concept: VideoConcept;
  index: number;
}

export const VideoConceptCard = ({ concept, index }: VideoConceptCardProps) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok":
        return "from-pink-500 to-cyan-500";
      case "reels":
        return "from-purple-500 to-pink-500";
      case "shorts":
        return "from-red-500 to-orange-500";
      default:
        return "from-primary to-purple-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="glass-card p-5 space-y-4 hover:border-primary/30 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r ${getPlatformColor(concept.platform)} text-white`}>
              {concept.platform}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground">
              {concept.style}
            </span>
          </div>
          <h4 className="font-display font-semibold text-sm leading-tight">
            {concept.title}
          </h4>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-success/10 border border-success/20">
          <Sparkles className="w-3 h-3 text-success" />
          <span className="text-xs font-bold text-success">{concept.viralScore}%</span>
        </div>
      </div>

      {/* Hook */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
            Hook (First 2 Seconds)
          </span>
        </div>
        <p className="text-sm font-medium text-foreground leading-relaxed">
          "{concept.hook}"
        </p>
      </div>

      {/* Script Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Script
          </span>
          <button
            onClick={() => copyToClipboard(concept.script, "Script")}
            className="p-1 rounded hover:bg-secondary transition-colors"
          >
            <Copy className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {concept.script}
        </p>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{concept.duration}s</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground truncate">{concept.emotionalTrigger}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Music className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground truncate">{concept.music}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
        <Target className="w-3 h-3 text-primary" />
        <span className="text-xs font-medium">{concept.cta}</span>
      </div>

      {/* Action Button */}
      <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-purple-500 text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        <Play className="w-3 h-3" />
        Generate Video
      </button>
    </motion.div>
  );
};

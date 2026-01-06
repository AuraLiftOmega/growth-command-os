import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Clock, 
  Target, 
  Music, 
  Zap, 
  Heart,
  Copy,
  Sparkles,
  Video,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { VideoConcept } from "@/hooks/useVideoGenerator";
import { toast } from "sonner";
import { RealVideoGenerator } from "./RealVideoGenerator";

interface VideoConceptCardProps {
  concept: VideoConcept;
  index: number;
}

export const VideoConceptCard = ({ concept, index }: VideoConceptCardProps) => {
  const [showVideoGen, setShowVideoGen] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);

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

  const handleVideoGenerated = (url: string) => {
    setVideoGenerated(true);
    toast.success("Video generated and ready for publishing!");
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
            {concept.passedQualityGate && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Quality Approved
              </span>
            )}
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
          {concept.hookInFirstTwoSeconds && (
            <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto" />
          )}
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

      {/* Real Video Generation */}
      {showVideoGen ? (
        <div className="space-y-3">
          <RealVideoGenerator concept={concept} onGenerate={handleVideoGenerated} />
          <button
            onClick={() => setShowVideoGen(false)}
            className="w-full py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
          >
            <ChevronUp className="w-3 h-3" />
            Hide Video Generator
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setShowVideoGen(true)}
          className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-opacity ${
            videoGenerated 
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground hover:opacity-90"
          }`}
        >
          {videoGenerated ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Video Generated
            </>
          ) : (
            <>
              <Video className="w-3 h-3" />
              Generate Real Video
              <ChevronDown className="w-3 h-3 ml-1" />
            </>
          )}
        </button>
      )}
    </motion.div>
  );
};

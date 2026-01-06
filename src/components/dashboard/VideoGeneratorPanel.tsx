import { motion } from "framer-motion";
import { 
  Sparkles, 
  Upload, 
  Wand2, 
  Play, 
  Clock, 
  CheckCircle2,
  Image,
  Type
} from "lucide-react";
import { useState } from "react";

interface GeneratedVideo {
  id: string;
  thumbnail: string;
  platform: string;
  status: "generating" | "ready" | "processing";
  score: number;
}

const mockVideos: GeneratedVideo[] = [
  { id: "1", thumbnail: "/placeholder.svg", platform: "TikTok", status: "ready", score: 94 },
  { id: "2", thumbnail: "/placeholder.svg", platform: "Reels", status: "ready", score: 87 },
  { id: "3", thumbnail: "/placeholder.svg", platform: "Shorts", status: "generating", score: 0 },
  { id: "4", thumbnail: "/placeholder.svg", platform: "TikTok", status: "ready", score: 91 },
];

export const VideoGeneratorPanel = () => {
  const [inputType, setInputType] = useState<"image" | "text">("image");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">AI Video Generator</h3>
          <p className="text-muted-foreground text-sm">Create viral ads in seconds</p>
        </div>
      </div>

      {/* Input Type Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setInputType("image")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            inputType === "image"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Image className="w-4 h-4" />
          Product Image
        </button>
        <button
          onClick={() => setInputType("text")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            inputType === "text"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Type className="w-4 h-4" />
          Text Prompt
        </button>
      </div>

      {/* Upload Area */}
      {inputType === "image" ? (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-6 hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm font-medium mb-1">Drop product images here</p>
          <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
        </div>
      ) : (
        <div className="mb-6">
          <textarea
            placeholder="Describe your ideal video ad... e.g., 'A UGC-style video showcasing our wireless earbuds with a morning routine hook, targeting Gen Z'"
            className="w-full h-32 bg-secondary/50 border border-border rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
          />
        </div>
      )}

      {/* Generate Button */}
      <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity animate-pulse-glow">
        <Wand2 className="w-4 h-4" />
        Generate 10 Viral Variations
      </button>

      {/* Generated Videos Preview */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Recent Generations</span>
          <span className="text-xs text-muted-foreground">4 videos</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {mockVideos.map((video) => (
            <div
              key={video.id}
              className="relative aspect-[9/16] bg-secondary rounded-lg overflow-hidden group cursor-pointer"
            >
              <img
                src={video.thumbnail}
                alt={video.platform}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-[10px] font-medium">{video.platform}</span>
                {video.status === "ready" && (
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    <span className="text-[10px] text-success">{video.score}%</span>
                  </div>
                )}
                {video.status === "generating" && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-warning animate-spin" />
                    <span className="text-[10px] text-warning">Generating</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40">
                <Play className="w-8 h-8 text-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

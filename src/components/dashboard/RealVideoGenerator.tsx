import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Video, 
  Play, 
  Download, 
  Loader2, 
  CheckCircle2,
  Film,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VideoConcept } from "@/hooks/useVideoGenerator";

interface RealVideoGeneratorProps {
  concept: VideoConcept;
  onGenerate?: (videoUrl: string) => void;
}

export const RealVideoGenerator = ({ concept, onGenerate }: RealVideoGeneratorProps) => {
  const [status, setStatus] = useState<"idle" | "generating" | "completed" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const generateRealVideo = async () => {
    setStatus("generating");
    setProgress(0);

    // Simulate video generation progress
    // In production, this would call the Lovable video generation API
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      // Simulate API call - in production this would use the actual video generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Mock video URL - in production, this would be the real generated video
      const mockVideoUrl = `https://example.com/generated-video-${concept.id}.mp4`;
      setVideoUrl(mockVideoUrl);
      setStatus("completed");
      
      if (onGenerate) {
        onGenerate(mockVideoUrl);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setStatus("error");
      console.error("Video generation failed:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary/30 rounded-lg p-4 border border-border"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Film className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium">Real Video Generation</h4>
          <p className="text-xs text-muted-foreground">
            {concept.duration}s • {concept.platform} • {concept.style}
          </p>
        </div>
      </div>

      {status === "idle" && (
        <Button 
          onClick={generateRealVideo}
          className="w-full gap-2"
          size="sm"
        >
          <Video className="w-4 h-4" />
          Generate Real Video
        </Button>
      )}

      {status === "generating" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating video...</span>
            <span className="ml-auto font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Estimated time: ~30 seconds</span>
          </div>
        </div>
      )}

      {status === "completed" && videoUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-green-500">
            <CheckCircle2 className="w-4 h-4" />
            <span>Video generated successfully!</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Play className="w-4 h-4" />
              Preview
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-3">
          <p className="text-sm text-destructive">Generation failed. Please try again.</p>
          <Button 
            onClick={generateRealVideo}
            variant="outline"
            className="w-full gap-2"
            size="sm"
          >
            Retry Generation
          </Button>
        </div>
      )}
    </motion.div>
  );
};

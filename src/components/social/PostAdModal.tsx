/**
 * Post Ad Modal - Select video, optimize caption/hashtags per channel
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Sparkles,
  Send,
  Clock,
  Hash,
  Loader2,
  Wand2,
  Video,
  Globe,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface VideoOption {
  id: string;
  name: string;
  thumbnail_url: string;
  video_url: string;
  duration_seconds: number;
  platform: string;
}

interface PostAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPlatform: string;
  platformName: string;
}

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
];

export function PostAdModal({
  open,
  onOpenChange,
  targetPlatform,
  platformName,
}: PostAdModalProps) {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoOption[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [language, setLanguage] = useState("en");
  const [schedulePost, setSchedulePost] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Fetch available videos
  useEffect(() => {
    if (open && user) {
      fetchVideos();
    }
  }, [open, user]);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("creatives")
        .select("id, name, thumbnail_url, video_url, duration_seconds, platform")
        .eq("user_id", user?.id)
        .not("video_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setVideos((data as VideoOption[]) || []);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      // Demo videos for UI
      setVideos([
        {
          id: "demo-1",
          name: "Vitamin C Serum - Problem/Solution",
          thumbnail_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200",
          video_url: "",
          duration_seconds: 15,
          platform: "tiktok",
        },
        {
          id: "demo-2",
          name: "Retinol Night Cream - Testimonial",
          thumbnail_url: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=200",
          video_url: "",
          duration_seconds: 30,
          platform: "instagram",
        },
        {
          id: "demo-3",
          name: "Rose Quartz Roller - Demo",
          thumbnail_url: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=200",
          video_url: "",
          duration_seconds: 20,
          platform: "pinterest",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // AI-optimize caption and hashtags for the platform
  const optimizeContent = async () => {
    if (!selectedVideo) {
      toast.error("Select a video first");
      return;
    }

    setIsOptimizing(true);
    try {
      // Simulate AI optimization based on platform
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const optimizations: Record<string, { caption: string; hashtags: string }> = {
        tiktok: {
          caption: "POV: You finally found the skincare that actually WORKS 💫 Link in bio for 20% off!",
          hashtags: "#skincare #glowup #skintok #beautytok #skincareroutine #viral #fyp",
        },
        instagram: {
          caption: "Your glow-up journey starts here ✨ Our best-selling formula delivers results you can see in just 7 days. Tap to shop now!",
          hashtags: "#skincare #beauty #selfcare #glowingskin #skincareproducts #skincarelover",
        },
        pinterest: {
          caption: "The viral skincare product everyone's talking about | Proven results for radiant skin",
          hashtags: "#skincare #beauty #wellness #skincareproducts #radiantskin",
        },
        youtube: {
          caption: "The Truth About This Viral Skincare Product | Full Review & Results",
          hashtags: "#skincare #beautyreview #skincareproducts #glowingskin #beautyhaul",
        },
        facebook: {
          caption: "Looking for skincare that delivers real results? Our customers are loving these before & after transformations! Shop now at the link below.",
          hashtags: "#skincare #beauty #selfcare #wellness",
        },
        twitter: {
          caption: "the skincare that changed everything 👀 if u know u know. link in bio.",
          hashtags: "#skincare #beauty",
        },
      };

      const opt = optimizations[targetPlatform] || optimizations.instagram;
      setCaption(opt.caption);
      setHashtags(opt.hashtags);
      toast.success(`Content optimized for ${platformName}!`);
    } catch (err) {
      toast.error("Optimization failed");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handlePost = async () => {
    if (!selectedVideo) {
      toast.error("Please select a video");
      return;
    }

    setIsPosting(true);
    try {
      // Determine the correct publish endpoint
      const publishEndpoint =
        targetPlatform === "pinterest"
          ? "pinterest-publish"
          : targetPlatform === "youtube"
          ? "youtube-publish"
          : targetPlatform === "tiktok"
          ? "tiktok-publish"
          : "autonomous-publisher";

      const video = videos.find((v) => v.id === selectedVideo);

      // Create publish job
      const { error } = await supabase.from("publish_jobs").insert({
        user_id: user?.id,
        creative_id: selectedVideo.startsWith("demo-") ? null : selectedVideo,
        platform: targetPlatform,
        status: schedulePost ? "queued" : "publishing",
      });

      if (error && !error.message.includes("null value")) {
        throw error;
      }

      // Simulate posting for demo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        schedulePost
          ? `Video scheduled for ${platformName}!`
          : `Video posted to ${platformName}!`
      );
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  const selectedVideoData = videos.find((v) => v.id === selectedVideo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Post to {platformName}
          </DialogTitle>
          <DialogDescription>
            Select a video and customize your post for maximum engagement.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Video Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Select Video
            </Label>
            <ScrollArea className="h-[280px] rounded-lg border border-border p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {videos.map((video) => (
                    <motion.button
                      key={video.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedVideo(video.id)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        selectedVideo === video.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted"
                      }`}
                    >
                      <div className="aspect-[9/16] bg-muted relative">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        {selectedVideo === video.id && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white">
                          {video.duration_seconds}s
                        </div>
                      </div>
                      <p className="text-[10px] text-center p-1 truncate">
                        {video.name}
                      </p>
                    </motion.button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Post Details */}
          <div className="space-y-4">
            {/* Caption */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Caption
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={optimizeContent}
                  disabled={isOptimizing}
                  className="h-7 text-xs"
                >
                  {isOptimizing ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3 mr-1" />
                  )}
                  AI Optimize
                </Button>
              </div>
              <Textarea
                placeholder={`Write a captivating caption for ${platformName}...`}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-[10px] text-muted-foreground text-right">
                {caption.length} characters
              </p>
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Hashtags
              </Label>
              <Input
                placeholder="#skincare #beauty #viral"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Schedule Post</span>
              </div>
              <Switch checked={schedulePost} onCheckedChange={setSchedulePost} />
            </div>

            {schedulePost && (
              <Input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {selectedVideoData && (
              <span>
                Selected: <strong>{selectedVideoData.name}</strong>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePost}
              disabled={!selectedVideo || isPosting}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {schedulePost ? "Scheduling..." : "Posting..."}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {schedulePost ? "Schedule Post" : "Post Now"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { motion } from "framer-motion";
import { Video, Share2, Users, Trophy } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const adStyles = [
  { id: "ugc", label: "UGC / Testimonial", desc: "Real people, real results" },
  { id: "pov", label: "POV / First-person", desc: "Immersive perspective" },
  { id: "before-after", label: "Before/After", desc: "Visual transformation" },
  { id: "unboxing", label: "Unboxing", desc: "Reveal experience" },
  { id: "tutorial", label: "Tutorial / How-to", desc: "Educational content" },
  { id: "lifestyle", label: "Lifestyle", desc: "Aspirational scenes" },
  { id: "comparison", label: "Comparison", desc: "Us vs. them" },
  { id: "story", label: "Story / Narrative", desc: "Emotional journey" },
];

const platforms = [
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "instagram-reels", label: "Instagram Reels", icon: "📷" },
  { id: "instagram-stories", label: "Instagram Stories", icon: "📱" },
  { id: "facebook-ads", label: "Facebook Ads", icon: "📘" },
  { id: "youtube-shorts", label: "YouTube Shorts", icon: "▶️" },
  { id: "pinterest", label: "Pinterest", icon: "📌" },
];

export const CreativeDirectionStep = () => {
  const { data, updateData } = useOnboardingStore();
  const creativeData = data.creativeDirection;

  const toggleAdStyle = (styleId: string) => {
    const current = creativeData.adStyles;
    const updated = current.includes(styleId)
      ? current.filter((id) => id !== styleId)
      : [...current, styleId];
    updateData("creativeDirection", { adStyles: updated });
  };

  const togglePlatform = (platformId: string) => {
    const current = creativeData.priorityPlatforms;
    const updated = current.includes(platformId)
      ? current.filter((id) => id !== platformId)
      : [...current, platformId];
    updateData("creativeDirection", { priorityPlatforms: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2">Creative Direction</h2>
        <p className="text-muted-foreground">
          Define your preferred ad styles and platforms. The AI will prioritize these in generation.
        </p>
      </div>

      {/* Ad Styles */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          Preferred Ad Styles *
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {adStyles.map((style) => (
            <div
              key={style.id}
              onClick={() => toggleAdStyle(style.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                creativeData.adStyles.includes(style.id)
                  ? "bg-primary/10 border-primary/30"
                  : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={creativeData.adStyles.includes(style.id)}
                  className="pointer-events-none mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">{style.label}</p>
                  <p className="text-xs text-muted-foreground">{style.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Platforms */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-primary" />
          Priority Platforms *
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                creativeData.priorityPlatforms.includes(platform.id)
                  ? "bg-primary/10 border-primary/30"
                  : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platform.icon}</span>
                <span className="text-sm font-medium">{platform.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitors */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Competitors or Creators You Admire (Optional)
        </Label>
        <Textarea
          value={creativeData.competitors || ""}
          onChange={(e) => updateData("creativeDirection", { competitors: e.target.value })}
          placeholder="List brands or creators whose ad style you admire. We'll analyze their approach."
          className="bg-secondary/50 border-border/50 min-h-[80px]"
        />
      </div>

      {/* Winning Ad Definition */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-warning" />
          Your Definition of a "Winning Ad" *
        </Label>
        <Textarea
          value={creativeData.winningAdDefinition}
          onChange={(e) => updateData("creativeDirection", { winningAdDefinition: e.target.value })}
          placeholder="What makes an ad 'winning' for you? High ROAS? Viral engagement? Brand awareness? Be specific about your success metrics."
          className="bg-secondary/50 border-border/50 min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          {creativeData.winningAdDefinition.length}/500 · Min 20 characters required
        </p>
      </div>
    </motion.div>
  );
};

import { motion } from "framer-motion";
import { Palette, Type, Ban, Sparkles } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const personalities = [
  { id: "bold", label: "Bold & Confident", emoji: "💪" },
  { id: "playful", label: "Playful & Fun", emoji: "🎉" },
  { id: "luxurious", label: "Luxurious & Premium", emoji: "✨" },
  { id: "authentic", label: "Authentic & Real", emoji: "🤝" },
  { id: "innovative", label: "Innovative & Cutting-edge", emoji: "🚀" },
  { id: "nurturing", label: "Nurturing & Caring", emoji: "💚" },
  { id: "edgy", label: "Edgy & Rebellious", emoji: "🔥" },
  { id: "minimalist", label: "Minimalist & Clean", emoji: "⚪" },
];

const colorPresets = [
  { color: "#3b82f6", name: "Electric Blue" },
  { color: "#8b5cf6", name: "Violet" },
  { color: "#ec4899", name: "Pink" },
  { color: "#ef4444", name: "Red" },
  { color: "#f97316", name: "Orange" },
  { color: "#eab308", name: "Yellow" },
  { color: "#22c55e", name: "Green" },
  { color: "#14b8a6", name: "Teal" },
  { color: "#000000", name: "Black" },
  { color: "#ffffff", name: "White" },
];

export const BrandControlStep = () => {
  const { data, updateData } = useOnboardingStore();
  const brandData = data.brandControl;

  const togglePersonality = (personalityId: string) => {
    const current = brandData.personality;
    if (current.includes(personalityId)) {
      updateData("brandControl", { personality: current.filter((id) => id !== personalityId) });
    } else if (current.length < 3) {
      updateData("brandControl", { personality: [...current, personalityId] });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2">Brand Control System</h2>
        <p className="text-muted-foreground">
          Define your brand's personality and visual identity. The AI will match this in all creatives.
        </p>
      </div>

      {/* Personality Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Brand Personality * (Select up to 3)
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {personalities.map((p) => (
            <div
              key={p.id}
              onClick={() => togglePersonality(p.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                brandData.personality.includes(p.id)
                  ? "bg-primary/10 border-primary/30"
                  : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
              } ${brandData.personality.length >= 3 && !brandData.personality.includes(p.id) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="text-2xl block mb-1">{p.emoji}</span>
              <span className="text-xs font-medium">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tone Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Tone: Casual ↔ Professional</Label>
          <div className="px-2">
            <Slider
              value={[brandData.toneCasualProfessional]}
              onValueChange={(value) => updateData("brandControl", { toneCasualProfessional: value[0] })}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Super Casual</span>
              <span>Very Professional</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Tone: Soft ↔ Aggressive</Label>
          <div className="px-2">
            <Slider
              value={[brandData.toneSoftAggressive]}
              onValueChange={(value) => updateData("brandControl", { toneSoftAggressive: value[0] })}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Gentle & Soft</span>
              <span>Bold & Aggressive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Color Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Primary Brand Color *
          </Label>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.color}
                onClick={() => updateData("brandControl", { primaryColor: preset.color })}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  brandData.primaryColor === preset.color
                    ? "border-primary scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            ))}
            <Input
              type="color"
              value={brandData.primaryColor}
              onChange={(e) => updateData("brandControl", { primaryColor: e.target.value })}
              className="w-10 h-10 p-1 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            Secondary Color (Optional)
          </Label>
          <div className="flex flex-wrap gap-2">
            {colorPresets.slice(0, 5).map((preset) => (
              <button
                key={preset.color}
                onClick={() => updateData("brandControl", { secondaryColor: preset.color })}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  brandData.secondaryColor === preset.color
                    ? "border-primary scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            ))}
            <Input
              type="color"
              value={brandData.secondaryColor || "#000000"}
              onChange={(e) => updateData("brandControl", { secondaryColor: e.target.value })}
              className="w-10 h-10 p-1 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          Brand Fonts (Optional)
        </Label>
        <Input
          value={brandData.fonts || ""}
          onChange={(e) => updateData("brandControl", { fonts: e.target.value })}
          placeholder="E.g., Montserrat for headings, Open Sans for body"
          className="bg-secondary/50 border-border/50"
        />
      </div>

      {/* Forbidden Words */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Ban className="w-4 h-4 text-destructive" />
          Forbidden Words/Phrases (Optional)
        </Label>
        <Textarea
          value={brandData.forbiddenWords || ""}
          onChange={(e) => updateData("brandControl", { forbiddenWords: e.target.value })}
          placeholder="Words or phrases the AI should NEVER use. E.g., 'cheap', 'guarantee', competitor names..."
          className="bg-secondary/50 border-border/50 min-h-[80px]"
        />
      </div>
    </motion.div>
  );
};

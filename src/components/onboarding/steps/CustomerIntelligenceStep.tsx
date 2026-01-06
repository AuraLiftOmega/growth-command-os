import { motion } from "framer-motion";
import { Users, Frown, Star, XCircle, AlertTriangle } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const CustomerIntelligenceStep = () => {
  const { data, updateData } = useOnboardingStore();
  const customerData = data.customerIntelligence;

  const handleChange = (field: string, value: string) => {
    updateData("customerIntelligence", { [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-display font-bold">Target Customer Intelligence</h2>
          <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-bold">
            CRITICAL
          </span>
        </div>
        <p className="text-muted-foreground">
          This section directly determines creative quality. Be specific and detailed.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
        <p className="text-sm text-primary">
          💡 <strong>Pro tip:</strong> The more detail you provide here, the better your AI-generated creatives will convert. 
          Think about your top 10 customers—what do they have in common?
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Ideal Customer Demographics *
        </Label>
        <Textarea
          value={customerData.demographics}
          onChange={(e) => handleChange("demographics", e.target.value)}
          placeholder="Age range, gender, location, income level, lifestyle, interests, profession..."
          className="bg-secondary/50 border-border/50 min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          {customerData.demographics.length}/500 · Min 20 characters required
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Frown className="w-4 h-4 text-warning" />
          Biggest Frustrations *
        </Label>
        <Textarea
          value={customerData.frustrations}
          onChange={(e) => handleChange("frustrations", e.target.value)}
          placeholder="What problems keep them up at night? What have they tried that didn't work? What are they sick of?"
          className="bg-secondary/50 border-border/50 min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          {customerData.frustrations.length}/500 · Min 20 characters required
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Star className="w-4 h-4 text-success" />
          Desired Outcomes *
        </Label>
        <Textarea
          value={customerData.desiredOutcomes}
          onChange={(e) => handleChange("desiredOutcomes", e.target.value)}
          placeholder="What transformation do they want? How do they want to feel? What does success look like to them?"
          className="bg-secondary/50 border-border/50 min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          {customerData.desiredOutcomes.length}/500 · Min 20 characters required
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-destructive" />
          Past Failures (Optional)
        </Label>
        <Textarea
          value={customerData.pastFailures || ""}
          onChange={(e) => handleChange("pastFailures", e.target.value)}
          placeholder="What products, services, or solutions have they tried before that failed? Why did those fail?"
          className="bg-secondary/50 border-border/50 min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Buying Objections *
        </Label>
        <Textarea
          value={customerData.buyingObjections}
          onChange={(e) => handleChange("buyingObjections", e.target.value)}
          placeholder="'It's too expensive', 'Does it really work?', 'I've tried everything', 'I don't have time'..."
          className="bg-secondary/50 border-border/50 min-h-[80px]"
        />
        <p className="text-xs text-muted-foreground">
          {customerData.buyingObjections.length}/500 · Min 10 characters required
        </p>
      </div>
    </motion.div>
  );
};

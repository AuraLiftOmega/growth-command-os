import { motion } from "framer-motion";
import { MessageCircle, MousePointer, Gift, ToggleLeft, ToggleRight } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ctaOptions = [
  { value: "shop-now", label: "Shop Now", desc: "Direct to product/collection" },
  { value: "learn-more", label: "Learn More", desc: "Educational landing page" },
  { value: "get-offer", label: "Get My Offer", desc: "Discount/promo focused" },
  { value: "claim-now", label: "Claim Now", desc: "Urgency/scarcity" },
  { value: "try-free", label: "Try Free", desc: "Free trial/sample" },
  { value: "book-call", label: "Book a Call", desc: "High-ticket consultation" },
];

const offerTypes = [
  { value: "discount", label: "Percentage Discount", desc: "10-50% off" },
  { value: "bogo", label: "Buy One Get One", desc: "BOGO deals" },
  { value: "free-shipping", label: "Free Shipping", desc: "Shipping incentive" },
  { value: "bundle", label: "Bundle Deal", desc: "Multi-product savings" },
  { value: "gift", label: "Free Gift", desc: "Gift with purchase" },
  { value: "none", label: "No Offer", desc: "Full price focus" },
];

export const AutomationStep = () => {
  const { data, updateData } = useOnboardingStore();
  const automationData = data.automation;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2">Automation & Funnels</h2>
        <p className="text-muted-foreground">
          Configure how the AI engages with your audience and drives conversions.
        </p>
      </div>

      {/* Comment → DM Automation */}
      <div
        onClick={() => updateData("automation", { enableCommentDM: !automationData.enableCommentDM })}
        className={`p-6 rounded-xl border cursor-pointer transition-all ${
          automationData.enableCommentDM
            ? "bg-success/5 border-success/30"
            : "bg-secondary/30 border-border/50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${automationData.enableCommentDM ? "bg-success/20" : "bg-secondary"}`}>
              <MessageCircle className={`w-6 h-6 ${automationData.enableCommentDM ? "text-success" : "text-muted-foreground"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Comment → DM Automation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Automatically DM users who comment on your posts with personalized messages, 
                offers, and checkout links.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                  +34% conversion rate
                </span>
                <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs">
                  24/7 automated
                </span>
                <span className="px-2 py-1 rounded-full bg-chart-4/10 text-chart-4 text-xs">
                  AI-personalized
                </span>
              </div>
            </div>
          </div>
          {automationData.enableCommentDM ? (
            <ToggleRight className="w-8 h-8 text-success flex-shrink-0" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </div>

      {/* CTA Preference */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <MousePointer className="w-4 h-4 text-primary" />
          Default CTA Preference *
        </Label>
        <Select
          value={automationData.ctaPreference}
          onValueChange={(value) => updateData("automation", { ctaPreference: value })}
        >
          <SelectTrigger className="bg-secondary/50 border-border/50">
            <SelectValue placeholder="Select CTA style" />
          </SelectTrigger>
          <SelectContent>
            {ctaOptions.map((cta) => (
              <SelectItem key={cta.value} value={cta.value}>
                <div className="flex flex-col">
                  <span>{cta.label}</span>
                  <span className="text-xs text-muted-foreground">{cta.desc}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Offer Type */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" />
          Primary Offer Type *
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {offerTypes.map((offer) => (
            <div
              key={offer.value}
              onClick={() => updateData("automation", { offerType: offer.value })}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                automationData.offerType === offer.value
                  ? "bg-primary/10 border-primary/30"
                  : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
              }`}
            >
              <p className="text-sm font-medium">{offer.label}</p>
              <p className="text-xs text-muted-foreground">{offer.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

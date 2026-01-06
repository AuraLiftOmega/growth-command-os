import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle, FileCheck } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const proofTypes = [
  { id: "testimonials", label: "Customer Testimonials" },
  { id: "before-after", label: "Before/After Photos" },
  { id: "reviews", label: "Product Reviews (4+ stars)" },
  { id: "ugc", label: "UGC Videos" },
  { id: "influencer", label: "Influencer Endorsements" },
  { id: "clinical", label: "Clinical Studies" },
  { id: "certifications", label: "Certifications/Awards" },
  { id: "press", label: "Press Mentions" },
];

export const ProductTruthStep = () => {
  const { data, updateData } = useOnboardingStore();
  const productData = data.productTruth;

  const handleChange = (field: string, value: string) => {
    updateData("productTruth", { [field]: value });
  };

  const toggleProofAsset = (proofId: string) => {
    const current = productData.proofAssets;
    const updated = current.includes(proofId)
      ? current.filter((id) => id !== proofId)
      : [...current, proofId];
    updateData("productTruth", { proofAssets: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2">Product Truth & Compliance</h2>
        <p className="text-muted-foreground">
          Define what makes your product special and what claims are safe to use.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-warning/5 border border-warning/20 mb-6">
        <p className="text-sm text-warning">
          ⚠️ <strong>Important:</strong> The AI will only make claims you explicitly allow. 
          This protects your brand and ensures compliance.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Real Competitive Advantages *
        </Label>
        <Textarea
          value={productData.competitiveAdvantages}
          onChange={(e) => handleChange("competitiveAdvantages", e.target.value)}
          placeholder="What truly makes your product better than competitors? Unique ingredients, technology, process, sourcing, results..."
          className="bg-secondary/50 border-border/50 min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          {productData.competitiveAdvantages.length}/500
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" />
          Claims ALLOWED *
        </Label>
        <Textarea
          value={productData.claimsAllowed}
          onChange={(e) => handleChange("claimsAllowed", e.target.value)}
          placeholder="List specific claims you can legally and truthfully make. E.g., 'Clinically proven to reduce wrinkles by 47%', 'Made with organic ingredients'..."
          className="bg-secondary/50 border-border/50 min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          {productData.claimsAllowed.length}/500
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-destructive" />
          Claims NOT ALLOWED (Optional)
        </Label>
        <Textarea
          value={productData.claimsForbidden || ""}
          onChange={(e) => handleChange("claimsForbidden", e.target.value)}
          placeholder="List claims to avoid. E.g., 'Cures disease', 'FDA approved', 'Guaranteed results'..."
          className="bg-secondary/50 border-border/50 min-h-[80px]"
        />
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-primary" />
          Proof Assets Available *
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Select all types of social proof you have available for the AI to reference
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {proofTypes.map((proof) => (
            <div
              key={proof.id}
              onClick={() => toggleProofAsset(proof.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                productData.proofAssets.includes(proof.id)
                  ? "bg-primary/10 border-primary/30 text-foreground"
                  : "bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={productData.proofAssets.includes(proof.id)}
                  className="pointer-events-none"
                />
                <span className="text-sm">{proof.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

import { motion } from "framer-motion";
import { Building2, Globe, Package, DollarSign, TrendingUp, Target } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const revenueRanges = [
  { value: "0-10k", label: "$0 - $10K/month" },
  { value: "10k-50k", label: "$10K - $50K/month" },
  { value: "50k-100k", label: "$50K - $100K/month" },
  { value: "100k-500k", label: "$100K - $500K/month" },
  { value: "500k-1m", label: "$500K - $1M/month" },
  { value: "1m+", label: "$1M+/month" },
];

const growthGoals = [
  { value: "scale-aggressively", label: "🚀 Scale Aggressively (Default)" },
  { value: "profitable-growth", label: "📈 Profitable Growth" },
  { value: "market-expansion", label: "🌍 Market Expansion" },
  { value: "product-launch", label: "🎯 New Product Launch" },
];

export const BusinessDNAStep = () => {
  const { data, updateData } = useOnboardingStore();
  const businessData = data.businessDNA;

  const handleChange = (field: string, value: string) => {
    updateData("businessDNA", { [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2">Business DNA</h2>
        <p className="text-muted-foreground">
          Core information about your brand. This powers all AI decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Brand Name *
          </Label>
          <Input
            value={businessData.brandName}
            onChange={(e) => handleChange("brandName", e.target.value)}
            placeholder="Your brand name"
            className="bg-secondary/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Shopify URL
          </Label>
          <Input
            value={businessData.shopifyUrl}
            onChange={(e) => handleChange("shopifyUrl", e.target.value)}
            placeholder="https://yourstore.myshopify.com"
            className="bg-secondary/50 border-border/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          Primary Products *
        </Label>
        <Textarea
          value={businessData.primaryProducts}
          onChange={(e) => handleChange("primaryProducts", e.target.value)}
          placeholder="Describe your main products. What do you sell? Who is it for? What makes it special?"
          className="bg-secondary/50 border-border/50 min-h-[120px]"
        />
        <p className="text-xs text-muted-foreground">
          {businessData.primaryProducts.length}/500 characters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Average Order Value (AOV) *
          </Label>
          <Input
            value={businessData.aov}
            onChange={(e) => handleChange("aov", e.target.value)}
            placeholder="$75"
            className="bg-secondary/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Monthly Revenue *
          </Label>
          <Select
            value={businessData.monthlyRevenue}
            onValueChange={(value) => handleChange("monthlyRevenue", value)}
          >
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {revenueRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Growth Goal *
          </Label>
          <Select
            value={businessData.growthGoal}
            onValueChange={(value) => handleChange("growthGoal", value)}
          >
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue placeholder="Select goal" />
            </SelectTrigger>
            <SelectContent>
              {growthGoals.map((goal) => (
                <SelectItem key={goal.value} value={goal.value}>
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
};

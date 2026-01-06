import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Building2, 
  Quote, 
  FileText,
  Plus,
  Check,
  Eye,
  Megaphone,
  Swords
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ProofAsset {
  id: string;
  type: "revenue_increase" | "time_saved" | "agency_replaced" | "quote" | "case_study";
  title: string;
  metric?: string;
  brand?: string;
  approvedFor: string[];
  isAnonymized: boolean;
}

const mockAssets: ProofAsset[] = [
  {
    id: "1",
    type: "revenue_increase",
    title: "47% revenue increase in 30 days",
    metric: "+47%",
    brand: "Fashion Brand",
    approvedFor: ["ads", "sales"],
    isAnonymized: true
  },
  {
    id: "2",
    type: "time_saved",
    title: "Creative iteration reduced from 2 weeks to 4 hours",
    metric: "95% faster",
    brand: "DTC Skincare",
    approvedFor: ["sales", "pr"],
    isAnonymized: true
  },
  {
    id: "3",
    type: "agency_replaced",
    title: "Replaced $12k/month agency completely",
    metric: "$12k saved",
    brand: "Home Goods Co",
    approvedFor: ["ads", "sales", "pr"],
    isAnonymized: false
  },
  {
    id: "4",
    type: "quote",
    title: "This is the future of e-commerce creative. Agencies are obsolete.",
    brand: "CEO, 8-Figure Brand",
    approvedFor: ["ads", "pr"],
    isAnonymized: false
  }
];

const assetTypeConfig = {
  revenue_increase: { icon: DollarSign, color: "text-accent", bgColor: "bg-accent/20", label: "Revenue Increase" },
  time_saved: { icon: Clock, color: "text-primary", bgColor: "bg-primary/20", label: "Time Saved" },
  agency_replaced: { icon: Building2, color: "text-destructive", bgColor: "bg-destructive/20", label: "Agency Replaced" },
  quote: { icon: Quote, color: "text-warning", bgColor: "bg-warning/20", label: "Quote" },
  case_study: { icon: FileText, color: "text-primary", bgColor: "bg-primary/20", label: "Case Study" }
};

const feedTargets = [
  { id: "ads", label: "Ads", icon: Megaphone },
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "pr", label: "PR / Narrative", icon: Swords }
];

export const ProofEngine = () => {
  const [assets] = useState(mockAssets);

  // Stats
  const stats = {
    revenueIncreases: assets.filter(a => a.type === "revenue_increase").length,
    timeSaved: assets.filter(a => a.type === "time_saved").length,
    agenciesReplaced: assets.filter(a => a.type === "agency_replaced").length,
    quotes: assets.filter(a => a.type === "quote").length,
    caseStudies: assets.filter(a => a.type === "case_study").length
  };

  const totalAssets = assets.length;
  const caseStudyReady = assets.filter(a => a.approvedFor.length >= 2).length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">Proof & Leverage Engine</h2>
            <p className="text-sm text-muted-foreground">Track, collect, and deploy proof assets</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 text-center">
            <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent">{stats.revenueIncreases}</p>
            <p className="text-xs text-muted-foreground">Revenue Increases</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{stats.timeSaved}</p>
            <p className="text-xs text-muted-foreground">Time Saved</p>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <Building2 className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold text-destructive">{stats.agenciesReplaced}</p>
            <p className="text-xs text-muted-foreground">Agencies Replaced</p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-center">
            <Quote className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-warning">{stats.quotes}</p>
            <p className="text-xs text-muted-foreground">Quotes</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary border border-border text-center">
            <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold">{caseStudyReady}</p>
            <p className="text-xs text-muted-foreground">Case Study Ready</p>
          </div>
        </div>
      </motion.div>

      {/* Feed Targets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="font-display font-semibold text-lg mb-4">Feed Outputs Into</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedTargets.map((target) => {
            const count = assets.filter(a => a.approvedFor.includes(target.id)).length;
            return (
              <div key={target.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <target.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{target.label}</p>
                    <p className="text-xs text-muted-foreground">{count} assets ready</p>
                  </div>
                </div>
                <Progress value={(count / totalAssets) * 100} className="h-2" />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Asset List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Proof Assets</h3>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </div>

        <div className="space-y-3">
          {assets.map((asset, index) => {
            const config = assetTypeConfig[asset.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                className="glass-card p-5"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                      {asset.isAnonymized && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          <Eye className="w-3 h-3 mr-1" />
                          Anonymized
                        </Badge>
                      )}
                    </div>

                    <p className="font-medium text-foreground mb-1">
                      {asset.type === "quote" ? `"${asset.title}"` : asset.title}
                    </p>

                    {asset.brand && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {asset.type === "quote" ? `— ${asset.brand}` : asset.brand}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Approved for:</span>
                      {asset.approvedFor.map((target) => (
                        <Badge key={target} className="bg-accent/20 text-accent border-accent/30 text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {asset.metric && (
                    <div className="text-right shrink-0">
                      <p className={`text-2xl font-bold ${config.color}`}>{asset.metric}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

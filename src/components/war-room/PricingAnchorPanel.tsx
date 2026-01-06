import { motion } from "framer-motion";
import { DollarSign, Building2, Users, Sparkles } from "lucide-react";

interface PricingComparison {
  id: string;
  label: string;
  range: string;
  icon: React.ReactNode;
  type: "competitor" | "highlight";
}

const pricingData: PricingComparison[] = [
  {
    id: "agency",
    label: "Typical Agency Cost",
    range: "$3k–$15k/month",
    icon: <Building2 className="w-5 h-5" />,
    type: "competitor",
  },
  {
    id: "internal",
    label: "Internal Team Cost",
    range: "$8k–$30k/month",
    icon: <Users className="w-5 h-5" />,
    type: "competitor",
  },
  {
    id: "dominion",
    label: "DOMINION",
    range: "System-Level Leverage",
    icon: <Sparkles className="w-5 h-5" />,
    type: "highlight",
  },
];

export const PricingAnchorPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">Pricing Anchor Panel</h3>
          <p className="text-sm text-muted-foreground">Always visible during call</p>
        </div>
      </div>

      <div className="space-y-3">
        {pricingData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className={`p-4 rounded-lg border transition-all ${
              item.type === "highlight"
                ? "bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/40"
                : "bg-secondary/30 border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                item.type === "highlight" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  item.type === "highlight" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {item.label}
                </p>
                <p className={`text-lg font-display font-bold ${
                  item.type === "highlight" ? "gradient-text" : "text-foreground"
                }`}>
                  {item.range}
                </p>
              </div>
              {item.type === "competitor" && (
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                  <span className="text-destructive text-lg">✗</span>
                </div>
              )}
              {item.type === "highlight" && (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent text-lg">✓</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
        <p className="text-xs font-medium text-destructive uppercase tracking-wider mb-1">
          ⚠️ CRITICAL FRAMING
        </p>
        <p className="text-sm text-foreground">
          Pricing must <strong>never</strong> be framed as "software."
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Position as system-level infrastructure that replaces human guesswork.
        </p>
      </div>
    </motion.div>
  );
};

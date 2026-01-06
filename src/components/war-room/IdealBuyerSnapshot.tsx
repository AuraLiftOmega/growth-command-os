import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, AlertTriangle, CheckCircle2, DollarSign, TrendingUp, Wrench, Crown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QualificationItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
}

export const IdealBuyerSnapshot = () => {
  const [items, setItems] = useState<QualificationItem[]>([
    {
      id: "revenue",
      label: "Monthly Revenue Bracket",
      description: "Doing $50k+/mo in revenue",
      icon: <DollarSign className="w-4 h-4" />,
      checked: false,
    },
    {
      id: "spend",
      label: "Current Ad/Agency Spend",
      description: "Spending $3k+/mo on ads or agency",
      icon: <TrendingUp className="w-4 h-4" />,
      checked: false,
    },
    {
      id: "pain",
      label: "Operational Pain Confirmed",
      description: "Clear inefficiency or bottleneck identified",
      icon: <Wrench className="w-4 h-4" />,
      checked: false,
    },
    {
      id: "decision-maker",
      label: "Decision-Maker Status",
      description: "Can approve spend without committee",
      icon: <Crown className="w-4 h-4" />,
      checked: false,
    },
  ]);

  const [isLive, setIsLive] = useState(false);

  const allChecked = items.every((item) => item.checked);
  const checkedCount = items.filter((item) => item.checked).length;

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleMarkLive = () => {
    if (allChecked) {
      setIsLive(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Ideal Buyer Snapshot</h3>
            <p className="text-sm text-muted-foreground">Pre-call qualification filter</p>
          </div>
        </div>
        <Badge 
          variant={allChecked ? "default" : "secondary"}
          className={allChecked ? "bg-accent text-accent-foreground" : ""}
        >
          {checkedCount}/{items.length} Qualified
        </Badge>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 4 }}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
              item.checked 
                ? "bg-accent/10 border-accent/30" 
                : "bg-secondary/30 border-border hover:border-border/60"
            }`}
            onClick={() => toggleItem(item.id)}
          >
            <Checkbox 
              checked={item.checked} 
              onCheckedChange={() => toggleItem(item.id)}
              className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              item.checked ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
            }`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <p className={`font-medium text-sm ${item.checked ? "text-foreground" : "text-muted-foreground"}`}>
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            {item.checked && (
              <CheckCircle2 className="w-5 h-5 text-accent" />
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!allChecked ? (
          <motion.div
            key="warning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30"
          >
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-sm text-destructive">🚫 LOW CLOSE PROBABILITY</p>
              <p className="text-xs text-muted-foreground">Complete all qualifications before marking call as live</p>
            </div>
          </motion.div>
        ) : isLive ? (
          <motion.div
            key="live"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-accent/10 border border-accent/30"
          >
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
            <p className="font-medium text-accent">CALL IS LIVE — Execute the Framework</p>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Button 
              onClick={handleMarkLive}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              Mark Call as Live
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

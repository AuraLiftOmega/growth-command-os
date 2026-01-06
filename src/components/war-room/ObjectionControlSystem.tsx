import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronRight, Lock, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Objection {
  id: string;
  objection: string;
  response: string;
  category: "stall" | "value" | "price";
}

const objections: Objection[] = [
  {
    id: "think",
    objection: "We need to think about it",
    response: "That usually means the value isn't clear yet. What part doesn't make sense?",
    category: "stall",
  },
  {
    id: "agency",
    objection: "We already have an agency",
    response: "So did most of our best users — until they realized agencies don't compound learning.",
    category: "value",
  },
  {
    id: "price",
    objection: "Price is high",
    response: "Compared to what you're already spending to move slower?",
    category: "price",
  },
  {
    id: "timing",
    objection: "Not the right time",
    response: "When would be? Because inefficiency compounds every day you wait.",
    category: "stall",
  },
  {
    id: "team",
    objection: "Need to run it by my team",
    response: "Of course. What specific concerns do you think they'll have?",
    category: "stall",
  },
  {
    id: "budget",
    objection: "It's not in the budget",
    response: "Neither is the money you're losing to slow iteration. What's that costing you monthly?",
    category: "price",
  },
];

const categoryColors = {
  stall: "bg-warning/20 text-warning border-warning/30",
  value: "bg-primary/20 text-primary border-primary/30",
  price: "bg-destructive/20 text-destructive border-destructive/30",
};

const categoryLabels = {
  stall: "Stall Tactic",
  value: "Value Question",
  price: "Price Objection",
};

export const ObjectionControlSystem = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Objection Control</h3>
            <p className="text-sm text-muted-foreground">Locked responses only</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>CEO Override Only</span>
        </div>
      </div>

      <div className="space-y-2">
        {objections.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <motion.div
              key={item.id}
              className="rounded-lg border border-border overflow-hidden"
            >
              <motion.button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                whileHover={{ backgroundColor: "hsl(var(--secondary) / 0.5)" }}
                className="w-full flex items-center gap-3 p-3 text-left transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="flex-1 text-sm font-medium text-foreground truncate">
                  "{item.objection}"
                </p>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${categoryColors[item.category]}`}>
                  {categoryLabels[item.category]}
                </Badge>
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-3 pb-3">
                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                        <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1">
                          Approved Response
                        </p>
                        <p className="text-sm text-foreground font-medium">
                          "{item.response}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          Reps cannot edit responses without CEO override
        </p>
      </div>
    </motion.div>
  );
};

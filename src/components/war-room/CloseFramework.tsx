import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, ChevronDown, Clock, CheckCircle2, MessageSquare, Lightbulb, DollarSign, Rocket } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface PhaseItem {
  id: string;
  title: string;
  timeRange: string;
  icon: React.ReactNode;
  color: string;
  objectives: string[];
  prompts?: string[];
  statement?: string;
}

const phases: PhaseItem[] = [
  {
    id: "control",
    title: "Phase 1: Control",
    timeRange: "0-3 min",
    icon: <Target className="w-5 h-5" />,
    color: "text-primary",
    objectives: [
      "Establish authority",
      "Set call outcome",
      "Frame time constraint",
    ],
    statement: "This call is to see if replacing your current setup makes sense. If not, we'll know fast.",
  },
  {
    id: "reality",
    title: "Phase 2: Reality Framing",
    timeRange: "3-8 min",
    icon: <Lightbulb className="w-5 h-5" />,
    color: "text-warning",
    objectives: [
      "Expose inefficiencies",
      "Quantify current costs",
      "Highlight human labor limits",
    ],
    prompts: [
      "What does slow iteration cost you monthly?",
      "How many people touch one ad before it launches?",
    ],
  },
  {
    id: "reframe",
    title: "Phase 3: Reframe",
    timeRange: "8-12 min",
    icon: <MessageSquare className="w-5 h-5" />,
    color: "text-accent",
    objectives: [
      "Replace labor with intelligence",
      "Contrast agency vs system",
      "Shift from cost → opportunity loss",
    ],
    statement: "You're not paying for results. You're paying for people guessing.",
  },
  {
    id: "close",
    title: "Phase 4: Close",
    timeRange: "12-15 min",
    icon: <DollarSign className="w-5 h-5" />,
    color: "text-destructive",
    objectives: [
      "Present price once",
      "Anchor against current spend",
      "Offer participation, not access",
    ],
    statement: "This replaces what you're already paying for. The question is timing.",
  },
];

export const CloseFramework = () => {
  const [openPhases, setOpenPhases] = useState<string[]>(["control"]);
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);

  const togglePhase = (id: string) => {
    setOpenPhases((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const markComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedPhases((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">The 15-Minute Close Framework</h3>
            <p className="text-sm text-muted-foreground">Step-by-step call execution</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">15 min total</span>
        </div>
      </div>

      <div className="space-y-3">
        {phases.map((phase, index) => {
          const isOpen = openPhases.includes(phase.id);
          const isCompleted = completedPhases.includes(phase.id);

          return (
            <Collapsible
              key={phase.id}
              open={isOpen}
              onOpenChange={() => togglePhase(phase.id)}
            >
              <CollapsibleTrigger asChild>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    isCompleted
                      ? "bg-accent/10 border-accent/30"
                      : isOpen
                      ? "bg-secondary/50 border-primary/30"
                      : "bg-secondary/30 border-border hover:border-border/60"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isCompleted ? "bg-accent/20" : "bg-muted"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    ) : (
                      <span className={phase.color}>{phase.icon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm ${isCompleted ? "text-accent" : "text-foreground"}`}>
                        {phase.title}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {phase.timeRange}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {phase.objectives.length} objectives
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </motion.div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 ml-14 space-y-4"
                    >
                      {/* Objectives */}
                      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          Objectives
                        </p>
                        <ul className="space-y-2">
                          {phase.objectives.map((obj, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Prompts */}
                      {phase.prompts && (
                        <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                          <p className="text-xs font-medium text-warning uppercase tracking-wider mb-2">
                            System Prompts
                          </p>
                          <ul className="space-y-2">
                            {phase.prompts.map((prompt, i) => (
                              <li key={i} className="text-sm text-foreground italic">
                                "{prompt}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Statement */}
                      {phase.statement && (
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                            {phase.id === "control" ? "Approved Opener" : phase.id === "reframe" ? "Anchor Statement" : "Close Line"}
                          </p>
                          <p className="text-sm text-foreground font-medium">
                            "{phase.statement}"
                          </p>
                        </div>
                      )}

                      <button
                        onClick={(e) => markComplete(phase.id, e)}
                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                          isCompleted
                            ? "bg-accent/20 text-accent hover:bg-accent/30"
                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                        }`}
                      >
                        {isCompleted ? "✓ Phase Complete" : "Mark Phase Complete"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </motion.div>
  );
};

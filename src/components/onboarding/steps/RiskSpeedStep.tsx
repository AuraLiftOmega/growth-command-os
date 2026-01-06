import { motion } from "framer-motion";
import { Gauge, Zap, Sparkles } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Label } from "@/components/ui/label";

const aggressivenessLevels = [
  {
    value: "conservative",
    label: "Conservative",
    desc: "Careful testing, slower scaling, higher approval",
    color: "bg-muted",
    icon: "🐢",
  },
  {
    value: "balanced",
    label: "Balanced",
    desc: "Moderate testing, steady scaling, some automation",
    color: "bg-primary/20",
    icon: "⚖️",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    desc: "Fast testing, auto-scaling, minimal approval needed",
    color: "bg-warning/20",
    icon: "🔥",
    recommended: true,
  },
  {
    value: "maximum",
    label: "Maximum Velocity",
    desc: "Full automation, fastest iteration, data-driven everything",
    color: "bg-destructive/20",
    icon: "🚀",
  },
];

const priorities = [
  {
    value: "fast-iteration",
    label: "Fast Iteration",
    desc: "Speed > polish. Test more, learn faster, scale winners quickly.",
    icon: Zap,
    recommended: true,
  },
  {
    value: "highest-polish",
    label: "Highest Polish",
    desc: "Quality > quantity. Every creative is refined before testing.",
    icon: Sparkles,
  },
];

export const RiskSpeedStep = () => {
  const { data, updateData } = useOnboardingStore();
  const riskData = data.riskSpeed;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2">Risk & Speed Control</h2>
        <p className="text-muted-foreground">
          How aggressively should the AI operate? This affects testing velocity and automation level.
        </p>
      </div>

      {/* Aggressiveness Level */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          Aggressiveness Level *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aggressivenessLevels.map((level) => (
            <div
              key={level.value}
              onClick={() => updateData("riskSpeed", { aggressivenessLevel: level.value })}
              className={`p-5 rounded-xl border cursor-pointer transition-all relative ${
                riskData.aggressivenessLevel === level.value
                  ? `${level.color} border-primary/50`
                  : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
              }`}
            >
              {level.recommended && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-success text-success-foreground text-[10px] font-bold">
                  RECOMMENDED
                </span>
              )}
              <div className="flex items-start gap-3">
                <span className="text-3xl">{level.icon}</span>
                <div>
                  <p className="font-semibold text-lg">{level.label}</p>
                  <p className="text-sm text-muted-foreground">{level.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-3">
        <Label>Priority: Speed vs. Polish *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {priorities.map((priority) => {
            const Icon = priority.icon;
            return (
              <div
                key={priority.value}
                onClick={() => updateData("riskSpeed", { priority: priority.value })}
                className={`p-5 rounded-xl border cursor-pointer transition-all relative ${
                  riskData.priority === priority.value
                    ? "bg-primary/10 border-primary/50"
                    : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                }`}
              >
                {priority.recommended && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-success text-success-foreground text-[10px] font-bold">
                    RECOMMENDED
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{priority.label}</p>
                    <p className="text-sm text-muted-foreground">{priority.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Speed Stats */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-primary/5 via-chart-2/5 to-success/5 border border-primary/10">
        <h4 className="font-semibold mb-3">Your Configuration Impact</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-display font-bold text-primary">
              {riskData.aggressivenessLevel === "maximum" ? "10x" : 
               riskData.aggressivenessLevel === "aggressive" ? "5x" :
               riskData.aggressivenessLevel === "balanced" ? "2x" : "1x"}
            </p>
            <p className="text-xs text-muted-foreground">Testing Velocity</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-success">
              {riskData.priority === "fast-iteration" ? "24hrs" : "72hrs"}
            </p>
            <p className="text-xs text-muted-foreground">Time to First Results</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-chart-4">
              {riskData.aggressivenessLevel === "conservative" ? "High" : 
               riskData.aggressivenessLevel === "balanced" ? "Medium" : "Low"}
            </p>
            <p className="text-xs text-muted-foreground">Manual Approval</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

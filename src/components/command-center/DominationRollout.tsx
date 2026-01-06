import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Lock, 
  CheckCircle2, 
  Circle,
  Eye,
  Megaphone,
  Swords,
  TrendingUp,
  Crown,
  ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";

interface Phase {
  id: number;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  conditions: { id: string; label: string; met: boolean }[];
  actions?: string[];
  rules?: string[];
  contentAngles?: string[];
}

const initialPhases: Phase[] = [
  {
    id: 1,
    name: "Silent Proof Accumulation",
    subtitle: "Private proof before public claims",
    icon: <Eye className="w-5 h-5" />,
    color: "text-primary",
    conditions: [
      { id: "active_users", label: "20+ active users", met: false },
      { id: "documented_wins", label: "5 documented wins", met: false },
      { id: "agency_replaced", label: "At least 1 agency replaced", met: false }
    ],
    rules: ["No public ads yet", "Focus on results documentation", "Build case study pipeline"]
  },
  {
    id: 2,
    name: "Controlled Exposure",
    subtitle: "Strategic visibility without desperation",
    icon: <Megaphone className="w-5 h-5" />,
    color: "text-warning",
    conditions: [
      { id: "anonymized_wins", label: "Release anonymized wins", met: false },
      { id: "founder_content", label: "Founder-led content active", met: false },
      { id: "waitlist_active", label: "Limited public waitlist", met: false }
    ],
    actions: [
      "Release anonymized wins",
      "Founder-led content",
      "\"Invite-only system replacing agencies\" narrative",
      "Limited public waitlist"
    ],
    rules: ["Scarcity language enforced"]
  },
  {
    id: 3,
    name: "Narrative Warfare",
    subtitle: "Public positioning as inevitable",
    icon: <Swords className="w-5 h-5" />,
    color: "text-destructive",
    conditions: [
      { id: "public_challenges", label: "Agencies challenged publicly", met: false },
      { id: "labor_obsolete", label: "Labor obsolescence content", met: false },
      { id: "infrastructure_pos", label: "Infrastructure positioning", met: false }
    ],
    contentAngles: [
      "Why agencies can't scale learning",
      "Why software beats retainers",
      "Why humans slow growth"
    ]
  },
  {
    id: 4,
    name: "Paid Scale",
    subtitle: "Amplification without dilution",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "text-accent",
    conditions: [
      { id: "proof_amplification", label: "Ads amplify proof, not promises", met: false },
      { id: "intake_caps", label: "Intake caps enforced", met: false },
      { id: "price_increases", label: "Price increases triggered by demand", met: false }
    ],
    rules: [
      "Ads amplify proof, not promises",
      "No mass onboarding",
      "Intake caps enforced",
      "Price increases triggered by demand"
    ]
  },
  {
    id: 5,
    name: "Market Lock-In",
    subtitle: "Default comparison achieved",
    icon: <Crown className="w-5 h-5" />,
    color: "text-warning",
    conditions: [
      { id: "default_comparison", label: "DOMINION becomes default comparison", met: false },
      { id: "agency_reactions", label: "Agencies react publicly", met: false },
      { id: "pricing_resistance_gone", label: "Pricing resistance disappears", met: false }
    ]
  }
];

export const DominationRollout = () => {
  const [phases, setPhases] = useState(initialPhases);
  const [openPhases, setOpenPhases] = useState<number[]>([1]);

  const togglePhase = (id: number) => {
    setOpenPhases(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleCondition = (phaseId: number, conditionId: string) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          conditions: phase.conditions.map(c => 
            c.id === conditionId ? { ...c, met: !c.met } : c
          )
        };
      }
      return phase;
    }));
  };

  const getPhaseProgress = (phase: Phase) => {
    const met = phase.conditions.filter(c => c.met).length;
    return (met / phase.conditions.length) * 100;
  };

  const getCurrentPhase = () => {
    for (let i = 0; i < phases.length; i++) {
      if (getPhaseProgress(phases[i]) < 100) return i + 1;
    }
    return 5;
  };

  const currentPhase = getCurrentPhase();

  return (
    <div className="space-y-6">
      {/* Phase Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">Beta → Domination Rollout</h2>
            <p className="text-sm text-muted-foreground">
              Private proof → Public inevitability
            </p>
          </div>
          <Badge className="ml-auto bg-primary text-primary-foreground text-lg px-4 py-2">
            Phase {currentPhase}
          </Badge>
        </div>

        {/* Phase Timeline */}
        <div className="flex items-center gap-2 mb-6">
          {phases.map((phase, i) => {
            const progress = getPhaseProgress(phase);
            const isComplete = progress === 100;
            const isCurrent = phase.id === currentPhase;

            return (
              <div key={phase.id} className="flex items-center flex-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${isComplete ? "bg-accent text-accent-foreground" : 
                    isCurrent ? "bg-primary text-primary-foreground" : 
                    "bg-secondary text-muted-foreground"}
                `}>
                  {isComplete ? <CheckCircle2 className="w-4 h-4" /> : phase.id}
                </div>
                {i < phases.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    isComplete ? "bg-accent" : "bg-border"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Current Objective</p>
          <p className="font-display font-semibold text-lg">
            {phases[currentPhase - 1]?.name}: {phases[currentPhase - 1]?.subtitle}
          </p>
        </div>
      </motion.div>

      {/* Phase Details */}
      <div className="space-y-4">
        {phases.map((phase, index) => {
          const isOpen = openPhases.includes(phase.id);
          const progress = getPhaseProgress(phase);
          const isComplete = progress === 100;
          const isCurrent = phase.id === currentPhase;

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Collapsible open={isOpen} onOpenChange={() => togglePhase(phase.id)}>
                <CollapsibleTrigger asChild>
                  <div className={`
                    glass-card p-5 cursor-pointer transition-all
                    ${isCurrent ? "border-primary/50" : ""}
                  `}>
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        ${isComplete ? "bg-accent/20" : isCurrent ? "bg-primary/20" : "bg-secondary"}
                      `}>
                        {isComplete ? (
                          <CheckCircle2 className="w-6 h-6 text-accent" />
                        ) : (
                          <span className={phase.color}>{phase.icon}</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">Phase {phase.id}</span>
                          {isCurrent && (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              CURRENT
                            </Badge>
                          )}
                          {isComplete && (
                            <Badge className="bg-accent text-accent-foreground text-xs">
                              COMPLETE
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-display font-semibold text-lg">{phase.name}</h3>
                        <p className="text-sm text-muted-foreground">{phase.subtitle}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Progress</p>
                        <p className={`text-xl font-bold ${isComplete ? "text-accent" : "text-foreground"}`}>
                          {Math.round(progress)}%
                        </p>
                      </div>

                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </div>

                    <Progress value={progress} className="h-2 mt-4" />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-5 pt-0 space-y-4">
                    {/* Conditions */}
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Conditions to Proceed
                      </p>
                      <div className="space-y-2">
                        {phase.conditions.map((condition) => (
                          <div
                            key={condition.id}
                            onClick={() => toggleCondition(phase.id, condition.id)}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                              ${condition.met ? "bg-accent/10 border border-accent/30" : "bg-muted/50 hover:bg-muted"}
                            `}
                          >
                            <Checkbox 
                              checked={condition.met}
                              className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                            />
                            <span className={`text-sm ${condition.met ? "text-accent font-medium" : "text-foreground"}`}>
                              {condition.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {phase.actions && (
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                        <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">
                          Actions
                        </p>
                        <ul className="space-y-2">
                          {phase.actions.map((action, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Rules */}
                    {phase.rules && (
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                        <p className="text-xs font-medium text-destructive uppercase tracking-wider mb-3">
                          Rules
                        </p>
                        <ul className="space-y-2">
                          {phase.rules.map((rule, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <Lock className="w-4 h-4 text-destructive shrink-0" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Content Angles */}
                    {phase.contentAngles && (
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                        <p className="text-xs font-medium text-warning uppercase tracking-wider mb-3">
                          Approved Content Angles
                        </p>
                        <ul className="space-y-2">
                          {phase.contentAngles.map((angle, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <Megaphone className="w-4 h-4 text-warning shrink-0" />
                              "{angle}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Copy,
  Check,
  Crown,
  DollarSign,
  TrendingUp,
  Target,
  UserX
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const approvedDMScript = `Saw you're scaling [brand].
We're opening a limited internal beta of an AI system that replaces agencies and content teams by running creative and scaling autonomously.
Not for beginners.
If you're already spending and want to move faster, I can explain.`;

const betaRules = [
  { rule: "No free tier", enforced: true },
  { rule: "No trials", enforced: true },
  { rule: "No discounts", enforced: true },
  { rule: "Non-executors removed", enforced: true }
];

const scarcityRules = [
  "100 accounts max",
  "Invite-only access",
  "Founder approval required",
  "No public signup"
];

export const PowerUsersSystem = () => {
  const [copied, setCopied] = useState(false);
  const [qualificationChecks, setQualificationChecks] = useState({
    revenue: false,
    spend: false,
    bottleneck: false,
    decisionMaker: false
  });

  const copyScript = () => {
    navigator.clipboard.writeText(approvedDMScript);
    setCopied(true);
    toast.success("DM script copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCheck = (key: keyof typeof qualificationChecks) => {
    setQualificationChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(qualificationChecks).every(Boolean);
  const checkedCount = Object.values(qualificationChecks).filter(Boolean).length;

  // Mock data
  const currentUsers = 12;
  const maxUsers = 100;

  return (
    <div className="space-y-6">
      {/* Scarcity Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6 border-l-4 border-l-warning"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">First 100 Power Users</h2>
              <p className="text-sm text-muted-foreground">Invite-only beta access</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 border-warning text-warning">
            {currentUsers} / {maxUsers}
          </Badge>
        </div>

        <Progress value={(currentUsers / maxUsers) * 100} className="h-3 mb-4" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scarcityRules.map((rule, i) => (
            <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-warning" />
                <p className="text-sm font-medium text-foreground">{rule}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hard Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Hard Requirements</h3>
              <p className="text-sm text-muted-foreground">Must meet all criteria</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <DollarSign className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-sm">Monthly Revenue</p>
                <p className="text-xs text-muted-foreground">$20k–$500k/month</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <TrendingUp className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-sm">Existing Spend</p>
                <p className="text-xs text-muted-foreground">Active ad or agency budget</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-sm">Clear Growth Bottleneck</p>
                <p className="text-xs text-muted-foreground">Identified scaling problem</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Crown className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Decision-Maker</p>
                <p className="text-xs text-muted-foreground">Can approve without committee</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Beta Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Beta Rules</h3>
              <p className="text-sm text-muted-foreground">Non-negotiable policies</p>
            </div>
          </div>

          <div className="space-y-3">
            {betaRules.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="font-medium text-sm text-foreground">{item.rule}</p>
                <Badge variant="outline" className="border-destructive text-destructive text-xs">
                  ENFORCED
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Approved DM Script */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Approved DM Script</h3>
              <p className="text-sm text-muted-foreground">Locked — use exactly as written</p>
            </div>
          </div>
          <Button onClick={copyScript} variant="outline" size="sm" className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy Script
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
            {approvedDMScript}
          </pre>
        </div>
      </motion.div>

      {/* Qualification Gate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Qualification Gate</h3>
              <p className="text-sm text-muted-foreground">Confirm before onboarding</p>
            </div>
          </div>
          <Badge variant={allChecked ? "default" : "secondary"} className={allChecked ? "bg-accent" : ""}>
            {checkedCount}/4 Confirmed
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {[
            { key: "revenue", label: "Revenue Confirmed", desc: "$20k–$500k/month verified" },
            { key: "spend", label: "Spend Confirmed", desc: "Active ad/agency budget" },
            { key: "bottleneck", label: "Bottleneck Identified", desc: "Clear growth problem" },
            { key: "decisionMaker", label: "Decision-Maker", desc: "Authority to approve" }
          ].map((item) => (
            <div
              key={item.key}
              onClick={() => toggleCheck(item.key as keyof typeof qualificationChecks)}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                qualificationChecks[item.key as keyof typeof qualificationChecks]
                  ? "bg-accent/10 border-accent/30"
                  : "bg-secondary/30 border-border hover:border-border/60"
              }`}
            >
              <Checkbox 
                checked={qualificationChecks[item.key as keyof typeof qualificationChecks]}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!allChecked ? (
            <motion.div
              key="fail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3"
            >
              <UserX className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">DO NOT ONBOARD</p>
                <p className="text-xs text-muted-foreground">Qualification gate not passed</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pass"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-lg bg-accent/10 border border-accent/30 flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-accent">QUALIFIED — Proceed to Onboarding</p>
                <p className="text-xs text-muted-foreground">All requirements confirmed</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

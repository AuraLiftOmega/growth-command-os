import { motion } from "framer-motion";
import { Shield, CheckCircle, AlertTriangle, Zap, Brain, Rocket, RefreshCw, Target } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";

const automationCapabilities = [
  { icon: Zap, label: "Test creatives automatically", color: "text-primary" },
  { icon: Rocket, label: "Scale winning ads without approval", color: "text-success" },
  { icon: Target, label: "Kill underperforming creatives", color: "text-destructive" },
  { icon: RefreshCw, label: "Repost winners across platforms", color: "text-chart-2" },
  { icon: Brain, label: "Optimize based on performance data", color: "text-chart-4" },
];

export const AuthorizationStep = () => {
  const { data, updateData, calculateQualityScore, inputQualityScore } = useOnboardingStore();
  const authData = data.authorization;

  useEffect(() => {
    calculateQualityScore();
  }, []);

  const getQualityStatus = () => {
    if (inputQualityScore >= 80) return { label: "Excellent", color: "text-success", bg: "bg-success/10" };
    if (inputQualityScore >= 60) return { label: "Good", color: "text-primary", bg: "bg-primary/10" };
    if (inputQualityScore >= 40) return { label: "Needs Improvement", color: "text-warning", bg: "bg-warning/10" };
    return { label: "Incomplete", color: "text-destructive", bg: "bg-destructive/10" };
  };

  const qualityStatus = getQualityStatus();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold mb-2">Final Authorization</h2>
        <p className="text-muted-foreground">
          Review your input quality and authorize the AI to operate on your behalf.
        </p>
      </div>

      {/* Input Quality Score */}
      <div className={`p-6 rounded-xl border ${qualityStatus.bg} border-${qualityStatus.color.replace('text-', '')}/30`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Input Quality Score</h3>
          <div className={`px-3 py-1 rounded-full ${qualityStatus.bg} ${qualityStatus.color} text-sm font-bold`}>
            {qualityStatus.label}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Data completeness</span>
            <span className="font-bold">{inputQualityScore}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${inputQualityScore}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`h-full rounded-full ${
                inputQualityScore >= 80 ? "bg-success" :
                inputQualityScore >= 60 ? "bg-primary" :
                inputQualityScore >= 40 ? "bg-warning" : "bg-destructive"
              }`}
            />
          </div>
        </div>

        {inputQualityScore < 60 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Limited Automation</p>
              <p className="text-xs text-muted-foreground">
                With an input quality below 60%, automation will be limited. 
                Go back and add more detail to unlock full AI power.
              </p>
            </div>
          </div>
        )}

        {inputQualityScore >= 80 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-success">Full Automation Unlocked</p>
              <p className="text-xs text-muted-foreground">
                Excellent data quality! The AI has everything it needs to operate at maximum efficiency.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Capabilities Summary */}
      <div className="p-6 rounded-xl bg-secondary/30 border border-border/50">
        <h3 className="font-semibold text-lg mb-4">By authorizing, the AI will:</h3>
        <div className="space-y-3">
          {automationCapabilities.map((cap, index) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <Icon className={`w-5 h-5 ${cap.color}`} />
                <span className="text-sm">{cap.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Authorization Checkbox */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        onClick={() => updateData("authorization", { authorizeAutomation: !authData.authorizeAutomation })}
        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
          authData.authorizeAutomation
            ? "bg-success/5 border-success/50"
            : "bg-secondary/30 border-border hover:border-primary/30"
        }`}
      >
        <div className="flex items-start gap-4">
          <Checkbox
            checked={authData.authorizeAutomation}
            className="mt-1 h-6 w-6"
          />
          <div>
            <p className="font-semibold text-lg mb-2">
              I authorize the system to automatically test, scale, kill, repost, and optimize 
              creatives based on performance data to maximize revenue.
            </p>
            <p className="text-sm text-muted-foreground">
              This is required to enable full automation. You can adjust individual settings 
              from the dashboard at any time.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Security Note */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
        <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Your data is encrypted and never shared. The AI operates within the guardrails you've set. 
          You maintain full control and can pause automation at any time.
        </p>
      </div>
    </motion.div>
  );
};

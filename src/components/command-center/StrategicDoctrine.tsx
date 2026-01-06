import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Shield, 
  Lock, 
  Check, 
  X, 
  AlertTriangle,
  Edit3,
  Save,
  Users,
  UserX
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const StrategicDoctrine = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [northStar, setNorthStar] = useState(
    "DOMINION is an AI commerce operating system that replaces agencies, media buyers, and content teams with one system that learns and scales revenue autonomously."
  );
  const [marketCategory] = useState("Autonomous Revenue Infrastructure");

  const approvedLanguage = ["Replace", "Operate", "Run", "Scale", "Eliminate", "Compound"];
  const forbiddenLanguage = ["Help", "Assist", "Tool", "Platform", "Support", "AI-powered"];

  const targetAudience = [
    "Owners scaling past $20k/month",
    "Operators with existing ad spend",
    "Decision-makers with authority",
    "Brands hitting growth ceilings"
  ];

  const excludedAudience = [
    "Beginners with no revenue",
    "Free users / tire-kickers",
    "Emotionally attached to agencies",
    "Committee decision-makers"
  ];

  const [testInput, setTestInput] = useState("");
  const [violations, setViolations] = useState<string[]>([]);

  const checkLanguage = (text: string) => {
    const found: string[] = [];
    forbiddenLanguage.forEach(word => {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        found.push(word);
      }
    });
    setViolations(found);
  };

  return (
    <div className="space-y-6">
      {/* North Star */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6 border-l-4 border-l-primary"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl">North Star</h2>
                <Badge variant="outline" className="text-xs gap-1">
                  <Lock className="w-3 h-3" />
                  CEO Only
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Immutable strategic direction</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="gap-2"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {isEditing ? "Save" : "Edit"}
          </Button>
        </div>

        {isEditing ? (
          <Textarea 
            value={northStar}
            onChange={(e) => setNorthStar(e.target.value)}
            className="min-h-[100px] bg-secondary/50"
          />
        ) : (
          <p className="text-lg font-medium text-foreground leading-relaxed">
            "{northStar}"
          </p>
        )}
      </motion.div>

      {/* Market Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Market Category</h3>
            <p className="text-sm text-muted-foreground">How we define ourselves</p>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
          <p className="text-2xl font-display font-bold text-accent">{marketCategory}</p>
        </div>
      </motion.div>

      {/* Language Enforcement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Approved Language</h3>
              <p className="text-sm text-muted-foreground">Power words only</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {approvedLanguage.map((word) => (
              <Badge key={word} className="bg-accent/20 text-accent border-accent/30 text-sm py-1.5 px-3">
                {word}
              </Badge>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <X className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Forbidden Language</h3>
              <p className="text-sm text-muted-foreground">Never use these</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {forbiddenLanguage.map((word) => (
              <Badge key={word} variant="outline" className="border-destructive/50 text-destructive text-sm py-1.5 px-3 line-through">
                {word}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Language Checker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Language Violation Checker</h3>
            <p className="text-sm text-muted-foreground">Test your copy before publishing</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Input
            placeholder="Enter text to check for forbidden language..."
            value={testInput}
            onChange={(e) => {
              setTestInput(e.target.value);
              checkLanguage(e.target.value);
            }}
            className="bg-secondary/50"
          />
          
          {violations.length > 0 && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm font-medium text-destructive mb-2">⚠️ VIOLATIONS DETECTED:</p>
              <div className="flex flex-wrap gap-2">
                {violations.map((word) => (
                  <Badge key={word} variant="destructive" className="text-sm">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {testInput && violations.length === 0 && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <p className="text-sm font-medium text-accent">✓ No violations detected</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Target Audience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Who This Is For</h3>
              <p className="text-sm text-muted-foreground">Ideal customers</p>
            </div>
          </div>
          <ul className="space-y-2">
            {targetAudience.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="w-4 h-4 text-accent shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <UserX className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Who This Is NOT For</h3>
              <p className="text-sm text-muted-foreground">Do not onboard</p>
            </div>
          </div>
          <ul className="space-y-2">
            {excludedAudience.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <X className="w-4 h-4 text-destructive shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

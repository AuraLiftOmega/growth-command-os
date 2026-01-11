import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Zap, TrendingUp, AlertCircle, 
  CheckCircle, Clock, Loader2, Sparkles,
  Target, DollarSign, Activity
} from "lucide-react";

interface GrokThinking {
  analysis: string;
  commands: Array<{ bot_id: string; action: string; target: string; priority: string }>;
  optimizations: string[];
  projected_revenue: number;
  confidence: number;
  next_think_in_minutes: number;
}

interface GrokBrainPanelProps {
  onThink: () => Promise<GrokThinking | null>;
  lastThinking: GrokThinking | null;
  isThinking: boolean;
}

export function GrokBrainPanel({ onThink, lastThinking, isThinking }: GrokBrainPanelProps) {
  const [autoThink, setAutoThink] = useState(false);

  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            GROK CEO Brain
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              Central Intelligence
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoThink ? "default" : "outline"}
              onClick={() => setAutoThink(!autoThink)}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Auto-Think {autoThink ? "ON" : "OFF"}
            </Button>
            <Button
              size="sm"
              onClick={onThink}
              disabled={isThinking}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {isThinking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Think Now
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Thinking animation */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-lg bg-primary/10 border border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Brain className="h-8 w-8 text-primary" />
                  <motion.div
                    className="absolute inset-0 bg-primary/30 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div>
                  <p className="font-medium">Analyzing 50 bots across 5 teams...</p>
                  <p className="text-sm text-muted-foreground">Running optimization algorithms</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking results */}
        {lastThinking && !isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Key metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Projected Revenue</span>
                </div>
                <p className="text-2xl font-bold text-green-500">
                  ${lastThinking.projected_revenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={lastThinking.confidence} className="h-2 flex-1" />
                  <span className="text-lg font-bold">{lastThinking.confidence}%</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Next Think</span>
                </div>
                <p className="text-lg font-bold text-orange-500">
                  {lastThinking.next_think_in_minutes} min
                </p>
              </div>
            </div>

            {/* Analysis */}
            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Analysis
              </h4>
              <p className="text-sm text-muted-foreground">{lastThinking.analysis}</p>
            </div>

            {/* Commands */}
            {lastThinking.commands.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Bot Commands ({lastThinking.commands.length})
                </h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {lastThinking.commands.map((cmd, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={cmd.priority === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {cmd.priority}
                          </Badge>
                          <span className="text-sm font-mono">{cmd.bot_id}</span>
                          <span className="text-sm text-muted-foreground">→</span>
                          <span className="text-sm">{cmd.action}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{cmd.target}</span>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Optimizations */}
            {lastThinking.optimizations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Optimizations
                </h4>
                <ul className="space-y-1">
                  {lastThinking.optimizations.map((opt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!lastThinking && !isThinking && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Click "Think Now" to activate Grok CEO Brain</p>
            <p className="text-sm">Analyzes all 50 bots and issues optimization commands</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

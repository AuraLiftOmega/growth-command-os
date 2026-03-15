import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, CheckCircle, AlertTriangle, Loader2, X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HealResult {
  type: string;
  status: string;
  message: string;
  platform?: string;
  ad_id?: string;
  job_id?: string;
}

interface HealSummary {
  scanned_at: string;
  total_issues_found: number;
  issues_fixed: number;
  issues_pending: number;
  results: HealResult[];
}

export const FloatingSelfHeal = React.forwardRef<HTMLDivElement>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [lastHeal, setLastHeal] = useState<HealSummary | null>(null);

  const runSelfHeal = async () => {
    setIsHealing(true);
    try {
      const { data, error } = await supabase.functions.invoke('omega-self-heal', {
        body: { action: 'full_scan' }
      });

      if (error) throw error;

      setLastHeal(data);
      
      if (data.issues_fixed > 0) {
        toast.success(`Omega Self-Heal: Fixed ${data.issues_fixed} issue(s)`);
      } else if (data.total_issues_found === 0) {
        toast.success("All systems healthy! No issues found.");
      } else {
        toast.warning(`Found ${data.issues_pending} issue(s) requiring attention`);
      }
    } catch (error) {
      console.error("Self-heal error:", error);
      toast.error("Self-heal scan failed");
    } finally {
      setIsHealing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'refreshed':
      case 'queued_retry':
      case 'reset':
        return 'bg-green-500/20 text-green-400';
      case 'needs_reconnect':
      case 'sync_needed':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25"
          size="icon"
        >
          {isHealing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Wrench className="h-6 w-6" />
          )}
        </Button>
        
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-500/30"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 z-50 w-80"
          >
            <Card className="border-emerald-500/30 bg-background/95 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    Omega Self-Heal
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={runSelfHeal}
                  disabled={isHealing}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                >
                  {isHealing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Wrench className="mr-2 h-4 w-4" />
                      Run Self-Heal Scan
                    </>
                  )}
                </Button>

                {lastHeal && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last scan:</span>
                      <span>{new Date(lastHeal.scanned_at).toLocaleTimeString()}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <div className="text-lg font-bold">{lastHeal.total_issues_found}</div>
                        <div className="text-xs text-muted-foreground">Found</div>
                      </div>
                      <div className="bg-emerald-500/20 rounded-lg p-2">
                        <div className="text-lg font-bold text-emerald-400">{lastHeal.issues_fixed}</div>
                        <div className="text-xs text-emerald-400/70">Fixed</div>
                      </div>
                      <div className="bg-yellow-500/20 rounded-lg p-2">
                        <div className="text-lg font-bold text-yellow-400">{lastHeal.issues_pending}</div>
                        <div className="text-xs text-yellow-400/70">Pending</div>
                      </div>
                    </div>

                    {lastHeal.results.length > 0 && (
                      <ScrollArea className="h-40">
                        <div className="space-y-2">
                          {lastHeal.results.map((result, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg text-sm"
                            >
                              {result.status === 'failed' || result.status === 'needs_reconnect' ? (
                                <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs truncate">{result.message}</p>
                                <Badge className={`mt-1 text-[10px] ${getStatusColor(result.status)}`}>
                                  {result.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}

                    {lastHeal.total_issues_found === 0 && (
                      <div className="flex items-center justify-center gap-2 text-emerald-400 py-4">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm">All systems healthy!</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

FloatingSelfHeal.displayName = 'FloatingSelfHeal';

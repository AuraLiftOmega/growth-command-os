import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, Bot, DollarSign, CheckCircle, 
  AlertCircle, Clock, Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BotLog {
  id: string;
  bot_id: string;
  bot_name: string;
  team: string;
  action: string;
  action_type: string;
  status: string;
  revenue_impact: number;
  created_at: string;
}

interface LiveBotLogsProps {
  logs: BotLog[];
  isLive: boolean;
}

const TEAM_COLORS: Record<string, string> = {
  sales: "hsl(142, 76%, 36%)",
  ads: "hsl(217, 91%, 60%)",
  domains: "hsl(271, 91%, 65%)",
  engagement: "hsl(24, 95%, 53%)",
  revenue: "hsl(48, 96%, 53%)",
  orchestrator: "hsl(262, 83%, 58%)",
};

export function LiveBotLogs({ logs, isLive }: LiveBotLogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isLive) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, isLive]);

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Bot Activity
            {isLive && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">LIVE</span>
              </span>
            )}
          </CardTitle>
          <Badge variant="outline">
            {logs.length} events
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
          <AnimatePresence mode="popLayout">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No bot activity yet</p>
                <p className="text-sm">Activate bots to see real-time logs</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Status icon */}
                        <div className="mt-0.5">
                          {log.status === "completed" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : log.status === "error" ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: TEAM_COLORS[log.team] || "currentColor",
                                color: TEAM_COLORS[log.team] || "currentColor",
                              }}
                            >
                              {log.bot_name}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {log.action}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </span>
                            {Number(log.revenue_impact) > 0 && (
                              <span className="flex items-center gap-1 text-green-500">
                                <DollarSign className="h-3 w-3" />
                                +${Number(log.revenue_impact).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Badge 
                        variant={log.status === "completed" ? "default" : "destructive"}
                        className="text-xs flex-shrink-0"
                      >
                        {log.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

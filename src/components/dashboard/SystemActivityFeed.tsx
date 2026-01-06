import { motion } from "framer-motion";
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  RefreshCw,
  XCircle,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { systemEventService } from "@/services/creative-service";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SystemEvent {
  id: string;
  event_type: string;
  event_category: string;
  title: string;
  description: string | null;
  severity: string;
  created_at: string;
  resolved: boolean;
  retry_count?: number;
  max_retries?: number;
}

const categoryIcons: Record<string, typeof Activity> = {
  creative: Zap,
  automation: Send,
  platform: RefreshCw,
  learning: TrendingUp,
  error: AlertTriangle,
  scale: TrendingUp,
};

const categoryColors: Record<string, string> = {
  creative: "text-primary bg-primary/10",
  automation: "text-success bg-success/10",
  platform: "text-chart-4 bg-chart-4/10",
  learning: "text-chart-2 bg-chart-2/10",
  error: "text-destructive bg-destructive/10",
  scale: "text-success bg-success/10",
};

const severityColors: Record<string, string> = {
  info: "border-border/50",
  warning: "border-warning/30 bg-warning/5",
  error: "border-destructive/30 bg-destructive/5",
  critical: "border-destructive/50 bg-destructive/10",
};

// Demo events for when no real data exists
const demoEvents: SystemEvent[] = [
  {
    id: "1",
    event_type: "creative_scaled",
    event_category: "scale",
    title: "Creative #47 auto-scaled",
    description: "ROAS hit 4.2x threshold, budget increased 50%",
    severity: "info",
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    resolved: true,
  },
  {
    id: "2",
    event_type: "creative_killed",
    event_category: "automation",
    title: "Auto-killed 3 underperformers",
    description: "Below 40% quality threshold for 24h",
    severity: "info",
    created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    resolved: true,
  },
  {
    id: "3",
    event_type: "learning_applied",
    event_category: "learning",
    title: "New insight applied",
    description: "POV hooks now prioritized in generation",
    severity: "info",
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    resolved: true,
  },
  {
    id: "4",
    event_type: "dm_sent",
    event_category: "automation",
    title: "847 DMs triggered",
    description: "From comment automation in last hour",
    severity: "info",
    created_at: new Date(Date.now() - 23 * 60000).toISOString(),
    resolved: true,
  },
  {
    id: "5",
    event_type: "regeneration",
    event_category: "creative",
    title: "5 creatives regenerated",
    description: "Quality below threshold, silently regenerated",
    severity: "info",
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    resolved: true,
  },
];

export const SystemActivityFeed = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SystemEvent[]>(demoEvents);
  const [isLoading, setIsLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    actionsToday: 1247,
    successRate: 99.8,
    pendingRetry: 0,
  });

  const fetchEvents = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const data = await systemEventService.fetchRecentEvents(user.id, 10);
      if (data && data.length > 0) {
        setEvents(data as SystemEvent[]);
        
        // Calculate real stats
        const pending = (data as SystemEvent[]).filter(e => !e.resolved).length;
        setStats(prev => ({ ...prev, pendingRetry: pending }));
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleRetry = async (eventId: string) => {
    if (!user || eventId.length < 10) {
      toast.info("This is demo data");
      return;
    }

    setRetryingId(eventId);

    try {
      const success = await systemEventService.retryFailedEvent(eventId);
      
      if (success) {
        toast.success("Retry initiated");
        // Update local state
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, retry_count: (e.retry_count || 0) + 1 } : e
        ));
      } else {
        // Mark as resolved if max retries exceeded
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, resolved: true } : e
        ));
        toast.info("Max retries reached, marked as resolved");
      }
    } catch (error) {
      console.error("Retry error:", error);
      toast.error("Failed to retry");
    } finally {
      setRetryingId(null);
    }
  };

  const handleResolve = async (eventId: string) => {
    if (!user || eventId.length < 10) {
      toast.info("This is demo data");
      return;
    }

    try {
      await supabase
        .from("system_events")
        .update({ resolved: true })
        .eq("id", eventId);

      setEvents(prev => prev.map(e => 
        e.id === eventId ? { ...e, resolved: true } : e
      ));
      
      toast.success("Event resolved");
    } catch (error) {
      console.error("Resolve error:", error);
      toast.error("Failed to resolve");
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-6 flex items-center justify-center min-h-[300px]"
      >
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-chart-4/20 to-chart-2/20">
              <Activity className="w-5 h-5 text-chart-4" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">System Activity</h3>
            <p className="text-muted-foreground text-sm">Real-time automation events</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 border border-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-success font-medium">LIVE</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
        {events.map((event, index) => {
          const Icon = categoryIcons[event.event_category] || Activity;
          const colorClass = categoryColors[event.event_category] || "text-muted-foreground bg-secondary";
          const severityClass = severityColors[event.severity] || severityColors.info;
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${severityClass} transition-all hover:border-primary/30`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatTime(event.created_at)}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {event.description}
                    </p>
                  )}
                </div>
                {!event.resolved && (
                  <div className="flex items-center gap-1">
                    {retryingId === event.id ? (
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    ) : (
                      <>
                        <button 
                          onClick={() => handleRetry(event.id)}
                          className="p-1 rounded-lg hover:bg-warning/20 transition-colors"
                          title="Retry"
                        >
                          <RefreshCw className="w-3 h-3 text-warning" />
                        </button>
                        <button 
                          onClick={() => handleResolve(event.id)}
                          className="p-1 rounded-lg hover:bg-success/20 transition-colors"
                          title="Mark Resolved"
                        >
                          <CheckCircle2 className="w-3 h-3 text-success" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-lg font-display font-bold text-foreground">{stats.actionsToday.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Actions Today</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-display font-bold text-success">{stats.successRate}%</p>
          <p className="text-[10px] text-muted-foreground">Success Rate</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-display font-bold ${stats.pendingRetry > 0 ? "text-warning" : "text-primary"}`}>
            {stats.pendingRetry}
          </p>
          <p className="text-[10px] text-muted-foreground">Pending Retry</p>
        </div>
      </div>
    </motion.div>
  );
};

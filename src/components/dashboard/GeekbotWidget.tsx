import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  RefreshCw,
  ExternalLink,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface StandupReport {
  id: string;
  member_name: string;
  standup_name: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
  created_at: string;
  has_blockers: boolean;
}

interface TeamInsight {
  totalReports: number;
  blockerCount: number;
  activeMembers: number;
  lastSyncTime: string | null;
}

export const GeekbotWidget = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<StandupReport[]>([]);
  const [insights, setInsights] = useState<TeamInsight>({
    totalReports: 0,
    blockerCount: 0,
    activeMembers: 0,
    lastSyncTime: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent geekbot reports from the database
      const { data, error } = await supabase
        .from('geekbot_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      if (data) {
        const formattedReports = data.map(report => ({
          id: report.id,
          member_name: report.member_name,
          standup_name: report.standup_name,
          questions: report.questions as Array<{ question: string; answer: string }>,
          created_at: report.created_at,
          has_blockers: report.has_blockers || false
        }));
        
        setReports(formattedReports);
        
        // Calculate insights
        const blockers = formattedReports.filter(r => r.has_blockers).length;
        const uniqueMembers = new Set(formattedReports.map(r => r.member_name)).size;
        
        setInsights({
          totalReports: data.length,
          blockerCount: blockers,
          activeMembers: uniqueMembers,
          lastSyncTime: data[0]?.synced_at || null
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to sync");
        return;
      }

      const response = await supabase.functions.invoke('geekbot-sync/sync', {
        body: { days: 1 }
      });

      if (response.error) {
        throw response.error;
      }

      toast.success("Geekbot sync complete!");
      await fetchReports();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error("Failed to sync. Check your API key in Settings.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Team Standups</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="gap-1"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <MessageSquare className="w-3 h-3" />
                <span className="text-xs">Reports</span>
              </div>
              <p className="text-lg font-bold">{insights.totalReports}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Users className="w-3 h-3" />
                <span className="text-xs">Members</span>
              </div>
              <p className="text-lg font-bold">{insights.activeMembers}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="flex items-center justify-center gap-1 text-destructive mb-1">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs">Blockers</span>
              </div>
              <p className="text-lg font-bold text-destructive">{insights.blockerCount}</p>
            </div>
          </div>

          {/* Recent Reports */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No standup reports yet</p>
              <p className="text-xs">Configure Geekbot in Settings to sync</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                          {report.member_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{report.member_name}</p>
                          <p className="text-xs text-muted-foreground">{report.standup_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.has_blockers ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Clear
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(report.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Last Sync Info */}
          {insights.lastSyncTime && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
              Last synced: {formatTimeAgo(insights.lastSyncTime)}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

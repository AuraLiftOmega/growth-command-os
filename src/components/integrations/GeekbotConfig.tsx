import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  RefreshCw, 
  Users, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface Standup {
  id: number;
  name: string;
  channel: string;
  time: string;
  timezone: string;
  questions: { id: number; text: string }[];
  users: { id: number; username: string; email: string }[];
}

interface Insights {
  memberActivity: Record<string, number>;
  blockerMentions: { member: string; text: string; date: string }[];
  completionRates: { member: string; rate: number }[];
  totalReports: number;
  uniqueMembers: number;
}

export function GeekbotConfig() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [standups, setStandups] = useState<Standup[]>([]);
  const [selectedStandup, setSelectedStandup] = useState<string>('');
  const [insights, setInsights] = useState<Insights | null>(null);
  const [autoSync, setAutoSync] = useState(false);
  const [syncDays, setSyncDays] = useState('7');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchStandups();
  }, []);

  const fetchStandups = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('geekbot-sync/standups');
      
      if (error) throw error;
      
      if (data?.standups) {
        setStandups(data.standups);
        setIsConnected(true);
        if (data.standups.length > 0 && !selectedStandup) {
          setSelectedStandup(data.standups[0].id.toString());
        }
      }
    } catch (error: any) {
      console.error('Error fetching standups:', error);
      setIsConnected(false);
      if (!error.message?.includes('not configured')) {
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to Geekbot. Check your API key.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInsights = async () => {
    if (!selectedStandup) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        `geekbot-sync/insights?standup_id=${selectedStandup}&days=${syncDays}`
      );
      
      if (error) throw error;
      
      if (data?.insights) {
        setInsights(data.insights);
      }
    } catch (error: any) {
      console.error('Error fetching insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch insights.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('geekbot-sync/sync', {
        body: {
          standup_id: selectedStandup ? parseInt(selectedStandup) : undefined,
          days: parseInt(syncDays),
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Sync Complete',
        description: `Synced ${data.synced} reports from Geekbot.`,
      });

      if (data.insights) {
        setInsights(data.insights);
      }
    } catch (error: any) {
      console.error('Error syncing:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync with Geekbot.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const selectedStandupData = standups.find(s => s.id.toString() === selectedStandup);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Geekbot Integration</CardTitle>
              <CardDescription>Sync standup reports and team updates</CardDescription>
            </div>
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Geekbot API key not configured.</p>
            <p className="text-sm mt-2">Add your API key in project settings to connect.</p>
          </div>
        ) : (
          <>
            {/* Standup Selection */}
            <div className="space-y-3">
              <Label>Select Standup</Label>
              <Select value={selectedStandup} onValueChange={setSelectedStandup}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a standup..." />
                </SelectTrigger>
                <SelectContent>
                  {standups.map((standup) => (
                    <SelectItem key={standup.id} value={standup.id.toString()}>
                      {standup.name} ({standup.channel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Standup Info */}
            {selectedStandupData && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStandupData.time} ({selectedStandupData.timezone})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStandupData.users.length} members</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Questions:</strong>
                  <ul className="mt-1 space-y-1">
                    {selectedStandupData.questions.slice(0, 3).map((q) => (
                      <li key={q.id} className="truncate">• {q.text}</li>
                    ))}
                    {selectedStandupData.questions.length > 3 && (
                      <li className="text-muted-foreground">
                        +{selectedStandupData.questions.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <Separator />

            {/* Sync Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sync Period</Label>
                  <p className="text-sm text-muted-foreground">How far back to sync reports</p>
                </div>
                <Select value={syncDays} onValueChange={setSyncDays}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Sync</Label>
                  <p className="text-sm text-muted-foreground">Automatically sync new reports</p>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSync} 
                disabled={isSyncing || !selectedStandup}
                className="flex-1"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchInsights}
                disabled={isLoading || !selectedStandup}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Get Insights
              </Button>
            </div>

            {/* Insights Display */}
            {insights && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Team Insights
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">{insights.totalReports}</div>
                      <div className="text-sm text-muted-foreground">Total Reports</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold">{insights.uniqueMembers}</div>
                      <div className="text-sm text-muted-foreground">Active Members</div>
                    </div>
                  </div>

                  {/* Completion Rates */}
                  {insights.completionRates.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Completion Rates</Label>
                      <div className="space-y-2">
                        {insights.completionRates.slice(0, 5).map((item) => (
                          <div key={item.member} className="flex items-center justify-between text-sm">
                            <span className="truncate">{item.member}</span>
                            <Badge variant={item.rate >= 80 ? 'default' : item.rate >= 50 ? 'secondary' : 'destructive'}>
                              {item.rate}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blockers */}
                  {insights.blockerMentions.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        Recent Blockers ({insights.blockerMentions.length})
                      </Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {insights.blockerMentions.slice(0, 5).map((blocker, i) => (
                          <div key={i} className="bg-destructive/10 rounded-lg p-2 text-sm">
                            <div className="font-medium">{blocker.member}</div>
                            <div className="text-muted-foreground truncate">{blocker.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.blockerMentions.length === 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      No blockers reported in this period
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

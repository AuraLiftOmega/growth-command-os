import { useEffect, useState } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign, Users, FolderKanban, Zap, Brain, Plus,
  TrendingUp, AlertCircle, CheckCircle, Clock, ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardMetrics {
  totalProjects: number;
  totalContacts: number;
  totalAutomations: number;
  recentRuns: number;
  failedRuns: number;
  suggestions: number;
}

export function CommandDashboard() {
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0, totalContacts: 0, totalAutomations: 0,
    recentRuns: 0, failedRuns: 0, suggestions: 0,
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [topSuggestions, setTopSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (!currentOrg) return;
    const orgId = currentOrg.id;

    const fetchAll = async () => {
      const [projects, automations, runs, failedRuns, suggestions, events] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('master_automations').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('automation_runs').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('automation_runs').select('id', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'failed'),
        supabase.from('brain_suggestions').select('*').eq('organization_id', orgId).eq('status', 'pending').limit(3),
        supabase.from('master_events').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(10),
      ]);

      setMetrics({
        totalProjects: projects.count || 0,
        totalContacts: 0,
        totalAutomations: automations.count || 0,
        recentRuns: runs.count || 0,
        failedRuns: failedRuns.count || 0,
        suggestions: suggestions.data?.length || 0,
      });
      setTopSuggestions(suggestions.data || []);
      setRecentEvents(events.data || []);
    };
    fetchAll();
  }, [currentOrg]);

  const statCards = [
    { label: 'Projects', value: metrics.totalProjects, icon: FolderKanban, color: 'text-blue-500' },
    { label: 'Automations', value: metrics.totalAutomations, icon: Zap, color: 'text-amber-500' },
    { label: 'Total Runs', value: metrics.recentRuns, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Failed Runs', value: metrics.failedRuns, icon: AlertCircle, color: 'text-red-500' },
  ];

  const quickActions = [
    { label: 'New Project', icon: Plus, action: () => navigate('/projects') },
    { label: 'New Experience', icon: Plus, action: () => navigate('/experiences/new') },
    { label: 'Run Automation', icon: Zap, action: () => navigate('/automations') },
    { label: 'Invite User', icon: Users, action: () => navigate('/admin/users') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Cockpit</h1>
          <p className="text-muted-foreground text-sm">
            {currentOrg?.name || 'Loading...'} — everything at a glance
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map(qa => (
          <Button key={qa.label} variant="outline" size="sm" onClick={qa.action} className="gap-2">
            <qa.icon className="w-3 h-3" />
            {qa.label}
          </Button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={`w-8 h-8 ${card.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Brain Suggestions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Performance Brain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSuggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No suggestions yet. Keep building!</p>
            ) : (
              topSuggestions.map(s => (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                  </div>
                  <Badge variant={s.impact === 'high' ? 'destructive' : 'secondary'} className="text-[9px]">
                    {s.impact}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              recentEvents.map(evt => (
                <div key={evt.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{evt.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(evt.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

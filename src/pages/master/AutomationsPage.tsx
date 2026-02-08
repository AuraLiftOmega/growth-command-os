import { useEffect, useState } from 'react';
import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Zap, Play, Plus, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AutomationsPage() {
  const { currentOrg, canOperate } = useOrganization();
  const { user } = useAuth();
  const [automations, setAutomations] = useState<any[]>([]);
  const [runs, setRuns] = useState<Record<string, any[]>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'n8n', external_id: '', endpoint_url: '' });
  const [triggering, setTriggering] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrg) return;
    supabase
      .from('master_automations')
      .select('*')
      .eq('organization_id', currentOrg.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAutomations(data || []);
        // Fetch last 3 runs for each automation
        data?.forEach(async (a) => {
          const { data: runData } = await supabase
            .from('automation_runs')
            .select('*')
            .eq('automation_id', a.id)
            .order('created_at', { ascending: false })
            .limit(3);
          if (runData) setRuns(prev => ({ ...prev, [a.id]: runData }));
        });
      });
  }, [currentOrg]);

  const handleCreate = async () => {
    if (!currentOrg || !form.name.trim()) return;
    const { data } = await supabase
      .from('master_automations')
      .insert({
        organization_id: currentOrg.id,
        name: form.name.trim(),
        type: form.type,
        external_id: form.external_id || null,
        endpoint_url: form.endpoint_url || null,
        created_by: user?.id,
      })
      .select()
      .single();
    if (data) {
      setAutomations(prev => [data, ...prev]);
      setShowCreate(false);
      setForm({ name: '', type: 'n8n', external_id: '', endpoint_url: '' });
    }
  };

  const triggerAutomation = async (automation: any) => {
    if (!currentOrg || !user) return;
    setTriggering(automation.id);
    try {
      // Create the run record
      const { data: run } = await supabase
        .from('automation_runs')
        .insert({
          automation_id: automation.id,
          organization_id: currentOrg.id,
          triggered_by: user.id,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Call the edge function to trigger the actual n8n/python job
      const { data: result, error } = await supabase.functions.invoke('trigger-automation', {
        body: {
          automation_id: automation.id,
          run_id: run?.id,
          type: automation.type,
          external_id: automation.external_id,
          endpoint_url: automation.endpoint_url,
          payload: {},
        },
      });

      if (error) throw error;
      toast.success(`${automation.name} triggered successfully`);
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setTriggering(null);
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="w-3 h-3 text-green-500" />;
    if (status === 'failed') return <XCircle className="w-3 h-3 text-red-500" />;
    if (status === 'running') return <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />;
    return <Clock className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <MasterOSLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Automations</h1>
          {canOperate && (
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="w-4 h-4" /> New Automation
            </Button>
          )}
        </div>

        {automations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap className="w-12 h-12 mx-auto text-muted-foreground/40" />
              <p className="mt-3 text-muted-foreground">No automations configured. Wire up n8n or Python!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {automations.map(a => (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      {a.name}
                      <Badge variant="outline" className="text-[9px]">{a.type}</Badge>
                      <Badge variant={a.status === 'active' ? 'default' : 'secondary'} className="text-[9px]">
                        {a.status}
                      </Badge>
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => triggerAutomation(a)}
                      disabled={triggering === a.id}
                      className="gap-1"
                    >
                      {triggering === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      Run
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {a.external_id && <p className="text-xs text-muted-foreground">ID: {a.external_id}</p>}
                  {runs[a.id]?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Recent runs:</p>
                      {runs[a.id].map(r => (
                        <div key={r.id} className="flex items-center gap-2 text-xs">
                          {statusIcon(r.status)}
                          <span>{r.status}</span>
                          <span className="text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                          </span>
                          {r.duration_ms && <span className="text-muted-foreground">{r.duration_ms}ms</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Automation</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Automation name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="n8n">n8n Workflow</SelectItem>
                  <SelectItem value="python">Python Worker</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="External ID / Workflow ID" value={form.external_id} onChange={e => setForm(f => ({ ...f, external_id: e.target.value }))} />
              <Input placeholder="Endpoint URL (optional override)" value={form.endpoint_url} onChange={e => setForm(f => ({ ...f, endpoint_url: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!form.name.trim()}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MasterOSLayout>
  );
}

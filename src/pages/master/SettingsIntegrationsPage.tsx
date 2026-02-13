import { useEffect, useState } from 'react';
import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layers, Zap, Code, Mail, CreditCard, MessageSquare, Database, Save, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IntegrationConfig {
  service_key: string;
  service_name: string;
  base_url: string;
  status: string;
  last_tested_at: string | null;
  icon: any;
  editable: boolean;
  placeholder: string;
}

const SERVICES: IntegrationConfig[] = [
  { service_key: 'supabase', service_name: 'Supabase (Backend)', base_url: '', status: 'connected', last_tested_at: null, icon: Database, editable: false, placeholder: 'Auto-configured' },
  { service_key: 'n8n', service_name: 'n8n (Workflow Automation)', base_url: '', status: 'disconnected', last_tested_at: null, icon: Zap, editable: true, placeholder: 'https://your-instance.app.n8n.cloud' },
  { service_key: 'python_worker', service_name: 'Python Worker', base_url: '', status: 'disconnected', last_tested_at: null, icon: Code, editable: true, placeholder: 'https://your-python-worker.example.com' },
  { service_key: 'stripe', service_name: 'Stripe', base_url: '', status: 'connected', last_tested_at: null, icon: CreditCard, editable: false, placeholder: 'Managed via secrets' },
  { service_key: 'resend', service_name: 'Email (Resend)', base_url: '', status: 'connected', last_tested_at: null, icon: Mail, editable: false, placeholder: 'Managed via secrets' },
  { service_key: 'slack', service_name: 'Slack', base_url: '', status: 'configured', last_tested_at: null, icon: MessageSquare, editable: false, placeholder: 'Managed via secrets' },
];

export default function SettingsIntegrationsPage() {
  const [configs, setConfigs] = useState<IntegrationConfig[]>(SERVICES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('user_id', user.id);

      setConfigs(prev => prev.map(svc => {
        const saved = data?.find((d: any) => d.service_key === svc.service_key);
        if (saved) {
          return { ...svc, base_url: saved.base_url || '', status: saved.status || 'disconnected', last_tested_at: saved.last_tested_at };
        }
        // Auto-set supabase
        if (svc.service_key === 'supabase') {
          return { ...svc, base_url: import.meta.env.VITE_SUPABASE_URL || '', status: 'connected' };
        }
        return svc;
      }));
    } catch (err) {
      console.error('Failed to load configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUrl = (key: string, url: string) => {
    setConfigs(prev => prev.map(s => s.service_key === key ? { ...s, base_url: url } : s));
  };

  const saveConfig = async (svc: IntegrationConfig) => {
    setSaving(svc.service_key);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const status = svc.base_url?.trim() ? 'configured' : 'disconnected';

      const { error } = await supabase
        .from('integration_configs')
        .upsert({
          user_id: user.id,
          service_key: svc.service_key,
          service_name: svc.service_name,
          base_url: svc.base_url?.trim() || null,
          status,
        }, { onConflict: 'user_id,service_key' });

      if (error) throw error;

      setConfigs(prev => prev.map(s => s.service_key === svc.service_key ? { ...s, status } : s));
      toast.success(`${svc.service_name} URL saved`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(null);
    }
  };

  const testConnection = async (svc: IntegrationConfig) => {
    if (!svc.base_url?.trim()) { toast.error('Enter a URL first'); return; }
    setTesting(svc.service_key);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const resp = await fetch(svc.base_url.trim(), { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
      clearTimeout(timeout);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('integration_configs').upsert({
          user_id: user.id, service_key: svc.service_key, service_name: svc.service_name,
          base_url: svc.base_url.trim(), status: 'connected', last_tested_at: new Date().toISOString(),
        }, { onConflict: 'user_id,service_key' });
      }

      setConfigs(prev => prev.map(s => s.service_key === svc.service_key ? { ...s, status: 'connected', last_tested_at: new Date().toISOString() } : s));
      toast.success(`${svc.service_name} reachable ✓`);
    } catch {
      setConfigs(prev => prev.map(s => s.service_key === svc.service_key ? { ...s, status: 'unreachable' } : s));
      toast.error(`Cannot reach ${svc.service_name} — check URL`);
    } finally {
      setTesting(null);
    }
  };

  const statusColor = (s: string) => {
    if (s === 'connected') return 'default';
    if (s === 'configured') return 'secondary';
    return 'destructive';
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'connected') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'configured') return <CheckCircle2 className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <MasterOSLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="w-6 h-6" /> Integrations
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your service endpoints. n8n and Python Worker URLs are editable — save and test connectivity in real time.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-3">
            {configs.map(svc => (
              <Card key={svc.service_key}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <svc.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{svc.service_name}</p>
                      {svc.last_tested_at && (
                        <p className="text-[10px] text-muted-foreground">
                          Last tested: {new Date(svc.last_tested_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={svc.status} />
                      <Badge variant={statusColor(svc.status) as any} className="text-[10px]">
                        {svc.status}
                      </Badge>
                    </div>
                  </div>

                  {svc.editable ? (
                    <div className="space-y-2">
                      <Label className="text-xs">Base URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={svc.base_url}
                          onChange={e => updateUrl(svc.service_key, e.target.value)}
                          placeholder={svc.placeholder}
                          className="text-xs h-8"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 shrink-0"
                          disabled={saving === svc.service_key}
                          onClick={() => saveConfig(svc)}
                        >
                          {saving === svc.service_key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 shrink-0"
                          disabled={testing === svc.service_key || !svc.base_url?.trim()}
                          onClick={() => testConnection(svc)}
                        >
                          {testing === svc.service_key ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground pl-[52px]">
                      {svc.service_key === 'supabase' ? svc.base_url : svc.placeholder}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MasterOSLayout>
  );
}

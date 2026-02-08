import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Zap, Code, Mail, CreditCard, MessageSquare } from 'lucide-react';

const integrations = [
  { name: 'Stripe', icon: CreditCard, status: 'connected', desc: 'Payment processing & subscriptions' },
  { name: 'n8n', icon: Zap, status: 'configure', desc: 'Workflow automation engine — set base URL in env' },
  { name: 'Python Worker', icon: Code, status: 'configure', desc: 'Custom processing jobs — set base URL in env' },
  { name: 'Email (Resend)', icon: Mail, status: 'connected', desc: 'Transactional emails' },
  { name: 'Slack', icon: MessageSquare, status: 'configured', desc: 'Team notifications' },
];

export default function SettingsIntegrationsPage() {
  return (
    <MasterOSLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="w-6 h-6" /> Integrations
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect external services. API keys and URLs are managed via environment secrets.
        </p>

        <div className="space-y-3">
          {integrations.map(int => (
            <Card key={int.name}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <int.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{int.name}</p>
                  <p className="text-xs text-muted-foreground">{int.desc}</p>
                </div>
                <Badge variant={int.status === 'connected' ? 'default' : 'secondary'} className="text-[10px]">
                  {int.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MasterOSLayout>
  );
}

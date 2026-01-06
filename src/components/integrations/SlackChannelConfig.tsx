import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Hash,
  Bell,
  TrendingUp,
  Users,
  AlertTriangle,
  TestTube,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChannelConfig {
  enabled: boolean;
  channel: string;
}

interface NotificationChannels {
  ab_test_results: ChannelConfig;
  new_leads: ChannelConfig;
  revenue_milestones: ChannelConfig;
  creative_performance: ChannelConfig;
  system_alerts: ChannelConfig;
}

const defaultChannels: NotificationChannels = {
  ab_test_results: { enabled: true, channel: '#ab-tests' },
  new_leads: { enabled: true, channel: '#leads' },
  revenue_milestones: { enabled: true, channel: '#revenue' },
  creative_performance: { enabled: false, channel: '#creatives' },
  system_alerts: { enabled: true, channel: '#alerts' },
};

const notificationTypes = [
  {
    key: 'ab_test_results' as const,
    label: 'A/B Test Results',
    description: 'Winner declarations and test milestones',
    icon: TestTube,
  },
  {
    key: 'new_leads' as const,
    label: 'New Leads',
    description: 'Lead capture notifications',
    icon: Users,
  },
  {
    key: 'revenue_milestones' as const,
    label: 'Revenue Milestones',
    description: 'Revenue goals and achievements',
    icon: TrendingUp,
  },
  {
    key: 'creative_performance' as const,
    label: 'Creative Performance',
    description: 'Performance alerts for ads',
    icon: Bell,
  },
  {
    key: 'system_alerts' as const,
    label: 'System Alerts',
    description: 'Critical system notifications',
    icon: AlertTriangle,
  },
];

export const SlackChannelConfig = () => {
  const { toast } = useToast();
  const [channels, setChannels] = useState<NotificationChannels>(defaultChannels);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadChannelConfig();
  }, []);

  const loadChannelConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ab_test_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading channel config:', error);
        return;
      }

      if (data) {
        // Parse slack_webhook_url as JSON config if it contains channel settings
        try {
          const savedChannels = data.slack_webhook_url 
            ? JSON.parse(data.slack_webhook_url) 
            : null;
          if (savedChannels && typeof savedChannels === 'object') {
            setChannels({ ...defaultChannels, ...savedChannels });
          }
        } catch {
          // Not JSON, use defaults
        }
      }
    } catch (err) {
      console.error('Failed to load channel config:', err);
    }
  };

  const handleToggle = (key: keyof NotificationChannels) => {
    setChannels(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
    setHasChanges(true);
  };

  const handleChannelChange = (key: keyof NotificationChannels, channel: string) => {
    setChannels(prev => ({
      ...prev,
      [key]: { ...prev[key], channel },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Not Authenticated',
          description: 'Please log in to save settings',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('ab_test_notification_settings')
        .upsert({
          user_id: user.id,
          slack_enabled: Object.values(channels).some(c => c.enabled),
          slack_webhook_url: JSON.stringify(channels),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setHasChanges(false);
      toast({
        title: 'Settings Saved',
        description: 'Slack notification channels updated successfully.',
      });
    } catch (err) {
      console.error('Error saving channel config:', err);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Hash className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>
                  Configure which Slack channels receive different notifications
                </CardDescription>
              </div>
            </div>
            {hasChanges && (
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type) => {
            const config = channels[type.key];
            const Icon = type.icon;
            
            return (
              <div
                key={type.key}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  config.enabled
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/50 bg-muted/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  config.enabled ? 'bg-primary/20' : 'bg-muted/50'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    config.enabled ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">{type.label}</Label>
                    {config.enabled && (
                      <Check className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-40">
                    <Input
                      placeholder="#channel"
                      value={config.channel}
                      onChange={(e) => handleChannelChange(type.key, e.target.value)}
                      disabled={!config.enabled}
                      className="h-9 text-sm"
                    />
                  </div>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={() => handleToggle(type.key)}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Use channel names like <code>#alerts</code> or channel IDs like <code>C0XXXXXXXXX</code>.
              Make sure the Slack app is invited to each channel.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SlackChannelConfig;

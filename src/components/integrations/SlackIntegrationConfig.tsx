import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Check, 
  Copy, 
  Shield,
  Hash,
  Calendar,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SlackConfig {
  appId: string;
  appCreationDate: string;
  clientId: string;
}

export const SlackIntegrationConfig = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SlackConfig>({
    appId: '',
    appCreationDate: '',
    clientId: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleInputChange = (field: keyof SlackConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSave = async () => {
    if (!config.appId || !config.clientId) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in App ID and Client ID",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not Authenticated",
          description: "Please log in to save Slack configuration",
          variant: "destructive",
        });
        return;
      }

      // Store only non-sensitive configuration in database
      const { error } = await supabase
        .from('revenue_engine_config')
        .upsert({
          user_id: user.id,
          connected_integrations: ['slack'],
          industry_config: {
            slack: {
              app_id: config.appId,
              app_creation_date: config.appCreationDate,
              client_id: config.clientId,
              configured: true,
            }
          },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setIsConnected(true);
      toast({
        title: "Slack Configuration Saved!",
        description: "App ID and Client ID have been saved. Remember to configure secrets securely.",
      });
    } catch (error) {
      console.error('Error saving Slack config:', error);
      toast({
        title: "Error",
        description: "Failed to save Slack configuration",
        variant: "destructive",
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#4A154B]/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#E01E5A]" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Slack Integration
                {isConnected && (
                  <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Connect your Slack app for team notifications and automation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Notice */}
          <Alert className="border-primary/30 bg-primary/5">
            <Lock className="h-4 w-4" />
            <AlertTitle>Secure Secrets Storage</AlertTitle>
            <AlertDescription className="text-sm">
              <strong>Client Secret</strong>, <strong>Signing Secret</strong>, and <strong>Verification Token</strong> 
              must be stored as secure environment variables—never in the database. 
              Contact your administrator to configure these secrets securely in the backend.
            </AlertDescription>
          </Alert>

          {/* App Identification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Hash className="w-4 h-4" />
              App Identification
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appId">App ID</Label>
                <div className="relative">
                  <Input
                    id="appId"
                    placeholder="A0XXXXXXXXX"
                    value={config.appId}
                    onChange={(e) => handleInputChange('appId', e.target.value)}
                    className="pr-10"
                  />
                  {config.appId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => copyToClipboard(config.appId, 'App ID')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appCreationDate" className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Date of App Creation
                </Label>
                <Input
                  id="appCreationDate"
                  type="date"
                  value={config.appCreationDate}
                  onChange={(e) => handleInputChange('appCreationDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <p className="text-xs text-muted-foreground">
                Public identifier for your Slack app (safe to store).
              </p>
              <div className="relative">
                <Input
                  id="clientId"
                  placeholder="1234567890.1234567890"
                  value={config.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                  className="pr-10"
                />
                {config.clientId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => copyToClipboard(config.clientId, 'Client ID')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Secrets Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="w-4 h-4" />
              Secure Secrets (Server-Side Only)
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">The following secrets must be configured securely:</p>
                  <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                    <li><strong>SLACK_CLIENT_SECRET</strong> - Required for OAuth token exchange</li>
                    <li><strong>SLACK_SIGNING_SECRET</strong> - Verifies requests from Slack</li>
                    <li><strong>SLACK_VERIFICATION_TOKEN</strong> - Legacy verification (if needed)</li>
                  </ul>
                  <p className="mt-3 text-xs">
                    These secrets are stored securely in the backend environment and never exposed to the client.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-border/50">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Saving...' : isConnected ? 'Update Configuration' : 'Save App Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SlackIntegrationConfig;

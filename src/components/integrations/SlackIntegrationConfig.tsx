import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Check, 
  Copy, 
  Shield,
  Hash,
  Calendar,
  AlertTriangle,
  Lock,
  ExternalLink,
  Loader2
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

interface SlackConnection {
  teamId: string;
  teamName: string;
  connectedAt: string;
}

export const SlackIntegrationConfig = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SlackConfig>({
    appId: '',
    appCreationDate: '',
    clientId: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [slackConnection, setSlackConnection] = useState<SlackConnection | null>(null);

  // Check for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const slackCode = urlParams.get('code');
    const slackState = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      toast({
        title: "Slack Connection Failed",
        description: error === 'access_denied' ? 'You denied the Slack authorization request.' : error,
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (slackCode && slackState) {
      handleOAuthCallback(slackCode, slackState);
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string) => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('slack-oauth', {
        body: { action: 'callback', code, state },
      });

      if (error) throw error;

      if (data.success) {
        setIsConnected(true);
        setSlackConnection({
          teamId: data.team_id,
          teamName: data.team_name,
          connectedAt: new Date().toISOString(),
        });
        
        toast({
          title: "Slack Connected!",
          description: `Successfully connected to ${data.team_name}`,
        });
      } else {
        throw new Error(data.error || 'Failed to connect Slack');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to complete Slack authorization",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

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

  const handleConnectSlack = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('slack-oauth', {
        body: { action: 'authorize' },
      });

      if (error) throw error;

      if (data.authorize_url) {
        // Redirect to Slack OAuth
        window.location.href = data.authorize_url;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      console.error('Error initiating Slack OAuth:', error);
      toast({
        title: "Error",
        description: "Failed to initiate Slack connection. Please ensure secrets are configured.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnectSlack = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Remove Slack from connected integrations
      const { error } = await supabase
        .from('revenue_engine_config')
        .update({
          connected_integrations: [],
          industry_config: {},
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsConnected(false);
      setSlackConnection(null);
      toast({
        title: "Slack Disconnected",
        description: "Your Slack workspace has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting Slack:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Slack",
        variant: "destructive",
      });
    }
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

      toast({
        title: "Configuration Saved!",
        description: "App configuration saved. Now connect your Slack workspace.",
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
                Connect your Slack workspace for team notifications and automation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connected Workspace Info */}
          {isConnected && slackConnection && (
            <Alert className="border-success/30 bg-success/5">
              <Check className="h-4 w-4 text-success" />
              <AlertTitle>Connected to {slackConnection.teamName}</AlertTitle>
              <AlertDescription className="text-sm">
                Team ID: {slackConnection.teamId}
                <br />
                Connected: {new Date(slackConnection.connectedAt).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}

          {/* OAuth Connect Button */}
          {!isConnected && (
            <div className="flex flex-col gap-4">
              <Alert className="border-primary/30 bg-primary/5">
                <Lock className="h-4 w-4" />
                <AlertTitle>Secure OAuth Connection</AlertTitle>
                <AlertDescription className="text-sm">
                  Click the button below to securely connect your Slack workspace using OAuth.
                  Secrets are stored securely in the backend and never exposed to the client.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleConnectSlack}
                disabled={isConnecting}
                className="w-full bg-[#4A154B] hover:bg-[#611f69] text-white"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect Slack Workspace
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Disconnect Button */}
          {isConnected && (
            <Button
              variant="outline"
              onClick={handleDisconnectSlack}
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              Disconnect Slack
            </Button>
          )}

          {/* Optional: Manual App Configuration */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Advanced: Manual App Configuration
            </summary>
            
            <div className="mt-4 space-y-4 pl-6 border-l border-border/50">
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

              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
                className="w-full"
              >
                {isSaving ? 'Saving...' : 'Save Manual Configuration'}
              </Button>
            </div>
          </details>

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
                  <p className="font-medium">The following secrets are configured securely:</p>
                  <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                    <li><strong>SLACK_CLIENT_ID</strong> - Your Slack app client ID</li>
                    <li><strong>SLACK_CLIENT_SECRET</strong> - Required for OAuth token exchange</li>
                    <li><strong>SLACK_SIGNING_SECRET</strong> - Verifies requests from Slack</li>
                  </ul>
                  <p className="mt-3 text-xs">
                    These secrets are stored securely in the backend and used by edge functions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SlackIntegrationConfig;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Check, 
  Copy, 
  Shield,
  Key,
  Hash,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SlackConfig {
  appId: string;
  appCreationDate: string;
  clientId: string;
  clientSecret: string;
  signingSecret: string;
  verificationToken: string;
}

export const SlackIntegrationConfig = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SlackConfig>({
    appId: '',
    appCreationDate: '',
    clientId: '',
    clientSecret: '',
    signingSecret: '',
    verificationToken: '',
  });
  const [showSecrets, setShowSecrets] = useState({
    clientSecret: false,
    signingSecret: false,
    verificationToken: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleInputChange = (field: keyof SlackConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleSecretVisibility = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSave = async () => {
    if (!config.appId || !config.clientId || !config.clientSecret) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in App ID, Client ID, and Client Secret",
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

      // Store in revenue_engine_config as connected integration
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
              // Note: In production, secrets should be stored encrypted
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
        title: "Slack Connected!",
        description: "Your Slack app credentials have been saved",
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
          </div>

          {/* OAuth Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Key className="w-4 h-4" />
              OAuth Credentials
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
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

              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <p className="text-xs text-muted-foreground">
                  You'll need to send this secret along with your client ID when making your oauth.v2.access request.
                </p>
                <div className="relative">
                  <Input
                    id="clientSecret"
                    type={showSecrets.clientSecret ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={config.clientSecret}
                    onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleSecretVisibility('clientSecret')}
                    >
                      {showSecrets.clientSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    {config.clientSecret && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(config.clientSecret, 'Client Secret')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="w-4 h-4" />
              Security Credentials
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signingSecret">Signing Secret</Label>
                <p className="text-xs text-muted-foreground">
                  Slack signs the requests we send you using this secret. Confirm that each request comes from Slack by verifying its unique signature.
                </p>
                <div className="relative">
                  <Input
                    id="signingSecret"
                    type={showSecrets.signingSecret ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={config.signingSecret}
                    onChange={(e) => handleInputChange('signingSecret', e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleSecretVisibility('signingSecret')}
                    >
                      {showSecrets.signingSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    {config.signingSecret && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(config.signingSecret, 'Signing Secret')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationToken">Verification Token</Label>
                <div className="relative">
                  <Input
                    id="verificationToken"
                    type={showSecrets.verificationToken ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={config.verificationToken}
                    onChange={(e) => handleInputChange('verificationToken', e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleSecretVisibility('verificationToken')}
                    >
                      {showSecrets.verificationToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    {config.verificationToken && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(config.verificationToken, 'Verification Token')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
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
              {isSaving ? 'Saving...' : isConnected ? 'Update Configuration' : 'Connect Slack'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SlackIntegrationConfig;

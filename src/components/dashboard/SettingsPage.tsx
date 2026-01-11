/**
 * SETTINGS PAGE - Dashboard settings with test mode, sync status, and integrations
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  CreditCard,
  Bell,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PLATFORM_CONFIG, DOMINION_LOGO_URL } from '@/lib/store-config';
import { useActiveStore } from '@/hooks/useActiveStore';

interface IntegrationStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync?: string;
}

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { activeStore, hasConnectedStores } = useActiveStore();
  const [testMode, setTestMode] = useState(false);
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  useEffect(() => {
    // Load settings from localStorage
    const savedTestMode = localStorage.getItem('dominion_test_mode') === 'true';
    const savedAutoMode = localStorage.getItem('dominion_autonomous_mode') === 'true';
    setTestMode(savedTestMode);
    setAutonomousMode(savedAutoMode);

    // Check integration statuses
    checkIntegrations();
  }, [user]);

  const checkIntegrations = async () => {
    if (!user) return;

    const integrationList: IntegrationStatus[] = [
      { name: 'Shopify', status: 'connected', lastSync: new Date().toISOString() },
      { name: 'HeyGen', status: 'connected' },
      { name: 'ElevenLabs', status: 'connected' },
      { name: 'ClickUp', status: 'connected' },
      { name: 'n8n', status: 'connected' },
      { name: 'TikTok', status: 'pending' },
      { name: 'Pinterest', status: 'pending' },
      { name: 'Stripe', status: 'connected' },
    ];

    // Check social tokens
    const { data: tokens } = await supabase
      .from('social_tokens')
      .select('channel, is_connected')
      .eq('user_id', user.id);

    if (tokens) {
      tokens.forEach(token => {
        const integration = integrationList.find(i => 
          i.name.toLowerCase() === token.channel
        );
        if (integration) {
          integration.status = token.is_connected ? 'connected' : 'disconnected';
        }
      });
    }

    setIntegrations(integrationList);
  };

  const toggleTestMode = (enabled: boolean) => {
    setTestMode(enabled);
    localStorage.setItem('dominion_test_mode', String(enabled));
    toast.success(enabled ? '🧪 Test Mode Enabled' : '🚀 Live Mode Activated', {
      description: enabled 
        ? 'Ads will be generated without real API calls'
        : 'Full HeyGen + ElevenLabs generation active'
    });
  };

  const toggleAutonomousMode = async (enabled: boolean) => {
    setAutonomousMode(enabled);
    localStorage.setItem('dominion_autonomous_mode', String(enabled));
    
    if (enabled) {
      toast.success('🤖 Autonomous Mode Activated', {
        description: 'Omega AI will generate and post ads automatically'
      });

      // Trigger autonomous workflow
      await supabase.functions.invoke('multi-agent-swarm', {
        body: { action: 'enable_autonomous', user_id: user?.id }
      });
    } else {
      toast.info('Autonomous Mode Disabled');
    }
  };

  const forceSyncProducts = async () => {
    setIsSyncing(true);
    try {
      toast.info('Syncing products from Shopify...');
      
      // Trigger product sync
      await supabase.functions.invoke('omega-swarm-2026', {
        body: { action: 'force_sync_products' }
      });

      await checkIntegrations();
      toast.success('Products synced successfully!');
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-success/20 text-success';
      case 'disconnected': return 'bg-destructive/20 text-destructive';
      default: return 'bg-warning/20 text-warning';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your Dominion dashboard and integrations
          </p>
        </div>
        <img 
          src={DOMINION_LOGO_URL} 
          alt="Dominion" 
          className="h-10 w-auto object-contain"
        />
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Zap className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <LinkIcon className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          {/* Test Mode Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🧪 Test Mode
              </CardTitle>
              <CardDescription>
                Generate ads without using real API credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Test Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {testMode ? 'Using mock generation' : 'Using real HeyGen + ElevenLabs'}
                  </p>
                </div>
                <Switch 
                  checked={testMode} 
                  onCheckedChange={toggleTestMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Autonomous Mode Toggle */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🤖 Autonomous Mode
                <Badge variant="outline" className="animate-pulse">BETA</Badge>
              </CardTitle>
              <CardDescription>
                Let Omega AI generate and post ads automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Autonomous Posting</p>
                  <p className="text-sm text-muted-foreground">
                    {autonomousMode ? 'AI will post to TikTok/Pinterest daily' : 'Manual posting only'}
                  </p>
                </div>
                <Switch 
                  checked={autonomousMode} 
                  onCheckedChange={toggleAutonomousMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Product Sync
              </CardTitle>
              <CardDescription>
                Sync products from your connected Shopify store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {hasConnectedStores && activeStore ? activeStore.storeName : 'No Store Connected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hasConnectedStores && activeStore ? activeStore.storeDomain : 'Connect your Shopify store to sync products'}
                  </p>
                </div>
                <Button 
                  onClick={forceSyncProducts} 
                  disabled={isSyncing}
                  variant="outline"
                  className="gap-2"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {isSyncing ? 'Syncing...' : 'Force Sync'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connected Services</CardTitle>
              <CardDescription>
                Manage your platform integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div 
                    key={integration.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {integration.status === 'connected' ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : integration.status === 'pending' ? (
                        <AlertCircle className="w-5 h-5 text-warning" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        {integration.lastSync && (
                          <p className="text-xs text-muted-foreground">
                            Last sync: {new Date(integration.lastSync).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Account
              </CardTitle>
              <CardDescription>
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="text-xs font-mono text-muted-foreground">{user?.id}</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={signOut}
                className="gap-2 mt-4"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">
                      Unlimited video generation + all integrations
                    </p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">Active</Badge>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

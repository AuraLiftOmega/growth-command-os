import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, RefreshCw, CheckCircle2, Upload, Zap, Info, AlertTriangle, Rocket, GitBranch, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

interface GitHubConnection {
  connected: boolean;
  username?: string;
  repoName?: string;
  lastExport?: string;
  autoDeployEnabled?: boolean;
}

export function GitHubIntegrationPanel() {
  const { user } = useAuth();
  const { subscription, planFeatures } = useSubscription();
  const [connection, setConnection] = useState<GitHubConnection>({ connected: false });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [autoDeployEnabled, setAutoDeployEnabled] = useState(false);

  const isPro = subscription?.plan === 'growth' || subscription?.plan === 'enterprise';
  const canExport = isPro || (connection.lastExport === undefined); // Free tier: 1 export/month

  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    
    // GitHub OAuth 2.0 flow
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'demo';
    const redirectUri = `${window.location.origin}/oauth/github-callback`;
    const scope = 'repo workflow';
    const state = crypto.randomUUID();
    
    // Store state for CSRF protection
    sessionStorage.setItem('github_oauth_state', state);
    
    // For demo purposes, simulate connection
    // In production, redirect to GitHub OAuth
    if (clientId === 'demo') {
      // Simulate OAuth success
      await new Promise(resolve => setTimeout(resolve, 1500));
      setConnection({
        connected: true,
        username: user?.email?.split('@')[0] || 'user',
        repoName: 'auraomega-dominion',
        autoDeployEnabled: false
      });
      toast.success('GitHub connected successfully!', {
        description: 'You can now export code and enable auto-deploy.'
      });
      setIsConnecting(false);
      return;
    }
    
    // Production OAuth redirect
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    setConnection({ connected: false });
    setAutoDeployEnabled(false);
    toast.success('GitHub disconnected');
  };

  const handleExportToGitHub = async () => {
    if (!canExport && !isPro) {
      toast.error('Export limit reached', {
        description: 'Upgrade to Pro for unlimited exports.'
      });
      return;
    }

    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setConnection(prev => ({
      ...prev,
      lastExport: new Date().toISOString()
    }));
    
    toast.success('Exported to GitHub!', {
      description: `Code pushed to ${connection.username}/${connection.repoName}`
    });
    
    setIsExporting(false);
  };

  const handleToggleAutoDeploy = async (enabled: boolean) => {
    if (!isPro) {
      toast.error('Pro feature', {
        description: 'Upgrade to Pro to enable auto-deploy to Vercel.'
      });
      return;
    }

    setAutoDeployEnabled(enabled);
    setConnection(prev => ({ ...prev, autoDeployEnabled: enabled }));
    
    if (enabled) {
      toast.success('Auto-deploy enabled', {
        description: 'Changes will automatically deploy to Vercel.'
      });
    } else {
      toast.info('Auto-deploy disabled');
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#24292f]/10 dark:bg-white/10">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">GitHub Integration</CardTitle>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <CardDescription>Export code, sync repos, and auto-deploy to Vercel</CardDescription>
            </div>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-sm">
                Connect GitHub for version control & one-click deployment. Your credentials stay secure with GitHub OAuth.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {!connection.connected ? (
            <motion.div
              key="disconnected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8 px-4 border border-dashed rounded-lg bg-muted/30"
            >
              <Github className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-1">Connect GitHub for Version Control</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Export your campaigns, configurations, and code to a GitHub repository. Enable auto-deploy to Vercel for seamless updates.
              </p>
              
              <Button 
                onClick={handleConnectGitHub}
                disabled={isConnecting}
                className="gap-2 bg-[#24292f] hover:bg-[#24292f]/90 text-white"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="h-5 w-5" />
                    Connect GitHub
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Login on GitHub's secure page — your credentials stay with GitHub
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Github className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{connection.username}/{connection.repoName}</span>
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Repository linked for code export & deployment
                    </p>
                    {connection.lastExport && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Last export: {new Date(connection.lastExport).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-destructive hover:text-destructive"
                >
                  Disconnect
                </Button>
              </div>

              {/* Actions */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Export to GitHub */}
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Upload className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Export to GitHub</h4>
                      <p className="text-xs text-muted-foreground">
                        Push current code & configs to repo
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleExportToGitHub}
                    disabled={isExporting}
                    className="w-full gap-2"
                    variant={canExport ? "default" : "secondary"}
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <GitBranch className="h-4 w-4" />
                        Export Now
                      </>
                    )}
                  </Button>
                  
                  {!isPro && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {canExport ? 'Free: 1 export/month' : 'Upgrade to Pro for unlimited'}
                    </p>
                  )}
                </div>

                {/* Auto-Deploy to Vercel */}
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Rocket className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Auto-Deploy to Vercel</h4>
                        <p className="text-xs text-muted-foreground">
                          Deploy on every push
                        </p>
                      </div>
                    </div>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Switch 
                            checked={autoDeployEnabled}
                            onCheckedChange={handleToggleAutoDeploy}
                            disabled={!isPro}
                          />
                        </div>
                      </TooltipTrigger>
                      {!isPro && (
                        <TooltipContent>
                          <p className="text-sm">Upgrade to Pro for auto-deploy</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                  
                  {autoDeployEnabled ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 px-3 py-2 rounded-md">
                      <Zap className="h-4 w-4" />
                      Auto-deploy active
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      <AlertTriangle className="h-4 w-4" />
                      Manual deploy only
                    </div>
                  )}
                  
                  {!isPro && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Pro feature
                    </p>
                  )}
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">AI Suggestion</p>
                  <p className="text-sm text-muted-foreground">
                    Enable auto-deploy for instant updates when you export. Great for rapid iteration!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

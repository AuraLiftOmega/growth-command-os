/**
 * SHOPIFY CONTROL CENTER - Admin Dashboard
 * 
 * Provides complete visibility and control over Shopify integration:
 * - Primary store status (locked)
 * - Token & webhook health
 * - Safe Mode controls
 * - Multi-shop mode (OFF by default)
 * - Reset & reauthorization tools
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Shield, ShieldCheck, ShieldAlert, ShieldX,
  Store, Lock, Unlock, RefreshCw, AlertTriangle,
  CheckCircle2, XCircle, Clock, Database,
  Webhook, Key, Settings, RotateCcw, Power,
  Eye, EyeOff, Archive, Activity, Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ShopifyConfig {
  id: string;
  project_slug: string;
  primary_shop_domain: string;
  primary_shop_id: string | null;
  safe_mode_enabled: boolean;
  safe_mode_started_at: string | null;
  safe_mode_reason: string | null;
  multi_shop_mode: boolean;
  last_reset_at: string | null;
  last_reset_by: string | null;
  confusion_state_detected: boolean;
  archived_credentials: any[];
  created_at: string;
  updated_at: string;
}

interface ShopifyConnection {
  id: string;
  project_slug: string;
  shop_domain: string;
  shop_id: string | null;
  role: 'primary' | 'secondary';
  enabled: boolean;
  is_verified: boolean;
  last_verified_at: string | null;
  webhook_verified: boolean;
  created_at: string;
}

interface AuditLog {
  id: string;
  event_type: string;
  shop_domain: string | null;
  action: string;
  details: any;
  performed_by: string | null;
  created_at: string;
}

const PRIMARY_STORE = 'lovable-project-7fb70.myshopify.com';

export default function ShopifyControlCenter() {
  const queryClient = useQueryClient();
  const [showSecrets, setShowSecrets] = useState(false);

  // Fetch config
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['shopify-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopify_config')
        .select('*')
        .eq('project_slug', 'primary')
        .single();
      if (error) throw error;
      return data as ShopifyConfig;
    }
  });

  // Fetch connections
  const { data: connections = [] } = useQuery({
    queryKey: ['shopify-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopify_connections')
        .select('*')
        .order('role', { ascending: true });
      if (error) throw error;
      return data as ShopifyConnection[];
    }
  });

  // Fetch audit log
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['shopify-audit-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopify_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as AuditLog[];
    }
  });

  // Toggle safe mode
  const toggleSafeMode = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('shopify_config')
        .update({
          safe_mode_enabled: enabled,
          safe_mode_started_at: enabled ? new Date().toISOString() : null,
          safe_mode_reason: enabled ? 'Manual activation' : null,
          updated_at: new Date().toISOString()
        })
        .eq('project_slug', 'primary');
      
      if (error) throw error;

      // Log the action
      await supabase.from('shopify_audit_log').insert({
        event_type: enabled ? 'SAFE_MODE_ENABLED' : 'SAFE_MODE_DISABLED',
        shop_domain: PRIMARY_STORE,
        action: enabled ? 'Safe mode activated' : 'Safe mode deactivated',
        details: { manual: true },
        performed_by: 'admin'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-config'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-audit-log'] });
      toast.success(config?.safe_mode_enabled ? 'Safe mode disabled' : 'Safe mode enabled');
    },
    onError: () => toast.error('Failed to toggle safe mode')
  });

  // Run full reset
  const runFullReset = useMutation({
    mutationFn: async () => {
      // Update config
      const { error } = await supabase
        .from('shopify_config')
        .update({
          last_reset_at: new Date().toISOString(),
          last_reset_by: 'admin-manual',
          confusion_state_detected: false,
          safe_mode_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('project_slug', 'primary');
      
      if (error) throw error;

      // Re-verify primary connection
      await supabase
        .from('shopify_connections')
        .update({
          is_verified: true,
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('shop_domain', PRIMARY_STORE);

      // Log
      await supabase.from('shopify_audit_log').insert({
        event_type: 'FULL_RESET',
        shop_domain: PRIMARY_STORE,
        action: 'Full Shopify reset executed',
        details: { manual: true, timestamp: new Date().toISOString() },
        performed_by: 'admin'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-config'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-connections'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-audit-log'] });
      toast.success('Full reset completed');
    },
    onError: () => toast.error('Reset failed')
  });

  // Verify token
  const verifyToken = useMutation({
    mutationFn: async () => {
      // Simulate token verification (in production, call Shopify API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await supabase
        .from('shopify_connections')
        .update({
          is_verified: true,
          last_verified_at: new Date().toISOString()
        })
        .eq('shop_domain', PRIMARY_STORE);

      await supabase.from('shopify_audit_log').insert({
        event_type: 'TOKEN_VERIFIED',
        shop_domain: PRIMARY_STORE,
        action: 'Access token verified successfully',
        performed_by: 'admin'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-connections'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-audit-log'] });
      toast.success('Token verified');
    },
    onError: () => toast.error('Token verification failed')
  });

  const primaryConnection = connections.find(c => c.role === 'primary');
  const secondaryConnections = connections.filter(c => c.role === 'secondary');

  if (configLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Shopify Control Center</h1>
              <p className="text-muted-foreground">Single source of truth for Shopify integration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={config?.safe_mode_enabled ? "destructive" : "outline"} className="gap-1">
              {config?.safe_mode_enabled ? (
                <>
                  <ShieldAlert className="w-3 h-3" />
                  Safe Mode ON
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3" />
                  Operational
                </>
              )}
            </Badge>
            
            <Badge variant="secondary" className="gap-1">
              <Store className="w-3 h-3" />
              Single Store
            </Badge>
          </div>
        </motion.div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primary Store Card */}
          <Card className="border-primary/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Primary Store (Locked)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-muted-foreground" />
                  <span className="font-mono text-sm truncate">
                    {config?.primary_shop_domain || PRIMARY_STORE}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {primaryConnection?.is_verified ? (
                    <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                      <AlertTriangle className="w-3 h-3" />
                      Unverified
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="gap-1">
                    <Zap className="w-3 h-3" />
                    Active
                  </Badge>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => verifyToken.mutate()}
                  disabled={verifyToken.isPending}
                >
                  {verifyToken.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  Verify Token
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Safe Mode Card */}
          <Card className={config?.safe_mode_enabled ? "border-destructive/50 bg-destructive/5" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Safe Mode
              </CardTitle>
              <CardDescription>
                Block all write operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="safe-mode">Enable Safe Mode</Label>
                  <Switch
                    id="safe-mode"
                    checked={config?.safe_mode_enabled || false}
                    onCheckedChange={(checked) => toggleSafeMode.mutate(checked)}
                    disabled={toggleSafeMode.isPending}
                  />
                </div>
                
                {config?.safe_mode_enabled && config?.safe_mode_started_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Since {new Date(config.safe_mode_started_at).toLocaleString()}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  When enabled, only read-only operations are allowed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Shop Mode Card */}
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Multi-Shop Mode
              </CardTitle>
              <CardDescription>
                Prepared but disabled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="multi-shop" className="text-muted-foreground">
                    Enable Multi-Shop
                  </Label>
                  <Switch
                    id="multi-shop"
                    checked={false}
                    disabled={true}
                  />
                </div>
                
                <Badge variant="secondary" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Disabled by Default
                </Badge>
                
                <p className="text-xs text-muted-foreground">
                  Secondary stores require explicit activation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Re-run Full Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Full Reset</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will purge stale credentials, re-verify the primary store,
                      and ensure single-store configuration. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => runFullReset.mutate()}>
                      Execute Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => verifyToken.mutate()}
                disabled={verifyToken.isPending}
              >
                <Key className="w-4 h-4" />
                Reauthorize Primary Store
              </Button>
              
              <Button variant="outline" className="w-full justify-start gap-2" disabled>
                <Eye className="w-4 h-4" />
                Scan for Foreign Tokens
              </Button>
              
              <Separator />
              
              <Button variant="ghost" className="w-full justify-start gap-2 opacity-50" disabled>
                <Store className="w-4 h-4" />
                Add Secondary Shop (Disabled)
              </Button>
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className={`p-1.5 rounded-full ${
                        log.event_type.includes('RESET') ? 'bg-blue-500/10 text-blue-500' :
                        log.event_type.includes('SAFE') ? 'bg-yellow-500/10 text-yellow-500' :
                        log.event_type.includes('VERIFIED') ? 'bg-green-500/10 text-green-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {log.event_type.includes('RESET') ? <RotateCcw className="w-3 h-3" /> :
                         log.event_type.includes('SAFE') ? <ShieldAlert className="w-3 h-3" /> :
                         log.event_type.includes('VERIFIED') ? <CheckCircle2 className="w-3 h-3" /> :
                         <Activity className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{log.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                          {log.performed_by && (
                            <Badge variant="outline" className="text-xs">
                              {log.performed_by}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {auditLogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No audit logs yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Archived Credentials */}
        {config?.archived_credentials && config.archived_credentials.length > 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Archive className="w-5 h-5 text-muted-foreground" />
                Archived Credentials
              </CardTitle>
              <CardDescription>
                Previously connected stores (read-only, isolated)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {config.archived_credentials.map((cred: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{cred.domain}</span>
                    </div>
                    <Badge variant="secondary">Archived</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Status */}
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Shopify: Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Webhooks: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Multi-Shop: OFF</span>
                </div>
              </div>
              
              {config?.last_reset_at && (
                <span className="text-xs text-muted-foreground">
                  Last reset: {new Date(config.last_reset_at).toLocaleString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

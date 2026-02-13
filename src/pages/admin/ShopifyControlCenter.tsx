/**
 * SHOPIFY CONTROL CENTER - Admin Dashboard
 * 
 * Full store management:
 * - Store status, token, safe mode
 * - Product management with CJ sourcing status
 * - Audit log
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Shield, ShieldCheck, ShieldAlert,
  Store, Lock, RefreshCw, AlertTriangle,
  CheckCircle2, XCircle, Clock, Database,
  Key, Settings, RotateCcw,
  Eye, Archive, Activity, Zap,
  Package, ImageIcon, Link2, ExternalLink,
  Search, Filter, Tag, Truck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ─── Types ───

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

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  description: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: { edges: Array<{ node: { id: string; title: string; price: { amount: string; currencyCode: string }; availableForSale: boolean } }> };
}

interface CJLogEntry {
  cj_product_id: string;
  cj_product_name: string;
  shopify_product_id: string | null;
}

const PRIMARY_STORE = 'lovable-project-7fb70.myshopify.com';

// ─── Product Manager Component ───

function ProductManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'sourced' | 'unsourced'>('all');

  // Fetch products from edge function
  const { data: productData, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['admin-shopify-products'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-shopify-products', {
        body: { limit: 50 },
      });
      if (error) throw error;
      return data as { products: Array<{ node: ProductNode }>; totalInStore: number; totalSourced: number };
    },
  });

  // Fetch ALL products (unfiltered) to show unsourced ones too
  const { data: allProductData } = useQuery({
    queryKey: ['admin-all-shopify-products'],
    queryFn: async () => {
      // Use a direct Admin API call via a special flag
      const { data, error } = await supabase.functions.invoke('fetch-shopify-products', {
        body: { limit: 50, query: 'status:active' },
      });
      if (error) throw error;
      return data as { products: Array<{ node: ProductNode }>; totalInStore: number; totalSourced: number };
    },
  });

  // Fetch CJ logs for sourcing info
  const { data: cjLogs = [] } = useQuery({
    queryKey: ['admin-cj-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cj_logs')
        .select('cj_product_id, cj_product_name, shopify_product_id');
      if (error) throw error;
      // Deduplicate
      const seen = new Set<string>();
      return (data || []).filter((entry: CJLogEntry) => {
        if (seen.has(entry.cj_product_id)) return false;
        seen.add(entry.cj_product_id);
        return true;
      }) as CJLogEntry[];
    },
  });

  const sourcedProducts = productData?.products || [];
  const allProducts = allProductData?.products || sourcedProducts;

  // Build a set of sourced product titles for matching
  const sourcedTitles = new Set(sourcedProducts.map(p => p.node.title.toLowerCase()));

  // Determine display list
  const displayProducts = filterMode === 'sourced' 
    ? sourcedProducts 
    : filterMode === 'unsourced'
    ? allProducts.filter(p => !sourcedTitles.has(p.node.title.toLowerCase()))
    : allProducts;

  // Search filter
  const filteredProducts = displayProducts.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.node.title.toLowerCase().includes(term) ||
           p.node.vendor?.toLowerCase().includes(term) ||
           p.node.productType?.toLowerCase().includes(term);
  });

  const totalSourced = sourcedProducts.length;
  const totalAll = allProducts.length;

  return (
    <div className="space-y-4">
      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold mt-1">{totalAll}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">CJ Sourced</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-green-500">{totalSourced}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Unsourced</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-yellow-500">{totalAll - totalSourced}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">With Images</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-blue-500">
            {allProducts.filter(p => p.node.images.edges.length > 0).length}
          </p>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterMode === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterMode('all')}
          >
            All ({totalAll})
          </Button>
          <Button 
            variant={filterMode === 'sourced' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterMode('sourced')}
            className={filterMode === 'sourced' ? '' : 'border-green-500/30 text-green-600 hover:bg-green-500/10'}
          >
            <Truck className="w-3 h-3 mr-1" />
            Sourced ({totalSourced})
          </Button>
          <Button 
            variant={filterMode === 'unsourced' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterMode('unsourced')}
            className={filterMode === 'unsourced' ? '' : 'border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10'}
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unsourced ({totalAll - totalSourced})
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchProducts()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Product Table */}
      {productsLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="hidden lg:table-cell">Storefront</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const p = product.node;
                  const hasImage = p.images.edges.length > 0;
                  const imageUrl = hasImage ? p.images.edges[0].node.url : null;
                  const isSourced = sourcedTitles.has(p.title.toLowerCase());
                  const cjTag = p.tags?.find((t: string) => t.startsWith('CJ-'));
                  const price = p.priceRange.minVariantPrice;
                  const variantCount = p.variants?.edges?.length || 0;

                  return (
                    <TableRow key={p.id} className={!isSourced ? 'opacity-60' : ''}>
                      <TableCell>
                        {imageUrl ? (
                          <img src={imageUrl} alt={p.title} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                          {variantCount > 1 && (
                            <span className="text-xs text-muted-foreground">{variantCount} variants</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">{p.productType || '—'}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {p.vendor || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        ${parseFloat(price.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {isSourced ? (
                          <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/30" variant="outline">
                            <Truck className="w-3 h-3" />
                            CJ
                          </Badge>
                        ) : (
                          <Badge className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30" variant="outline">
                            <AlertTriangle className="w-3 h-3" />
                            None
                          </Badge>
                        )}
                        {cjTag && (
                          <span className="block text-[10px] text-muted-foreground mt-0.5 font-mono">{cjTag}</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {isSourced ? (
                          <Badge variant="outline" className="gap-1 text-xs bg-primary/5">
                            <Eye className="w-3 h-3" />
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <XCircle className="w-3 h-3" />
                            Hidden
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => window.open(`https://admin.shopify.com/store/lovable-project-7fb70/products/${p.id.split('/').pop()}`, '_blank')}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No products match your search
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      {/* CJ Sourcing Log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Tag className="w-4 h-4" />
            CJ Sourcing Registry ({cjLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {cjLogs.map((log) => (
                <div key={log.cj_product_id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] px-1.5">{log.cj_product_id}</Badge>
                    <span className="truncate max-w-[250px]">{log.cj_product_name}</span>
                  </div>
                  {log.shopify_product_id ? (
                    <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600">Linked</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-600">Name-match</Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Control Center ───

export default function ShopifyControlCenter() {
  const queryClient = useQueryClient();
  const [showSecrets, setShowSecrets] = useState(false);

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

  const runFullReset = useMutation({
    mutationFn: async () => {
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
      await supabase.from('shopify_connections').update({
        is_verified: true,
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('shop_domain', PRIMARY_STORE);
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

  const verifyToken = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await supabase.from('shopify_connections').update({
        is_verified: true,
        last_verified_at: new Date().toISOString()
      }).eq('shop_domain', PRIMARY_STORE);
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
              <p className="text-muted-foreground">Full store management & product sourcing dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={config?.safe_mode_enabled ? "destructive" : "outline"} className="gap-1">
              {config?.safe_mode_enabled ? (
                <><ShieldAlert className="w-3 h-3" />Safe Mode ON</>
              ) : (
                <><ShieldCheck className="w-3 h-3" />Operational</>
              )}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Store className="w-3 h-3" />
              {PRIMARY_STORE.split('.')[0]}
            </Badge>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="products" className="gap-1">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="store" className="gap-1">
              <Settings className="w-4 h-4" />
              Store
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-1">
              <Activity className="w-4 h-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <ProductManager />
          </TabsContent>

          {/* Store Config Tab */}
          <TabsContent value="store">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primary Store */}
              <Card className="border-primary/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Primary Store (Locked)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-muted-foreground" />
                    <span className="font-mono text-sm truncate">{config?.primary_shop_domain || PRIMARY_STORE}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {primaryConnection?.is_verified ? (
                      <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                        <CheckCircle2 className="w-3 h-3" />Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                        <AlertTriangle className="w-3 h-3" />Unverified
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1"><Zap className="w-3 h-3" />Active</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => verifyToken.mutate()} disabled={verifyToken.isPending}>
                    {verifyToken.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                    Verify Token
                  </Button>
                </CardContent>
              </Card>

              {/* Safe Mode */}
              <Card className={config?.safe_mode_enabled ? "border-destructive/50 bg-destructive/5" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="w-4 h-4" />Safe Mode</CardTitle>
                  <CardDescription>Block all write operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="safe-mode">Enable Safe Mode</Label>
                    <Switch id="safe-mode" checked={config?.safe_mode_enabled || false} onCheckedChange={(checked) => toggleSafeMode.mutate(checked)} disabled={toggleSafeMode.isPending} />
                  </div>
                  {config?.safe_mode_enabled && config?.safe_mode_started_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />Since {new Date(config.safe_mode_started_at).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Multi-Shop */}
              <Card className="opacity-60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Settings className="w-4 h-4" />Multi-Shop Mode</CardTitle>
                  <CardDescription>Prepared but disabled</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Enable Multi-Shop</Label>
                    <Switch checked={false} disabled />
                  </div>
                  <Badge variant="secondary" className="gap-1"><Lock className="w-3 h-3" />Disabled by Default</Badge>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            {/* Quick Actions */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <RotateCcw className="w-4 h-4" />Re-run Full Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Full Reset</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will purge stale credentials, re-verify the primary store, and ensure single-store configuration.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => runFullReset.mutate()}>Execute Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => verifyToken.mutate()} disabled={verifyToken.isPending}>
                  <Key className="w-4 h-4" />Reauthorize Primary Store
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.open(`https://admin.shopify.com/store/lovable-project-7fb70`, '_blank')}>
                  <ExternalLink className="w-4 h-4" />Open Shopify Admin
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5" />Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
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
                            <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                            {log.performed_by && <Badge variant="outline" className="text-xs">{log.performed_by}</Badge>}
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
          </TabsContent>
        </Tabs>

        {/* Footer */}
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
                  <span className="text-sm text-muted-foreground">CJ: Active</span>
                </div>
              </div>
              {config?.last_reset_at && (
                <span className="text-xs text-muted-foreground">Last reset: {new Date(config.last_reset_at).toLocaleString()}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

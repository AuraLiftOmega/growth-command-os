import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, Plus, RefreshCw, Trash2, ExternalLink, Package, 
  DollarSign, ShoppingCart, Zap, CheckCircle2, AlertCircle,
  Sparkles, ArrowRight, Clock, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUserShopifyConnections } from '@/hooks/useUserShopifyConnections';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ShopifyConnectionsPanel() {
  const { 
    connections, 
    products,
    isLoading, 
    initiateOAuth, 
    disconnectStore, 
    syncProducts,
    hasConnections,
    refetch
  } = useUserShopifyConnections();
  
  const { subscription, planFeatures } = useSubscription();
  // Pre-fill with Aura Lift Essentials store
  const [shopDomain, setShopDomain] = useState('aura-lift-essentials');
  const [isConnecting, setIsConnecting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

  // Real-time subscription for connection updates
  useEffect(() => {
    const channel = supabase
      .channel('shopify-connections-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_shopify_connections'
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_products'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleConnect = async () => {
    if (!shopDomain.trim()) return;
    
    setIsConnecting(true);
    try {
      await initiateOAuth(shopDomain);
    } catch (error) {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedConnectionId) return;
    
    try {
      await disconnectStore(selectedConnectionId);
      setDisconnectDialogOpen(false);
      setSelectedConnectionId(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncingIds(prev => new Set([...prev, connectionId]));
    try {
      await syncProducts(connectionId);
    } finally {
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  const openDisconnectDialog = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setDisconnectDialogOpen(true);
  };

  const canAddMore = !planFeatures?.stores || connections.length < planFeatures.stores;

  const selectedConnection = connections.find(c => c.id === selectedConnectionId);

  return (
    <>
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-500/5 to-emerald-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Shopify Connections
                  {hasConnections && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {connections.length} Connected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Connect your Shopify stores for multi-store management</CardDescription>
              </div>
            </div>
            
            {hasConnections && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    disabled={!canAddMore}
                    className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Plus className="h-4 w-4" />
                    Add Store
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20">
                        <Store className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <DialogTitle>Connect Another Store</DialogTitle>
                        <DialogDescription>
                          Securely connect via Shopify OAuth
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Store Domain</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="your-store"
                          value={shopDomain}
                          onChange={(e) => setShopDomain(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                        />
                        <span className="flex items-center text-muted-foreground text-sm">.myshopify.com</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter your store name (e.g., "my-awesome-store")
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Secure OAuth 2.0 — Your credentials are never stored</span>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleConnect} 
                      disabled={isConnecting || !shopDomain.trim()}
                      className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Connect with Shopify
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-green-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading your stores...</p>
              </div>
            </div>
          ) : !hasConnections ? (
            /* Empty State - Prominent Connect Button */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 px-6"
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto">
                  <Store className="h-10 w-10 text-green-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">Connect Your Shopify Store</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Link your Shopify store to manage products, generate AI videos, 
                and automate social media posting — all from one dashboard.
              </p>
              
              {/* Connected Store Info */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Store className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-green-600">Connected Store</p>
                    <p className="text-xs text-muted-foreground">lovable-project-7fb70.myshopify.com</p>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setShopDomain('lovable-project-7fb70');
                    handleConnect();
                  }}
                  className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Sync Store Connection
                    </>
                  )}
                </Button>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
                {[
                  { icon: Package, label: 'Sync Products' },
                  { icon: Zap, label: 'AI Video Ads' },
                  { icon: ShoppingCart, label: 'Track Sales' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                    <feature.icon className="w-4 h-4 text-green-500" />
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* Main Connect Button */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="gap-3 px-8 py-6 text-base bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02]"
                  >
                    <Store className="h-5 w-5" />
                    Connect Your Shopify Store
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20">
                        <Store className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <DialogTitle>Connect Shopify Store</DialogTitle>
                        <DialogDescription>
                          Enter your store domain to connect via secure OAuth
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Store Domain</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="your-store"
                          value={shopDomain}
                          onChange={(e) => setShopDomain(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                        />
                        <span className="flex items-center text-muted-foreground text-sm">.myshopify.com</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Example: "my-awesome-store" for my-awesome-store.myshopify.com
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Secure OAuth 2.0 — You'll be redirected to Shopify to authorize</span>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleConnect} 
                      disabled={isConnecting || !shopDomain.trim()}
                      className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Redirecting to Shopify...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Connect with Shopify
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <p className="text-xs text-muted-foreground mt-4">
                1-click OAuth • Secure • No passwords stored
              </p>
            </motion.div>
          ) : (
            /* Connected Stores List */
            <AnimatePresence>
              <div className="space-y-3">
                {connections.map((connection, index) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                        <Store className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{connection.shop_name || connection.shop_domain}</span>
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{connection.shop_domain}</p>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Package className="h-3 w-3" />
                            {connection.products_count || 0} products
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ShoppingCart className="h-3 w-3" />
                            {connection.orders_count || 0} orders
                          </span>
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <DollarSign className="h-3 w-3" />
                            ${(connection.total_revenue || 0).toLocaleString()}
                          </span>
                          {connection.last_sync_at && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Last sync: {new Date(connection.last_sync_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSync(connection.id)}
                        disabled={syncingIds.has(connection.id)}
                        className="gap-1.5"
                      >
                        <RefreshCw className={`h-4 w-4 ${syncingIds.has(connection.id) ? 'animate-spin' : ''}`} />
                        {syncingIds.has(connection.id) ? 'Syncing...' : 'Sync'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDisconnectDialog(connection.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
          
          {hasConnections && !canAddMore && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>Upgrade to Pro or Business to connect more stores.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Disconnect Store?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect <strong>{selectedConnection?.shop_name || selectedConnection?.shop_domain}</strong>? 
              This will remove access to products and order data from this store. You can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

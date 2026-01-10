import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Plus, RefreshCw, Trash2, ExternalLink, Package, DollarSign, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserShopifyConnections } from '@/hooks/useUserShopifyConnections';
import { useSubscription } from '@/hooks/useSubscription';

export function ShopifyConnectionsPanel() {
  const { 
    connections, 
    products,
    isLoading, 
    initiateOAuth, 
    disconnectStore, 
    syncProducts,
    hasConnections 
  } = useUserShopifyConnections();
  
  const { subscription, planFeatures } = useSubscription();
  const [shopDomain, setShopDomain] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConnect = async () => {
    if (!shopDomain.trim()) return;
    
    setIsConnecting(true);
    try {
      await initiateOAuth(shopDomain);
    } catch (error) {
      setIsConnecting(false);
    }
  };

  const canAddMore = !planFeatures?.stores || connections.length < planFeatures.stores;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Shopify Connections</CardTitle>
              <CardDescription>Connect your Shopify stores to manage products and orders</CardDescription>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                disabled={!canAddMore}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Store
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Shopify Store</DialogTitle>
                <DialogDescription>
                  Enter your Shopify store domain to connect via OAuth. You'll be redirected to Shopify to authorize access.
                </DialogDescription>
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
                    />
                    <span className="flex items-center text-muted-foreground text-sm">.myshopify.com</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your store name (e.g., "my-awesome-store" for my-awesome-store.myshopify.com)
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting || !shopDomain.trim()}
                  className="gap-2"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Connecting...
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
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasConnections ? (
          <div className="text-center py-8 px-4 border border-dashed rounded-lg">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-1">No stores connected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Shopify store to start managing products, generating videos, and posting to social media.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Connect Your First Store
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((connection, index) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Store className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{connection.shop_name || connection.shop_domain}</span>
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{connection.shop_domain}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {connection.products_count || 0} products
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        {connection.orders_count || 0} orders
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${(connection.total_revenue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => syncProducts(connection.id)}
                    className="gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => disconnectStore(connection.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!canAddMore && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            Upgrade to Pro or Business to connect more stores.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

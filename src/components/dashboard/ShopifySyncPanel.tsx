/**
 * SHOPIFY SYNC PANEL - PER-USER DYNAMIC
 * 
 * Real-time sync status and product management for user's connected Shopify stores
 * NO HARDCODED STORES - All data fetched per-user from database
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  CheckCircle,
  Package,
  DollarSign,
  Image as ImageIcon,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertCircle,
  Store,
  Plus,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useUserShopifyConnections } from '@/hooks/useUserShopifyConnections';
import { useNavigate } from 'react-router-dom';

export function ShopifySyncPanel() {
  const navigate = useNavigate();
  const { 
    connections, 
    products, 
    isLoading, 
    hasConnections, 
    syncProducts,
    refetch 
  } = useUserShopifyConnections();
  
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (connectionId: string) => {
    setSyncingId(connectionId);
    try {
      await syncProducts(connectionId);
      toast.success('Shopify products synced successfully!');
    } catch (err) {
      toast.error('Sync failed', {
        description: 'Could not fetch products from Shopify'
      });
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    for (const connection of connections) {
      await handleSync(connection.id);
    }
  };

  const totalProducts = products.length;
  const totalRevenue = connections.reduce((sum, c) => sum + (c.total_revenue || 0), 0);

  // No connections - show connect prompt
  if (!isLoading && !hasConnections) {
    return (
      <Card className="p-8 text-center">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto">
            <Store className="h-10 w-10 text-green-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Connect Your Shopify Store</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Link your Shopify store to sync products, generate AI video ads, 
          and track sales — all from one dashboard.
        </p>
        
        <Button 
          size="lg"
          className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
          onClick={() => navigate('/dashboard/settings?tab=shopify')}
        >
          <Store className="w-5 h-5" />
          Connect Shopify Store
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status Header */}
      <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-display font-bold">Shopify Sync</h2>
                {hasConnections && (
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {connections.length} Store{connections.length !== 1 ? 's' : ''} Connected
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {totalProducts} products synced • ${totalRevenue.toLocaleString()} total revenue
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard/settings?tab=shopify')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Store
            </Button>
            <Button 
              onClick={handleSyncAll} 
              disabled={isLoading || syncingId !== null}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncingId ? 'animate-spin' : ''}`} />
              {syncingId ? 'Syncing...' : 'Sync All'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Connected Stores List */}
      <div className="space-y-4">
        {connections.map((connection) => (
          <Card key={connection.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                  <Store className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{connection.shop_name || connection.shop_domain}</span>
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{connection.shop_domain}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Package className="h-3 w-3" />
                      {connection.products_count || 0} products
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
                  disabled={syncingId === connection.id}
                >
                  <RefreshCw className={`h-4 w-4 ${syncingId === connection.id ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a 
                    href={`https://${connection.shop_domain}/admin`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Products Preview */}
      {products.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="w-4 h-4" />
              Recent Products
            </h3>
            <Badge variant="outline">{products.length} total</Badge>
          </div>
          
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {products.slice(0, 8).map((product) => (
                <div 
                  key={product.id} 
                  className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  {product.images?.[0]?.url ? (
                    <img 
                      src={product.images[0].url} 
                      alt={product.title}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-20 bg-muted rounded mb-2 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs font-medium line-clamp-1">{product.title}</p>
                  <p className="text-xs text-green-600">${product.price?.toFixed(2) || '0.00'}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}

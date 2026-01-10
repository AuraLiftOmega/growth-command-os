/**
 * SHOPIFY SYNC PANEL
 * 
 * Real-time sync status and product management for connected Shopify store
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
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';

export function ShopifySyncPanel() {
  const { products, isLoading, error, lastFetched, refetch } = useShopifyProducts({ 
    vendor: 'AuraLift Beauty',
    autoLoad: true 
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await refetch();
      toast.success('Shopify products synced successfully!', {
        description: `${products.length} products loaded`
      });
    } catch (err) {
      toast.error('Sync failed', {
        description: 'Could not fetch products from Shopify'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const totalInventoryValue = products.reduce((sum, p) => sum + p.price, 0);
  const availableProducts = products.filter(p => p.available).length;

  return (
    <div className="space-y-6">
      {/* Sync Status Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-chart-2/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-display font-bold">Shopify Sync</h2>
                <Badge className="bg-success/20 text-success border-success/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <p className="text-muted-foreground">
                AuraLift Essentials • lovable-project-7fb70.myshopify.com • LIVE
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleSync} 
            disabled={isSyncing || isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing || isLoading ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>

        {lastFetched && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Last synced: {lastFetched.toLocaleTimeString()}
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableProducts}</p>
                <p className="text-sm text-muted-foreground">In Stock</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalInventoryValue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Catalog Value</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${products.length > 0 ? (totalInventoryValue / products.length).toFixed(0) : 0}
                </p>
                <p className="text-sm text-muted-foreground">Avg Price</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Products Grid */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Synced Products</h3>
          <Badge variant="outline">{products.length} products</Badge>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h4 className="font-medium text-lg mb-2">No products found</h4>
            <p className="text-muted-foreground mb-4">
              Create a product by telling me what you want to sell!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative bg-muted">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <Badge 
                        className={`absolute top-2 right-2 ${
                          product.available 
                            ? 'bg-success/90 text-white' 
                            : 'bg-muted-foreground/90 text-white'
                        }`}
                      >
                        {product.available ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold truncate">{product.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-primary">
                          ${product.price.toFixed(2)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {product.vendor}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {product.description?.slice(0, 80)}...
                      </p>
                      
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs"
                          onClick={() => window.open(`/store#${product.handle}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View in Store
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}

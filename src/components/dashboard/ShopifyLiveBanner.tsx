/**
 * SHOPIFY LIVE BANNER - Per-user store sync status
 * Shows connected user stores, products, last sync, and revenue
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ShoppingBag, 
  DollarSign,
  Wifi,
  WifiOff,
  ExternalLink,
  TrendingUp,
  Sparkles,
  Store
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUserShopifyConnections } from '@/hooks/useUserShopifyConnections';

interface ShopifyLiveBannerProps {
  compact?: boolean;
}

export function ShopifyLiveBanner({ compact = false }: ShopifyLiveBannerProps) {
  const { connections, products, isLoading, hasConnections, refetch, primaryConnection } = useUserShopifyConnections();
  const [isSyncing, setIsSyncing] = useState(false);
  const [todayRevenue, setTodayRevenue] = useState(0);
  
  // Get revenue from primary connection
  useEffect(() => {
    if (primaryConnection?.total_revenue) {
      setTodayRevenue(primaryConnection.total_revenue);
    }
  }, [primaryConnection]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await refetch();
      toast.success(`✅ Synced ${products.length} products from your stores`);
    } catch (err) {
      toast.error('Sync failed - check connection');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString();
  };

  if (!hasConnections) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-primary/20">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Connect Your Shopify Store</p>
            <p className="text-sm text-muted-foreground">
              Link your store to start generating AI video ads and tracking sales
            </p>
          </div>
          <Button variant="default" size="sm" asChild>
            <a href="/dashboard/settings">Connect Store</a>
          </Button>
        </div>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Badge 
          variant="outline" 
          className="gap-1.5 px-3 py-1 border-success/30 bg-success/5 text-success"
        >
          {isLoading || isSyncing ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Wifi className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">Shopify</span> Live
        </Badge>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span>{products.length} products</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-success font-medium">${todayRevenue.toFixed(0)} revenue</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={handleSyncNow}
          disabled={isSyncing || isLoading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-success/10 via-success/5 to-transparent border border-success/20 rounded-lg p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Connection Status */}
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-success/20">
            <ShoppingBag className="w-5 h-5 text-success" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                {primaryConnection?.shop_name || 'Your Store'}
              </span>
              {(isLoading || isSyncing) ? (
                <Badge variant="secondary" className="gap-1 text-xs animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Syncing...
                </Badge>
              ) : (
                <Badge className="gap-1 text-xs bg-success/20 text-success hover:bg-success/30 border-0">
                  <CheckCircle className="w-3 h-3" />
                  Live
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {primaryConnection?.shop_domain} • {formatTime(primaryConnection?.last_sync_at || null)} • {products.length} products
            </p>
          </div>
        </div>

        {/* Center: Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-primary/10">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-lg font-bold text-success">${todayRevenue.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-accent/10">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stores</p>
              <p className="text-lg font-bold">{connections.length}</p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncNow}
            disabled={isSyncing || isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <a href="/dashboard/settings" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Manage
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

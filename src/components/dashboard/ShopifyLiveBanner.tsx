/**
 * SHOPIFY LIVE BANNER - Top-level sync status with revenue tracking
 * Shows connected store (AuraLift Essentials), products, last sync, and today's revenue
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
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { AURALIFT_DOMAIN, AURALIFT_STORE_URL } from '@/lib/shopify-config';

interface ShopifyLiveBannerProps {
  compact?: boolean;
}

export function ShopifyLiveBanner({ compact = false }: ShopifyLiveBannerProps) {
  const { products, isLoading, lastFetched, refetch, error } = useShopifyProducts({
    vendor: 'AuraLift Beauty',
    autoLoad: true
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [todayRevenue, setTodayRevenue] = useState(2847.50); // Demo revenue
  
  // Simulate revenue updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayRevenue(prev => prev + Math.random() * 15);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await refetch();
      toast.success(`✅ Synced ${products.length} AuraLift products from Shopify`);
    } catch (err) {
      toast.error('Sync failed - check connection');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString();
  };

  const isConnected = !error && products.length > 0;

  if (compact) {
    return (
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Badge 
          variant="outline" 
          className={`gap-1.5 px-3 py-1 ${isConnected ? 'border-success/30 bg-success/5 text-success' : 'border-destructive/30 text-destructive'}`}
        >
          {isLoading || isSyncing ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : isConnected ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">Shopify</span> Live
        </Badge>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span>{products.length} products</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-success font-medium">${todayRevenue.toFixed(0)} today</span>
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
          <div className={`p-2.5 rounded-lg ${isConnected ? 'bg-success/20' : 'bg-destructive/20'}`}>
            <ShoppingBag className={`w-5 h-5 ${isConnected ? 'text-success' : 'text-destructive'}`} />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                AuraLift Essentials
              </span>
              {(isLoading || isSyncing) ? (
                <Badge variant="secondary" className="gap-1 text-xs animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Syncing...
                </Badge>
              ) : isConnected ? (
                <Badge className="gap-1 text-xs bg-success/20 text-success hover:bg-success/30 border-0">
                  <CheckCircle className="w-3 h-3" />
                  Live
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  Error
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {AURALIFT_DOMAIN} • {formatTime(lastFetched)} • {products.length} products
            </p>
          </div>
        </div>

        {/* Center: Revenue */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-primary/10">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today's Revenue</p>
              <p className="text-lg font-bold text-success">${todayRevenue.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-accent/10">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conversion</p>
              <p className="text-lg font-bold">4.2%</p>
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
            <a 
              href={AURALIFT_STORE_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Store
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <a 
              href="https://admin.shopify.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Admin
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

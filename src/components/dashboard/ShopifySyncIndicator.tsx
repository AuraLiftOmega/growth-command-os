/**
 * SHOPIFY SYNC INDICATOR - Shows real-time sync status for AuraLift products
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, ShoppingBag, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';

interface ShopifySyncIndicatorProps {
  compact?: boolean;
}

export function ShopifySyncIndicator({ compact = false }: ShopifySyncIndicatorProps) {
  const { products, isLoading, lastFetched, refetch, error } = useShopifyProducts({
    vendor: 'AuraLift Beauty',
    autoLoad: true
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await refetch();
      toast.success(`✅ Synced ${products.length} AuraLift products`);
    } catch (err) {
      toast.error('Sync failed');
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

  if (compact) {
    return (
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Badge 
          variant="outline" 
          className={`gap-1 ${error ? 'border-destructive/30 text-destructive' : 'border-success/30 text-success'}`}
        >
          {isLoading || isSyncing ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : error ? (
            <AlertCircle className="w-3 h-3" />
          ) : (
            <CheckCircle className="w-3 h-3" />
          )}
          {products.length} products
        </Badge>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={handleSync}
          disabled={isSyncing || isLoading}
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${error ? 'bg-destructive/20' : 'bg-success/20'}`}>
          <ShoppingBag className={`w-4 h-4 ${error ? 'text-destructive' : 'text-success'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Shopify Sync</span>
            {(isLoading || isSyncing) ? (
              <Badge variant="secondary" className="gap-1 text-xs">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing...
              </Badge>
            ) : error ? (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertCircle className="w-3 h-3" />
                Error
              </Badge>
            ) : (
              <Badge className="gap-1 text-xs bg-success/20 text-success border-0">
                <CheckCircle className="w-3 h-3" />
                Synced
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            Last sync: {formatTime(lastFetched)}
            <span className="mx-1">•</span>
            {products.length} AuraLift products
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing || isLoading}
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        Sync Now
      </Button>
    </motion.div>
  );
}

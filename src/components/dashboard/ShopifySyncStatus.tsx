/**
 * SHOPIFY SYNC STATUS INDICATOR
 * 
 * Real-time sync status for connected Shopify store
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';

interface ShopifySyncStatusProps {
  compact?: boolean;
  showSyncButton?: boolean;
  onSync?: () => void;
}

export function ShopifySyncStatus({ 
  compact = false, 
  showSyncButton = true,
  onSync 
}: ShopifySyncStatusProps) {
  const { products, isLoading, error, lastFetched, refetch } = useShopifyProducts({
    vendor: 'AuraLift Beauty',
    autoLoad: true
  });
  
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await refetch();
      toast.success(`✅ Synced ${products.length} AuraLift products`);
      onSync?.();
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [refetch, products.length, onSync]);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  const getStatusColor = () => {
    if (error) return 'destructive';
    if (isLoading || isSyncing) return 'secondary';
    if (products.length > 0) return 'default';
    return 'outline';
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="w-3 h-3" />;
    if (isLoading || isSyncing) return <Loader2 className="w-3 h-3 animate-spin" />;
    return <CheckCircle2 className="w-3 h-3" />;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={getStatusColor()} className="gap-1">
          {getStatusIcon()}
          <span>{products.length} products</span>
        </Badge>
        {showSyncButton && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSync}
            disabled={isSyncing || isLoading}
            className="h-6 w-6"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border"
    >
      <div className="p-2 rounded-lg bg-primary/10">
        <ShoppingBag className="w-4 h-4 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Shopify Sync</span>
          <Badge variant={getStatusColor()} className="gap-1 text-xs">
            {getStatusIcon()}
            {error ? 'Error' : products.length > 0 ? 'Connected' : 'No products'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {products.length} AuraLift products • Last sync: {formatTime(lastFetched)}
        </p>
      </div>

      {showSyncButton && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          disabled={isSyncing || isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync
        </Button>
      )}
    </motion.div>
  );
}
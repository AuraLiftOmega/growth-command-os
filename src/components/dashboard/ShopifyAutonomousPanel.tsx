/**
 * SHOPIFY AUTONOMOUS SELLING PANEL
 * 
 * PRODUCTION VERSION - Uses REAL data from Supabase
 * No mock data. All metrics are computed from real events.
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  ShoppingCart,
  Brain,
  ExternalLink,
  Package,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Settings2,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useShopifyAutonomous, ProductAutomation } from '@/hooks/useShopifyAutonomous';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ShopifyAutonomousPanel() {
  const navigate = useNavigate();
  const {
    automations,
    stats,
    isLoading,
    isSyncing,
    systemStatus,
    lastSyncAt,
    error,
    syncProducts,
    updateAutomationStatus,
    updateAutomationMode,
    toggleEngine
  } = useShopifyAutonomous();

  const [isGlobalEnabled, setIsGlobalEnabled] = useState(systemStatus === 'active');

  const handleToggleGlobal = useCallback(() => {
    const newState = !isGlobalEnabled;
    setIsGlobalEnabled(newState);
    toggleEngine(newState);
  }, [isGlobalEnabled, toggleEngine]);

  const getStatusBadge = (status: ProductAutomation['status']) => {
    const styles = {
      optimizing: 'bg-primary/20 text-primary',
      scaling: 'bg-success/20 text-success',
      paused: 'bg-muted text-muted-foreground',
      learning: 'bg-chart-4/20 text-chart-4',
      disabled: 'bg-destructive/20 text-destructive'
    };
    const labels = {
      optimizing: 'Optimizing',
      scaling: 'Scaling',
      paused: 'Paused',
      learning: 'Learning',
      disabled: 'Disabled'
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading automation data...</span>
        </div>
      </Card>
    );
  }

  // Error state
  if (error && automations.length === 0) {
    return (
      <Card className="p-6 border-destructive/30">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div className="text-center">
            <h3 className="font-semibold text-lg">Connection Error</h3>
            <p className="text-muted-foreground text-sm mt-1">{error}</p>
          </div>
          <Button onClick={syncProducts} disabled={isSyncing} className="gap-2">
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            {isSyncing ? 'Syncing...' : 'Retry Sync'}
          </Button>
        </div>
      </Card>
    );
  }

  // No products state
  if (automations.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Package className="w-12 h-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="font-semibold text-lg">No Products Found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Sync your Shopify products to start autonomous selling
            </p>
          </div>
          <Button onClick={syncProducts} disabled={isSyncing} className="gap-2">
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            {isSyncing ? 'Syncing...' : 'Sync Products'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border-primary/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center",
              systemStatus === 'active' 
                ? "bg-gradient-to-br from-primary to-chart-2" 
                : systemStatus === 'error'
                ? "bg-destructive"
                : "bg-muted"
            )}>
              <Brain className={cn(
                "w-8 h-8",
                systemStatus === 'active' ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-display font-bold">Shopify Autonomous Engine</h2>
                <Badge className={cn(
                  systemStatus === 'active' ? 'bg-success/20 text-success' :
                  systemStatus === 'learning' ? 'bg-primary/20 text-primary' :
                  systemStatus === 'error' ? 'bg-destructive/20 text-destructive' :
                  'bg-muted text-muted-foreground'
                )}>
                  {systemStatus.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {stats.dataSource === 'insufficient' 
                  ? 'Collecting initial data - metrics will appear as events occur'
                  : `Managing ${stats.activeProducts} active products with real performance data`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className={cn(
                "text-2xl font-bold",
                stats.totalRevenue > 0 ? "text-success" : "text-muted-foreground"
              )}>
                {stats.totalRevenue > 0 ? formatCurrency(stats.totalRevenue) : 'INSUFFICIENT DATA'}
              </p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {stats.totalOrders > 0 ? stats.totalOrders : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
            <div className="text-center">
              <p className={cn(
                "text-2xl font-bold",
                stats.avgRoas > 0 ? "text-primary" : "text-muted-foreground"
              )}>
                {stats.avgRoas > 0 ? `${stats.avgRoas.toFixed(1)}x` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">ROAS</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {isGlobalEnabled ? 'Active' : 'Paused'}
              </span>
              <Switch
                checked={isGlobalEnabled}
                onCheckedChange={handleToggleGlobal}
              />
            </div>
          </div>
        </div>

        {/* Data Status Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {stats.dataSource === 'insufficient' 
                ? 'Awaiting real performance data' 
                : 'Real-time optimization active'
              }
            </span>
            <span className="font-medium flex items-center gap-2">
              {lastSyncAt && (
                <span className="text-xs text-muted-foreground">
                  Last sync: {lastSyncAt.toLocaleTimeString()}
                </span>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={syncProducts}
                disabled={isSyncing}
                className="h-6 px-2"
              >
                <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
              </Button>
            </span>
          </div>
          <Progress 
            value={stats.dataSource === 'insufficient' ? 10 : Math.min(95, 50 + (stats.activeProducts * 5))} 
            className="h-2" 
          />
        </div>
      </Card>

      {/* Metrics Overview - Only show if we have real data */}
      {stats.dataSource === 'real' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats.totalImpressions)}</p>
                <p className="text-xs text-muted-foreground">Impressions</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <MousePointer className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalImpressions > 0 
                    ? ((automations.reduce((sum, a) => sum + a.clicks, 0) / stats.totalImpressions) * 100).toFixed(2)
                    : '0'
                  }%
                </p>
                <p className="text-xs text-muted-foreground">CTR</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <ShoppingCart className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground">Conversions</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-4/10">
                <DollarSign className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSpend)}</p>
                <p className="text-xs text-muted-foreground">Ad Spend</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Product Automations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {automations.slice(0, 8).map((automation, index) => (
          <motion.div
            key={automation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:border-primary/30 transition-colors">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 rounded-lg bg-secondary/20 overflow-hidden flex-shrink-0">
                  {automation.productImage ? (
                    <img
                      src={automation.productImage}
                      alt={automation.productTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-sm truncate">{automation.productTitle}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(automation.productPrice)}
                      </p>
                    </div>
                    {getStatusBadge(automation.status)}
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-muted-foreground">Impr.</p>
                      <p className="font-medium">
                        {automation.impressions > 0 ? formatNumber(automation.impressions) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Clicks</p>
                      <p className="font-medium">
                        {automation.clicks > 0 ? automation.clicks : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className={cn(
                        "font-medium",
                        automation.revenue > 0 ? "text-success" : "text-muted-foreground"
                      )}>
                        {automation.revenue > 0 ? formatCurrency(automation.revenue) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ROAS</p>
                      <p className={cn(
                        "font-medium",
                        automation.roas > 0 ? "text-primary" : "text-muted-foreground"
                      )}>
                        {automation.roas > 0 ? `${automation.roas.toFixed(1)}x` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart3 className="w-3 h-3" />
                      <span>{automation.nextAction || 'Awaiting data'}</span>
                    </div>
                    <Select
                      value={automation.automationMode}
                      onValueChange={(value) => updateAutomationMode(automation.id, value as ProductAutomation['automationMode'])}
                    >
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="assisted">Assisted</SelectItem>
                        <SelectItem value="autonomous">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-4 bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            <span>
              {stats.dataSource === 'insufficient'
                ? 'Engine is learning - metrics will populate as real events occur'
                : 'Real-time optimization active based on actual performance data'
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => navigate('/store')}
            >
              <ExternalLink className="w-4 h-4" />
              View Store
            </Button>
            <Button 
              size="sm" 
              className="gap-2"
              onClick={() => {
                syncProducts();
                toast.info('Syncing latest product data...');
              }}
              disabled={isSyncing}
            >
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              Sync Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
/**
 * PRODUCTION STATUS BANNER
 * 
 * Real-time status display for all connected systems:
 * - Shopify (real products from lovable-project-7fb70.myshopify.com)
 * - CJ Dropshipping
 * - HeyGen/D-ID video generation
 * - Social channels (TikTok Shop, Pinterest)
 * - Super Grok CEO
 * - Lifetime access status
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Store,
  Video,
  Share2,
  Brain,
  Package,
  Crown,
  Zap,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { storefrontApiRequest, PRODUCTS_QUERY, SHOPIFY_STORE_PERMANENT_DOMAIN } from '@/lib/shopify-config';

interface SystemStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'loading' | 'partial';
  details: string;
  icon: React.ElementType;
  count?: number;
  action?: () => void;
  actionLabel?: string;
  link?: string;
}

export function ProductionStatusBanner() {
  const { user } = useAuth();
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLifetimeAccess, setIsLifetimeAccess] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const checkAllSystems = async () => {
    setIsRefreshing(true);
    const statuses: SystemStatus[] = [];

    // Check lifetime access
    if (user) {
      const { data: adminData } = await supabase
        .from('admin_entitlements')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (adminData?.bypass_all_credit_checks) {
        setIsLifetimeAccess(true);
      }
    }

    // 1. Shopify Status
    try {
      const shopifyData = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50 });
      const productCount = shopifyData?.data?.products?.edges?.length || 0;
      const auraliftProducts = shopifyData?.data?.products?.edges?.filter(
        (p: any) => p.node?.vendor === 'AuraLift Beauty'
      )?.length || 0;

      statuses.push({
        name: 'Shopify Store',
        status: productCount > 0 ? 'connected' : 'partial',
        details: productCount > 0 
          ? `${productCount} products (${auraliftProducts} AuraLift)` 
          : 'No products loaded',
        icon: Store,
        count: productCount,
        link: `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/admin`
      });
    } catch (err) {
      statuses.push({
        name: 'Shopify Store',
        status: 'disconnected',
        details: 'Connection error',
        icon: Store
      });
    }

    // 2. CJ Dropshipping Status
    if (user) {
      const { data: cjSettings } = await supabase
        .from('cj_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: cjLogs } = await supabase
        .from('cj_logs')
        .select('id')
        .eq('user_id', user.id);

      statuses.push({
        name: 'CJ Dropshipping',
        status: (cjSettings?.is_connected || (cjLogs?.length || 0) > 0) ? 'connected' : 'partial',
        details: cjLogs?.length 
          ? `${cjLogs.length} products sourced` 
          : 'Ready to source',
        icon: Package,
        count: cjLogs?.length || 0
      });

      // 3. Video Generation (HeyGen/D-ID)
      const { data: ads } = await supabase
        .from('ads')
        .select('id, status, provider')
        .eq('user_id', user.id);

      const completedAds = ads?.filter(a => a.status === 'completed')?.length || 0;

      statuses.push({
        name: 'Video Gen (HeyGen/D-ID)',
        status: completedAds > 0 ? 'connected' : 'partial',
        details: completedAds > 0 
          ? `${completedAds} videos generated` 
          : 'Ready to generate',
        icon: Video,
        count: completedAds
      });

      // 4. Social Channels
      const { data: socialTokens } = await supabase
        .from('social_tokens')
        .select('channel, is_connected')
        .eq('user_id', user.id);

      const connectedPlatforms = socialTokens?.filter(t => t.is_connected)?.length || 0;
      const platformNames = socialTokens?.map(t => t.channel).join(', ') || 'None';

      statuses.push({
        name: 'Social Channels',
        status: connectedPlatforms > 0 ? 'connected' : 'partial',
        details: connectedPlatforms > 0 
          ? `${connectedPlatforms} connected (${platformNames})` 
          : 'TikTok Shop + Pinterest ready',
        icon: Share2,
        count: connectedPlatforms
      });

      // 5. Super Grok CEO
      const { data: grokLogs } = await supabase
        .from('grok_ceo_logs')
        .select('id, execution_status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const activeStrategies = grokLogs?.length || 0;

      statuses.push({
        name: 'Super Grok CEO',
        status: activeStrategies > 0 ? 'connected' : 'partial',
        details: activeStrategies > 0 
          ? `${activeStrategies} strategies deployed` 
          : 'Ready for autonomous mode',
        icon: Brain,
        count: activeStrategies
      });
    }

    setSystems(statuses);
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkAllSystems();
  }, [user]);

  const handleRefresh = async () => {
    toast.loading('Syncing all systems...', { id: 'refresh-systems' });
    await checkAllSystems();
    toast.success('All systems synced', { id: 'refresh-systems' });
  };

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'connected': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'partial': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'disconnected': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'loading': return 'text-muted-foreground bg-muted/10 border-muted/30';
    }
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-4 h-4" />;
      case 'partial': return <AlertCircle className="w-4 h-4" />;
      case 'disconnected': return <AlertCircle className="w-4 h-4" />;
      case 'loading': return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const connectedCount = systems.filter(s => s.status === 'connected').length;
  const totalCount = systems.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-6"
    >
      {/* Lifetime Access Banner */}
      {isLifetimeAccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-2 border-amber-500/50"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-500" />
            <div className="flex-1">
              <h3 className="font-bold text-amber-500">Lifetime Free Access Granted</h3>
              <p className="text-sm text-muted-foreground">Unlimited Everything – No Credits, No Limits, No Paywalls</p>
            </div>
            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/50">
              <Zap className="w-3 h-3 mr-1" />
              PREMIUM
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Main Status Banner */}
      <Card className="p-4 border-2 border-green-500/30 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/20">
              <Zap className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">AURAOMEGA Production Mode</h3>
                <Badge className="bg-green-500 text-white animate-pulse">
                  LIVE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {connectedCount}/{totalCount} systems active • Real revenue mode
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/50"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {systems.map((system, i) => (
                  <motion.div
                    key={system.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-lg border ${getStatusColor(system.status)} transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-start gap-2">
                      <system.icon className="w-4 h-4 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm truncate">{system.name}</span>
                          {getStatusIcon(system.status)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {system.details}
                        </p>
                        {system.link && (
                          <a 
                            href={system.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
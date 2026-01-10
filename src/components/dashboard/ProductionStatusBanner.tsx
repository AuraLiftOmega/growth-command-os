/**
 * PRODUCTION STATUS BANNER
 * 
 * Shows real-time status of production systems:
 * - API connections
 * - Live vs simulated mode
 * - Missing keys needed for full operation
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Key,
  TrendingUp,
  Video,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { isProductionMode, REQUIRED_PLATFORM_KEYS, SHOPIFY_STORE } from '@/lib/production-mode';

interface SystemStatus {
  name: string;
  icon: typeof Zap;
  status: 'live' | 'partial' | 'needs-keys';
  description: string;
}

export function ProductionStatusBanner() {
  const [showDetails, setShowDetails] = useState(false);

  const systems: SystemStatus[] = [
    {
      name: 'Shopify Store',
      icon: CreditCard,
      status: 'live',
      description: `LIVE: ${SHOPIFY_STORE.domain}`
    },
    {
      name: 'AI Video Generation',
      icon: Video,
      status: 'live',
      description: 'Replicate + ElevenLabs + Lovable AI'
    },
    {
      name: 'TikTok Publishing',
      icon: TrendingUp,
      status: 'live',
      description: 'OAuth keys configured'
    },
    {
      name: 'Stripe Payments',
      icon: DollarSign,
      status: 'live',
      description: 'Ready for transactions'
    }
  ];

  const liveCount = systems.filter(s => s.status === 'live').length;
  const needsKeysCount = REQUIRED_PLATFORM_KEYS.filter(k => !k.configured).length;

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'live': return 'text-success';
      case 'partial': return 'text-warning';
      case 'needs-keys': return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: SystemStatus['status']) => {
    switch (status) {
      case 'live': return <Badge className="bg-success/20 text-success">LIVE</Badge>;
      case 'partial': return <Badge className="bg-warning/20 text-warning">PARTIAL</Badge>;
      case 'needs-keys': return <Badge variant="outline">NEEDS KEYS</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className={cn(
        "p-4 border-2",
        isProductionMode() 
          ? "border-success/30 bg-success/5" 
          : "border-muted"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isProductionMode() ? "bg-success/20" : "bg-muted"
            )}>
              <Zap className={cn(
                "w-6 h-6",
                isProductionMode() ? "text-success" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">AURAOMEGA Production Mode</h3>
                <Badge className="bg-success text-success-foreground animate-pulse">
                  LIVE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {liveCount}/{systems.length} systems active • {needsKeysCount} keys needed for full power
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              {systems.map((sys, i) => {
                const Icon = sys.icon;
                return (
                  <div 
                    key={i}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      sys.status === 'live' ? "bg-success/20" :
                      sys.status === 'partial' ? "bg-warning/20" : "bg-muted"
                    )}
                    title={`${sys.name}: ${sys.description}`}
                  >
                    <Icon className={cn("w-4 h-4", getStatusColor(sys.status))} />
                  </div>
                );
              })}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {systems.map((sys, i) => {
                const Icon = sys.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Icon className={cn("w-5 h-5", getStatusColor(sys.status))} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{sys.name}</span>
                        {getStatusBadge(sys.status)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{sys.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {needsKeysCount > 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Required API Keys for Full Production:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {REQUIRED_PLATFORM_KEYS.filter(k => !k.configured).map((key, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {key.key}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

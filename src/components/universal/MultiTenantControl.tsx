import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Users, 
  Eye, 
  Shield, 
  Lock,
  Unlock,
  Settings,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { useDominionStore, TenantMode } from '@/stores/dominion-core-store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

/**
 * MULTI-TENANT POWER STRUCTURE
 * 
 * Supports:
 * - Founder Mode (absolute control)
 * - Customer Mode (scoped access)
 * - Demo Mode (restricted view)
 * 
 * Customers NEVER access:
 * - Core intelligence
 * - System logic
 * - Learning engine
 * - Founder war-room views
 */

interface AccessLevel {
  id: TenantMode;
  name: string;
  description: string;
  icon: any;
  color: string;
  permissions: string[];
  restricted: string[];
}

const ACCESS_LEVELS: AccessLevel[] = [
  {
    id: 'founder',
    name: 'Founder Mode',
    description: 'Absolute control. Full system access.',
    icon: Crown,
    color: 'text-primary',
    permissions: [
      'All system modules',
      'Core intelligence',
      'Learning engine',
      'Multi-tenant management',
      'Revenue war room',
      'Self-marketing controls',
      'Integration sovereignty',
      'Pricing & scaling',
    ],
    restricted: [],
  },
  {
    id: 'customer',
    name: 'Customer Mode',
    description: 'Scoped access. Industry-adapted view.',
    icon: Users,
    color: 'text-accent',
    permissions: [
      'Dashboard & analytics',
      'Creative generation',
      'Campaign management',
      'Basic automations',
      'Performance reports',
      'Integration status',
    ],
    restricted: [
      'Core intelligence',
      'System logic',
      'Learning engine',
      'Founder war room',
      'Multi-tenant controls',
      'Self-marketing engine',
    ],
  },
  {
    id: 'demo',
    name: 'Demo Mode',
    description: 'Restricted view. Showcase only.',
    icon: Eye,
    color: 'text-muted-foreground',
    permissions: [
      'View dashboards',
      'View sample data',
      'Basic navigation',
    ],
    restricted: [
      'All write operations',
      'Real data access',
      'Configuration',
      'Core intelligence',
      'System logic',
      'Learning engine',
      'Integration management',
    ],
  },
];

export const MultiTenantControl = () => {
  const { tenantMode, setTenantMode, isFounderInstance, resetToFounder } = useDominionStore();
  const [showWarning, setShowWarning] = useState(false);
  const [pendingMode, setPendingMode] = useState<TenantMode | null>(null);

  const currentLevel = ACCESS_LEVELS.find(l => l.id === tenantMode) || ACCESS_LEVELS[0];

  const handleModeChange = (mode: TenantMode) => {
    if (mode === tenantMode) return;
    
    if (tenantMode === 'founder' && mode !== 'founder') {
      setPendingMode(mode);
      setShowWarning(true);
    } else {
      setTenantMode(mode);
    }
  };

  const confirmModeChange = () => {
    if (pendingMode) {
      setTenantMode(pendingMode);
    }
    setShowWarning(false);
    setPendingMode(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              tenantMode === 'founder' ? "bg-primary/20" : "bg-secondary"
            )}>
              <currentLevel.icon className={cn("w-5 h-5", currentLevel.color)} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Multi-Tenant Control</h2>
              <p className="text-sm text-muted-foreground">Current: {currentLevel.name}</p>
            </div>
          </div>
        </div>

        {tenantMode !== 'founder' && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetToFounder}
            className="gap-2"
          >
            <Crown className="w-4 h-4" />
            Return to Founder
          </Button>
        )}
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ACCESS_LEVELS.map((level) => (
          <motion.button
            key={level.id}
            onClick={() => handleModeChange(level.id)}
            className={cn(
              "p-5 rounded-lg border text-left transition-all",
              tenantMode === level.id
                ? level.id === 'founder' 
                  ? "bg-primary/10 border-primary/50 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.5)]"
                  : level.id === 'customer'
                  ? "bg-accent/10 border-accent/50"
                  : "bg-secondary border-border"
                : "bg-card/50 border-border/50 hover:border-border"
            )}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <level.icon className={cn("w-6 h-6", level.color)} />
              <div>
                <h3 className="font-semibold">{level.name}</h3>
                {tenantMode === level.id && (
                  <span className="text-xs text-success">Active</span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{level.description}</p>
            
            <div className="space-y-1">
              {level.permissions.slice(0, 3).map((perm) => (
                <div key={perm} className="flex items-center gap-2 text-xs">
                  <Check className="w-3 h-3 text-success" />
                  <span className="text-muted-foreground">{perm}</span>
                </div>
              ))}
              {level.permissions.length > 3 && (
                <p className="text-xs text-muted-foreground pl-5">
                  +{level.permissions.length - 3} more
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Current Permissions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          Access Permissions: {currentLevel.name}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allowed */}
          <div>
            <h4 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
              <Unlock className="w-4 h-4" />
              Accessible
            </h4>
            <div className="space-y-2">
              {currentLevel.permissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-success" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Restricted */}
          <div>
            <h4 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Restricted
            </h4>
            <div className="space-y-2">
              {currentLevel.restricted.length > 0 ? (
                currentLevel.restricted.map((perm) => (
                  <div key={perm} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive/50" />
                    <span>{perm}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No restrictions - full access granted</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Founder Priority Note */}
      {tenantMode === 'founder' && (
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Founder Priority Override Active</p>
              <p className="text-sm text-muted-foreground">
                Your instance is the Alpha node. New capabilities deploy here first. 
                Internal success becomes external proof.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-xl bg-card border border-border shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-warning" />
                <h3 className="text-lg font-semibold">Leave Founder Mode?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Switching to {pendingMode === 'customer' ? 'Customer' : 'Demo'} Mode will restrict 
                access to core system controls. You can return to Founder Mode at any time.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowWarning(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmModeChange} className="btn-power">
                  Switch Mode
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiTenantControl;

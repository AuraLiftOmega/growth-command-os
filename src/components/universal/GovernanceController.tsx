import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Check,
  X,
  Key,
  Users,
  Settings,
  Database,
  Code,
  Copy,
  Download,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDominionStore } from '@/stores/dominion-core-store';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * GOVERNANCE CONTROLLER - MODULE D
 * 
 * Enforces:
 * - Founder-only master control
 * - Role-based access (view / execute / admin)
 * - Protection against:
 *   - System logic export
 *   - Workflow copying
 *   - Architecture reverse engineering
 * 
 * All automation remains centrally governed.
 */

interface ProtectedAction {
  id: string;
  name: string;
  description: string;
  requiredRole: 'admin' | 'moderator' | 'user';
  icon: any;
  category: 'view' | 'execute' | 'admin' | 'founder';
  isBlocked: boolean;
}

const PROTECTED_ACTIONS: ProtectedAction[] = [
  // Founder-Only Actions
  { id: 'export_logic', name: 'Export System Logic', description: 'Download automation workflows', requiredRole: 'admin', icon: Download, category: 'founder', isBlocked: true },
  { id: 'copy_workflows', name: 'Copy Full Workflows', description: 'Duplicate complete automation chains', requiredRole: 'admin', icon: Copy, category: 'founder', isBlocked: true },
  { id: 'access_architecture', name: 'View Architecture', description: 'Access system design documents', requiredRole: 'admin', icon: Code, category: 'founder', isBlocked: true },
  { id: 'modify_core', name: 'Modify Core Engine', description: 'Change fundamental system behavior', requiredRole: 'admin', icon: Settings, category: 'founder', isBlocked: false },
  
  // Admin Actions
  { id: 'manage_users', name: 'Manage Users', description: 'Add/remove user access', requiredRole: 'admin', icon: Users, category: 'admin', isBlocked: false },
  { id: 'modify_pricing', name: 'Modify Pricing', description: 'Change pricing rules and tiers', requiredRole: 'admin', icon: Key, category: 'admin', isBlocked: false },
  { id: 'access_database', name: 'Direct Database Access', description: 'Query raw data tables', requiredRole: 'admin', icon: Database, category: 'admin', isBlocked: false },
  
  // Execute Actions
  { id: 'run_automations', name: 'Run Automations', description: 'Execute configured automations', requiredRole: 'moderator', icon: Settings, category: 'execute', isBlocked: false },
  { id: 'generate_content', name: 'Generate Content', description: 'Create new content and creatives', requiredRole: 'moderator', icon: Code, category: 'execute', isBlocked: false },
  
  // View Actions
  { id: 'view_dashboard', name: 'View Dashboard', description: 'Access performance metrics', requiredRole: 'user', icon: Eye, category: 'view', isBlocked: false },
  { id: 'view_reports', name: 'View Reports', description: 'Access generated reports', requiredRole: 'user', icon: Eye, category: 'view', isBlocked: false },
];

interface UserRole {
  role: 'admin' | 'moderator' | 'user';
}

export const GovernanceController = () => {
  const { user } = useAuth();
  const { tenantMode, isFounderInstance } = useDominionStore();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlockedAttempts, setShowBlockedAttempts] = useState(false);
  const [blockedAttempts, setBlockedAttempts] = useState<{ action: string; timestamp: Date }[]>([]);

  // Fetch user roles from database
  useEffect(() => {
    const fetchRoles = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!error && data) {
        setUserRoles(data as UserRole[]);
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user?.id]);

  const hasRole = (requiredRole: 'admin' | 'moderator' | 'user'): boolean => {
    // Founder mode always has full access
    if (isFounderInstance && tenantMode === 'founder') return true;
    
    // Check role hierarchy
    const roleHierarchy = { admin: 3, moderator: 2, user: 1 };
    const userMaxRole = userRoles.reduce((max, r) => 
      Math.max(max, roleHierarchy[r.role] || 0), 0
    );
    
    return userMaxRole >= roleHierarchy[requiredRole];
  };

  const canPerformAction = (action: ProtectedAction): boolean => {
    // Permanently blocked actions
    if (action.isBlocked && action.category === 'founder') return false;
    
    // Role-based access
    return hasRole(action.requiredRole);
  };

  const handleActionAttempt = (action: ProtectedAction) => {
    if (!canPerformAction(action)) {
      setBlockedAttempts(prev => [
        { action: action.name, timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);
    }
  };

  const isFounder = isFounderInstance && tenantMode === 'founder';

  const categories = [
    { id: 'founder', name: 'Founder-Only', color: 'text-primary', bgColor: 'bg-primary/10' },
    { id: 'admin', name: 'Admin', color: 'text-accent', bgColor: 'bg-accent/10' },
    { id: 'execute', name: 'Execute', color: 'text-success', bgColor: 'bg-success/10' },
    { id: 'view', name: 'View', color: 'text-muted-foreground', bgColor: 'bg-secondary' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Governance Controller</h2>
            <p className="text-sm text-muted-foreground">
              Central authority over all system access
            </p>
          </div>
        </div>

        {isFounder && (
          <Badge variant="outline" className="gap-2 border-primary/50 text-primary">
            <Crown className="w-4 h-4" />
            Founder Override Active
          </Badge>
        )}
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-lg bg-success/10 border border-success/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">System Locked</span>
          </div>
          <p className="text-2xl font-mono font-bold text-success">ACTIVE</p>
          <p className="text-xs text-muted-foreground mt-1">Core logic protected</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-lg bg-accent/10 border border-accent/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <Fingerprint className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium">Export Protection</span>
          </div>
          <p className="text-2xl font-mono font-bold text-accent">ENABLED</p>
          <p className="text-xs text-muted-foreground mt-1">No external copying</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-lg bg-card border border-border"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium">Blocked Attempts</span>
          </div>
          <p className="text-2xl font-mono font-bold">{blockedAttempts.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
        </motion.div>
      </div>

      {/* Immutable Protections */}
      <div className="p-4 rounded-lg border-2 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-5 h-5 text-destructive" />
          <h3 className="font-semibold text-destructive">IMMUTABLE PROTECTIONS</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          These protections cannot be disabled by any user, including the founder. 
          They ensure system integrity and prevent unauthorized replication.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <X className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Export System Logic</span>
            </div>
            <p className="text-xs text-muted-foreground">Permanently blocked</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <X className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Copy Full Workflows</span>
            </div>
            <p className="text-xs text-muted-foreground">Permanently blocked</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <X className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Reverse Engineer</span>
            </div>
            <p className="text-xs text-muted-foreground">Permanently blocked</p>
          </div>
        </div>
      </div>

      {/* Permission Categories */}
      <div className="space-y-4">
        <h3 className="font-semibold">Access Control Matrix</h3>
        
        {categories.map((category) => {
          const categoryActions = PROTECTED_ACTIONS.filter(a => a.category === category.id);
          
          return (
            <div key={category.id} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={cn("w-3 h-3 rounded-full", category.bgColor)} />
                <h4 className={cn("font-medium", category.color)}>{category.name}</h4>
                <Badge variant="outline" className="ml-auto text-xs">
                  {categoryActions.length} actions
                </Badge>
              </div>
              
              <div className="space-y-2">
                {categoryActions.map((action) => {
                  const canPerform = canPerformAction(action);
                  
                  return (
                    <div
                      key={action.id}
                      onClick={() => handleActionAttempt(action)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer",
                        action.isBlocked 
                          ? "bg-destructive/5 border border-destructive/20"
                          : canPerform
                          ? "bg-secondary/30 hover:bg-secondary/50"
                          : "bg-muted/30 opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className={cn(
                          "w-4 h-4",
                          action.isBlocked ? "text-destructive" : canPerform ? "text-foreground" : "text-muted-foreground"
                        )} />
                        <div>
                          <p className={cn(
                            "text-sm font-medium",
                            action.isBlocked && "text-destructive line-through"
                          )}>
                            {action.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {action.requiredRole}
                        </Badge>
                        {action.isBlocked ? (
                          <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-destructive" />
                          </div>
                        ) : canPerform ? (
                          <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-success" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <EyeOff className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Blocked Attempts Log */}
      {blockedAttempts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h4 className="font-medium">Recent Blocked Attempts</h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBlockedAttempts([])}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {blockedAttempts.map((attempt, i) => (
              <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-warning/5">
                <span className="text-muted-foreground">{attempt.action}</span>
                <span className="text-xs text-muted-foreground">
                  {attempt.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Governance Philosophy */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <Crown className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Governance Philosophy</p>
            <p className="text-sm text-muted-foreground">
              DOMINION operates under founder sovereignty. External users can execute 
              automations but never export, copy, or reverse-engineer the core system. 
              All intelligence remains centrally governed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceController;

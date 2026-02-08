import { Link } from 'react-router-dom';
import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { Badge } from '@/components/ui/badge';
import {
  Activity, BarChart3, Brain, CreditCard, DollarSign, Globe,
  Layers, Lock, Megaphone, Package, Radio, Rocket, Shield, ShoppingBag,
  Target, Users, Zap, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle,
  Server, Wifi, Database, Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

type SystemStatus = 'operational' | 'degraded' | 'down';

interface SubsystemCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  category: 'finance' | 'marketing' | 'operations' | 'intelligence' | 'admin';
  status: SystemStatus;
  metric?: string;
  metricLabel?: string;
}

const statusConfig: Record<SystemStatus, { color: string; icon: React.ElementType; label: string }> = {
  operational: { color: 'text-success', icon: CheckCircle2, label: 'Operational' },
  degraded: { color: 'text-warning', icon: AlertTriangle, label: 'Degraded' },
  down: { color: 'text-destructive', icon: XCircle, label: 'Down' },
};

const categoryColors: Record<string, string> = {
  finance: 'from-green-500/20 to-emerald-500/10 border-success/20',
  marketing: 'from-purple-500/20 to-fuchsia-500/10 border-primary/20',
  operations: 'from-blue-500/20 to-cyan-500/10 border-accent/20',
  intelligence: 'from-amber-500/20 to-orange-500/10 border-warning/20',
  admin: 'from-red-500/20 to-rose-500/10 border-destructive/20',
};

export default function CoreConsolePage() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const [liveStats, setLiveStats] = useState({
    totalContacts: 0,
    activeAutomations: 0,
    totalAds: 0,
    activeBots: 0,
  });

  useEffect(() => {
    if (!user) return;
    const loadStats = async () => {
      const [contactsRes, automationsRes, adsRes, botsRes] = await Promise.all([
        supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('autonomous_posting_rules').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
        supabase.from('ads').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('bot_configs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
      ]);
      setLiveStats({
        totalContacts: contactsRes.count ?? 0,
        activeAutomations: automationsRes.count ?? 0,
        totalAds: adsRes.count ?? 0,
        activeBots: botsRes.count ?? 0,
      });
    };
    loadStats();
  }, [user]);

  const subsystems: SubsystemCard[] = [
    // Finance
    { id: 'revenue-engine', title: 'Revenue Engine', description: 'Shopify sales, payouts & bank sync', icon: DollarSign, path: '/dashboard/revenue-engine', category: 'finance', status: 'operational', metric: 'Live', metricLabel: 'Tracking' },
    { id: 'payments-spine', title: 'Payments Spine', description: 'Multi-project Stripe telemetry', icon: CreditCard, path: '/dashboard/payments-spine', category: 'finance', status: 'operational' },
    { id: 'billing-admin', title: 'Billing Admin', description: 'Subscriptions & webhook health', icon: CreditCard, path: '/admin/billing', category: 'finance', status: 'operational' },
    { id: 'revenue-command', title: 'Revenue Command', description: 'Profit engine & margin control', icon: BarChart3, path: '/revenue-command', category: 'finance', status: 'operational' },

    // Marketing
    { id: 'social-channels', title: 'Social Channels', description: 'Platform connections & posting', icon: Megaphone, path: '/dashboard/social-channels', category: 'marketing', status: 'operational', metric: String(liveStats.totalAds), metricLabel: 'Ads' },
    { id: 'omega-comms', title: 'OMEGA Comms', description: 'Real-time team communication', icon: Radio, path: '/comms', category: 'marketing', status: 'operational' },
    { id: 'live-chat', title: 'Live Chat', description: 'AI sales conversations', icon: Users, path: '/dashboard/live-chat', category: 'marketing', status: 'operational' },

    // Operations
    { id: 'store', title: 'Storefront', description: 'Product catalog & store builder', icon: ShoppingBag, path: '/store', category: 'operations', status: 'operational' },
    { id: 'automations', title: 'Automations', description: 'Workflows & posting rules', icon: Zap, path: '/automations', category: 'operations', status: 'operational', metric: String(liveStats.activeAutomations), metricLabel: 'Active' },
    { id: 'experiences', title: 'Experiences', description: 'AR, demos & interactive content', icon: Globe, path: '/experiences', category: 'operations', status: 'operational' },
    { id: 'integrations', title: 'Integrations', description: 'Shopify, CJ, Stripe, Slack & more', icon: Layers, path: '/settings/integrations', category: 'operations', status: 'operational' },
    { id: 'shopify-control', title: 'Shopify Control', description: 'Store lock, tokens & webhooks', icon: Lock, path: '/admin/shopify-control-center', category: 'operations', status: 'operational' },

    // Intelligence
    { id: 'brain', title: 'OMEGA Brain', description: 'AI suggestions & learning engine', icon: Brain, path: '/brain', category: 'intelligence', status: 'operational' },
    { id: 'crm', title: 'CRM', description: 'Contacts, deals & pipeline', icon: Target, path: '/crm/contacts', category: 'intelligence', status: 'operational', metric: String(liveStats.totalContacts), metricLabel: 'Contacts' },
    { id: 'ceo-brain', title: 'CEO Brain', description: 'Strategic AI orchestrator', icon: Rocket, path: '/ceo-brain', category: 'intelligence', status: 'operational' },
    { id: 'war-room', title: 'War Room', description: 'Real-time competitive intel', icon: Activity, path: '/war-room', category: 'intelligence', status: 'operational' },

    // Admin
    { id: 'security', title: 'Security Audit', description: 'Threat detection & hardening', icon: Shield, path: '/dashboard/security-audit', category: 'admin', status: 'operational' },
    { id: 'users', title: 'Users & Orgs', description: 'Team management & RBAC', icon: Users, path: '/admin/users', category: 'admin', status: 'operational' },
    { id: 'bot-team', title: 'Bot Army', description: 'Autonomous bot orchestration', icon: Server, path: '/dashboard', category: 'admin', status: 'operational', metric: String(liveStats.activeBots), metricLabel: 'Active' },
  ];

  const categories = [
    { key: 'finance', label: '💰 Finance & Revenue', icon: DollarSign },
    { key: 'marketing', label: '📣 Marketing & Comms', icon: Megaphone },
    { key: 'operations', label: '⚙️ Operations', icon: Package },
    { key: 'intelligence', label: '🧠 Intelligence', icon: Brain },
    { key: 'admin', label: '🔒 Admin & Security', icon: Shield },
  ];

  const allOperational = subsystems.every(s => s.status === 'operational');
  const degradedCount = subsystems.filter(s => s.status === 'degraded').length;
  const downCount = subsystems.filter(s => s.status === 'down').length;

  return (
    <MasterOSLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Core System Console</h1>
            <p className="text-muted-foreground mt-1">
              {currentOrg?.name || 'MASTER_OS'} — Central Operations Hub
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
              <Wifi className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">
                {allOperational ? 'All Systems Operational' : `${degradedCount + downCount} Issues`}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Subsystems', value: subsystems.length, icon: Server, color: 'text-primary' },
            { label: 'Operational', value: subsystems.filter(s => s.status === 'operational').length, icon: CheckCircle2, color: 'text-success' },
            { label: 'Active Bots', value: liveStats.activeBots, icon: Zap, color: 'text-accent' },
            { label: 'CRM Contacts', value: liveStats.totalContacts, icon: Users, color: 'text-warning' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center justify-between">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-2xl font-black">{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Category Sections */}
        {categories.map(cat => {
          const items = subsystems.filter(s => s.category === cat.key);
          if (!items.length) return null;

          return (
            <section key={cat.key}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {cat.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {items.map((sys, i) => {
                  const StatusIcon = statusConfig[sys.status].icon;
                  return (
                    <motion.div
                      key={sys.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to={sys.path}
                        className={`group block p-4 rounded-xl border bg-gradient-to-br ${categoryColors[sys.category]} hover:scale-[1.02] transition-all duration-200`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-lg bg-background/60">
                            <sys.icon className="w-5 h-5 text-foreground" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            {sys.metric && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {sys.metric} {sys.metricLabel}
                              </Badge>
                            )}
                            <StatusIcon className={`w-3.5 h-3.5 ${statusConfig[sys.status].color}`} />
                          </div>
                        </div>
                        <h3 className="font-bold text-sm">{sys.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{sys.description}</p>
                        <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                          Open <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </MasterOSLayout>
  );
}
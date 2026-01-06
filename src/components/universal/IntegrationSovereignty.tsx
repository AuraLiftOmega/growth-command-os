import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Link2, 
  Plus, 
  Check, 
  X, 
  ShoppingBag, 
  BarChart3, 
  Mail, 
  MessageSquare,
  CreditCard,
  Database,
  Calendar,
  Users,
  Zap,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useDominionStore } from '@/stores/dominion-core-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * INTEGRATION SOVEREIGNTY SYSTEM
 * 
 * DOMINION sits ABOVE existing tools as the control layer.
 * - Never requires full replacement unless chosen
 * - Orchestrates existing systems
 * - Replaces humans first, tools last
 */

interface Integration {
  id: string;
  name: string;
  category: 'commerce' | 'ads' | 'email' | 'crm' | 'payments' | 'analytics' | 'calendar' | 'communication';
  icon: any;
  description: string;
  status: 'connected' | 'available' | 'coming_soon';
  orchestrated: boolean;
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  // Commerce
  { id: 'shopify', name: 'Shopify', category: 'commerce', icon: ShoppingBag, description: 'E-commerce platform', status: 'connected', orchestrated: true },
  { id: 'woocommerce', name: 'WooCommerce', category: 'commerce', icon: ShoppingBag, description: 'WordPress commerce', status: 'available', orchestrated: false },
  
  // Ads
  { id: 'meta_ads', name: 'Meta Ads', category: 'ads', icon: BarChart3, description: 'Facebook & Instagram ads', status: 'available', orchestrated: false },
  { id: 'google_ads', name: 'Google Ads', category: 'ads', icon: BarChart3, description: 'Search & display ads', status: 'available', orchestrated: false },
  { id: 'tiktok_ads', name: 'TikTok Ads', category: 'ads', icon: BarChart3, description: 'TikTok advertising', status: 'available', orchestrated: false },
  
  // Email
  { id: 'klaviyo', name: 'Klaviyo', category: 'email', icon: Mail, description: 'E-commerce email', status: 'available', orchestrated: false },
  { id: 'convertkit', name: 'ConvertKit', category: 'email', icon: Mail, description: 'Creator email', status: 'available', orchestrated: false },
  
  // CRM
  { id: 'hubspot', name: 'HubSpot', category: 'crm', icon: Users, description: 'CRM & marketing', status: 'available', orchestrated: false },
  { id: 'salesforce', name: 'Salesforce', category: 'crm', icon: Users, description: 'Enterprise CRM', status: 'coming_soon', orchestrated: false },
  
  // Payments
  { id: 'stripe', name: 'Stripe', category: 'payments', icon: CreditCard, description: 'Payment processing', status: 'available', orchestrated: false },
  
  // Calendar
  { id: 'calendly', name: 'Calendly', category: 'calendar', icon: Calendar, description: 'Scheduling', status: 'available', orchestrated: false },
  
  // Communication
  { id: 'slack', name: 'Slack', category: 'communication', icon: MessageSquare, description: 'Team communication', status: 'available', orchestrated: false },
];

const categories = [
  { id: 'all', name: 'All' },
  { id: 'commerce', name: 'Commerce' },
  { id: 'ads', name: 'Advertising' },
  { id: 'email', name: 'Email' },
  { id: 'crm', name: 'CRM' },
  { id: 'payments', name: 'Payments' },
];

export const IntegrationSovereignty = () => {
  const { connectedIntegrations, addIntegration, removeIntegration } = useDominionStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [integrations, setIntegrations] = useState(AVAILABLE_INTEGRATIONS);

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const handleConnect = (integrationId: string) => {
    addIntegration(integrationId);
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { ...i, status: 'connected' as const, orchestrated: true } : i
    ));
  };

  const handleDisconnect = (integrationId: string) => {
    removeIntegration(integrationId);
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { ...i, status: 'available' as const, orchestrated: false } : i
    ));
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const orchestratedCount = integrations.filter(i => i.orchestrated).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Integration Sovereignty</h2>
              <p className="text-sm text-muted-foreground">DOMINION orchestrates your existing tools</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-mono font-bold">{connectedCount}</p>
            <p className="text-xs text-muted-foreground">Connected</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-accent">{orchestratedCount}</p>
            <p className="text-xs text-muted-foreground">Orchestrated</p>
          </div>
        </div>
      </div>

      {/* Philosophy */}
      <div className="p-4 rounded-lg bg-card/50 border border-border/50">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Integration Philosophy</p>
            <p className="text-sm text-muted-foreground">
              DOMINION sits above your existing tools as the control layer. No full replacement required. 
              We orchestrate your systems and replace humans first, tools last.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-4 rounded-lg border transition-all",
              integration.status === 'connected'
                ? "bg-success/5 border-success/20"
                : integration.status === 'coming_soon'
                ? "bg-card/30 border-border/30 opacity-60"
                : "bg-card/50 border-border/50 hover:border-border"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  integration.status === 'connected' ? "bg-success/20" : "bg-secondary"
                )}>
                  <integration.icon className={cn(
                    "w-5 h-5",
                    integration.status === 'connected' ? "text-success" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <h3 className="font-medium">{integration.name}</h3>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {integration.status === 'connected' ? (
                <>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-xs text-success">Connected</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDisconnect(integration.id)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Disconnect
                  </Button>
                </>
              ) : integration.status === 'coming_soon' ? (
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnect(integration.id)}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Connect
                </Button>
              )}
            </div>

            {integration.orchestrated && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-accent" />
                  <span className="text-xs text-accent">Orchestrated by DOMINION</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Orchestration Status */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Orchestration Layer</h3>
        <p className="text-sm text-muted-foreground mb-4">
          DOMINION acts as the command layer. Existing tools become execution nodes. 
          No forced migrations. No operational disruption.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm">Traffic Generation</span>
            </div>
            <span className="text-xs text-muted-foreground">Meta Ads, Google Ads, TikTok</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm">Commerce Operations</span>
            </div>
            <span className="text-xs text-muted-foreground">Shopify, Stripe</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm">Customer Intelligence</span>
            </div>
            <span className="text-xs text-muted-foreground">HubSpot, Klaviyo</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm">Sales Automation</span>
            </div>
            <span className="text-xs text-muted-foreground">Calendly, Email</span>
          </div>
        </div>
      </div>

      {/* Command Layer Visualization */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Command Layer Architecture
        </h3>
        <div className="relative">
          {/* DOMINION Core */}
          <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary/50 text-center mb-4">
            <p className="font-semibold text-primary">DOMINION CORE</p>
            <p className="text-xs text-muted-foreground">Central Intelligence & Orchestration</p>
          </div>
          
          {/* Arrows */}
          <div className="flex justify-center mb-4">
            <div className="w-px h-6 bg-primary/50" />
          </div>
          
          {/* Execution Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['CRM', 'Ads', 'Email', 'Commerce'].map((node) => (
              <div key={node} className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
                <p className="text-sm font-medium">{node}</p>
                <p className="text-xs text-muted-foreground">Execution Node</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          DOMINION never requires full system replacement. Your tools execute, DOMINION commands.
        </p>
      </div>
    </div>
  );
};

export default IntegrationSovereignty;

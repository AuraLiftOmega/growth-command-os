import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StoreManagementPanel } from "@/components/settings/StoreManagementPanel";
import { PricingPanel } from "@/components/settings/PricingPanel";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminEntitlements } from "@/hooks/useAdminEntitlements";
import { Badge } from "@/components/ui/badge";
import { Crown, Clock, Shield, Infinity } from "lucide-react";
import { SlackIntegrationConfig } from "@/components/integrations/SlackIntegrationConfig";
import { SlackChannelConfig } from "@/components/integrations/SlackChannelConfig";
import { GeekbotConfig } from "@/components/integrations/GeekbotConfig";
import { ProductIntakePanel } from "@/components/product-intake";
import { ContentAssistantEngine } from "@/components/content-assist";

export default function Settings() {
  const { subscription, isTrialing, trialDaysLeft, isAdmin } = useSubscription();
  const { entitlements, ADMIN_EMAIL } = useAdminEntitlements();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Admin Mode Banner */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-500">Admin Override Active</p>
                  <p className="text-xs text-muted-foreground">
                    Unlimited usage enabled for {ADMIN_EMAIL}. All credit checks bypassed.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1 border-green-500/50 text-green-500">
                    <Infinity className="w-3 h-3" />
                    Unlimited
                  </Badge>
                </div>
              </motion.div>
            )}

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your stores, integrations, and subscription
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Badge className="gap-1 bg-green-500/20 text-green-500 border-green-500/50">
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Badge>
                )}
                {subscription && (
                  <>
                    <Badge variant="outline" className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                    </Badge>
                    {isTrialing && !isAdmin && (
                      <Badge variant="secondary" className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {trialDaysLeft} days left
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Store Management */}
            <StoreManagementPanel />

            {/* Product & Content Tools */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold">Product & Content Tools</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <ProductIntakePanel showConnectOption={false} />
                <ContentAssistantEngine />
              </div>
            </motion.div>

            {/* Integrations Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold">Integrations</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <SlackIntegrationConfig />
                <GeekbotConfig />
              </div>
              <SlackChannelConfig />
            </motion.div>

            {/* Pricing - hide for admin */}
            {!isAdmin && <PricingPanel />}
            
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-secondary/30 border border-border"
              >
                <h3 className="font-semibold mb-2">Admin Entitlements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="p-2 rounded bg-green-500/10 text-center">
                    <p className="text-green-500 font-medium">✓ Unlimited Generation</p>
                  </div>
                  <div className="p-2 rounded bg-green-500/10 text-center">
                    <p className="text-green-500 font-medium">✓ Bypass Credits</p>
                  </div>
                  <div className="p-2 rounded bg-green-500/10 text-center">
                    <p className="text-green-500 font-medium">✓ Bypass Paywalls</p>
                  </div>
                  <div className="p-2 rounded bg-green-500/10 text-center">
                    <p className="text-green-500 font-medium">✓ All Features</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

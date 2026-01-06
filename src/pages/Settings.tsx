import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StoreManagementPanel } from "@/components/settings/StoreManagementPanel";
import { PricingPanel } from "@/components/settings/PricingPanel";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Crown, Clock } from "lucide-react";

export default function Settings() {
  const { subscription, isTrialing, trialDaysLeft } = useSubscription();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your stores and subscription
                </p>
              </div>
              
              {subscription && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                  </Badge>
                  {isTrialing && (
                    <Badge variant="secondary" className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {trialDaysLeft} days left
                    </Badge>
                  )}
                </div>
              )}
            </motion.div>

            {/* Store Management */}
            <StoreManagementPanel />

            {/* Pricing */}
            <PricingPanel />
          </div>
        </main>
      </div>
    </div>
  );
}

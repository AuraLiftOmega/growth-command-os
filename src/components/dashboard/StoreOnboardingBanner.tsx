import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Zap, ArrowRight, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/useUserStore";
import { ConnectShopifyModal } from "@/components/settings/ConnectShopifyModal";

export function StoreOnboardingBanner() {
  const { stores, isLoading, primaryStore } = useUserStore();
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  // Don't show if loading or has stores
  if (isLoading || stores.length > 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30 relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  Connect Your Shopify Store
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">
                    Quick Setup
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Unlock the autonomous revenue engine — AI-powered creatives, auto-publishing, and 24/7 profit optimization.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span>Your data stays private</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span>Disconnect anytime</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-success" />
                  <span>Secure OAuth</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="lg"
              onClick={() => setConnectModalOpen(true)}
              className="gap-2 shadow-lg shadow-primary/25"
            >
              <Zap className="w-4 h-4" />
              Connect Store
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <ConnectShopifyModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
      />
    </>
  );
}

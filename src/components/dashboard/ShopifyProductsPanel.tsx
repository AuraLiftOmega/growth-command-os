import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, ExternalLink, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/shopify/ProductGrid";
import { CartDrawer } from "@/components/shopify/CartDrawer";
import { useUserStore } from "@/hooks/useUserStore";
import { ConnectShopifyModal } from "@/components/settings/ConnectShopifyModal";

export const ShopifyProductsPanel = () => {
  const { primaryStore, hasConnectedStore, isLoading } = useUserStore();
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 flex items-center justify-center min-h-[300px]"
      >
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </motion.div>
    );
  }

  if (!hasConnectedStore) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect Your Shopify Store</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your Shopify store to sync products, manage orders, and power AI-driven marketing campaigns.
            </p>
            <Button onClick={() => setConnectModalOpen(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Connect Shopify Store
            </Button>
          </div>
        </motion.div>

        <ConnectShopifyModal
          open={connectModalOpen}
          onOpenChange={setConnectModalOpen}
        />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Product Catalog</h3>
            <p className="text-sm text-muted-foreground">
              {primaryStore?.store_name || "Connected Store"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CartDrawer />
          {primaryStore && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`https://${primaryStore.store_domain}/admin`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Shopify Admin
            </Button>
          )}
        </div>
      </div>

      <ProductGrid limit={12} store={primaryStore ?? undefined} />
    </motion.div>
  );
};

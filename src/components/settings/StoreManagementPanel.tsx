import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Store, 
  Plus, 
  Trash2, 
  Star, 
  ExternalLink, 
  RefreshCw,
  Crown,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/hooks/useUserStore";
import { useSubscription, PLAN_FEATURES } from "@/hooks/useSubscription";
import { ConnectShopifyModal } from "@/components/settings/ConnectShopifyModal";
import { toast } from "sonner";

export function StoreManagementPanel() {
  const { stores, primaryStore, isLoading, removeStore, setPrimaryStoreById, refetch } = useUserStore();
  const { subscription, canAddStore, planFeatures } = useSubscription();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRemoveStore = async (storeId: string, storeName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${storeName}? This will remove all synced data.`)) {
      return;
    }

    setDeletingId(storeId);
    try {
      await removeStore(storeId);
      toast.success(`${storeName} disconnected`);
    } catch (error) {
      toast.error("Failed to disconnect store");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (storeId: string) => {
    try {
      await setPrimaryStoreById(storeId);
      toast.success("Primary store updated");
    } catch (error) {
      toast.error("Failed to update primary store");
    }
  };

  const storesLimit = planFeatures.stores === -1 ? "∞" : planFeatures.stores;
  const storesUsed = stores.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20">
            <Store className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Connected Stores</h3>
            <p className="text-sm text-muted-foreground">
              {storesUsed} of {storesLimit} stores used
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {subscription && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              {PLAN_FEATURES[subscription.plan].name}
            </Badge>
          )}
          <Button
            size="sm"
            onClick={() => setConnectModalOpen(true)}
            disabled={!canAddStore}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Store
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : stores.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium mb-2">No stores connected</h4>
          <p className="text-muted-foreground mb-4">
            Connect your Shopify store to start managing products and orders
          </p>
          <Button onClick={() => setConnectModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Connect Your First Store
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {stores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border transition-all ${
                store.is_primary 
                  ? "bg-primary/5 border-primary/30" 
                  : "bg-secondary/30 border-border/50 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🛍️</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{store.store_name}</h4>
                      {store.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{store.store_domain}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-success">
                      ${store.total_revenue?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {store.products_count || 0} products
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {!store.is_primary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSetPrimary(store.id)}
                        title="Set as primary"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`https://${store.store_domain}/admin`, "_blank")}
                      title="Open Shopify Admin"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveStore(store.id, store.store_name)}
                      disabled={deletingId === store.id}
                      title="Disconnect store"
                    >
                      {deletingId === store.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!canAddStore && stores.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/30"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-warning" />
            <div>
              <p className="font-medium text-sm">Store limit reached</p>
              <p className="text-xs text-muted-foreground">
                Upgrade your plan to connect more stores
              </p>
            </div>
            <Button size="sm" variant="outline" className="ml-auto">
              Upgrade Plan
            </Button>
          </div>
        </motion.div>
      )}

      <ConnectShopifyModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
      />
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Store, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/shopify/ProductGrid";
import { CartDrawer } from "@/components/shopify/CartDrawer";
import { SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";

export const ShopifyProductsPanel = () => {
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
              Connected to Shopify
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CartDrawer />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/admin`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Shopify Admin
          </Button>
        </div>
      </div>

      <ProductGrid limit={12} />
    </motion.div>
  );
};

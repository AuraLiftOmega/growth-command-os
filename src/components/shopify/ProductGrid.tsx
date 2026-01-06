import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, RefreshCw, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { createShopifyClient, ShopifyProduct } from "@/lib/multi-tenant-shopify";
import type { UserStoreConnection } from "@/hooks/useUserStore";

interface ProductGridProps {
  searchQuery?: string;
  limit?: number;
  store?: UserStoreConnection | null;
}

export const ProductGrid = ({ searchQuery, limit = 20, store }: ProductGridProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!store) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const client = createShopifyClient(store);
      const data = await client.fetchProducts(limit, searchQuery);
      setProducts(data);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchQuery, limit, store?.id]);

  if (!store) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-secondary/20 border border-border/50 rounded-xl"
      >
        <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Store Connected</h3>
        <p className="text-sm text-muted-foreground">
          Connect a Shopify store to view products
        </p>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="aspect-square bg-secondary/30 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadProducts} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-card border border-border rounded-xl"
      >
        <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Your Shopify store doesn't have any products. Add products in your Shopify admin.
        </p>
        <Button
          variant="outline"
          onClick={() => window.open(`https://${store.store_domain}/admin/products`, "_blank")}
        >
          Open Shopify Products
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <ProductCard 
          key={product.node.id} 
          product={product} 
          index={index}
          store={store}
        />
      ))}
    </div>
  );
};

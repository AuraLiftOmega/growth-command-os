import { useState, useEffect } from "react";
import { Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StoreProductCard } from "./StoreProductCard";
import { ProductQuickView } from "./ProductQuickView";
import { 
  ShopifyProduct, 
  storefrontApiRequest, 
  PRODUCTS_QUERY 
} from "@/lib/shopify-config";
import { useActiveStore } from "@/hooks/useActiveStore";

interface StoreProductGridProps {
  category?: string;
  limit?: number;
  showQuickView?: boolean;
}

export function StoreProductGrid({ 
  category, 
  limit = 20,
  showQuickView = true 
}: StoreProductGridProps) {
  const { activeStore, hasConnectedStores } = useActiveStore();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<ShopifyProduct | null>(null);

  useEffect(() => {
    async function loadProducts() {
      if (!activeStore) {
        setIsLoading(false);
        setProducts([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Build query - filter by category if specified
        let query = undefined;
        if (category && category !== 'all') {
          query = `product_type:"${category}"`;
        }
        
        console.log('Loading products with query:', query);
        const data = await storefrontApiRequest(
          activeStore.storeDomain,
          activeStore.storefrontToken,
          PRODUCTS_QUERY, 
          { first: limit, query }
        );
        
        if (data?.data?.products?.edges) {
          console.log('Products loaded:', data.data.products.edges.length);
          setProducts(data.data.products.edges);
        } else if (data?.error) {
          console.warn('Shopify API returned error:', data.error);
          setProducts([]);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [category, limit, activeStore]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasConnectedStores) {
    return (
      <div className="text-center py-20">
        <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Store Connected</h3>
        <p className="text-muted-foreground mb-4">
          Connect your Shopify store to display products
        </p>
        <Button asChild>
          <Link to="/dashboard/social-channels">Connect Shopify Store</Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <StoreProductCard
            key={product.node.id}
            product={product}
            index={index}
            onQuickView={showQuickView ? setQuickViewProduct : undefined}
          />
        ))}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          open={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}

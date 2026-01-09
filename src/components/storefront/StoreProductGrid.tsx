import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { StoreProductCard } from "./StoreProductCard";
import { ProductQuickView } from "./ProductQuickView";
import { 
  ShopifyProduct, 
  storefrontApiRequest, 
  PRODUCTS_QUERY 
} from "@/lib/shopify-config";

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
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<ShopifyProduct | null>(null);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Filter by AuraLift Beauty vendor, optionally also by category
        let query = 'vendor:"AuraLift Beauty"';
        if (category && category !== 'all') {
          query += ` AND product_type:${category}`;
        }
        const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: limit, query });
        setProducts(data.data.products.edges || []);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [category, limit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

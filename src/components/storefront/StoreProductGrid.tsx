import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StoreProductCard } from "./StoreProductCard";
import { ProductQuickView } from "./ProductQuickView";
import { ShopifyProduct } from "@/lib/shopify-config";
import { supabase } from "@/integrations/supabase/client";

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
        // Build query - filter by product_type if category specified
        let query: string | undefined = undefined;
        if (category && category.toLowerCase() !== 'all') {
          query = `product_type:${category}`;
        }
        
        console.log('Loading products via edge function with query:', query);
        
        // Use edge function to fetch products via Admin API
        const { data, error: fnError } = await supabase.functions.invoke('fetch-shopify-products', {
          body: { limit, query }
        });
        
        if (fnError) {
          console.error('Edge function error:', fnError);
          setError('Failed to load products');
          return;
        }
        
        if (data?.products) {
          console.log('Products loaded:', data.products.length);
          setProducts(data.products);
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
  }, [category, limit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Removed "No Store Connected" check - we always have fallback credentials

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

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

// Fallback store credentials for public pages
const FALLBACK_STORE_DOMAIN = "lovable-project-7fb70.myshopify.com";
const FALLBACK_STOREFRONT_TOKEN = "d9830af538b34d418e1167726cf1f67a";

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
  const { activeStore } = useActiveStore();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<ShopifyProduct | null>(null);

  // Use active store or fallback to direct credentials
  const storeDomain = activeStore?.storeDomain || FALLBACK_STORE_DOMAIN;
  const storefrontToken = activeStore?.storefrontToken || FALLBACK_STOREFRONT_TOKEN;

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Build query - filter by product_type if category specified
        let query: string | undefined = undefined;
        if (category && category.toLowerCase() !== 'all') {
          // Case-insensitive matching for product_type
          query = `product_type:${category}`;
        }
        
        console.log('Loading products with query:', query);
        const data = await storefrontApiRequest(
          storeDomain,
          storefrontToken,
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
  }, [category, limit, storeDomain, storefrontToken]);

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

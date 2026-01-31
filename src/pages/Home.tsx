import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShoppingBag, Loader2, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { TrustBadges } from "@/components/storefront/TrustBadges";
import { StoreProductCard } from "@/components/storefront/StoreProductCard";
import { ProductQuickView } from "@/components/storefront/ProductQuickView";
import { STORE_CONFIG } from "@/lib/store-config";
import { ShopifyProduct } from "@/lib/shopify-config";
import { supabase } from "@/integrations/supabase/client";
import heroBanner from "@/assets/skincare-hero.jpg";

export default function Home() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ShopifyProduct | null>(null);

  // Fetch products via edge function (Admin API)
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('fetch-shopify-products', {
          body: { limit: 12 }
        });
        
        if (error) {
          console.error("Edge function error:", error);
          return;
        }
        
        if (data?.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
    document.title = `${STORE_CONFIG.name} | Premium Beauty & Skincare`;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <img 
            src={heroBanner} 
            alt="Luxury skincare products"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Premium Beauty Collection</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              Radiance
              <span className="gradient-text"> Redefined</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Discover our curated collection of premium skincare and beauty essentials. 
              Science-backed formulas for visible results.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="btn-power">
                <a href="#featured-products">
                  Shop Collection
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/store">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  View All Products
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Featured Products Section */}
      <section id="featured-products" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Featured Products
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our best-selling skincare and beauty essentials, handpicked for maximum results
              </p>
            </motion.div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <StoreIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
              <p className="text-muted-foreground mb-4">
                Products will appear here once synced from Shopify
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <StoreProductCard
                  key={product.node.id}
                  product={product}
                  index={index}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline">
                <Link to="/store">
                  View All Products
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          open={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      <StoreFooter />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShoppingBag, Loader2, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { TrustBadges } from "@/components/storefront/TrustBadges";
import { CategorySection } from "@/components/storefront/CategorySection";
import { FeaturedBundles } from "@/components/storefront/FeaturedBundles";
import { LifestyleBanner } from "@/components/storefront/LifestyleBanner";
import { SocialProof } from "@/components/storefront/SocialProof";
import { UpsellStrip } from "@/components/storefront/UpsellStrip";
import { SocialFollow } from "@/components/storefront/SocialFollow";
import { EmailCaptureBanner } from "@/components/storefront/EmailCaptureBanner";
import { StoreProductCard } from "@/components/storefront/StoreProductCard";
import { ProductQuickView } from "@/components/storefront/ProductQuickView";
import { STORE_CONFIG } from "@/lib/store-config";
import { ShopifyProduct, fetchProducts } from "@/lib/storefront-api";
import heroImg from "@/assets/hero-luxury.jpg";

export default function Home() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ShopifyProduct | null>(null);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const result = await fetchProducts({ first: 8 });
        setProducts(result);
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

      {/* Upsell Strip */}
      <UpsellStrip />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 -z-10">
          <img 
            src={heroImg} 
            alt="Luxury skincare collection"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">New: Anti-Aging Collection Now Live</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.95]"
            >
              Radiance
              <br />
              <span className="gradient-text">Redefined</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Science-backed skincare meets luxury beauty tech.
              Clinical-grade formulas. Visible results in 14 days.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="btn-power text-base px-8 py-6">
                <a href="#featured-products">
                  Shop Bestsellers
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
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

      {/* Categories */}
      <CategorySection />

      {/* Featured Products */}
      <section id="featured-products" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Bestsellers
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our most-loved products — trusted by thousands for real results
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
              <h3 className="text-lg font-semibold mb-2">Products Loading...</h3>
              <p className="text-muted-foreground">Check back in a moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Lifestyle Banner */}
      <LifestyleBanner />

      {/* Email Capture */}
      <EmailCaptureBanner />

      {/* Bundles & Upsells */}
      <FeaturedBundles />

      {/* Social Proof */}
      <SocialProof />

      {/* Social Follow */}
      <SocialFollow />

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

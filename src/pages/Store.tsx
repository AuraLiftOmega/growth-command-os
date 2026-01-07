import { useSearchParams } from "react-router-dom";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreHero } from "@/components/storefront/StoreHero";
import { CategorySection } from "@/components/storefront/CategorySection";
import { StoreProductGrid } from "@/components/storefront/StoreProductGrid";
import { TrustBadges } from "@/components/storefront/TrustBadges";
import { StoreFooter } from "@/components/storefront/StoreFooter";

export default function Store() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || undefined;

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      
      {/* Show hero only on main store page */}
      {!category && <StoreHero />}
      
      {/* Categories */}
      {!category && <CategorySection />}

      {/* Trust Badges */}
      <TrustBadges />

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection` : "All Products"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {category 
                ? `Explore our premium ${category} selection`
                : "Premium products engineered for peak performance"
              }
            </p>
          </div>

          <StoreProductGrid category={category} limit={20} />
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}

import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreHero } from "@/components/storefront/StoreHero";
import { CategorySection } from "@/components/storefront/CategorySection";
import { StoreProductGrid } from "@/components/storefront/StoreProductGrid";
import { TrustBadges } from "@/components/storefront/TrustBadges";
import { UpsellStrip } from "@/components/storefront/UpsellStrip";
import { SocialProof } from "@/components/storefront/SocialProof";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { STORE_CONFIG } from "@/lib/store-config";

export default function Store() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || undefined;

  useEffect(() => {
    document.title = category 
      ? `${category} Collection | ${STORE_CONFIG.name}`
      : `${STORE_CONFIG.name} | ${STORE_CONFIG.tagline}`;
  }, [category]);

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <UpsellStrip />
      
      {!category && <StoreHero />}
      {!category && <CategorySection />}

      <TrustBadges />

      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {category ? `${category} Collection` : "All Products"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {category 
                ? `Explore our premium ${category.toLowerCase()} selection`
                : "Premium products engineered for peak performance"
              }
            </p>
          </div>

          <StoreProductGrid category={category} limit={50} />
        </div>
      </section>

      {!category && <SocialProof />}

      <StoreFooter />
    </div>
  );
}

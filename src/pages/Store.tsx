import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreProductGrid } from "@/components/storefront/StoreProductGrid";
import { TrustBadges } from "@/components/storefront/TrustBadges";
import { UpsellStrip } from "@/components/storefront/UpsellStrip";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { STORE_CONFIG } from "@/lib/store-config";
import { CategoryFilter } from "@/components/storefront/CategoryFilter";
import { AuraSalesChat } from "@/components/storefront/AuraSalesChat";

export default function Store() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || undefined;

  useEffect(() => {
    document.title = category 
      ? `${category} | ${STORE_CONFIG.name}`
      : `Shop All | ${STORE_CONFIG.name}`;
  }, [category]);

  const handleCategoryChange = (cat: string | undefined) => {
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <UpsellStrip />

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              {category ? `${category}` : "Shop All Products"}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {category 
                ? `Explore our premium ${category.toLowerCase()} collection`
                : "47 premium beauty & skincare products — curated for real results"
              }
            </p>
          </div>

          {/* Category Filter */}
          <CategoryFilter 
            activeCategory={category} 
            onCategoryChange={handleCategoryChange} 
          />

          {/* Product Grid */}
          <StoreProductGrid category={category} limit={50} />
        </div>
      </section>

      <TrustBadges />
      <StoreFooter />
      <AuraSalesChat />
    </div>
  );
}

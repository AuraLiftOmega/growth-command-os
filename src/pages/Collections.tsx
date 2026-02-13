import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { PLATFORM_CONFIG } from "@/lib/store-config";
import collectionsHero from "@/assets/collections-hero.jpg";
import { useEffect } from "react";

const collections = [
  {
    name: "Skincare",
    description: "Serums, moisturizers, toners, and cleansers formulated with clinical-grade actives.",
    image: "🧴",
    count: "15+ products",
    href: "/store?category=Skincare",
    gradient: "from-rose-500/20 to-pink-500/10",
  },
  {
    name: "Beauty Tools",
    description: "Derma rollers, ice globes, gua sha stones, and professional-grade tools for home use.",
    image: "✨",
    count: "10+ products",
    href: "/store?category=Beauty Tools",
    gradient: "from-violet-500/20 to-purple-500/10",
  },
  {
    name: "Beauty Tech",
    description: "LED masks, RF devices, EMS sculptors, and cutting-edge technology for visible results.",
    image: "💡",
    count: "8+ products",
    href: "/store?category=Beauty Tech",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  {
    name: "Bundles & Sets",
    description: "Curated skincare routines and gift sets at exclusive bundle pricing.",
    image: "🎁",
    count: "6+ sets",
    href: "/store?category=Bundle",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Collections() {
  useEffect(() => {
    document.title = `Collections | ${PLATFORM_CONFIG.name}`;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 -z-10">
          <img src={collectionsHero} alt="Our Collections" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <motion.h1 {...fadeUp} className="text-5xl md:text-7xl font-bold mb-6">
            Shop by <span className="gradient-text">Collection</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ delay: 0.1, duration: 0.6 }} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated categories — from clinical serums to professional beauty devices.
          </motion.p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {collections.map((collection, i) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={collection.href}
                  className={`block p-10 rounded-2xl border border-border/40 bg-gradient-to-br ${collection.gradient} hover:border-primary/40 transition-all duration-300 group h-full`}
                >
                  <div className="text-5xl mb-6">{collection.image}</div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {collection.name}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {collection.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{collection.count}</span>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                      Browse Collection <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products CTA */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeUp} className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Looking for Everything?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Browse our complete catalog of 40+ premium products.
            </p>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              View All Products <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}

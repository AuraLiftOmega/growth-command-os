import { motion } from "framer-motion";
import { Heart, Leaf, Shield, Award, Sparkles, Users } from "lucide-react";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { PLATFORM_CONFIG } from "@/lib/store-config";
import aboutHero from "@/assets/about-hero.jpg";
import { useEffect } from "react";

const values = [
  {
    icon: Leaf,
    title: "Clean Ingredients",
    description: "Every formula is crafted with clinically-proven, ethically-sourced ingredients. No parabens, sulfates, or harmful chemicals.",
  },
  {
    icon: Shield,
    title: "Dermatologist Tested",
    description: "All products undergo rigorous testing by board-certified dermatologists to ensure safety and efficacy for all skin types.",
  },
  {
    icon: Heart,
    title: "Cruelty Free",
    description: "We never test on animals. Our commitment to cruelty-free beauty is certified and non-negotiable.",
  },
  {
    icon: Award,
    title: "Clinically Proven",
    description: "Visible results in 14 days — backed by independent clinical trials with real participants.",
  },
  {
    icon: Sparkles,
    title: "Innovation First",
    description: "We merge cutting-edge beauty technology with time-tested botanicals for products that truly perform.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Built with feedback from thousands of customers. Your skin tells us what to create next.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function About() {
  useEffect(() => {
    document.title = `About Us | ${PLATFORM_CONFIG.name}`;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 -z-10">
          <img src={aboutHero} alt="About Aura Lift Essentials" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <motion.h1 {...fadeUp} className="text-5xl md:text-7xl font-bold mb-6">
            Our <span className="gradient-text">Story</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ delay: 0.1, duration: 0.6 }} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {PLATFORM_CONFIG.name} was born from a simple belief: everyone deserves access to clinical-grade skincare without the clinical price tag.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Science Meets <span className="text-primary">Luxury</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We started {PLATFORM_CONFIG.name} after years of frustration with the beauty industry — overpriced products filled with fillers, misleading claims, and zero transparency.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our team of cosmetic chemists and skincare enthusiasts set out to create a line that's different: formulas backed by peer-reviewed research, transparent ingredient lists, and results you can actually see.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From our best-selling Retinol Night Renewal to our innovative LED therapy devices, every product in our collection is designed to deliver real, visible results — not just promises.
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted/20 border border-border/40">
                <img src={aboutHero} alt="Our products" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card border border-border/40 rounded-xl p-6 shadow-2xl">
                <div className="text-3xl font-bold text-primary">40+</div>
                <div className="text-sm text-muted-foreground">Premium Products</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Stand For</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our values aren't marketing buzzwords — they're the non-negotiable standards behind every product we create.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-background border border-border/40 hover:border-primary/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeUp} className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Skin?</h2>
            <p className="text-muted-foreground">
              Join thousands who've discovered what science-backed skincare can really do.
            </p>
            <a
              href="/store"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Shop the Collection
            </a>
          </motion.div>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}

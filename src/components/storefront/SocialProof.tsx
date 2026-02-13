import { motion } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";

/**
 * Social Proof section — shows trust signals WITHOUT fabricated reviews.
 * Real reviews should come from a Shopify review integration.
 */
export function SocialProof() {
  return (
    <section className="py-16 md:py-24 bg-card/30 border-y border-border/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-primary text-primary" />
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Beauty Lovers <span className="gradient-text">Everywhere</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            47 premium products. Clinical-grade formulas. Results you can see and feel.
          </p>

          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold font-mono text-primary">47</p>
              <p className="text-xs text-muted-foreground mt-1">Products</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold font-mono text-primary">14</p>
              <p className="text-xs text-muted-foreground mt-1">Day Results</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold font-mono text-primary">100%</p>
              <p className="text-xs text-muted-foreground mt-1">Cruelty Free</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Dermatologist-formulated · Clean ingredients · Free shipping $50+</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

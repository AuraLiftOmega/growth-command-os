import { motion } from "framer-motion";
import { Zap, Clock, TrendingUp } from "lucide-react";

const promos = [
  { icon: Zap, text: "FREE shipping on orders $50+", highlight: "FREE" },
  { icon: Clock, text: "Order in next 2h for same-day dispatch", highlight: "2h" },
  { icon: TrendingUp, text: "Trending: Snail Mucin Essence — 500+ sold this week", highlight: "500+" },
];

export function UpsellStrip() {
  return (
    <section className="py-3 bg-primary/5 border-y border-primary/10 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="flex items-center justify-center gap-8 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {promos.map((promo, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <promo.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground whitespace-nowrap">{promo.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

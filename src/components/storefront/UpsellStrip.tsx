import { motion } from "framer-motion";
import { Truck, Clock, Tag } from "lucide-react";

const promos = [
  { icon: Truck, text: "FREE shipping on orders $50+" },
  { icon: Tag, text: "Use code TONIGHT20 for 20% off" },
  { icon: Clock, text: "Order today for fast dispatch" },
];

export function UpsellStrip() {
  return (
    <div className="py-2.5 bg-primary/5 border-b border-primary/10 overflow-hidden">
      <motion.div
        className="flex items-center justify-center gap-6 md:gap-10 flex-wrap px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {promos.map((promo, i) => (
          <div key={i} className="flex items-center gap-2 text-xs md:text-sm">
            <promo.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-muted-foreground whitespace-nowrap">{promo.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { Shield, Quote } from "lucide-react";

export const SalesPhilosophy = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-elevated p-6 border-l-4 border-l-primary"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
            Sales Philosophy — Immutable
          </p>
          <div className="flex items-start gap-2">
            <Quote className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
            <p className="text-lg font-display font-semibold text-foreground">
              We do not convince. We qualify, frame reality, and let logic close.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

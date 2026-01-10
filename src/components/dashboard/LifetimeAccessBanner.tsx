import { Crown, Sparkles, Infinity } from "lucide-react";
import { useAdminEntitlements } from "@/hooks/useAdminEntitlements";
import { motion } from "framer-motion";

export function LifetimeAccessBanner() {
  const { isAdmin, isLoading } = useAdminEntitlements();

  // Only show for admin user
  if (isLoading || !isAdmin) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-500/90 via-yellow-500/90 to-amber-500/90 text-black px-4 py-2 flex items-center justify-center gap-3 shadow-lg"
    >
      <Crown className="h-5 w-5 text-amber-900" />
      <span className="font-bold text-sm md:text-base">
        ✨ Lifetime Free Access Granted – Unlimited Everything
      </span>
      <div className="flex items-center gap-1.5">
        <Infinity className="h-4 w-4 text-amber-900" />
        <span className="text-xs font-medium text-amber-900">D-ID</span>
        <span className="text-amber-800">•</span>
        <span className="text-xs font-medium text-amber-900">Grok</span>
        <span className="text-amber-800">•</span>
        <span className="text-xs font-medium text-amber-900">All Features</span>
      </div>
      <Sparkles className="h-5 w-5 text-amber-900" />
    </motion.div>
  );
}

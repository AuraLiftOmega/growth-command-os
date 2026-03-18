import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: undefined, label: "All" },
  { id: "Skincare", label: "Skincare" },
  { id: "Beauty Tech", label: "Beauty Tech" },
  { id: "Beauty Tools", label: "Beauty Tools" },
  { id: "Bundle", label: "Bundles" },
  { id: "Gift Set", label: "Gift Sets" },
  { id: "Hair Care", label: "Hair Care" },
  { id: "Makeup", label: "Makeup" },
  { id: "Apps", label: "Apps & Software" },
];

interface CategoryFilterProps {
  activeCategory: string | undefined;
  onCategoryChange: (category: string | undefined) => void;
}

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.label}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}

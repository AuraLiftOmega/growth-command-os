import { motion } from "framer-motion";
import { Eye, Palette, Target, Sparkles } from "lucide-react";
import { ProductAnalysis } from "@/hooks/useVideoGenerator";

interface ProductAnalysisCardProps {
  analysis: ProductAnalysis;
}

export const ProductAnalysisCard = ({ analysis }: ProductAnalysisCardProps) => {
  if (!analysis.productType && !analysis.keyFeatures?.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">AI Product Analysis</span>
      </div>

      <div className="space-y-3">
        {analysis.productType && (
          <div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Product Type
            </span>
            <p className="text-sm font-medium mt-0.5">{analysis.productType}</p>
          </div>
        )}

        {analysis.keyFeatures && analysis.keyFeatures.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Key Features
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {analysis.keyFeatures.map((feature, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-foreground"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.colors && analysis.colors.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Palette className="w-3 h-3" />
              Colors Detected
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {analysis.colors.map((color, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.targetAudience && (
          <div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Target className="w-3 h-3" />
              Target Audience
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">{analysis.targetAudience}</p>
          </div>
        )}

        {analysis.uniqueSellingPoints && analysis.uniqueSellingPoints.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Unique Selling Points
            </span>
            <ul className="mt-1.5 space-y-1">
              {analysis.uniqueSellingPoints.map((usp, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  {usp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

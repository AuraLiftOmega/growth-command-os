import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import merkabahImg from "@/assets/merkabah-v2.png";

interface DominionLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  linkTo?: string;
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 md:h-10 md:w-10",
  md: "h-10 w-10 md:h-12 md:w-12",
  lg: "h-12 w-12 md:h-16 md:w-16",
  xl: "h-16 w-16 md:h-24 md:w-24",
};

export function DominionLogo({
  size = "md",
  showText = false,
  linkTo,
  className,
  animated = false,
}: DominionLogoProps) {
  const logoContent = (
    <div
      className={cn(
        "flex items-center gap-3 transition-transform duration-200 hover:scale-105",
        linkTo && "cursor-pointer",
        className
      )}
    >
      <img
        src={merkabahImg}
        alt="Dominion Revenue OS"
        className={cn(
          sizeClasses[size],
          "object-contain animate-[spin_12s_linear_infinite] drop-shadow-[0_0_12px_rgba(37,99,235,0.5)]",
          animated && "drop-shadow-[0_0_20px_rgba(37,99,235,0.8)]"
        )}
        loading="eager"
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight text-foreground">
            DOMINION
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Revenue OS
          </span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

// Backward-compat aliases
export const AuraOmegaLogo = DominionLogo;

export function DominionLoading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6 z-50">
      <img
        src={merkabahImg}
        alt="Dominion Revenue OS"
        className="h-20 md:h-28 w-auto object-contain animate-[spin_8s_linear_infinite] drop-shadow-[0_0_24px_rgba(37,99,235,0.7)]"
        loading="eager"
      />
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-bold tracking-tight">DOMINION</span>
        <span className="text-sm text-muted-foreground">Loading Revenue OS...</span>
      </div>
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 animate-[shimmer_1.5s_infinite]" 
             style={{ width: '30%', animation: 'loading 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

export const AuraOmegaLoading = DominionLoading;

export function DominionFooterLogo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src={merkabahImg}
        alt="Dominion Revenue OS"
        className="h-6 w-6 object-contain animate-[spin_14s_linear_infinite] opacity-80"
        loading="lazy"
      />
      <span className="text-xs text-muted-foreground">
        Powered by <span className="font-semibold text-foreground">DOMINION</span>
      </span>
    </div>
  );
}

export const AuraOmegaFooterLogo = DominionFooterLogo;

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AuraOmegaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  linkTo?: string;
  className?: string;
  animated?: boolean;
}

const LOGO_URL = "https://files.catbox.moe/0k2q8l.png";

const sizeClasses = {
  sm: "h-8 max-h-8 md:h-10 md:max-h-10",
  md: "h-10 max-h-10 md:h-12 md:max-h-12",
  lg: "h-12 max-h-12 md:h-16 md:max-h-16",
  xl: "h-16 max-h-16 md:h-24 md:max-h-24",
};

// Keep old export for backward compatibility
export function DominionLogo(props: AuraOmegaLogoProps) {
  return <AuraOmegaLogo {...props} />;
}

export function AuraOmegaLogo({
  size = "md",
  showText = false,
  linkTo,
  className,
  animated = false,
}: AuraOmegaLogoProps) {
  const logoContent = (
    <div
      className={cn(
        "flex items-center gap-3 transition-transform duration-200 hover:scale-105",
        linkTo && "cursor-pointer",
        className
      )}
    >
      <img
        src={LOGO_URL}
        alt="AURAOMEGA - Autonomous Revenue Operating System"
        className={cn(
          sizeClasses[size],
          "w-auto object-contain",
          animated && "animate-pulse"
        )}
        loading="eager"
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight text-foreground">
            AURAOMEGA
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

// Loading spinner with logo
export function AuraOmegaLoading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6 z-50">
      <img
        src={LOGO_URL}
        alt="AURAOMEGA - Autonomous Revenue Operating System"
        className="h-16 md:h-24 w-auto object-contain animate-pulse"
        loading="eager"
      />
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-bold tracking-tight">AURAOMEGA</span>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-accent animate-[shimmer_1.5s_infinite]" 
             style={{ width: '30%', animation: 'loading 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

// Keep old export for backward compatibility
export function DominionLoading() {
  return <AuraOmegaLoading />;
}

// Footer logo variant
export function AuraOmegaFooterLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src={LOGO_URL}
        alt="AURAOMEGA"
        className="h-6 w-auto object-contain opacity-80"
        loading="lazy"
      />
      <span className="text-xs text-muted-foreground">
        Powered by <span className="font-semibold text-foreground">AURAOMEGA</span>
      </span>
    </div>
  );
}

// Keep old export for backward compatibility
export function DominionFooterLogo() {
  return <AuraOmegaFooterLogo />;
}

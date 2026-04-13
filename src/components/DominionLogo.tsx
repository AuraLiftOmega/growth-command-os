import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import merkabahImg from "@/assets/merkabah.png";

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

const merkabahSizeClasses = {
  sm: "h-6 w-6 md:h-7 md:w-7",
  md: "h-8 w-8 md:h-10 md:w-10",
  lg: "h-10 w-10 md:h-14 md:w-14",
  xl: "h-14 w-14 md:h-20 md:w-20",
};

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
        "flex items-center gap-2 transition-transform duration-200 hover:scale-105",
        linkTo && "cursor-pointer",
        className
      )}
    >
      <div className="relative flex items-center">
        <img
          src={merkabahImg}
          alt=""
          className={cn(
            merkabahSizeClasses[size],
            "object-contain animate-[spin_8s_linear_infinite] drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
          )}
          loading="eager"
        />
      </div>
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

export function AuraOmegaLoading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6 z-50">
      <div className="relative flex items-center justify-center">
        <img
          src={merkabahImg}
          alt=""
          className="h-20 md:h-28 w-auto object-contain animate-[spin_6s_linear_infinite] drop-shadow-[0_0_16px_rgba(56,189,248,0.7)] absolute"
          loading="eager"
        />
        <img
          src={LOGO_URL}
          alt="AURAOMEGA - Autonomous Revenue Operating System"
          className="h-16 md:h-24 w-auto object-contain animate-pulse relative z-10"
          loading="eager"
        />
      </div>
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

export function DominionLoading() {
  return <AuraOmegaLoading />;
}

export function AuraOmegaFooterLogo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src={merkabahImg}
        alt=""
        className="h-5 w-5 object-contain animate-[spin_10s_linear_infinite] opacity-70"
        loading="lazy"
      />
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

export function DominionFooterLogo() {
  return <AuraOmegaFooterLogo />;
}

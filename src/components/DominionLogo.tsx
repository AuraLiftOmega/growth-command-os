import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import merkabahImg from "@/assets/merkabah-premium.png";

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
        "flex items-center gap-3 transition-transform duration-300 hover:scale-110",
        linkTo && "cursor-pointer",
        className
      )}
    >
      <div className={cn("merkabah-container", sizeClasses[size])}>
        <div className="merkabah-aura-ring-2" />
        <div className="merkabah-aura-ring" />
        <img
          src={merkabahImg}
          alt="Dominion Revenue OS — Sacred Merkabah"
          className={cn(
            "merkabah-img merkabah-spin-slow object-contain w-full h-full"
          )}
          loading="eager"
          width={1024}
          height={1024}
        />
      </div>
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
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-8 z-50 overflow-hidden">
      {/* Ambient cosmic background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(37,99,235,0.25) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="merkabah-container h-32 w-32 md:h-44 md:w-44">
        <div className="merkabah-aura-ring-2" />
        <div className="merkabah-aura-ring" />
        <img
          src={merkabahImg}
          alt="Dominion Revenue OS"
          className="merkabah-img merkabah-spin-slow object-contain w-full h-full"
          loading="eager"
          width={1024}
          height={1024}
        />
      </div>

      <div className="flex flex-col items-center gap-2 relative z-10">
        <span className="text-2xl font-bold tracking-[0.3em] bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
          DOMINION
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-[0.4em]">
          Revenue OS Awakening...
        </span>
      </div>

      <div className="w-56 h-1 bg-muted/30 rounded-full overflow-hidden relative z-10">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 rounded-full"
          style={{
            width: "40%",
            animation: "merkabah-spin 1.8s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

export const AuraOmegaLoading = DominionLoading;

export function DominionFooterLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="merkabah-container h-7 w-7">
        <img
          src={merkabahImg}
          alt="Dominion Revenue OS"
          className="merkabah-img merkabah-spin-slow object-contain w-full h-full opacity-90"
          loading="lazy"
          width={1024}
          height={1024}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        Powered by{" "}
        <span className="font-semibold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          DOMINION
        </span>
      </span>
    </div>
  );
}

export const AuraOmegaFooterLogo = DominionFooterLogo;

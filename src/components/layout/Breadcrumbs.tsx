import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbConfig {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const routeLabels: Record<string, BreadcrumbConfig> = {
  dashboard: { label: "Dashboard", icon: Home },
  "omega-command": { label: "OMEGA Command" },
  "ceo-brain": { label: "CEO Brain" },
  "war-room": { label: "War Room" },
  store: { label: "Store" },
  pricing: { label: "Pricing" },
  settings: { label: "Settings" },
  auth: { label: "Authentication" },
  onboarding: { label: "Onboarding" },
  "store-builder": { label: "Store Builder" },
  "command-center": { label: "Command Center" },
  "revenue-war-room": { label: "Revenue War Room" },
};

export const Breadcrumbs = () => {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    
    if (pathSegments.length === 0) {
      return [{ path: "/dashboard", label: "Dashboard", isLast: true }];
    }

    return pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
      const config = routeLabels[segment] || { label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ") };
      const isLast = index === pathSegments.length - 1;

      return {
        path,
        label: config.label,
        icon: config.icon,
        isLast,
      };
    });
  }, [location.pathname]);

  // Don't show breadcrumbs on auth or root
  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {/* Home link always shown */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/dashboard" 
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={crumb.path}>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              </BreadcrumbSeparator>
              
              {crumb.isLast ? (
                <BreadcrumbPage className="flex items-center gap-1.5 font-medium">
                  {crumb.icon && <crumb.icon className="w-3.5 h-3.5" />}
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link 
                    to={crumb.path}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.icon && <crumb.icon className="w-3.5 h-3.5" />}
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </motion.div>
  );
};

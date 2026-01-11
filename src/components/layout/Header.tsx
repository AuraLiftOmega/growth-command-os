import { motion } from "framer-motion";
import { Bell, ExternalLink, Globe, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "./Breadcrumbs";
import { DominionLogo } from "@/components/DominionLogo";
import { Badge } from "@/components/ui/badge";
import { DOMAINS } from "@/lib/domains.config";

// Banner configuration
const SHOW_DOMAIN_BANNER = true;

export const Header = () => {
  return (
    <div className="flex flex-col">
      {/* Dual-Domain Production Banner */}
      {SHOW_DOMAIN_BANNER && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-success/30 via-primary/20 to-accent/30 border-b border-success/40 py-2 px-4"
        >
          <div className="flex items-center justify-center gap-3 text-sm font-semibold">
            <Badge variant="outline" className="text-[10px] py-0.5 px-2 border-success bg-success/20 text-success animate-pulse">
              🚀 LIVE
            </Badge>
            <span className="text-foreground">Live at</span>
            <a 
              href={DOMAINS.primary.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-success hover:text-success/80 transition-colors font-bold"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{DOMAINS.primary.domain}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-muted-foreground">–</span>
            <span className="text-foreground">Tech Docs at</span>
            <a 
              href={DOMAINS.tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-bold"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{DOMAINS.tech.domain}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      )}
      
      {/* Main Header */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6"
      >
        <div className="flex items-center gap-4">
          <DominionLogo size="sm" linkTo="/dashboard" />
          <div className="h-6 w-px bg-border" />
          <Breadcrumbs />
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </motion.header>
    </div>
  );
};

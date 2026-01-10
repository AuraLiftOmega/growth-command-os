import { motion } from "framer-motion";
import { Bell, ExternalLink, Globe, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "./Breadcrumbs";
import { DominionLogo } from "@/components/DominionLogo";
import { Badge } from "@/components/ui/badge";
import { DOMAINS, DUAL_DOMAIN_BANNER } from "@/lib/domains.config";

export const Header = () => {
  return (
    <div className="flex flex-col">
      {/* Dual-Domain Production Banner */}
      {DUAL_DOMAIN_BANNER.enabled && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-primary/20 via-accent/20 to-success/20 border-b border-primary/30 py-1.5 px-4"
        >
          <div className="flex items-center justify-center gap-4 text-xs font-medium">
            <a 
              href={DOMAINS.primary.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
            >
              <Globe className="w-3 h-3" />
              <span>App Live at</span>
              <span className="font-bold">{DOMAINS.primary.domain}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-muted-foreground">•</span>
            <a 
              href={DOMAINS.tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-accent-foreground hover:text-accent-foreground/80 transition-colors"
            >
              <FileCode className="w-3 h-3" />
              <span>Tech Docs at</span>
              <span className="font-bold">{DOMAINS.tech.domain}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-success text-success">
              PRODUCTION
            </Badge>
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

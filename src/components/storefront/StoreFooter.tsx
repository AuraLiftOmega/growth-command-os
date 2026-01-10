import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Globe, Store } from "lucide-react";
import { PLATFORM_CONFIG } from "@/lib/store-config";
import { DominionFooterLogo } from "@/components/DominionLogo";
import { useActiveStore } from "@/hooks/useActiveStore";

export function StoreFooter() {
  const { activeStore } = useActiveStore();
  
  // Use connected store info or platform defaults
  const storeName = activeStore?.storeName || PLATFORM_CONFIG.name;
  const storeDomain = activeStore?.storeDomain || PLATFORM_CONFIG.domain;
  const storeUrl = activeStore?.storeDomain 
    ? `https://${activeStore.storeDomain}` 
    : PLATFORM_CONFIG.fullUrl;
  const storeDescription = PLATFORM_CONFIG.description;
  const storeEmail = PLATFORM_CONFIG.email;

  return (
    <footer className="border-t border-border/40 bg-card/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/store" className="inline-block">
              <span className="text-2xl font-bold gradient-text">{storeName}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {storeDescription}
            </p>
            {activeStore && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Store className="w-4 h-4" />
                <span className="text-muted-foreground">
                  Connected to Shopify
                </span>
              </div>
            )}
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Shop</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/store" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                All Products
              </Link>
              <Link to="/store?category=skincare" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Skincare
              </Link>
              <Link to="/store?category=beauty tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Beauty Tools
              </Link>
            </nav>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Shipping Policy
              </Link>
              <Link to="/refund" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Refund Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{storeEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Worldwide Shipping</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <DominionFooterLogo />
        </div>
      </div>
    </footer>
  );
}

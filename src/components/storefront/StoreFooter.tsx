import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="border-t border-border/40 bg-card/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/store" className="inline-block">
              <span className="text-2xl font-bold gradient-text">DOMINION</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium products for peak performance. Elevate your game with gear that matches your ambition.
            </p>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Shop</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/store" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                All Products
              </Link>
              <Link to="/store?category=electronics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Electronics
              </Link>
              <Link to="/store?category=fitness" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Fitness
              </Link>
              <Link to="/store?category=footwear" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Footwear
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
                <span>support@dominion.store</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>1-800-DOMINION</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Worldwide Shipping</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DOMINION. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

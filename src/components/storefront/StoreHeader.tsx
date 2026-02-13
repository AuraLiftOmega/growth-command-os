import { Link } from "react-router-dom";
import { ShoppingCart, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cart-store";
import { useState } from "react";
import { StoreCartDrawer } from "./StoreCartDrawer";
import { ProductSearch } from "./ProductSearch";
import { STORE_CONFIG } from "@/lib/store-config";

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const setCartOpen = useCartStore((s) => s.setOpen);
  const isCartOpen = useCartStore((s) => s.isOpen);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/store", label: "Shop All" },
    { href: "/store?category=Skincare", label: "Skincare" },
    { href: "/store?category=Beauty Tech", label: "Beauty Tech" },
    { href: "/store?category=Bundle", label: "Bundles" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <div className="flex flex-col space-y-1 mt-8">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mb-6">
                  <span className="text-2xl font-bold gradient-text">{STORE_CONFIG.name}</span>
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium py-3 border-b border-border/30 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <span className="text-xl md:text-2xl font-bold gradient-text tracking-tight">{STORE_CONFIG.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-1">
            {/* Search */}
            <div className="hidden md:block">
              <ProductSearch />
            </div>
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <div className="py-4">
                  <ProductSearch isMobile onClose={() => {}} />
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <StoreCartDrawer open={isCartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}

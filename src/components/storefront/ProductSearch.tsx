import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { storefrontApiRequest, PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify-config";
import { motion, AnimatePresence } from "framer-motion";

interface ProductSearchProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export function ProductSearch({ onClose, isMobile = false }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await storefrontApiRequest(PRODUCTS_QUERY, {
          first: 6,
          query: query,
        });
        setResults(data.data.products.edges || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = (handle: string) => {
    navigate(`/product/${handle}`);
    setQuery("");
    setIsOpen(false);
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/store?search=${encodeURIComponent(query)}`);
      setQuery("");
      setIsOpen(false);
      onClose?.();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${isMobile ? 'w-full' : ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`pl-9 pr-9 ${isMobile ? 'w-full' : 'w-64'} bg-secondary/50 border-border/50 focus:bg-background`}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </form>

      <AnimatePresence>
        {isOpen && (query.length >= 2 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((product) => (
                  <button
                    key={product.node.id}
                    onClick={() => handleProductClick(product.node.handle)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                      {product.node.images.edges[0]?.node.url && (
                        <img
                          src={product.node.images.edges[0].node.url}
                          alt={product.node.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.node.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.node.priceRange.minVariantPrice.currencyCode}{" "}
                        {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={handleSubmit}
                  className="w-full p-3 text-center text-sm text-primary hover:bg-secondary/50 transition-colors border-t border-border"
                >
                  View all results for "{query}"
                </button>
              </div>
            ) : query.length >= 2 ? (
              <div className="py-8 text-center text-muted-foreground">
                No products found for "{query}"
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { ShopifyProduct } from "@/lib/storefront-api";
import { toast } from "sonner";

interface StoreProductCardProps {
  product: ShopifyProduct;
  index?: number;
  onQuickView?: (product: ShopifyProduct) => void;
}

export function StoreProductCard({ product, index = 0, onQuickView }: StoreProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const node = product.node;
  const firstVariant = node.variants.edges[0]?.node;
  const productImageUrl = node.images.edges[0]?.node?.url || '';
  const hasImage = !!productImageUrl;
  const price = node.priceRange.minVariantPrice;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) {
      toast.error("Product unavailable");
      return;
    }

    setIsAdding(true);
    
    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions,
    });

    toast.success("Added to cart", {
      description: node.title,
      position: "top-center",
    });

    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="group"
    >
      <Link to={`/product/${node.handle}`} className="block">
        <div className="rounded-xl overflow-hidden border border-border/40 bg-card/40 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            {hasImage ? (
              <img
                src={productImageUrl}
                alt={node.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/30" />
              </div>
            )}

            {/* Quick View */}
            {onQuickView && (
              <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <Button
                  variant="secondary"
                  size="sm"
                  className="shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(product);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Quick View
                </Button>
              </div>
            )}

            {/* Variant Badge */}
            {node.variants.edges.length > 1 && (
              <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px]">
                {node.variants.edges.length} Options
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="p-4 space-y-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
              {node.productType || "Beauty"}
            </p>
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
              {node.title}
            </h3>

            <div className="flex items-center justify-between pt-1">
              <span className="text-lg font-bold text-primary font-mono">
                ${parseFloat(price.amount).toFixed(2)}
              </span>

              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isAdding || !firstVariant?.availableForSale}
                className={`h-9 px-4 text-xs ${isAdding ? "bg-success hover:bg-success" : "btn-power"}`}
              >
                {isAdding ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

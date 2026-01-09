import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { ShopifyProduct, SHOPIFY_STORE_PERMANENT_DOMAIN, SHOPIFY_STOREFRONT_TOKEN, getProductImage } from "@/lib/shopify-config";
import { STORE_CONFIG } from "@/lib/store-config";
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
  const shopifyImageUrl = node.images.edges[0]?.node?.url;
  const price = node.priceRange.minVariantPrice;
  
  // Get image with local fallback for AuraLift products
  const productImageUrl = getProductImage(node.handle, shopifyImageUrl);

  const handleAddToCart = async () => {
    if (!firstVariant) {
      toast.error("Product unavailable");
      return;
    }

    setIsAdding(true);
    
    addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions,
      storeDomain: SHOPIFY_STORE_PERMANENT_DOMAIN,
      storefrontToken: SHOPIFY_STOREFRONT_TOKEN,
    });

    toast.success("Added to cart", {
      description: node.title,
      position: "top-center",
    });

    setTimeout(() => setIsAdding(false), 500);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = STORE_CONFIG.getProductUrl(node.handle);
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!", {
        description: `${STORE_CONFIG.domain}/product/${node.handle}`,
        position: "top-center",
      });
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="glass-card overflow-hidden transition-all duration-300 hover:border-primary/30">
        {/* Image Container */}
        <Link to={`/product/${node.handle}`} className="block relative aspect-square overflow-hidden">
          <img
            src={productImageUrl}
            alt={node.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Action Buttons Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick View Button */}
          {onQuickView && (
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView(product);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Quick View
              </Button>
            </div>
          )}

          {/* Sale Badge */}
          {node.variants.edges.length > 1 && (
            <Badge className="absolute top-3 left-3 bg-accent">
              {node.variants.edges.length} Options
            </Badge>
          )}
        </Link>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <Link to={`/product/${node.handle}`}>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {node.title}
            </h3>
          </Link>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {node.description || "Premium quality product for your needs"}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xl font-bold text-primary">
              {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAdding || !firstVariant?.availableForSale}
              className={isAdding ? "bg-success hover:bg-success" : "btn-power"}
            >
              {isAdding ? (
                <Check className="w-4 h-4" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

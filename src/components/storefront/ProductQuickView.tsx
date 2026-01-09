import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCartStore } from "@/stores/cart-store";
import { ShopifyProduct, SHOPIFY_STORE_PERMANENT_DOMAIN, SHOPIFY_STOREFRONT_TOKEN, getProductImage } from "@/lib/shopify-config";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProductQuickViewProps {
  product: ShopifyProduct;
  open: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, open, onClose }: ProductQuickViewProps) {
  const node = product.node;
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const addItem = useCartStore((s) => s.addItem);
  const selectedVariant = node.variants.edges[selectedVariantIndex]?.node;
  const shopifyImages = node.images.edges;
  
  // Get product image with fallback
  const fallbackImageUrl = getProductImage(node.handle, shopifyImages[0]?.node?.url);
  const images = shopifyImages.length > 0 
    ? shopifyImages 
    : [{ node: { url: fallbackImageUrl, altText: node.title } }];

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    setIsAdding(true);

    addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
      storeDomain: SHOPIFY_STORE_PERMANENT_DOMAIN,
      storefrontToken: SHOPIFY_STOREFRONT_TOKEN,
    });

    toast.success("Added to cart", {
      description: `${quantity}x ${node.title}`,
      position: "top-center",
    });

    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">{node.title}</DialogTitle>
        <div className="grid md:grid-cols-2 gap-0">
          {/* Images */}
          <div className="relative bg-muted/20">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={images[selectedImage]?.node.url}
                alt={images[selectedImage]?.node.altText || node.title}
                className="w-full aspect-square object-cover"
              />
            </AnimatePresence>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                {images.slice(0, 5).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{node.title}</h2>
              <p className="text-muted-foreground line-clamp-3">
                {node.description}
              </p>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-primary">
              {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
            </div>

            {/* Variants */}
            {node.options.map((option, optionIndex) => (
              <div key={option.name} className="space-y-2">
                <label className="text-sm font-medium">{option.name}</label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value, valueIndex) => {
                    const isSelected = selectedVariant?.selectedOptions.some(
                      (opt) => opt.name === option.name && opt.value === value
                    );
                    return (
                      <Button
                        key={value}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          // Find variant matching this option
                          const variantIndex = node.variants.edges.findIndex((v) =>
                            v.node.selectedOptions.some(
                              (opt) => opt.name === option.name && opt.value === value
                            )
                          );
                          if (variantIndex >= 0) {
                            setSelectedVariantIndex(variantIndex);
                          }
                        }}
                        className={isSelected ? "btn-power" : ""}
                      >
                        {value}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isAdding || !selectedVariant?.availableForSale}
                className={isAdding ? "bg-success hover:bg-success" : "btn-power"}
              >
                {isAdding ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added!
                  </>
                ) : !selectedVariant?.availableForSale ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={`/product/${node.handle}`} onClick={onClose}>
                  View Full Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, ExternalLink, Plus, Loader2, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/shopify/CartDrawer";
import { useUserStore } from "@/hooks/useUserStore";
import { ConnectShopifyModal } from "@/components/settings/ConnectShopifyModal";
import { 
  storefrontApiRequest, 
  PRODUCTS_QUERY,
  SHOPIFY_STORE_PERMANENT_DOMAIN,
  SHOPIFY_STOREFRONT_TOKEN,
  ShopifyProduct 
} from "@/lib/shopify-config";
import { Link } from "react-router-dom";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

export const ShopifyProductsPanel = () => {
  const { primaryStore, hasConnectedStore, isLoading: storeLoading } = useUserStore();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCartStore();

  // Load products from the connected project store
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 12 });
      if (data?.data?.products?.edges) {
        setProducts(data.data.products.edges);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    
    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions,
      storeDomain: SHOPIFY_STORE_PERMANENT_DOMAIN,
      storefrontToken: SHOPIFY_STOREFRONT_TOKEN,
    });
    toast.success(`${product.node.title} added to cart`);
  };

  if (storeLoading || isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 flex items-center justify-center min-h-[300px]"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadProducts} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Product Catalog</h3>
              <p className="text-sm text-muted-foreground">
                {products.length} products from your store
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CartDrawer />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/admin`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Store Admin
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">No products found</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add products to your store to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, index) => {
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;
              
              return (
                <motion.div
                  key={product.node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-secondary/30 rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all"
                >
                  <Link to={`/product/${product.node.handle}`}>
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {image ? (
                        <img 
                          src={image.url} 
                          alt={image.altText || product.node.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link to={`/product/${product.node.handle}`}>
                      <h4 className="font-medium text-sm truncate hover:text-primary transition-colors">
                        {product.node.title}
                      </h4>
                    </Link>
                    <p className="text-primary font-semibold mt-1">
                      ${parseFloat(price.amount).toFixed(2)} {price.currencyCode}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <ConnectShopifyModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
      />
    </>
  );
};

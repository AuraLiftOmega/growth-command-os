import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, ExternalLink, Loader2, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/shopify/CartDrawer";
import { useUserShopifyConnections } from "@/hooks/useUserShopifyConnections";
import { ConnectShopifyModal } from "@/components/settings/ConnectShopifyModal";
import { Link } from "react-router-dom";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import { AISuggestionBanner } from "./AISuggestionBanner";

export const ShopifyProductsPanel = () => {
  const { products, connections, hasConnections, isLoading, refetch, primaryConnection } = useUserShopifyConnections();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = async (product: any) => {
    if (!primaryConnection) {
      toast.error('No store connected');
      return;
    }
    
    // Format product for cart
    const formattedProduct = {
      node: {
        id: product.id,
        title: product.title,
        handle: product.handle,
        images: { edges: product.images?.map((img: string) => ({ node: { url: img, altText: null } })) || [] },
        variants: { edges: product.variants?.map((v: any) => ({ node: v })) || [] },
        priceRange: { minVariantPrice: { amount: String(product.price || 0), currencyCode: product.currency || 'USD' } },
        description: product.description || '',
        options: product.options || []
      }
    };
    
    const variant = product.variants?.[0];
    if (!variant) {
      toast.error('No variant available');
      return;
    }
    
    await addItem({
      product: formattedProduct,
      variantId: variant.id,
      variantTitle: variant.title,
      price: { amount: String(variant.price || product.price), currencyCode: product.currency || 'USD' },
      quantity: 1,
      selectedOptions: [],
    });
    toast.success(`${product.title} added to cart`);
  };

  if (isLoading) {
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

  if (!hasConnections) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <AISuggestionBanner 
            message="Connect your Shopify store to display products, generate AI video ads, and start selling!"
            type="shopify"
            ctaLabel="Connect Store"
            onAction={() => setConnectModalOpen(true)}
          />
          
          <div className="text-center py-12 mt-4">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">No Store Connected</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Shopify store to see your products here
            </p>
            <Button onClick={() => setConnectModalOpen(true)}>
              Connect Shopify Store
            </Button>
          </div>
        </motion.div>

        <ConnectShopifyModal
          open={connectModalOpen}
          onOpenChange={setConnectModalOpen}
        />
      </>
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
                {products.length} products from {connections.length} store{connections.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CartDrawer />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <a href="/dashboard/settings">
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Stores
              </a>
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">No products found</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add products to your Shopify store to see them here
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, index) => {
              const image = product.images?.[0];
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-secondary/30 rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all"
                >
                  <Link to={`/product/${product.handle}`}>
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {image ? (
                        <img 
                          src={image} 
                          alt={product.title}
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
                    <Link to={`/product/${product.handle}`}>
                      <h4 className="font-medium text-sm truncate hover:text-primary transition-colors">
                        {product.title}
                      </h4>
                    </Link>
                    <p className="text-primary font-semibold mt-1">
                      ${(product.price || 0).toFixed(2)} {product.currency || 'USD'}
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

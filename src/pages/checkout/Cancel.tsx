import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

export default function CheckoutCancel() {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const setCartOpen = useCartStore((s) => s.setOpen);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Cancel Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-muted-foreground" />
          </div>
        </motion.div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-2">Checkout Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          No worries! Your cart is still saved and ready when you are.
        </p>

        {/* Cart Status */}
        {totalItems > 0 && (
          <div className="glass-card p-4 mb-6">
            <p className="text-sm">
              You have <span className="font-semibold text-primary">{totalItems} item{totalItems !== 1 ? 's' : ''}</span> in your cart
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          
          {totalItems > 0 && (
            <Button onClick={() => setCartOpen(true)}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Cart
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

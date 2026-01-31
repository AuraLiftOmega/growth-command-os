import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((s) => s.clearCart);

  // Clear cart on successful checkout
  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
        </motion.div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. We've received your order and will send you a confirmation email shortly.
        </p>

        {/* Order Info */}
        <div className="glass-card p-6 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <span className="font-semibold">What's Next?</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 text-primary" />
              You'll receive an order confirmation email
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 text-primary" />
              We'll process your order within 1-2 business days
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 text-primary" />
              Shipping confirmation with tracking will be sent
            </li>
          </ul>
        </div>

        {/* Session ID for reference */}
        {sessionId && (
          <p className="text-xs text-muted-foreground mb-6">
            Order reference: {sessionId.slice(0, 20)}...
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

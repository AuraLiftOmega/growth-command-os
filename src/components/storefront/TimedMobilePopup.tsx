import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TimedMobilePopupProps {
  delaySeconds?: number;
}

export function TimedMobilePopup({ delaySeconds = 15 }: TimedMobilePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if already shown or submitted
    const alreadyShown = localStorage.getItem("timed_popup_shown");
    if (alreadyShown) return;

    // Only show on mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem("timed_popup_shown", "true");
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("capture-lead", {
        body: {
          email,
          source: "timed_mobile_popup",
          metadata: { device: "mobile", trigger: "timed" },
        },
      });

      if (error) throw error;

      toast.success("Welcome! Check your inbox for your exclusive offer.");
      localStorage.setItem("lead_captured", "true");
      setIsOpen(false);
    } catch (error) {
      console.error("Error capturing lead:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
            onClick={handleClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          >
            <div className="bg-card border-t border-border rounded-t-3xl p-6 shadow-2xl">
              {/* Handle */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-chart-4 to-chart-3 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Get 20% Off Your First Month
                </h3>
                <p className="text-sm text-muted-foreground">
                  Join 1,200+ store owners who launched in 30 minutes
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                  autoComplete="email"
                />
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-chart-4 to-chart-3 hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    "Claim My Discount"
                  )}
                </Button>
              </form>

              <p className="text-xs text-center text-muted-foreground mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

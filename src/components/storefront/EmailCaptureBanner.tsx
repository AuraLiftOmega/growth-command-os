import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Gift, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function EmailCaptureBanner() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Use edge function so anonymous visitors can subscribe
      const { data, error } = await supabase.functions.invoke("subscribe-email", {
        body: { email, source: "storefront_banner" },
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("You're in! Check your inbox for your code 🎉");
    } catch (err: any) {
      console.error("Email signup error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-12 md:py-16 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-3"
          >
            <Gift className="w-10 h-10 text-primary mx-auto" />
            <h3 className="text-2xl font-bold">Welcome to the family! 🎉</h3>
            <p className="text-muted-foreground">Use code <span className="font-bold text-primary">TONIGHT20</span> for 20% off your first order</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Limited Time</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold">
            Get 20% Off Your First Order
          </h3>
          <p className="text-muted-foreground">
            Join our list & get your exclusive discount code instantly. Plus early access to new drops.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="btn-power whitespace-nowrap">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Get My Code
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground/60">
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

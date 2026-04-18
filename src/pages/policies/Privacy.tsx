import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy — Aura Lift Essentials";
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>We collect only the information needed to process and ship your orders: name, address, email, and payment details (handled by our payment processors — we never store full card numbers).</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">How We Use Your Data</h2>
          <p>To fulfill orders, send order updates, and (with consent) marketing emails. You can unsubscribe at any time.</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">Sharing</h2>
          <p>We share data only with fulfillment partners (e.g., shipping carriers) and payment processors required to deliver your order. We never sell your data.</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">Your Rights</h2>
          <p>Email support@auraliftessentials.com to request access, correction, or deletion of your data.</p>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}

import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { useEffect } from "react";

export default function Refund() {
  useEffect(() => {
    document.title = "Refund Policy — Aura Lift Essentials";
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Refund Policy</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>We offer a 30-day satisfaction guarantee. If you are not happy with your purchase, contact us within 30 days for a full refund or replacement.</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">How to Request a Refund</h2>
          <p>Email support@auraliftessentials.com with your order number and reason. Refunds are processed within 5–7 business days back to the original payment method.</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">Non-Refundable Items</h2>
          <p>Used skincare products are eligible for store credit only. Final-sale and bundle items are non-refundable unless damaged on arrival.</p>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}

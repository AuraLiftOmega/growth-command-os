import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { useEffect } from "react";

export default function Shipping() {
  useEffect(() => {
    document.title = "Shipping Policy — Aura Lift Essentials";
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Shipping Policy</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>We ship worldwide. Standard orders are processed within 1–2 business days and delivered in 7–14 business days depending on destination.</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">Tracking</h2>
          <p>You will receive an email with a tracking number as soon as your order ships.</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">Customs &amp; Duties</h2>
          <p>International customers are responsible for any customs fees or import duties charged by their country.</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">Lost or Damaged Packages</h2>
          <p>Contact us at support@auraliftessentials.com within 7 days of delivery for replacements or refunds.</p>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}

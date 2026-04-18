import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { useEffect } from "react";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service — Aura Lift Essentials";
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>By using auraliftessentials.com you agree to these terms. All product descriptions, pricing, and availability are subject to change without notice.</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">Use of Site</h2>
          <p>You may not use the site for any unlawful purpose or to violate any laws in your jurisdiction.</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">Limitation of Liability</h2>
          <p>Aura Lift Essentials is not liable for any indirect or consequential damages arising from use of our products.</p>
          <h2 className="text-foreground text-xl font-semibold pt-4">Contact</h2>
          <p>support@auraliftessentials.com</p>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}

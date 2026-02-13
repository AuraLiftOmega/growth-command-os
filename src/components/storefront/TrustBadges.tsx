import { Truck, Shield, RefreshCw, Leaf } from "lucide-react";

const badges = [
  { icon: Truck, title: "Free Shipping", description: "On orders over $50" },
  { icon: Shield, title: "Secure Checkout", description: "256-bit SSL encryption" },
  { icon: RefreshCw, title: "Easy Returns", description: "30-day return policy" },
  { icon: Leaf, title: "Clean Beauty", description: "Cruelty-free formulas" },
];

export function TrustBadges() {
  return (
    <section className="py-8 md:py-10 border-y border-border/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <badge.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{badge.title}</h4>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

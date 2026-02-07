import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Gift, Percent, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import bundleImg from "@/assets/bundle-luxury.jpg";

const bundles = [
  {
    title: "The Glow Ritual",
    subtitle: "Complete AM/PM Routine",
    description: "Niacinamide Serum + Retinol Night Cream + Snail Mucin Essence — everything for glass skin.",
    savings: "Save 25%",
    originalPrice: "$89.97",
    bundlePrice: "$67.48",
    tag: "Best Seller",
    query: "product_type:Bundle",
    color: "from-primary/20 via-primary/5 to-transparent",
  },
  {
    title: "Anti-Aging Powerhouse",
    subtitle: "Turn Back Time",
    description: "Retinol Cream + Hyaluronic Acid Complex + Galvanic Lifting Wand — clinical-grade results at home.",
    savings: "Save 30%",
    originalPrice: "$134.97",
    bundlePrice: "$94.48",
    tag: "Most Popular",
    query: "product_type:Bundle",
    color: "from-accent/20 via-accent/5 to-transparent",
  },
  {
    title: "Luxury Gift Set",
    subtitle: "The Ultimate Present",
    description: "Rose Quartz Roller + Ice Globes + LED Mask + Premium Serums — curated luxury in a gift box.",
    savings: "Save 35%",
    originalPrice: "$199.97",
    bundlePrice: "$129.98",
    tag: "Gift Ready",
    query: "product_type:Gift Set",
    color: "from-success/20 via-success/5 to-transparent",
  },
];

export function FeaturedBundles() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 border-accent/30 text-accent">
              <Gift className="w-3.5 h-3.5 mr-1.5" />
              Exclusive Bundles
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Save More, <span className="gradient-text-purple">Glow More</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Curated skincare sets designed by dermatologists. Bundle & save up to 35%.
            </p>
          </motion.div>
        </div>

        {/* Hero Bundle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card/50">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                <img
                  src={bundleImg}
                  alt="Luxury skincare gift set"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80 lg:block hidden" />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-primary/10 text-primary border-primary/20">
                  <Star className="w-3 h-3 mr-1" /> Limited Edition
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold mb-3">The Complete Collection</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Every bestseller in one luxe box. 8 premium products worth $299 — 
                  yours for $179. The ultimate skincare wardrobe.
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl font-bold text-primary font-mono">$179</span>
                  <span className="text-xl text-muted-foreground line-through">$299</span>
                  <Badge className="bg-success/10 text-success border-success/20">
                    <Percent className="w-3 h-3 mr-1" /> Save 40%
                  </Badge>
                </div>
                <Button asChild size="lg" className="btn-power w-fit">
                  <Link to="/store?category=Gift Set">
                    Shop Gift Sets
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bundle Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {bundles.map((bundle, index) => (
            <motion.div
              key={bundle.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`relative h-full glass-card p-6 bg-gradient-to-br ${bundle.color} hover:border-primary/30 transition-all duration-300`}>
                <Badge variant="outline" className="mb-4 text-xs">
                  {bundle.tag}
                </Badge>
                <h3 className="text-xl font-bold mb-1">{bundle.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{bundle.subtitle}</p>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                  {bundle.description}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-primary font-mono">{bundle.bundlePrice}</span>
                  <span className="text-sm text-muted-foreground line-through">{bundle.originalPrice}</span>
                </div>
                <Badge className="bg-success/10 text-success border-success/20 mb-4">
                  {bundle.savings}
                </Badge>
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link to="/store?category=Bundle">
                    View Bundle
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

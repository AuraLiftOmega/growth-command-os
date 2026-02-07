import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import lifestyleImg from "@/assets/lifestyle-glow.jpg";

export function LifestyleBanner() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div className="grid lg:grid-cols-2 gap-0 min-h-[500px]">
            {/* Image Side */}
            <div className="relative overflow-hidden">
              <img
                src={lifestyleImg}
                alt="Radiant glowing skin"
                className="w-full h-full object-cover min-h-[400px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background lg:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:hidden" />
            </div>

            {/* Content Side */}
            <div className="relative p-8 lg:p-16 flex flex-col justify-center bg-background lg:bg-transparent">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">The Aura Luxe Difference</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Your Skin Deserves
                <br />
                <span className="gradient-text">Clinical Results</span>
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Dermatologist-Formulated</p>
                    <p className="text-sm text-muted-foreground">Every product backed by clinical research and real results</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Visible Results in 14 Days</p>
                    <p className="text-sm text-muted-foreground">93% of users report smoother, more radiant skin within two weeks</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Clean & Cruelty-Free</p>
                    <p className="text-sm text-muted-foreground">No parabens, no sulfates, never tested on animals</p>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="btn-power w-fit">
                <Link to="/store?category=Skincare">
                  Shop Skincare
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

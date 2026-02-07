import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Sarah M.",
    product: "Snail Mucin Essence",
    rating: 5,
    text: "My skin has never looked this hydrated. Visible difference in just one week!",
    verified: true,
  },
  {
    name: "Jessica L.",
    product: "LED Face Mask Pro",
    rating: 5,
    text: "Worth every penny. My acne scars are fading and my skin tone is so much more even.",
    verified: true,
  },
  {
    name: "Amanda K.",
    product: "Retinol Night Cream",
    rating: 5,
    text: "Finally a retinol that doesn't irritate my sensitive skin. Waking up with baby-soft skin every morning.",
    verified: true,
  },
  {
    name: "Michelle R.",
    product: "Complete Glow Kit",
    rating: 5,
    text: "The bundle is incredible value. Every product feels luxurious. My entire routine is sorted.",
    verified: true,
  },
];

export function SocialProof() {
  return (
    <section className="py-16 md:py-24 bg-card/30 border-y border-border/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Loved by <span className="gradient-text">10,000+</span> Customers
          </h2>
          <p className="text-muted-foreground">4.9 average rating across all products</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground mb-4 leading-relaxed">"{review.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.product}</p>
                </div>
                {review.verified && (
                  <span className="text-xs text-success font-medium">✓ Verified</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

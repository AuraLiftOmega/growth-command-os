import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import categorySkincare from "@/assets/category-skincare.jpg";
import categoryTools from "@/assets/category-tools.jpg";
import categoryTech from "@/assets/category-tech.jpg";

const categories = [
  {
    id: "Skincare",
    name: "Skincare",
    description: "Serums, essences & treatments for luminous, glass-like skin",
    image: categorySkincare,
    count: "15+ Products",
  },
  {
    id: "Beauty Tools",
    name: "Beauty Tools",
    description: "Rose quartz rollers, gua sha stones & cryo ice globes",
    image: categoryTools,
    count: "8+ Products",
  },
  {
    id: "Beauty Tech",
    name: "Beauty Tech",
    description: "LED masks, EMS sculpting & galvanic lifting devices",
    image: categoryTech,
    count: "10+ Products",
  },
];

export function CategorySection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Curated collections for every step of your beauty ritual
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={`/store?category=${category.id}`}
                className="group block relative rounded-xl overflow-hidden aspect-[4/5] border border-border/40"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider mb-2 block">
                    {category.count}
                  </span>
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  <div className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-3 gap-2 transition-all">
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

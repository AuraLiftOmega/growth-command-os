import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Headphones, Dumbbell, Footprints, ArrowRight } from "lucide-react";

const categories = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Premium headphones, watches, and gadgets",
    icon: Headphones,
    color: "from-primary/20 to-primary/5",
    borderColor: "border-primary/30",
  },
  {
    id: "fitness",
    name: "Fitness",
    description: "Yoga mats, equipment, and accessories",
    icon: Dumbbell,
    color: "from-accent/20 to-accent/5",
    borderColor: "border-accent/30",
  },
  {
    id: "footwear",
    name: "Footwear",
    description: "Performance running shoes and sneakers",
    icon: Footprints,
    color: "from-success/20 to-success/5",
    borderColor: "border-success/30",
  },
];

export function CategorySection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collections of premium products designed for peak performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={`/store?category=${category.id}`}
                className={`block group p-6 rounded-xl border ${category.borderColor} bg-gradient-to-br ${category.color} hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <category.icon className="w-10 h-10 text-foreground" />
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

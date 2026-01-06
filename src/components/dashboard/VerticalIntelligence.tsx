import { motion } from "framer-motion";
import { 
  Sparkles, 
  Dumbbell, 
  Pill, 
  Shirt, 
  Home, 
  Cpu,
  FileText,
  TrendingUp,
  Star
} from "lucide-react";

interface Vertical {
  id: string;
  name: string;
  icon: typeof Sparkles;
  creativesGenerated: number;
  avgRoas: number;
  topHook: string;
  learningScore: number;
  color: string;
}

const verticals: Vertical[] = [
  {
    id: "beauty",
    name: "Beauty",
    icon: Sparkles,
    creativesGenerated: 2847,
    avgRoas: 4.8,
    topHook: "POV: Your skin after...",
    learningScore: 92,
    color: "from-pink-500/20 to-rose-500/20",
  },
  {
    id: "fitness",
    name: "Fitness",
    icon: Dumbbell,
    creativesGenerated: 1923,
    avgRoas: 5.2,
    topHook: "I gained 10lbs and...",
    learningScore: 87,
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    id: "supplements",
    name: "Supplements",
    icon: Pill,
    creativesGenerated: 1456,
    avgRoas: 3.9,
    topHook: "My doctor asked what...",
    learningScore: 78,
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: Shirt,
    creativesGenerated: 3124,
    avgRoas: 4.1,
    topHook: "Outfit check: $50 vs...",
    learningScore: 89,
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "home",
    name: "Home Goods",
    icon: Home,
    creativesGenerated: 987,
    avgRoas: 3.4,
    topHook: "Wait till you see...",
    learningScore: 71,
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "gadgets",
    name: "Gadgets",
    icon: Cpu,
    creativesGenerated: 1678,
    avgRoas: 4.6,
    topHook: "This tiny thing changed...",
    learningScore: 84,
    color: "from-slate-500/20 to-zinc-500/20",
  },
  {
    id: "digital",
    name: "Digital Products",
    icon: FileText,
    creativesGenerated: 2341,
    avgRoas: 6.8,
    topHook: "I made $10K with...",
    learningScore: 95,
    color: "from-primary/20 to-chart-2/20",
  },
];

export const VerticalIntelligence = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-chart-4/30 to-chart-5/30 flex items-center justify-center">
              <Star className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Vertical Intelligence</h3>
              <p className="text-muted-foreground text-sm">Niche-specific creative AI</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {verticals.map((vertical, index) => {
            const Icon = vertical.icon;
            return (
              <motion.div
                key={vertical.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                className={`p-4 rounded-xl bg-gradient-to-br ${vertical.color} border border-border/50 hover:border-primary/30 transition-all cursor-pointer group`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <h4 className="font-medium text-sm">{vertical.name}</h4>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Creatives</span>
                    <span className="font-medium">{vertical.creativesGenerated.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Avg ROAS</span>
                    <span className="font-medium text-success">{vertical.avgRoas}x</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Learning</span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 bg-background/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${vertical.learningScore}%` }}
                        />
                      </div>
                      <span className="font-medium">{vertical.learningScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[10px] text-muted-foreground mb-1">Top performing hook:</p>
                  <p className="text-xs italic text-foreground/80">"{vertical.topHook}"</p>
                </div>

                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-full py-2 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors">
                    Generate for {vertical.name}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Intelligence Stats */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm font-medium">Cross-Vertical Learning Active</p>
                <p className="text-xs text-muted-foreground">
                  Insights from beauty hooks improving fitness CTR by 18%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-display font-bold text-primary">14,356</p>
              <p className="text-xs text-muted-foreground">Total creatives generated</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

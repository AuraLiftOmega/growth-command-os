import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueEngineDashboard } from "@/components/revenue-engine/RevenueEngineDashboard";
import { RevenueAppsGrid } from "@/components/revenue-engine/RevenueAppsGrid";
import { Rocket, Plug, BarChart3, Settings, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function RevenueEngine() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Revenue Engine
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">AUTONOMOUS</Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                1-click revenue mode • Self-thinking Grok CEO • Real $10k+ profit machine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Bot className="w-3 h-3" />
              50 Bots Active
            </Badge>
            <Badge variant="outline" className="gap-1 text-green-500 border-green-500/30">
              <BarChart3 className="w-3 h-3" />
              4.2x ROAS
            </Badge>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="engine" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-2">
          <TabsTrigger value="engine" className="gap-2">
            <Rocket className="w-4 h-4" />
            Revenue Engine
          </TabsTrigger>
          <TabsTrigger value="apps" className="gap-2">
            <Plug className="w-4 h-4" />
            Revenue Apps
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="engine" className="mt-6">
          <RevenueEngineDashboard />
        </TabsContent>
        
        <TabsContent value="apps" className="mt-6">
          <RevenueAppsGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}

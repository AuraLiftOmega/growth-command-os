import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueEngineDashboard } from "@/components/revenue-engine/RevenueEngineDashboard";
import { RevenueAppsGrid } from "@/components/revenue-engine/RevenueAppsGrid";
import { Rocket, Plug } from "lucide-react";

export default function RevenueEngine() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="engine" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
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

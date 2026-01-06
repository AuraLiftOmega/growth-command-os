import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SalesPhilosophy } from "@/components/war-room/SalesPhilosophy";
import { IdealBuyerSnapshot } from "@/components/war-room/IdealBuyerSnapshot";
import { CloseFramework } from "@/components/war-room/CloseFramework";
import { PricingAnchorPanel } from "@/components/war-room/PricingAnchorPanel";
import { ObjectionControlSystem } from "@/components/war-room/ObjectionControlSystem";

const RevenueWarRoom = () => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6 pt-24 space-y-6">
          {/* Sales Philosophy - Always visible at top */}
          <SalesPhilosophy />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Pre-call filter + Framework */}
            <div className="xl:col-span-2 space-y-6">
              <IdealBuyerSnapshot />
              <CloseFramework />
            </div>

            {/* Right Column - Pricing + Objections */}
            <div className="space-y-6">
              <PricingAnchorPanel />
              <ObjectionControlSystem />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RevenueWarRoom;

/**
 * CEO CONTROL PAGE - Ultimate Self-Running CEO Dashboard
 */

import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { Header } from "@/components/layout/Header";
import { OmegaCEOControl } from "@/components/omega/OmegaCEOControl";

const CEOControl = () => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <SmartSidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Header />
        <main className="pt-20">
          <OmegaCEOControl />
        </main>
      </div>
    </div>
  );
};

export default CEOControl;

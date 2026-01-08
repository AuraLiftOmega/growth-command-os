/**
 * OMEGA COMMAND - Ultimate CEO Brain Interface
 * 
 * The apex of autonomous business intelligence.
 * Access to the full OMEGA 2026 swarm system.
 */

import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { Header } from "@/components/layout/Header";
import { OmegaWarRoom } from "@/components/omega/OmegaWarRoom";

const OmegaCommand = () => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <SmartSidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <Header />
        <main className="pt-20">
          <OmegaWarRoom />
        </main>
      </div>
    </div>
  );
};

export default OmegaCommand;

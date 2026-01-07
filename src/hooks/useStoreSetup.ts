import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StoreSetupData {
  storeName: string;
  industry: string;
  description: string;
  targetAudience: string;
  email: string;
  products: Array<{ name: string; price: string; description: string }>;
}

export interface StoreConfig {
  theme: {
    primaryColor: string;
    style: string;
  };
  layout: string;
  features: string[];
  seo: {
    title: string;
    description: string;
  };
}

export function useStoreSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [setupId, setSetupId] = useState<string | null>(null);

  const saveSetup = async (data: StoreSetupData): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: setup, error } = await supabase
        .from("store_setups")
        .insert({
          store_name: data.storeName,
          industry: data.industry,
          description: data.description,
          target_audience: data.targetAudience,
          email: data.email,
          products: data.products,
          user_id: user?.user?.id || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      setSetupId(setup.id);
      return setup.id;
    } catch (error) {
      console.error("Error saving store setup:", error);
      toast.error("Failed to save store setup");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateStoreConfig = async (data: StoreSetupData): Promise<StoreConfig> => {
    // Generate store configuration based on industry and preferences
    const industryStyles: Record<string, { primaryColor: string; style: string }> = {
      fashion: { primaryColor: "#ec4899", style: "elegant" },
      electronics: { primaryColor: "#3b82f6", style: "modern" },
      beauty: { primaryColor: "#f472b6", style: "luxurious" },
      home: { primaryColor: "#84cc16", style: "warm" },
      fitness: { primaryColor: "#f97316", style: "energetic" },
      food: { primaryColor: "#ef4444", style: "appetizing" },
      pets: { primaryColor: "#a855f7", style: "playful" },
      other: { primaryColor: "#6366f1", style: "professional" },
    };

    const theme = industryStyles[data.industry] || industryStyles.other;

    return {
      theme,
      layout: "modern-grid",
      features: ["cart", "wishlist", "quick-view", "search"],
      seo: {
        title: `${data.storeName} - ${data.industry.charAt(0).toUpperCase() + data.industry.slice(1)} Store`,
        description: data.description || `Shop the best ${data.industry} products at ${data.storeName}. Quality products, fast shipping.`,
      },
    };
  };

  const updateSetupWithConfig = async (setupId: string, config: StoreConfig): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("store_setups")
        .update({
          generated_config: JSON.parse(JSON.stringify(config)),
          status: "configured",
        })
        .eq("id", setupId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating store config:", error);
      toast.error("Failed to update store configuration");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const completeSetup = async (setupId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("store_setups")
        .update({ status: "complete" })
        .eq("id", setupId);

      if (error) throw error;
      toast.success("Store setup complete!");
      return true;
    } catch (error) {
      console.error("Error completing setup:", error);
      toast.error("Failed to complete setup");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setupId,
    saveSetup,
    generateStoreConfig,
    updateSetupWithConfig,
    completeSetup,
  };
}

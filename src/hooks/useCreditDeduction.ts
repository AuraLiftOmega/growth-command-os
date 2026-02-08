import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { isSuperAdmin } from "@/config/admin";

export type CreditAction = 
  | "video_generation"
  | "store_creation"
  | "ai_chat"
  | "automation_run"
  | "demo_generation";

interface CreditResult {
  success: boolean;
  bypassed?: boolean;
  credits_remaining?: number;
  credits_deducted?: number;
  error?: string;
  upgrade_required?: boolean;
}

export function useCreditDeduction() {
  const { user } = useAuth();
  const [isDeducting, setIsDeducting] = useState(false);

  const isGodMode = isSuperAdmin(user?.email);

  const deductCredits = useCallback(async (
    action: CreditAction,
    customAmount?: number
  ): Promise<CreditResult> => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // God mode bypass - instant success
    if (isGodMode) {
      console.log(`GOD MODE: Bypassing credit deduction for ${action}`);
      return { 
        success: true, 
        bypassed: true, 
        credits_remaining: -1,
        credits_deducted: 0,
      };
    }

    setIsDeducting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        return { success: false, error: "No session" };
      }

      const response = await supabase.functions.invoke("deduct-credits", {
        body: { action, amount: customAmount },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data as CreditResult;

      if (!result.success && result.upgrade_required) {
        toast.error("Credit limit reached", {
          description: `You need ${result.credits_deducted || 0} more credits. Upgrade your plan to continue.`,
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = "/pricing",
          },
        });
      }

      return result;
    } catch (error) {
      console.error("Credit deduction error:", error);
      const message = error instanceof Error ? error.message : "Failed to deduct credits";
      
      // Don't show error toast for god mode users
      if (!isGodMode) {
        toast.error("Credit error", { description: message });
      }
      
      return { success: false, error: message };
    } finally {
      setIsDeducting(false);
    }
  }, [user, isGodMode]);

  const checkCredits = useCallback(async (
    action: CreditAction,
    requiredAmount?: number
  ): Promise<boolean> => {
    // God mode always has credits
    if (isGodMode) return true;

    if (!user) return false;

    try {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("monthly_ai_credits, ai_credits_used_this_month")
        .eq("user_id", user.id)
        .single();

      if (!subscription) return false;

      // Unlimited credits
      if (subscription.monthly_ai_credits === -1) return true;

      const remaining = subscription.monthly_ai_credits - subscription.ai_credits_used_this_month;
      const needed = requiredAmount || getCreditCost(action);

      return remaining >= needed;
    } catch {
      return false;
    }
  }, [user, isGodMode]);

  return {
    deductCredits,
    checkCredits,
    isDeducting,
    isGodMode,
  };
}

function getCreditCost(action: CreditAction): number {
  const costs: Record<CreditAction, number> = {
    video_generation: 5,
    store_creation: 10,
    ai_chat: 1,
    automation_run: 2,
    demo_generation: 3,
  };
  return costs[action] || 1;
}

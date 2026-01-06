import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
export interface Creative {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  hook: string | null;
  script: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  style: string | null;
  emotional_trigger: string | null;
  quality_score: number;
  hook_score: number;
  engagement_score: number;
  conversion_score: number;
  passed_quality_gate: boolean;
  auto_regenerated: boolean;
  regeneration_count: number;
  impressions: number;
  views: number;
  watch_time_seconds: number;
  avg_watch_percentage: number;
  clicks: number;
  ctr: number;
  conversions: number;
  revenue: number;
  spend: number;
  roas: number;
  status: 'draft' | 'generating' | 'pending_review' | 'active' | 'paused' | 'scaling' | 'killed';
  kill_reason: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  killed_at: string | null;
}

// Quality thresholds for enforcement
const QUALITY_THRESHOLDS = {
  MINIMUM_SCORE: 70, // Minimum quality score to pass gate
  HOOK_MINIMUM: 65, // Hook must score at least 65%
  AUTO_REGENERATE_THRESHOLD: 50, // Below this, auto-regenerate silently
  SCALE_THRESHOLD: 85, // Above this, auto-scale
  KILL_THRESHOLD: 40, // Below this for 24h, auto-kill
};

export const calculateQualityScore = (creative: Partial<Creative>): number => {
  // Quality scoring algorithm based on multiple factors
  let score = 50; // Base score
  
  // Hook quality (0-30 points)
  if (creative.hook) {
    const hookLength = creative.hook.length;
    if (hookLength > 10 && hookLength < 80) score += 15;
    if (creative.hook.includes("?") || creative.hook.includes("...")) score += 10;
    if (creative.hook.toLowerCase().includes("pov") || creative.hook.toLowerCase().includes("wait")) score += 5;
  }
  
  // Performance-based scoring (0-50 points)
  if (creative.ctr && creative.ctr > 0.03) score += 15;
  if (creative.ctr && creative.ctr > 0.05) score += 10;
  if (creative.roas && creative.roas > 2) score += 10;
  if (creative.roas && creative.roas > 4) score += 15;
  
  return Math.min(100, Math.max(0, score));
};

export const creativeService = {
  async fetchCreatives(userId: string): Promise<Creative[]> {
    const { data, error } = await supabase
      .from("creatives")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching creatives:", error);
      return [];
    }
    
    return (data || []) as Creative[];
  },

  async createCreative(userId: string, creative: Partial<Creative>): Promise<Creative | null> {
    const qualityScore = calculateQualityScore(creative);
    const passedQualityGate = qualityScore >= QUALITY_THRESHOLDS.MINIMUM_SCORE;
    
    const { data, error } = await supabase
      .from("creatives")
      .insert({
        user_id: userId,
        name: creative.name || "Untitled Creative",
        platform: creative.platform || "tiktok",
        hook: creative.hook,
        script: creative.script,
        style: creative.style,
        emotional_trigger: creative.emotional_trigger,
        quality_score: qualityScore,
        hook_score: creative.hook_score || Math.round(qualityScore * 0.9),
        passed_quality_gate: passedQualityGate,
        status: passedQualityGate ? "pending_review" : "generating",
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating creative:", error);
      return null;
    }
    
    // If quality is too low, trigger auto-regeneration
    if (qualityScore < QUALITY_THRESHOLDS.AUTO_REGENERATE_THRESHOLD) {
      await this.triggerAutoRegeneration(data.id);
    }
    
    return data as Creative;
  },

  async updateCreativeStatus(
    creativeId: string,
    status: Creative["status"],
    killReason?: string
  ): Promise<void> {
    const updateData: Partial<Creative> = { status };
    if (status === "killed") {
      updateData.killed_at = new Date().toISOString();
      updateData.kill_reason = killReason || "Auto-killed due to low performance";
    }
    if (status === "active") {
      updateData.published_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from("creatives")
      .update(updateData)
      .eq("id", creativeId);
    
    if (error) {
      console.error("Error updating creative status:", error);
    }
  },

  async triggerAutoRegeneration(creativeId: string): Promise<void> {
    const { error } = await supabase
      .from("creatives")
      .update({
        auto_regenerated: true,
        regeneration_count: supabase.rpc ? 1 : 1, // Increment in real implementation
        status: "generating",
      })
      .eq("id", creativeId);
    
    if (error) {
      console.error("Error triggering regeneration:", error);
    }
  },

  async evaluateAndAutoScale(userId: string): Promise<{
    scaled: string[];
    killed: string[];
  }> {
    const creatives = await this.fetchCreatives(userId);
    const scaled: string[] = [];
    const killed: string[] = [];
    
    for (const creative of creatives) {
      if (creative.status === "active") {
        // Auto-scale high performers
        if (creative.quality_score >= QUALITY_THRESHOLDS.SCALE_THRESHOLD && creative.roas >= 3) {
          await this.updateCreativeStatus(creative.id, "scaling");
          scaled.push(creative.id);
        }
        // Auto-kill low performers
        else if (creative.quality_score < QUALITY_THRESHOLDS.KILL_THRESHOLD) {
          await this.updateCreativeStatus(creative.id, "killed", "Low quality score");
          killed.push(creative.id);
        }
      }
    }
    
    return { scaled, killed };
  },

  getQualityThresholds() {
    return QUALITY_THRESHOLDS;
  },
};

export const systemEventService = {
  async logEvent(
    userId: string,
    eventType: string,
    eventCategory: 'creative' | 'automation' | 'platform' | 'learning' | 'error' | 'scale',
    title: string,
    description?: string,
    metadata?: Json,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
  ): Promise<void> {
    const { error } = await supabase
      .from("system_events")
      .insert([{
        user_id: userId,
        event_type: eventType,
        event_category: eventCategory,
        title,
        description,
        metadata: metadata || {},
        severity,
        resolved: severity !== 'error' && severity !== 'critical',
      }]);
    
    if (error) {
      console.error("Error logging system event:", error);
    }
  },

  async fetchRecentEvents(userId: string, limit = 20): Promise<unknown[]> {
    const { data, error } = await supabase
      .from("system_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching system events:", error);
      return [];
    }
    
    return data || [];
  },

  async retryFailedEvent(eventId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("system_events")
      .update({ retry_count: 1 }) // Increment in real implementation
      .eq("id", eventId)
      .select()
      .single();
    
    if (error || !data) return false;
    
    // Check if max retries exceeded
    if (data.retry_count >= data.max_retries) {
      await supabase
        .from("system_events")
        .update({ resolved: true })
        .eq("id", eventId);
      return false;
    }
    
    return true;
  },
};

export const learningService = {
  async recordSignal(
    userId: string,
    creativeId: string,
    signalType: 'hook_performance' | 'pacing' | 'angle' | 'cta' | 'platform' | 'audience' | 'timing',
    signalData: Json,
    positiveOutcome: boolean,
    impactScore: number
  ): Promise<void> {
    const { error } = await supabase
      .from("learning_signals")
      .insert([{
        user_id: userId,
        creative_id: creativeId,
        signal_type: signalType,
        signal_data: signalData,
        positive_outcome: positiveOutcome,
        impact_score: impactScore,
      }]);
    
    if (error) {
      console.error("Error recording learning signal:", error);
    }
  },

  async fetchLearnings(userId: string): Promise<unknown[]> {
    const { data, error } = await supabase
      .from("ai_learnings")
      .select("*")
      .eq("user_id", userId)
      .order("confidence", { ascending: false })
      .limit(10);
    
    if (error) {
      console.error("Error fetching AI learnings:", error);
      return [];
    }
    
    return data || [];
  },

  async getSignalsCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("learning_signals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    
    if (error) return 0;
    return count || 0;
  },
};

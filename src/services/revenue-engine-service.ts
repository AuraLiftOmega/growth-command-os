import { supabase } from "@/integrations/supabase/client";
import { IndustryConfig } from "@/stores/dominion-core-store";

export interface RevenueEngineConfig {
  id: string;
  user_id: string;
  industry: string | null;
  industry_config: IndustryConfig | null;
  offer_type: string | null;
  sales_motion: string | null;
  deal_size: 'low' | 'mid' | 'high' | 'enterprise';
  buying_cycle: 'instant' | 'short' | 'medium' | 'long' | 'enterprise';
  core_capabilities: Record<string, boolean>;
  is_self_marketing_active: boolean;
  self_as_client: boolean;
  connected_integrations: string[];
  orchestrated_tools: string[];
  tenant_mode: 'founder' | 'customer' | 'demo';
  is_founder_instance: boolean;
  customer_id: string | null;
  primary_kpis: string[];
  secondary_kpis: string[];
  kpi_benchmarks: Record<string, number>;
  language_tone: string;
  approved_phrases: string[];
  forbidden_words: string[];
  decision_makers: string[];
  objections: string[];
  triggers: string[];
  is_configured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RevenueEngineUpdate {
  industry?: string | null;
  industry_config?: IndustryConfig | null;
  offer_type?: string | null;
  sales_motion?: string | null;
  deal_size?: 'low' | 'mid' | 'high' | 'enterprise';
  buying_cycle?: 'instant' | 'short' | 'medium' | 'long' | 'enterprise';
  core_capabilities?: Record<string, boolean>;
  is_self_marketing_active?: boolean;
  self_as_client?: boolean;
  connected_integrations?: string[];
  orchestrated_tools?: string[];
  tenant_mode?: 'founder' | 'customer' | 'demo';
  is_founder_instance?: boolean;
  customer_id?: string | null;
  primary_kpis?: string[];
  secondary_kpis?: string[];
  kpi_benchmarks?: Record<string, number>;
  language_tone?: string;
  approved_phrases?: string[];
  forbidden_words?: string[];
  decision_makers?: string[];
  objections?: string[];
  triggers?: string[];
  is_configured?: boolean;
  is_active?: boolean;
}

export const revenueEngineService = {
  async fetchConfig(userId: string): Promise<RevenueEngineConfig | null> {
    const { data, error } = await supabase
      .from("revenue_engine_config")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found, create one
        return this.createConfig(userId);
      }
      console.error("Error fetching revenue engine config:", error);
      return null;
    }

    return {
      ...data,
      industry_config: data.industry_config as unknown as IndustryConfig | null,
      core_capabilities: data.core_capabilities as unknown as Record<string, boolean>,
      kpi_benchmarks: data.kpi_benchmarks as unknown as Record<string, number>,
      deal_size: data.deal_size as 'low' | 'mid' | 'high' | 'enterprise',
      buying_cycle: data.buying_cycle as 'instant' | 'short' | 'medium' | 'long' | 'enterprise',
      tenant_mode: data.tenant_mode as 'founder' | 'customer' | 'demo',
    };
  },

  async createConfig(userId: string): Promise<RevenueEngineConfig | null> {
    const { data, error } = await supabase
      .from("revenue_engine_config")
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) {
      console.error("Error creating revenue engine config:", error);
      return null;
    }

    return {
      ...data,
      industry_config: data.industry_config as unknown as IndustryConfig | null,
      core_capabilities: data.core_capabilities as unknown as Record<string, boolean>,
      kpi_benchmarks: data.kpi_benchmarks as unknown as Record<string, number>,
      deal_size: data.deal_size as 'low' | 'mid' | 'high' | 'enterprise',
      buying_cycle: data.buying_cycle as 'instant' | 'short' | 'medium' | 'long' | 'enterprise',
      tenant_mode: data.tenant_mode as 'founder' | 'customer' | 'demo',
    };
  },

  async updateConfig(userId: string, updates: RevenueEngineUpdate): Promise<boolean> {
    // Convert to database-compatible format
    const dbUpdates: Record<string, unknown> = { ...updates };
    if (updates.industry_config) {
      dbUpdates.industry_config = JSON.parse(JSON.stringify(updates.industry_config));
    }
    if (updates.core_capabilities) {
      dbUpdates.core_capabilities = JSON.parse(JSON.stringify(updates.core_capabilities));
    }
    if (updates.kpi_benchmarks) {
      dbUpdates.kpi_benchmarks = JSON.parse(JSON.stringify(updates.kpi_benchmarks));
    }

    const { error } = await supabase
      .from("revenue_engine_config")
      .update(dbUpdates)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating revenue engine config:", error);
      return false;
    }

    return true;
  },

  async activateEngine(userId: string, config: RevenueEngineUpdate): Promise<boolean> {
    const fullConfig: RevenueEngineUpdate = {
      ...config,
      is_configured: true,
      is_active: true,
    };

    return this.updateConfig(userId, fullConfig);
  },

  async applyIndustryDefaults(userId: string, industry: string, config: IndustryConfig): Promise<boolean> {
    const updates: RevenueEngineUpdate = {
      industry,
      industry_config: config,
      buying_cycle: config.buyerPsychology.cycleLength,
      language_tone: config.language.tone,
      primary_kpis: config.kpis.primary,
      secondary_kpis: config.kpis.secondary,
      kpi_benchmarks: config.kpis.benchmarks,
      approved_phrases: config.language.approvedPhrases,
      forbidden_words: config.language.forbiddenWords,
      decision_makers: config.buyerPsychology.decisionMakers,
      objections: config.buyerPsychology.objections,
      triggers: config.buyerPsychology.triggers,
      connected_integrations: config.integrations,
    };

    return this.updateConfig(userId, updates);
  },

  async getOrCreateConfig(userId: string): Promise<RevenueEngineConfig | null> {
    const existing = await this.fetchConfig(userId);
    if (existing) return existing;
    return this.createConfig(userId);
  }
};

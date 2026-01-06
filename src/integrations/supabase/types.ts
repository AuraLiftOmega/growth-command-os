export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_learnings: {
        Row: {
          applied_to_generation: boolean | null
          category: string
          confidence: number | null
          created_at: string
          id: string
          improvement_percentage: number | null
          insight: string
          signals_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_to_generation?: boolean | null
          category: string
          confidence?: number | null
          created_at?: string
          id?: string
          improvement_percentage?: number | null
          insight: string
          signals_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_to_generation?: boolean | null
          category?: string
          confidence?: number | null
          created_at?: string
          id?: string
          improvement_percentage?: number | null
          insight?: string
          signals_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_settings: {
        Row: {
          aggressive_testing: boolean | null
          auto_killed_today: number | null
          auto_posting: boolean | null
          auto_regeneration: boolean | null
          created_at: string
          creatives_generated_today: number | null
          human_approval_required: boolean | null
          id: string
          multi_variation: boolean | null
          performance_scaling: boolean | null
          scaling_now: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aggressive_testing?: boolean | null
          auto_killed_today?: number | null
          auto_posting?: boolean | null
          auto_regeneration?: boolean | null
          created_at?: string
          creatives_generated_today?: number | null
          human_approval_required?: boolean | null
          id?: string
          multi_variation?: boolean | null
          performance_scaling?: boolean | null
          scaling_now?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aggressive_testing?: boolean | null
          auto_killed_today?: number | null
          auto_posting?: boolean | null
          auto_regeneration?: boolean | null
          created_at?: string
          creatives_generated_today?: number | null
          human_approval_required?: boolean | null
          id?: string
          multi_variation?: boolean | null
          performance_scaling?: boolean | null
          scaling_now?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comment_automations: {
        Row: {
          comment_author: string | null
          comment_text: string
          created_at: string
          dm_sent_at: string | null
          dm_status: string | null
          dm_text: string | null
          id: string
          outcome: string | null
          platform: string
          post_id: string | null
          revenue_attributed: number | null
          user_id: string
        }
        Insert: {
          comment_author?: string | null
          comment_text: string
          created_at?: string
          dm_sent_at?: string | null
          dm_status?: string | null
          dm_text?: string | null
          id?: string
          outcome?: string | null
          platform: string
          post_id?: string | null
          revenue_attributed?: number | null
          user_id: string
        }
        Update: {
          comment_author?: string | null
          comment_text?: string
          created_at?: string
          dm_sent_at?: string | null
          dm_status?: string | null
          dm_text?: string | null
          id?: string
          outcome?: string | null
          platform?: string
          post_id?: string | null
          revenue_attributed?: number | null
          user_id?: string
        }
        Relationships: []
      }
      creatives: {
        Row: {
          auto_regenerated: boolean | null
          avg_watch_percentage: number | null
          clicks: number | null
          conversion_score: number | null
          conversions: number | null
          created_at: string
          ctr: number | null
          emotional_trigger: string | null
          engagement_score: number | null
          hook: string | null
          hook_score: number | null
          id: string
          impressions: number | null
          kill_reason: string | null
          killed_at: string | null
          name: string
          passed_quality_gate: boolean | null
          platform: string
          published_at: string | null
          quality_score: number | null
          regeneration_count: number | null
          revenue: number | null
          roas: number | null
          script: string | null
          spend: number | null
          status: string | null
          style: string | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          video_url: string | null
          views: number | null
          watch_time_seconds: number | null
        }
        Insert: {
          auto_regenerated?: boolean | null
          avg_watch_percentage?: number | null
          clicks?: number | null
          conversion_score?: number | null
          conversions?: number | null
          created_at?: string
          ctr?: number | null
          emotional_trigger?: string | null
          engagement_score?: number | null
          hook?: string | null
          hook_score?: number | null
          id?: string
          impressions?: number | null
          kill_reason?: string | null
          killed_at?: string | null
          name: string
          passed_quality_gate?: boolean | null
          platform?: string
          published_at?: string | null
          quality_score?: number | null
          regeneration_count?: number | null
          revenue?: number | null
          roas?: number | null
          script?: string | null
          spend?: number | null
          status?: string | null
          style?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
          views?: number | null
          watch_time_seconds?: number | null
        }
        Update: {
          auto_regenerated?: boolean | null
          avg_watch_percentage?: number | null
          clicks?: number | null
          conversion_score?: number | null
          conversions?: number | null
          created_at?: string
          ctr?: number | null
          emotional_trigger?: string | null
          engagement_score?: number | null
          hook?: string | null
          hook_score?: number | null
          id?: string
          impressions?: number | null
          kill_reason?: string | null
          killed_at?: string | null
          name?: string
          passed_quality_gate?: boolean | null
          platform?: string
          published_at?: string | null
          quality_score?: number | null
          regeneration_count?: number | null
          revenue?: number | null
          roas?: number | null
          script?: string | null
          spend?: number | null
          status?: string | null
          style?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          views?: number | null
          watch_time_seconds?: number | null
        }
        Relationships: []
      }
      learning_signals: {
        Row: {
          created_at: string
          creative_id: string | null
          id: string
          impact_score: number | null
          positive_outcome: boolean | null
          signal_data: Json
          signal_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creative_id?: string | null
          id?: string
          impact_score?: number | null
          positive_outcome?: boolean | null
          signal_data?: Json
          signal_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          creative_id?: string | null
          id?: string
          impact_score?: number | null
          positive_outcome?: boolean | null
          signal_data?: Json
          signal_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_signals_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_data: {
        Row: {
          ad_styles: string[] | null
          aggressiveness_level: string | null
          aov: string | null
          authorize_automation: boolean | null
          brand_name: string | null
          buying_objections: string | null
          claims_allowed: string | null
          claims_forbidden: string | null
          competitive_advantages: string | null
          competitors: string | null
          created_at: string
          cta_preference: string | null
          current_step: number | null
          demographics: string | null
          desired_outcomes: string | null
          enable_comment_dm: boolean | null
          fonts: string | null
          forbidden_words: string | null
          frustrations: string | null
          growth_goal: string | null
          id: string
          input_quality_score: number | null
          is_completed: boolean | null
          monthly_revenue: string | null
          offer_type: string | null
          past_failures: string | null
          personality: string[] | null
          primary_color: string | null
          primary_products: string | null
          priority: string | null
          priority_platforms: string[] | null
          proof_assets: string[] | null
          secondary_color: string | null
          shopify_url: string | null
          tone_casual_professional: number | null
          tone_soft_aggressive: number | null
          updated_at: string
          user_id: string
          winning_ad_definition: string | null
        }
        Insert: {
          ad_styles?: string[] | null
          aggressiveness_level?: string | null
          aov?: string | null
          authorize_automation?: boolean | null
          brand_name?: string | null
          buying_objections?: string | null
          claims_allowed?: string | null
          claims_forbidden?: string | null
          competitive_advantages?: string | null
          competitors?: string | null
          created_at?: string
          cta_preference?: string | null
          current_step?: number | null
          demographics?: string | null
          desired_outcomes?: string | null
          enable_comment_dm?: boolean | null
          fonts?: string | null
          forbidden_words?: string | null
          frustrations?: string | null
          growth_goal?: string | null
          id?: string
          input_quality_score?: number | null
          is_completed?: boolean | null
          monthly_revenue?: string | null
          offer_type?: string | null
          past_failures?: string | null
          personality?: string[] | null
          primary_color?: string | null
          primary_products?: string | null
          priority?: string | null
          priority_platforms?: string[] | null
          proof_assets?: string[] | null
          secondary_color?: string | null
          shopify_url?: string | null
          tone_casual_professional?: number | null
          tone_soft_aggressive?: number | null
          updated_at?: string
          user_id: string
          winning_ad_definition?: string | null
        }
        Update: {
          ad_styles?: string[] | null
          aggressiveness_level?: string | null
          aov?: string | null
          authorize_automation?: boolean | null
          brand_name?: string | null
          buying_objections?: string | null
          claims_allowed?: string | null
          claims_forbidden?: string | null
          competitive_advantages?: string | null
          competitors?: string | null
          created_at?: string
          cta_preference?: string | null
          current_step?: number | null
          demographics?: string | null
          desired_outcomes?: string | null
          enable_comment_dm?: boolean | null
          fonts?: string | null
          forbidden_words?: string | null
          frustrations?: string | null
          growth_goal?: string | null
          id?: string
          input_quality_score?: number | null
          is_completed?: boolean | null
          monthly_revenue?: string | null
          offer_type?: string | null
          past_failures?: string | null
          personality?: string[] | null
          primary_color?: string | null
          primary_products?: string | null
          priority?: string | null
          priority_platforms?: string[] | null
          proof_assets?: string[] | null
          secondary_color?: string | null
          shopify_url?: string | null
          tone_casual_professional?: number | null
          tone_soft_aggressive?: number | null
          updated_at?: string
          user_id?: string
          winning_ad_definition?: string | null
        }
        Relationships: []
      }
      performance_snapshots: {
        Row: {
          clicks: number | null
          conversions: number | null
          created_at: string
          creative_id: string | null
          ctr: number | null
          id: string
          impressions: number | null
          revenue: number | null
          roas: number | null
          snapshot_hour: string
          spend: number | null
          user_id: string
          views: number | null
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          creative_id?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          revenue?: number | null
          roas?: number | null
          snapshot_hour: string
          spend?: number | null
          user_id: string
          views?: number | null
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          creative_id?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          revenue?: number | null
          roas?: number | null
          snapshot_hour?: string
          spend?: number | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_snapshots_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_connections: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          id: string
          last_sync_at: string | null
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token_encrypted: string | null
          status: string | null
          store_url: string | null
          sync_status: string | null
          token_expires_at: string | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token_encrypted?: string | null
          status?: string | null
          store_url?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          id?: string
          last_sync_at?: string | null
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token_encrypted?: string | null
          status?: string | null
          store_url?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          brand_name: string | null
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          ai_credits_used_this_month: number
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          monthly_ai_credits: number
          monthly_video_credits: number
          plan: string
          status: string
          stores_limit: number
          stores_used: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          videos_used_this_month: number
        }
        Insert: {
          ai_credits_used_this_month?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_ai_credits?: number
          monthly_video_credits?: number
          plan?: string
          status?: string
          stores_limit?: number
          stores_used?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
          videos_used_this_month?: number
        }
        Update: {
          ai_credits_used_this_month?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_ai_credits?: number
          monthly_video_credits?: number
          plan?: string
          status?: string
          stores_limit?: number
          stores_used?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
          videos_used_this_month?: number
        }
        Relationships: []
      }
      system_events: {
        Row: {
          created_at: string
          description: string | null
          event_category: string
          event_type: string
          id: string
          max_retries: number | null
          metadata: Json | null
          resolved: boolean | null
          retry_count: number | null
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_category: string
          event_type: string
          id?: string
          max_retries?: number | null
          metadata?: Json | null
          resolved?: boolean | null
          retry_count?: number | null
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_category?: string
          event_type?: string
          id?: string
          max_retries?: number | null
          metadata?: Json | null
          resolved?: boolean | null
          retry_count?: number | null
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_store_connections: {
        Row: {
          admin_access_token: string | null
          connected_at: string
          id: string
          is_active: boolean
          is_primary: boolean
          last_synced_at: string | null
          orders_count: number | null
          products_count: number | null
          store_domain: string
          store_name: string
          storefront_access_token: string
          total_revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_access_token?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          last_synced_at?: string | null
          orders_count?: number | null
          products_count?: number | null
          store_domain: string
          store_name: string
          storefront_access_token: string
          total_revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_access_token?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          last_synced_at?: string | null
          orders_count?: number | null
          products_count?: number | null
          store_domain?: string
          store_name?: string
          storefront_access_token?: string
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

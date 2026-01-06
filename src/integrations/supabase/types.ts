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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

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
      ab_test_digest_schedules: {
        Row: {
          created_at: string
          digest_type: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          next_scheduled_at: string | null
          scheduled_time: string
          settings_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_type: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          next_scheduled_at?: string | null
          scheduled_time: string
          settings_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          digest_type?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          next_scheduled_at?: string | null
          scheduled_time?: string
          settings_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_digest_schedules_settings_id_fkey"
            columns: ["settings_id"]
            isOneToOne: false
            referencedRelation: "ab_test_notification_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_notification_settings: {
        Row: {
          auto_send_email: boolean | null
          auto_winner_declaration: boolean | null
          created_at: string
          digest_enabled: boolean | null
          digest_frequency: string | null
          digest_time: string | null
          discord_enabled: boolean | null
          discord_webhook_url: string | null
          email_address: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          sample_milestones: boolean | null
          significance_threshold: number | null
          slack_enabled: boolean | null
          slack_webhook_url: string | null
          teams_enabled: boolean | null
          teams_webhook_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_send_email?: boolean | null
          auto_winner_declaration?: boolean | null
          created_at?: string
          digest_enabled?: boolean | null
          digest_frequency?: string | null
          digest_time?: string | null
          discord_enabled?: boolean | null
          discord_webhook_url?: string | null
          email_address?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          sample_milestones?: boolean | null
          significance_threshold?: number | null
          slack_enabled?: boolean | null
          slack_webhook_url?: string | null
          teams_enabled?: boolean | null
          teams_webhook_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_send_email?: boolean | null
          auto_winner_declaration?: boolean | null
          created_at?: string
          digest_enabled?: boolean | null
          digest_frequency?: string | null
          digest_time?: string | null
          discord_enabled?: boolean | null
          discord_webhook_url?: string | null
          email_address?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          sample_milestones?: boolean | null
          significance_threshold?: number | null
          slack_enabled?: boolean | null
          slack_webhook_url?: string | null
          teams_enabled?: boolean | null
          teams_webhook_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      abandoned_carts: {
        Row: {
          abandoned_at: string | null
          cart_total: number | null
          created_at: string | null
          customer_email: string | null
          customer_phone: string | null
          id: string
          items: Json | null
          recovered: boolean | null
          recovered_at: string | null
          recovery_channel: string | null
          recovery_revenue: number | null
          recovery_sent_at: string | null
          shopify_checkout_id: string | null
          user_id: string
        }
        Insert: {
          abandoned_at?: string | null
          cart_total?: number | null
          created_at?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json | null
          recovered?: boolean | null
          recovered_at?: string | null
          recovery_channel?: string | null
          recovery_revenue?: number | null
          recovery_sent_at?: string | null
          shopify_checkout_id?: string | null
          user_id: string
        }
        Update: {
          abandoned_at?: string | null
          cart_total?: number | null
          created_at?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json | null
          recovered?: boolean | null
          recovered_at?: string | null
          recovery_channel?: string | null
          recovery_revenue?: number | null
          recovery_sent_at?: string | null
          shopify_checkout_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_entitlements: {
        Row: {
          bypass_all_credit_checks: boolean
          bypass_all_feature_gates: boolean
          bypass_all_paywalls: boolean
          created_at: string
          features: Json
          id: string
          role: string
          unlimited_generation: boolean
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          bypass_all_credit_checks?: boolean
          bypass_all_feature_gates?: boolean
          bypass_all_paywalls?: boolean
          created_at?: string
          features?: Json
          id?: string
          role?: string
          unlimited_generation?: boolean
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          bypass_all_credit_checks?: boolean
          bypass_all_feature_gates?: boolean
          bypass_all_paywalls?: boolean
          created_at?: string
          features?: Json
          id?: string
          role?: string
          unlimited_generation?: boolean
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          aspect_ratio: string | null
          avatar_id: string | null
          clicks: number | null
          conversions: number | null
          created_at: string
          duration_seconds: number | null
          heygen_video_id: string | null
          id: string
          metadata: Json | null
          name: string
          product_image: string | null
          product_name: string
          provider: string | null
          revenue: number | null
          script: string
          shopify_product_id: string | null
          status: string | null
          test_mode: boolean | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          video_url: string | null
          views: number | null
          voice_id: string | null
          voiceover_url: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          avatar_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          duration_seconds?: number | null
          heygen_video_id?: string | null
          id?: string
          metadata?: Json | null
          name: string
          product_image?: string | null
          product_name: string
          provider?: string | null
          revenue?: number | null
          script: string
          shopify_product_id?: string | null
          status?: string | null
          test_mode?: boolean | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
          views?: number | null
          voice_id?: string | null
          voiceover_url?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          avatar_id?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          duration_seconds?: number | null
          heygen_video_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          product_image?: string | null
          product_name?: string
          provider?: string | null
          revenue?: number | null
          script?: string
          shopify_product_id?: string | null
          status?: string | null
          test_mode?: boolean | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          views?: number | null
          voice_id?: string | null
          voiceover_url?: string | null
        }
        Relationships: []
      }
      agent_debates: {
        Row: {
          completed_at: string | null
          consensus_output: Json | null
          consensus_reached: boolean | null
          created_at: string
          debate_topic: string
          debate_transcript: Json
          execution_status: string | null
          final_strategy: Json | null
          id: string
          impact_metrics: Json | null
          participants: Json
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          consensus_output?: Json | null
          consensus_reached?: boolean | null
          created_at?: string
          debate_topic: string
          debate_transcript?: Json
          execution_status?: string | null
          final_strategy?: Json | null
          id?: string
          impact_metrics?: Json | null
          participants?: Json
          user_id: string
        }
        Update: {
          completed_at?: string | null
          consensus_output?: Json | null
          consensus_reached?: boolean | null
          created_at?: string
          debate_topic?: string
          debate_transcript?: Json
          execution_status?: string | null
          final_strategy?: Json | null
          id?: string
          impact_metrics?: Json | null
          participants?: Json
          user_id?: string
        }
        Relationships: []
      }
      ai_decision_log: {
        Row: {
          action_taken: string
          confidence: number | null
          created_at: string
          decision_type: string
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          execution_status: string | null
          id: string
          impact_metrics: Json | null
          override_reason: string | null
          reasoning: string | null
          user_id: string
          was_overridden: boolean | null
        }
        Insert: {
          action_taken: string
          confidence?: number | null
          created_at?: string
          decision_type: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          execution_status?: string | null
          id?: string
          impact_metrics?: Json | null
          override_reason?: string | null
          reasoning?: string | null
          user_id: string
          was_overridden?: boolean | null
        }
        Update: {
          action_taken?: string
          confidence?: number | null
          created_at?: string
          decision_type?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          execution_status?: string | null
          id?: string
          impact_metrics?: Json | null
          override_reason?: string | null
          reasoning?: string | null
          user_id?: string
          was_overridden?: boolean | null
        }
        Relationships: []
      }
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
      ai_sales_conversations: {
        Row: {
          booking_id: string | null
          channel: string
          context: Json | null
          created_at: string
          deal_closed: boolean | null
          deal_value: number | null
          funnel_stage: string
          id: string
          intent_level: number | null
          last_message_at: string | null
          messages: Json | null
          next_action: string | null
          prospect_company: string | null
          prospect_email: string | null
          prospect_name: string | null
          prospect_phone: string | null
          qualification_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          channel?: string
          context?: Json | null
          created_at?: string
          deal_closed?: boolean | null
          deal_value?: number | null
          funnel_stage?: string
          id?: string
          intent_level?: number | null
          last_message_at?: string | null
          messages?: Json | null
          next_action?: string | null
          prospect_company?: string | null
          prospect_email?: string | null
          prospect_name?: string | null
          prospect_phone?: string | null
          qualification_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          channel?: string
          context?: Json | null
          created_at?: string
          deal_closed?: boolean | null
          deal_value?: number | null
          funnel_stage?: string
          id?: string
          intent_level?: number | null
          last_message_at?: string | null
          messages?: Json | null
          next_action?: string | null
          prospect_company?: string | null
          prospect_email?: string | null
          prospect_name?: string | null
          prospect_phone?: string | null
          qualification_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_sales_conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "demo_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_experiences: {
        Row: {
          ar_effect: string
          ar_project_id: string | null
          ar_provider: string | null
          ar_url: string | null
          conversion_rate: number | null
          created_at: string
          experience_name: string
          experience_type: string | null
          id: string
          preview_image_url: string | null
          product_id: string | null
          product_name: string | null
          qr_code_url: string | null
          revenue_attributed: number | null
          status: string | null
          total_conversions: number | null
          total_views: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ar_effect: string
          ar_project_id?: string | null
          ar_provider?: string | null
          ar_url?: string | null
          conversion_rate?: number | null
          created_at?: string
          experience_name: string
          experience_type?: string | null
          id?: string
          preview_image_url?: string | null
          product_id?: string | null
          product_name?: string | null
          qr_code_url?: string | null
          revenue_attributed?: number | null
          status?: string | null
          total_conversions?: number | null
          total_views?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ar_effect?: string
          ar_project_id?: string | null
          ar_provider?: string | null
          ar_url?: string | null
          conversion_rate?: number | null
          created_at?: string
          experience_name?: string
          experience_type?: string | null
          id?: string
          preview_image_url?: string | null
          product_id?: string | null
          product_name?: string | null
          qr_code_url?: string | null
          revenue_attributed?: number | null
          status?: string | null
          total_conversions?: number | null
          total_views?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_data: Json | null
          job_type: string
          max_retries: number | null
          output_data: Json | null
          priority: number | null
          retry_count: number | null
          scheduled_for: string | null
          started_at: string | null
          status: string
          target_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          job_type: string
          max_retries?: number | null
          output_data?: Json | null
          priority?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          target_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          job_type?: string
          max_retries?: number | null
          output_data?: Json | null
          priority?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          target_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          automation_id: string
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          organization_id: string
          payload: Json | null
          result: Json | null
          started_at: string | null
          status: string
          triggered_by: string | null
        }
        Insert: {
          automation_id: string
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          organization_id: string
          payload?: Json | null
          result?: Json | null
          started_at?: string | null
          status?: string
          triggered_by?: string | null
        }
        Update: {
          automation_id?: string
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          organization_id?: string
          payload?: Json | null
          result?: Json | null
          started_at?: string | null
          status?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "master_automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      autonomous_posting_rules: {
        Row: {
          channels: string[] | null
          content_template: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          performance_threshold: Json | null
          posting_schedule: Json | null
          posts_created: number | null
          revenue_generated: number | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channels?: string[] | null
          content_template?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          performance_threshold?: Json | null
          posting_schedule?: Json | null
          posts_created?: number | null
          revenue_generated?: number | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channels?: string[] | null
          content_template?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          performance_threshold?: Json | null
          posting_schedule?: Json | null
          posts_created?: number | null
          revenue_generated?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_alerts: {
        Row: {
          code: string
          created_at: string
          dedupe_key: string | null
          id: string
          message: string
          meta_json: Json | null
          project_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          dedupe_key?: string | null
          id?: string
          message: string
          meta_json?: Json | null
          project_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          dedupe_key?: string | null
          id?: string
          message?: string
          meta_json?: Json | null
          project_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      billing_customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          metadata: Json | null
          name: string | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_entitlements: {
        Row: {
          created_at: string
          entitlement_key: string
          expires_at: string | null
          granted_at: string
          id: string
          metadata: Json | null
          plan: string | null
          source: string | null
          source_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entitlement_key: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          metadata?: Json | null
          plan?: string | null
          source?: string | null
          source_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entitlement_key?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          metadata?: Json | null
          plan?: string | null
          source?: string | null
          source_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_metrics_daily: {
        Row: {
          active_subscriptions: number | null
          churned_subscriptions: number | null
          created_at: string
          date: string
          disputes: number | null
          env: string | null
          failed_payments: number | null
          id: string
          mrr_cents: number | null
          new_subscriptions: number | null
          project_id: string | null
          refunds_cents: number | null
          revenue_cents: number | null
          successful_payments: number | null
        }
        Insert: {
          active_subscriptions?: number | null
          churned_subscriptions?: number | null
          created_at?: string
          date: string
          disputes?: number | null
          env?: string | null
          failed_payments?: number | null
          id?: string
          mrr_cents?: number | null
          new_subscriptions?: number | null
          project_id?: string | null
          refunds_cents?: number | null
          revenue_cents?: number | null
          successful_payments?: number | null
        }
        Update: {
          active_subscriptions?: number | null
          churned_subscriptions?: number | null
          created_at?: string
          date?: string
          disputes?: number | null
          env?: string | null
          failed_payments?: number | null
          id?: string
          mrr_cents?: number | null
          new_subscriptions?: number | null
          project_id?: string | null
          refunds_cents?: number | null
          revenue_cents?: number | null
          successful_payments?: number | null
        }
        Relationships: []
      }
      billing_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          failure_code: string | null
          failure_message: string | null
          id: string
          livemode: boolean | null
          metadata: Json | null
          product_name: string | null
          receipt_url: string | null
          status: string
          stripe_charge_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          livemode?: boolean | null
          metadata?: Json | null
          product_name?: string | null
          receipt_url?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          livemode?: boolean | null
          metadata?: Json | null
          product_name?: string | null
          receipt_url?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blockchain_logs: {
        Row: {
          amount: number | null
          block_number: number | null
          chain: string | null
          confirmed: boolean | null
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          tx_hash: string | null
          tx_type: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          block_number?: number | null
          chain?: string | null
          confirmed?: boolean | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          tx_hash?: string | null
          tx_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          block_number?: number | null
          chain?: string | null
          confirmed?: boolean | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          tx_hash?: string | null
          tx_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      booking_reminders: {
        Row: {
          booking_id: string
          created_at: string
          delivery_channel: string
          delivery_status: string | null
          id: string
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          delivery_channel?: string
          delivery_status?: string | null
          id?: string
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          delivery_channel?: string
          delivery_status?: string | null
          id?: string
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_reminders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "demo_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_configs: {
        Row: {
          bot_id: string
          bot_name: string
          config: Json | null
          created_at: string
          description: string | null
          error_count: number | null
          id: string
          is_active: boolean | null
          last_active_at: string | null
          performance_score: number | null
          revenue_generated: number | null
          tasks_completed: number | null
          team: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_id: string
          bot_name: string
          config?: Json | null
          created_at?: string
          description?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          performance_score?: number | null
          revenue_generated?: number | null
          tasks_completed?: number | null
          team: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_id?: string
          bot_name?: string
          config?: Json | null
          created_at?: string
          description?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          performance_score?: number | null
          revenue_generated?: number | null
          tasks_completed?: number | null
          team?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bot_execution_queue: {
        Row: {
          bot_id: string
          bot_name: string
          command: string
          command_payload: Json | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          force_execute: boolean | null
          id: string
          max_retries: number | null
          priority: number | null
          queued_at: string | null
          result: Json | null
          retry_count: number | null
          revenue_impact: number | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          bot_id: string
          bot_name: string
          command: string
          command_payload?: Json | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          force_execute?: boolean | null
          id?: string
          max_retries?: number | null
          priority?: number | null
          queued_at?: string | null
          result?: Json | null
          retry_count?: number | null
          revenue_impact?: number | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          bot_id?: string
          bot_name?: string
          command?: string
          command_payload?: Json | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          force_execute?: boolean | null
          id?: string
          max_retries?: number | null
          priority?: number | null
          queued_at?: string | null
          result?: Json | null
          retry_count?: number | null
          revenue_impact?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bot_logs: {
        Row: {
          action: string
          action_type: string
          bot_id: string
          bot_name: string
          created_at: string
          id: string
          metadata: Json | null
          revenue_impact: number | null
          status: string
          team: string
          user_id: string
        }
        Insert: {
          action: string
          action_type: string
          bot_id: string
          bot_name: string
          created_at?: string
          id?: string
          metadata?: Json | null
          revenue_impact?: number | null
          status?: string
          team: string
          user_id: string
        }
        Update: {
          action?: string
          action_type?: string
          bot_id?: string
          bot_name?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          revenue_impact?: number | null
          status?: string
          team?: string
          user_id?: string
        }
        Relationships: []
      }
      bot_team_metrics: {
        Row: {
          active_bots: number | null
          created_at: string
          hourly_metrics: Json | null
          id: string
          metric_date: string
          success_rate: number | null
          tasks_completed: number | null
          team: string
          total_revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_bots?: number | null
          created_at?: string
          hourly_metrics?: Json | null
          id?: string
          metric_date?: string
          success_rate?: number | null
          tasks_completed?: number | null
          team: string
          total_revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_bots?: number | null
          created_at?: string
          hourly_metrics?: Json | null
          id?: string
          metric_date?: string
          success_rate?: number | null
          tasks_completed?: number | null
          team?: string
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brain_suggestions: {
        Row: {
          applied_at: string | null
          category: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          impact: string | null
          organization_id: string
          status: string
          title: string
        }
        Insert: {
          applied_at?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          impact?: string | null
          organization_id: string
          status?: string
          title: string
        }
        Update: {
          applied_at?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          impact?: string | null
          organization_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_suggestions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token_encrypted: string | null
          calendar_id: string | null
          created_at: string
          id: string
          is_primary: boolean
          last_sync_at: string | null
          provider: string
          provider_name: string
          refresh_token_encrypted: string | null
          settings: Json | null
          sync_enabled: boolean
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          calendar_id?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          last_sync_at?: string | null
          provider: string
          provider_name: string
          refresh_token_encrypted?: string | null
          settings?: Json | null
          sync_enabled?: boolean
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          calendar_id?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          last_sync_at?: string | null
          provider?: string
          provider_name?: string
          refresh_token_encrypted?: string | null
          settings?: Json | null
          sync_enabled?: boolean
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      cj_logs: {
        Row: {
          ad_video_url: string | null
          cj_price: number | null
          cj_product_id: string
          cj_product_image: string | null
          cj_product_name: string | null
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          posted_platforms: string[] | null
          shopify_handle: string | null
          shopify_product_id: string | null
          sync_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_video_url?: string | null
          cj_price?: number | null
          cj_product_id: string
          cj_product_image?: string | null
          cj_product_name?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          posted_platforms?: string[] | null
          shopify_handle?: string | null
          shopify_product_id?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_video_url?: string | null
          cj_price?: number | null
          cj_product_id?: string
          cj_product_image?: string | null
          cj_product_name?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          posted_platforms?: string[] | null
          shopify_handle?: string | null
          shopify_product_id?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cj_settings: {
        Row: {
          auto_ad_generation: boolean | null
          auto_post_enabled: boolean | null
          auto_sync_enabled: boolean | null
          created_at: string
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          preferred_channels: string[] | null
          products_loaded: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_ad_generation?: boolean | null
          auto_post_enabled?: boolean | null
          auto_sync_enabled?: boolean | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          preferred_channels?: string[] | null
          products_loaded?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_ad_generation?: boolean | null
          auto_post_enabled?: boolean | null
          auto_sync_enabled?: boolean | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          preferred_channels?: string[] | null
          products_loaded?: number | null
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
      comms_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comms_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "comms_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      comms_channel_members: {
        Row: {
          channel_id: string
          id: string
          is_muted: boolean | null
          joined_at: string
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comms_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "comms_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      comms_channels: {
        Row: {
          channel_type: string
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          is_archived: boolean | null
          is_private: boolean | null
          name: string
          organization_id: string
          pinned_message_id: string | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          channel_type?: string
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          is_private?: boolean | null
          name: string
          organization_id: string
          pinned_message_id?: string | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          channel_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          is_private?: boolean | null
          name?: string
          organization_id?: string
          pinned_message_id?: string | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comms_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      comms_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          is_pinned: boolean | null
          message_type: string
          metadata: Json | null
          parent_id: string | null
          thread_count: number | null
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          message_type?: string
          metadata?: Json | null
          parent_id?: string | null
          thread_count?: number | null
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          message_type?: string
          metadata?: Json | null
          parent_id?: string | null
          thread_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comms_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "comms_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comms_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comms_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      comms_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comms_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "comms_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      comms_typing: {
        Row: {
          channel_id: string
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comms_typing_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "comms_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      content_performance_webhooks: {
        Row: {
          clicks: number | null
          conversions: number | null
          creative_id: string | null
          event_type: string
          external_id: string
          id: string
          impressions: number | null
          platform: string
          processed: boolean | null
          raw_data: Json | null
          received_at: string | null
          revenue: number | null
          user_id: string
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          creative_id?: string | null
          event_type: string
          external_id: string
          id?: string
          impressions?: number | null
          platform: string
          processed?: boolean | null
          raw_data?: Json | null
          received_at?: string | null
          revenue?: number | null
          user_id: string
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          creative_id?: string | null
          event_type?: string
          external_id?: string
          id?: string
          impressions?: number | null
          platform?: string
          processed?: boolean | null
          raw_data?: Json | null
          received_at?: string | null
          revenue?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_performance_webhooks_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_metrics: {
        Row: {
          clicks: number | null
          conversions: number | null
          creative_id: string
          ctr: number | null
          id: string
          impressions: number | null
          observed_at: string
          platform: string
          revenue: number | null
          roas: number | null
          spend: number | null
          user_id: string
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          creative_id: string
          ctr?: number | null
          id?: string
          impressions?: number | null
          observed_at?: string
          platform: string
          revenue?: number | null
          roas?: number | null
          spend?: number | null
          user_id: string
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          creative_id?: string
          ctr?: number | null
          id?: string
          impressions?: number | null
          observed_at?: string
          platform?: string
          revenue?: number | null
          roas?: number | null
          spend?: number | null
          user_id?: string
        }
        Relationships: []
      }
      creatives: {
        Row: {
          adherence_score: number | null
          auto_regenerated: boolean | null
          avg_watch_percentage: number | null
          captions: Json | null
          clicks: number | null
          conversion_score: number | null
          conversions: number | null
          created_at: string
          ctr: number | null
          duration_seconds: number | null
          emotional_trigger: string | null
          engagement_score: number | null
          error: string | null
          generation_provider: string | null
          hook: string | null
          hook_score: number | null
          id: string
          impressions: number | null
          kill_reason: string | null
          killed_at: string | null
          name: string
          passed_quality_gate: boolean | null
          platform: string
          prompt_spec: Json | null
          published_at: string | null
          quality_score: number | null
          regeneration_count: number | null
          render_progress: number | null
          render_status: string | null
          revenue: number | null
          roas: number | null
          script: string | null
          shopify_product_id: string | null
          shot_list: Json | null
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
          adherence_score?: number | null
          auto_regenerated?: boolean | null
          avg_watch_percentage?: number | null
          captions?: Json | null
          clicks?: number | null
          conversion_score?: number | null
          conversions?: number | null
          created_at?: string
          ctr?: number | null
          duration_seconds?: number | null
          emotional_trigger?: string | null
          engagement_score?: number | null
          error?: string | null
          generation_provider?: string | null
          hook?: string | null
          hook_score?: number | null
          id?: string
          impressions?: number | null
          kill_reason?: string | null
          killed_at?: string | null
          name: string
          passed_quality_gate?: boolean | null
          platform?: string
          prompt_spec?: Json | null
          published_at?: string | null
          quality_score?: number | null
          regeneration_count?: number | null
          render_progress?: number | null
          render_status?: string | null
          revenue?: number | null
          roas?: number | null
          script?: string | null
          shopify_product_id?: string | null
          shot_list?: Json | null
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
          adherence_score?: number | null
          auto_regenerated?: boolean | null
          avg_watch_percentage?: number | null
          captions?: Json | null
          clicks?: number | null
          conversion_score?: number | null
          conversions?: number | null
          created_at?: string
          ctr?: number | null
          duration_seconds?: number | null
          emotional_trigger?: string | null
          engagement_score?: number | null
          error?: string | null
          generation_provider?: string | null
          hook?: string | null
          hook_score?: number | null
          id?: string
          impressions?: number | null
          kill_reason?: string | null
          killed_at?: string | null
          name?: string
          passed_quality_gate?: boolean | null
          platform?: string
          prompt_spec?: Json | null
          published_at?: string | null
          quality_score?: number | null
          regeneration_count?: number | null
          render_progress?: number | null
          render_status?: string | null
          revenue?: number | null
          roas?: number | null
          script?: string | null
          shopify_product_id?: string | null
          shot_list?: Json | null
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
      crm_contacts: {
        Row: {
          avatar_url: string | null
          churn_risk: number | null
          company: string | null
          created_at: string
          custom_fields: Json | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_interaction_at: string | null
          last_name: string | null
          last_order_at: string | null
          lead_score: number | null
          lifecycle_stage: string | null
          ltv: number | null
          notes: string | null
          phone: string | null
          shopify_customer_id: string | null
          social_profiles: Json | null
          source: string | null
          source_details: Json | null
          tags: string[] | null
          title: string | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          churn_risk?: number | null
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_interaction_at?: string | null
          last_name?: string | null
          last_order_at?: string | null
          lead_score?: number | null
          lifecycle_stage?: string | null
          ltv?: number | null
          notes?: string | null
          phone?: string | null
          shopify_customer_id?: string | null
          social_profiles?: Json | null
          source?: string | null
          source_details?: Json | null
          tags?: string[] | null
          title?: string | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          churn_risk?: number | null
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_interaction_at?: string | null
          last_name?: string | null
          last_order_at?: string | null
          lead_score?: number | null
          lifecycle_stage?: string | null
          ltv?: number | null
          notes?: string | null
          phone?: string | null
          shopify_customer_id?: string | null
          social_profiles?: Json | null
          source?: string | null
          source_details?: Json | null
          tags?: string[] | null
          title?: string | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_deals: {
        Row: {
          activities: Json | null
          actual_close_date: string | null
          amount: number | null
          assigned_to: string | null
          competitor: string | null
          contact_id: string | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          expected_close_date: string | null
          id: string
          is_active: boolean | null
          lost_reason: string | null
          next_action: string | null
          next_action_date: string | null
          priority: string | null
          probability: number | null
          source: string | null
          stage: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          won_reason: string | null
        }
        Insert: {
          activities?: Json | null
          actual_close_date?: string | null
          amount?: number | null
          assigned_to?: string | null
          competitor?: string | null
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          is_active?: boolean | null
          lost_reason?: string | null
          next_action?: string | null
          next_action_date?: string | null
          priority?: string | null
          probability?: number | null
          source?: string | null
          stage?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          won_reason?: string | null
        }
        Update: {
          activities?: Json | null
          actual_close_date?: string | null
          amount?: number | null
          assigned_to?: string | null
          competitor?: string | null
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          is_active?: boolean | null
          lost_reason?: string | null
          next_action?: string | null
          next_action_date?: string | null
          priority?: string | null
          probability?: number | null
          source?: string | null
          stage?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          won_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_demo_triggers: {
        Row: {
          auto_send: boolean | null
          conversions: number | null
          created_at: string
          deal_size_max: number | null
          deal_size_min: number | null
          demo_id: string
          demos_sent: number | null
          id: string
          industry_match: string[] | null
          sales_stage: string
          send_delay_minutes: number | null
          status: string
          trigger_name: string
          triggers_fired: number | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          auto_send?: boolean | null
          conversions?: number | null
          created_at?: string
          deal_size_max?: number | null
          deal_size_min?: number | null
          demo_id: string
          demos_sent?: number | null
          id?: string
          industry_match?: string[] | null
          sales_stage: string
          send_delay_minutes?: number | null
          status?: string
          trigger_name: string
          triggers_fired?: number | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          auto_send?: boolean | null
          conversions?: number | null
          created_at?: string
          deal_size_max?: number | null
          deal_size_min?: number | null
          demo_id?: string
          demos_sent?: number | null
          id?: string
          industry_match?: string[] | null
          sales_stage?: string
          send_delay_minutes?: number | null
          status?: string
          trigger_name?: string
          triggers_fired?: number | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_demo_triggers_demo_id_fkey"
            columns: ["demo_id"]
            isOneToOne: false
            referencedRelation: "demo_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          ai_next_action: string | null
          ai_summary: string | null
          channel: string | null
          contact_id: string | null
          content: string | null
          created_at: string
          deal_id: string | null
          direction: string | null
          id: string
          is_automated: boolean | null
          metadata: Json | null
          response_time_seconds: number | null
          sentiment: string | null
          subject: string | null
          type: string
          user_id: string
        }
        Insert: {
          ai_next_action?: string | null
          ai_summary?: string | null
          channel?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          deal_id?: string | null
          direction?: string | null
          id?: string
          is_automated?: boolean | null
          metadata?: Json | null
          response_time_seconds?: number | null
          sentiment?: string | null
          subject?: string | null
          type: string
          user_id: string
        }
        Update: {
          ai_next_action?: string | null
          ai_summary?: string | null
          channel?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          deal_id?: string | null
          direction?: string | null
          id?: string
          is_automated?: boolean | null
          metadata?: Json | null
          response_time_seconds?: number | null
          sentiment?: string | null
          subject?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          automation_trigger: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          is_automated: boolean | null
          priority: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          automation_trigger?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_automated?: boolean | null
          priority?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          automation_trigger?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_automated?: boolean | null
          priority?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_analytics: {
        Row: {
          avg_watch_time_seconds: number
          close_rate: number
          closed_deals: number
          completion_rate: number
          created_at: string
          demo_id: string
          drop_off_points: Json
          id: string
          revenue_attributed: number
          updated_at: string
          user_id: string
          view_sessions: Json
          views: number
        }
        Insert: {
          avg_watch_time_seconds?: number
          close_rate?: number
          closed_deals?: number
          completion_rate?: number
          created_at?: string
          demo_id: string
          drop_off_points?: Json
          id?: string
          revenue_attributed?: number
          updated_at?: string
          user_id: string
          view_sessions?: Json
          views?: number
        }
        Update: {
          avg_watch_time_seconds?: number
          close_rate?: number
          closed_deals?: number
          completion_rate?: number
          created_at?: string
          demo_id?: string
          drop_off_points?: Json
          id?: string
          revenue_attributed?: number
          updated_at?: string
          user_id?: string
          view_sessions?: Json
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "demo_analytics_demo_id_fkey"
            columns: ["demo_id"]
            isOneToOne: false
            referencedRelation: "demo_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_availability_slots: {
        Row: {
          buffer_minutes: number
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          slot_duration_minutes: number
          start_time: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          buffer_minutes?: number
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          slot_duration_minutes?: number
          start_time: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          buffer_minutes?: number
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          slot_duration_minutes?: number
          start_time?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_bookings: {
        Row: {
          attended_at: string | null
          booking_source: string | null
          conversation_context: Json | null
          created_at: string
          deal_size_estimate: number | null
          duration_minutes: number
          external_calendar_id: string | null
          external_calendar_provider: string | null
          id: string
          outcome: string | null
          outcome_notes: string | null
          pre_call_email_sent: boolean | null
          prospect_company: string | null
          prospect_email: string
          prospect_name: string
          prospect_phone: string | null
          qualification_notes: Json | null
          qualification_score: number | null
          reminder_sent_at: string | null
          revenue_closed: number | null
          scheduled_at: string
          status: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attended_at?: string | null
          booking_source?: string | null
          conversation_context?: Json | null
          created_at?: string
          deal_size_estimate?: number | null
          duration_minutes?: number
          external_calendar_id?: string | null
          external_calendar_provider?: string | null
          id?: string
          outcome?: string | null
          outcome_notes?: string | null
          pre_call_email_sent?: boolean | null
          prospect_company?: string | null
          prospect_email: string
          prospect_name: string
          prospect_phone?: string | null
          qualification_notes?: Json | null
          qualification_score?: number | null
          reminder_sent_at?: string | null
          revenue_closed?: number | null
          scheduled_at: string
          status?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attended_at?: string | null
          booking_source?: string | null
          conversation_context?: Json | null
          created_at?: string
          deal_size_estimate?: number | null
          duration_minutes?: number
          external_calendar_id?: string | null
          external_calendar_provider?: string | null
          id?: string
          outcome?: string | null
          outcome_notes?: string | null
          pre_call_email_sent?: boolean | null
          prospect_company?: string | null
          prospect_email?: string
          prospect_name?: string
          prospect_phone?: string | null
          qualification_notes?: Json | null
          qualification_score?: number | null
          reminder_sent_at?: string | null
          revenue_closed?: number | null
          scheduled_at?: string
          status?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_capability_performance: {
        Row: {
          avg_watch_time_when_shown: number
          capability_id: string
          close_correlation: number
          created_at: string
          engagement_score: number
          id: string
          times_shown: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_watch_time_when_shown?: number
          capability_id: string
          close_correlation?: number
          created_at?: string
          engagement_score?: number
          id?: string
          times_shown?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_watch_time_when_shown?: number
          capability_id?: string
          close_correlation?: number
          created_at?: string
          engagement_score?: number
          id?: string
          times_shown?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_deployments: {
        Row: {
          clicks: number | null
          conversions: number | null
          created_at: string
          demo_id: string
          deployment_config: Json
          deployment_name: string
          deployment_type: string
          embed_code: string | null
          id: string
          public_url: string | null
          revenue_attributed: number | null
          status: string
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          demo_id: string
          deployment_config?: Json
          deployment_name: string
          deployment_type: string
          embed_code?: string | null
          id?: string
          public_url?: string | null
          revenue_attributed?: number | null
          status?: string
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          demo_id?: string
          deployment_config?: Json
          deployment_name?: string
          deployment_type?: string
          embed_code?: string | null
          id?: string
          public_url?: string | null
          revenue_attributed?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_deployments_demo_id_fkey"
            columns: ["demo_id"]
            isOneToOne: false
            referencedRelation: "demo_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_optimizations: {
        Row: {
          applied: boolean
          applied_at: string | null
          created_at: string
          description: string
          id: string
          impact: string | null
          optimization_type: string
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          applied?: boolean
          applied_at?: string | null
          created_at?: string
          description: string
          id?: string
          impact?: string | null
          optimization_type: string
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          applied?: boolean
          applied_at?: string | null
          created_at?: string
          description?: string
          id?: string
          impact?: string | null
          optimization_type?: string
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_share_links: {
        Row: {
          conversions: number | null
          created_at: string
          demo_id: string
          expires_at: string | null
          id: string
          last_viewed_at: string | null
          recipient_email: string | null
          recipient_name: string | null
          revenue_attributed: number | null
          share_code: string
          total_watch_time_seconds: number | null
          unique_viewers: number | null
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          conversions?: number | null
          created_at?: string
          demo_id: string
          expires_at?: string | null
          id?: string
          last_viewed_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          revenue_attributed?: number | null
          share_code: string
          total_watch_time_seconds?: number | null
          unique_viewers?: number | null
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          conversions?: number | null
          created_at?: string
          demo_id?: string
          expires_at?: string | null
          id?: string
          last_viewed_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          revenue_attributed?: number | null
          share_code?: string
          total_watch_time_seconds?: number | null
          unique_viewers?: number | null
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_share_links_demo_id_fkey"
            columns: ["demo_id"]
            isOneToOne: false
            referencedRelation: "demo_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_share_views: {
        Row: {
          completion_percentage: number | null
          converted: boolean | null
          created_at: string
          id: string
          share_link_id: string
          viewer_fingerprint: string | null
          viewer_ip: string | null
          watch_time_seconds: number | null
        }
        Insert: {
          completion_percentage?: number | null
          converted?: boolean | null
          created_at?: string
          id?: string
          share_link_id: string
          viewer_fingerprint?: string | null
          viewer_ip?: string | null
          watch_time_seconds?: number | null
        }
        Update: {
          completion_percentage?: number | null
          converted?: boolean | null
          created_at?: string
          id?: string
          share_link_id?: string
          viewer_fingerprint?: string | null
          viewer_ip?: string | null
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_share_views_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "demo_share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_videos: {
        Row: {
          capabilities: string[]
          created_at: string
          deal_size: string
          duration_seconds: number | null
          frames_generated: number | null
          id: string
          industry: string
          length: string
          narration_url: string | null
          narrative: Json
          render_error: string | null
          render_progress: number | null
          sales_stage: string
          status: string
          thumbnail_url: string | null
          total_frames: number | null
          updated_at: string
          user_id: string
          variant: string
          video_url: string | null
        }
        Insert: {
          capabilities?: string[]
          created_at?: string
          deal_size: string
          duration_seconds?: number | null
          frames_generated?: number | null
          id?: string
          industry: string
          length: string
          narration_url?: string | null
          narrative?: Json
          render_error?: string | null
          render_progress?: number | null
          sales_stage: string
          status?: string
          thumbnail_url?: string | null
          total_frames?: number | null
          updated_at?: string
          user_id: string
          variant: string
          video_url?: string | null
        }
        Update: {
          capabilities?: string[]
          created_at?: string
          deal_size?: string
          duration_seconds?: number | null
          frames_generated?: number | null
          id?: string
          industry?: string
          length?: string
          narration_url?: string | null
          narrative?: Json
          render_error?: string | null
          render_progress?: number | null
          sales_stage?: string
          status?: string
          thumbnail_url?: string | null
          total_frames?: number | null
          updated_at?: string
          user_id?: string
          variant?: string
          video_url?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          ab_test_config: Json | null
          campaign_type: string | null
          click_rate: number | null
          conversion_rate: number | null
          created_at: string | null
          from_email: string | null
          from_name: string | null
          html_content: string
          id: string
          list_id: string | null
          name: string
          open_rate: number | null
          plain_text: string | null
          preview_text: string | null
          scheduled_at: string | null
          segment_rules: Json | null
          sent_at: string | null
          status: string | null
          subject: string
          total_bounces: number | null
          total_clicks: number | null
          total_delivered: number | null
          total_opens: number | null
          total_revenue: number | null
          total_sent: number | null
          total_unsubscribes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ab_test_config?: Json | null
          campaign_type?: string | null
          click_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content: string
          id?: string
          list_id?: string | null
          name: string
          open_rate?: number | null
          plain_text?: string | null
          preview_text?: string | null
          scheduled_at?: string | null
          segment_rules?: Json | null
          sent_at?: string | null
          status?: string | null
          subject: string
          total_bounces?: number | null
          total_clicks?: number | null
          total_delivered?: number | null
          total_opens?: number | null
          total_revenue?: number | null
          total_sent?: number | null
          total_unsubscribes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ab_test_config?: Json | null
          campaign_type?: string | null
          click_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content?: string
          id?: string
          list_id?: string | null
          name?: string
          open_rate?: number | null
          plain_text?: string | null
          preview_text?: string | null
          scheduled_at?: string | null
          segment_rules?: Json | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          total_bounces?: number | null
          total_clicks?: number | null
          total_delivered?: number | null
          total_opens?: number | null
          total_revenue?: number | null
          total_sent?: number | null
          total_unsubscribes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      email_leads: {
        Row: {
          created_at: string
          email: string
          email_sent: boolean
          id: string
          industry: string | null
          metadata: Json | null
          source: string
          store_name: string | null
          subscribed_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_sent?: boolean
          id?: string
          industry?: string | null
          metadata?: Json | null
          source?: string
          store_name?: string | null
          subscribed_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_sent?: boolean
          id?: string
          industry?: string | null
          metadata?: Json | null
          source?: string
          store_name?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      email_list_members: {
        Row: {
          added_at: string | null
          id: string
          list_id: string | null
          subscriber_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          list_id?: string | null
          subscriber_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          list_id?: string | null
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_list_members_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "email_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          segment_rules: Json | null
          subscriber_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          segment_rules?: Json | null
          subscriber_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          segment_rules?: Json | null
          subscriber_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          delivered_at: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          resend_id: string | null
          revenue_attributed: number | null
          sent_at: string | null
          sequence_id: string | null
          status: string | null
          subject: string
          subscriber_id: string | null
          to_email: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          resend_id?: string | null
          revenue_attributed?: number | null
          sent_at?: string | null
          sequence_id?: string | null
          status?: string | null
          subject: string
          subscriber_id?: string | null
          to_email: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          delivered_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          resend_id?: string | null
          revenue_attributed?: number | null
          sent_at?: string | null
          sequence_id?: string | null
          status?: string | null
          subject?: string
          subscriber_id?: string | null
          to_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_send_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_send_log_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_send_log_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "email_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          enrolled_at: string | null
          id: string
          next_email_at: string | null
          revenue_attributed: number | null
          sequence_id: string | null
          status: string | null
          subscriber_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          next_email_at?: string | null
          revenue_attributed?: number | null
          sequence_id?: string | null
          status?: string | null
          subscriber_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          next_email_at?: string | null
          revenue_attributed?: number | null
          sequence_id?: string | null
          status?: string | null
          subscriber_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_enrollments_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "email_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          created_at: string
          description: string | null
          emails: Json
          id: string
          name: string
          revenue_attributed: number | null
          status: string
          total_clicks: number | null
          total_conversions: number | null
          total_opens: number | null
          total_sent: number | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          emails?: Json
          id?: string
          name: string
          revenue_attributed?: number | null
          status?: string
          total_clicks?: number | null
          total_conversions?: number | null
          total_opens?: number | null
          total_sent?: number | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          emails?: Json
          id?: string
          name?: string
          revenue_attributed?: number | null
          status?: string
          total_clicks?: number | null
          total_conversions?: number | null
          total_opens?: number | null
          total_sent?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          created_at: string | null
          custom_fields: Json | null
          email: string
          engagement_score: number | null
          first_name: string | null
          id: string
          last_email_at: string | null
          last_name: string | null
          phone: string | null
          source: string | null
          status: string | null
          subscribed_at: string | null
          tags: string[] | null
          total_clicks: number | null
          total_emails_sent: number | null
          total_opens: number | null
          total_revenue: number | null
          unsubscribed_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_fields?: Json | null
          email: string
          engagement_score?: number | null
          first_name?: string | null
          id?: string
          last_email_at?: string | null
          last_name?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
          total_clicks?: number | null
          total_emails_sent?: number | null
          total_opens?: number | null
          total_revenue?: number | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_fields?: Json | null
          email?: string
          engagement_score?: number | null
          first_name?: string | null
          id?: string
          last_email_at?: string | null
          last_name?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
          total_clicks?: number | null
          total_emails_sent?: number | null
          total_opens?: number | null
          total_revenue?: number | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          analytics: Json | null
          config: Json | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          organization_id: string
          project_id: string | null
          published_url: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          analytics?: Json | null
          config?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          organization_id: string
          project_id?: string | null
          published_url?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          analytics?: Json | null
          config?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          organization_id?: string
          project_id?: string | null
          published_url?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      geekbot_reports: {
        Row: {
          created_at: string
          geekbot_report_id: string | null
          has_blockers: boolean | null
          id: string
          member_id: string | null
          member_name: string
          questions: Json
          standup_id: string | null
          standup_name: string
          synced_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          geekbot_report_id?: string | null
          has_blockers?: boolean | null
          id?: string
          member_id?: string | null
          member_name: string
          questions?: Json
          standup_id?: string | null
          standup_name: string
          synced_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          geekbot_report_id?: string | null
          has_blockers?: boolean | null
          id?: string
          member_id?: string | null
          member_name?: string
          questions?: Json
          standup_id?: string | null
          standup_name?: string
          synced_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grok_ceo_logs: {
        Row: {
          actions_taken: Json | null
          created_at: string
          execution_status: string | null
          grok_response: Json | null
          id: string
          profit_projection: number | null
          query: string
          strategy_json: Json | null
          user_id: string
        }
        Insert: {
          actions_taken?: Json | null
          created_at?: string
          execution_status?: string | null
          grok_response?: Json | null
          id?: string
          profit_projection?: number | null
          query: string
          strategy_json?: Json | null
          user_id: string
        }
        Update: {
          actions_taken?: Json | null
          created_at?: string
          execution_status?: string | null
          grok_response?: Json | null
          id?: string
          profit_projection?: number | null
          query?: string
          strategy_json?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      grok_query_history: {
        Row: {
          created_at: string
          id: string
          mode: string | null
          model: string | null
          prompt: string
          response: string | null
          tokens_used: number | null
          tool_calls: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string | null
          model?: string | null
          prompt: string
          response?: string | null
          tokens_used?: number | null
          tool_calls?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string | null
          model?: string | null
          prompt?: string
          response?: string | null
          tokens_used?: number | null
          tool_calls?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      integration_tokens: {
        Row: {
          access_token_encrypted: string | null
          api_key_encrypted: string | null
          connection_type: string
          created_at: string
          error_message: string | null
          id: string
          integration_category: string
          integration_name: string
          is_connected: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          refresh_token_encrypted: string | null
          scopes: string[] | null
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          api_key_encrypted?: string | null
          connection_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          integration_category: string
          integration_name: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          api_key_encrypted?: string | null
          connection_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          integration_category?: string
          integration_name?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      language_violations: {
        Row: {
          content: string
          context: string | null
          created_at: string
          flagged_word: string | null
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          user_id: string
          violation_type: string
        }
        Insert: {
          content: string
          context?: string | null
          created_at?: string
          flagged_word?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id: string
          violation_type: string
        }
        Update: {
          content?: string
          context?: string | null
          created_at?: string
          flagged_word?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string
          violation_type?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          company: string | null
          converted_at: string | null
          created_at: string
          email: string
          id: string
          metadata: Json | null
          name: string | null
          organization_id: string | null
          score: number | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          converted_at?: string | null
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          name?: string | null
          organization_id?: string | null
          score?: number | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          converted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          name?: string | null
          organization_id?: string | null
          score?: number | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      master_automations: {
        Row: {
          config: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          endpoint_url: string | null
          external_id: string | null
          id: string
          last_run_at: string | null
          last_run_status: string | null
          name: string
          organization_id: string
          project_id: string | null
          run_count: number | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          endpoint_url?: string | null
          external_id?: string | null
          id?: string
          last_run_at?: string | null
          last_run_status?: string | null
          name: string
          organization_id: string
          project_id?: string | null
          run_count?: number | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          endpoint_url?: string | null
          external_id?: string | null
          id?: string
          last_run_at?: string | null
          last_run_status?: string | null
          name?: string
          organization_id?: string
          project_id?: string | null
          run_count?: number | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_automations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_automations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      master_events: {
        Row: {
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      metaverse_deployments: {
        Row: {
          config: Json | null
          created_at: string
          deployment_type: string
          id: string
          interactions_count: number | null
          location: Json | null
          platform: string
          revenue_generated: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          deployment_type: string
          id?: string
          interactions_count?: number | null
          location?: Json | null
          platform: string
          revenue_generated?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          deployment_type?: string
          id?: string
          interactions_count?: number | null
          location?: Json | null
          platform?: string
          revenue_generated?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nft_mints: {
        Row: {
          ai_prompt: string | null
          blockchain: string | null
          contract_address: string | null
          created_at: string
          customer_email: string | null
          id: string
          image_url: string | null
          listed_at: string | null
          marketplace_url: string | null
          metadata_url: string | null
          mint_price: number | null
          mint_status: string | null
          minted_at: string | null
          nft_description: string | null
          nft_name: string
          nft_type: string | null
          order_id: string | null
          product_id: string | null
          product_name: string | null
          royalty_percentage: number | null
          sale_price: number | null
          sold_at: string | null
          token_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_prompt?: string | null
          blockchain?: string | null
          contract_address?: string | null
          created_at?: string
          customer_email?: string | null
          id?: string
          image_url?: string | null
          listed_at?: string | null
          marketplace_url?: string | null
          metadata_url?: string | null
          mint_price?: number | null
          mint_status?: string | null
          minted_at?: string | null
          nft_description?: string | null
          nft_name: string
          nft_type?: string | null
          order_id?: string | null
          product_id?: string | null
          product_name?: string | null
          royalty_percentage?: number | null
          sale_price?: number | null
          sold_at?: string | null
          token_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_prompt?: string | null
          blockchain?: string | null
          contract_address?: string | null
          created_at?: string
          customer_email?: string | null
          id?: string
          image_url?: string | null
          listed_at?: string | null
          marketplace_url?: string | null
          metadata_url?: string | null
          mint_price?: number | null
          mint_status?: string | null
          minted_at?: string | null
          nft_description?: string | null
          nft_name?: string
          nft_type?: string | null
          order_id?: string | null
          product_id?: string | null
          product_name?: string | null
          royalty_percentage?: number | null
          sale_price?: number | null
          sold_at?: string | null
          token_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_delivery_log: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          id: string
          latency_ms: number | null
          notification_id: string | null
          provider: string | null
          provider_response: Json | null
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          notification_id?: string | null
          provider?: string | null
          provider_response?: Json | null
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          notification_id?: string | null
          provider?: string | null
          provider_response?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          batch_low_priority: boolean
          category_overrides: Json | null
          created_at: string
          critical_always_push: boolean
          digest_enabled: boolean
          digest_frequency: string | null
          digest_time: string | null
          discord_enabled: boolean
          email_enabled: boolean
          id: string
          in_app_enabled: boolean
          push_enabled: boolean
          quiet_hours_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_low_priority?: boolean
          category_overrides?: Json | null
          created_at?: string
          critical_always_push?: boolean
          digest_enabled?: boolean
          digest_frequency?: string | null
          digest_time?: string | null
          discord_enabled?: boolean
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          push_enabled?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_low_priority?: boolean
          category_overrides?: Json | null
          created_at?: string
          critical_always_push?: boolean
          digest_enabled?: boolean
          digest_frequency?: string | null
          digest_time?: string | null
          discord_enabled?: boolean
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          push_enabled?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          body: string
          category: string
          channel: string
          created_at: string
          dedup_key: string | null
          delivered_at: string | null
          delivery_status: Json | null
          dismissed_at: string | null
          expires_at: string | null
          group_key: string | null
          icon: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          organization_id: string | null
          priority: string
          read_at: string | null
          source_id: string | null
          source_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          body: string
          category?: string
          channel?: string
          created_at?: string
          dedup_key?: string | null
          delivered_at?: string | null
          delivery_status?: Json | null
          dismissed_at?: string | null
          expires_at?: string | null
          group_key?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string
          read_at?: string | null
          source_id?: string | null
          source_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          body?: string
          category?: string
          channel?: string
          created_at?: string
          dedup_key?: string | null
          delivered_at?: string | null
          delivery_status?: Json | null
          dismissed_at?: string | null
          expires_at?: string | null
          group_key?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string
          read_at?: string | null
          source_id?: string | null
          source_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_states: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          platform: string
          redirect_uri: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          platform: string
          redirect_uri: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          platform?: string
          redirect_uri?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      omega_ceo_agents: {
        Row: {
          agent_type: string
          created_at: string
          id: string
          last_run: string | null
          logs: string | null
          metadata: Json | null
          query: string | null
          status: string
          strategy: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type?: string
          created_at?: string
          id?: string
          last_run?: string | null
          logs?: string | null
          metadata?: Json | null
          query?: string | null
          status?: string
          strategy?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: string
          created_at?: string
          id?: string
          last_run?: string | null
          logs?: string | null
          metadata?: Json | null
          query?: string | null
          status?: string
          strategy?: Json | null
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
      organization_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_colors: Json | null
          created_at: string
          custom_domain: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          plan: string
          settings: Json | null
          slug: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          brand_colors?: Json | null
          created_at?: string
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id: string
          plan?: string
          settings?: Json | null
          slug?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          brand_colors?: Json | null
          created_at?: string
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan?: string
          settings?: Json | null
          slug?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
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
      platform_accounts: {
        Row: {
          created_at: string
          credentials_encrypted: Json | null
          handle: string | null
          health_status: string | null
          id: string
          is_connected: boolean | null
          last_health_check: string | null
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credentials_encrypted?: Json | null
          handle?: string | null
          health_status?: string | null
          id?: string
          is_connected?: boolean | null
          last_health_check?: string | null
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credentials_encrypted?: Json | null
          handle?: string | null
          health_status?: string | null
          id?: string
          is_connected?: boolean | null
          last_health_check?: string | null
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      platform_posts: {
        Row: {
          ad_id: string | null
          caption: string | null
          comments: number | null
          created_at: string
          hashtags: string[] | null
          id: string
          likes: number | null
          platform: string
          platform_post_id: string | null
          post_url: string | null
          posted_at: string | null
          revenue_attributed: number | null
          shares: number | null
          status: string | null
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          ad_id?: string | null
          caption?: string | null
          comments?: number | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          likes?: number | null
          platform: string
          platform_post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          revenue_attributed?: number | null
          shares?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          ad_id?: string | null
          caption?: string | null
          comments?: number | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          likes?: number | null
          platform?: string
          platform_post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          revenue_attributed?: number | null
          shares?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_posts_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      power_user_applications: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          brand_name: string
          contact_email: string
          contact_name: string
          created_at: string
          current_ad_spend: string
          growth_bottleneck: string
          id: string
          is_decision_maker: boolean
          monthly_revenue: string
          status: string
          updated_at: string
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand_name: string
          contact_email: string
          contact_name: string
          created_at?: string
          current_ad_spend: string
          growth_bottleneck: string
          id?: string
          is_decision_maker?: boolean
          monthly_revenue: string
          status?: string
          updated_at?: string
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand_name?: string
          contact_email?: string
          contact_name?: string
          created_at?: string
          current_ad_spend?: string
          growth_bottleneck?: string
          id?: string
          is_decision_maker?: boolean
          monthly_revenue?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_automations: {
        Row: {
          automation_mode: string
          clicks: number
          conversion_rate: number | null
          conversions: number
          created_at: string
          ctr: number | null
          id: string
          impressions: number
          last_action: string | null
          last_action_at: string | null
          next_action: string | null
          product_id: string | null
          quality_score: number | null
          revenue: number
          roas: number | null
          shopify_product_id: string
          spend: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          automation_mode?: string
          clicks?: number
          conversion_rate?: number | null
          conversions?: number
          created_at?: string
          ctr?: number | null
          id?: string
          impressions?: number
          last_action?: string | null
          last_action_at?: string | null
          next_action?: string | null
          product_id?: string | null
          quality_score?: number | null
          revenue?: number
          roas?: number | null
          shopify_product_id: string
          spend?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          automation_mode?: string
          clicks?: number
          conversion_rate?: number | null
          conversions?: number
          created_at?: string
          ctr?: number | null
          id?: string
          impressions?: number
          last_action?: string | null
          last_action_at?: string | null
          next_action?: string | null
          product_id?: string | null
          quality_score?: number | null
          revenue?: number
          roas?: number | null
          shopify_product_id?: string
          spend?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_automations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopify_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_bundles: {
        Row: {
          bundle_price: number | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          name: string
          original_price: number | null
          products: Json
          revenue: number | null
          sales_count: number | null
          shopify_variant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bundle_price?: number | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          original_price?: number | null
          products?: Json
          revenue?: number | null
          sales_count?: number | null
          shopify_variant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bundle_price?: number | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          original_price?: number | null
          products?: Json
          revenue?: number | null
          sales_count?: number | null
          shopify_variant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_sourcing: {
        Row: {
          auto_reorder: boolean | null
          cost_price: number
          created_at: string | null
          id: string
          last_price_check: string | null
          meets_60pct_margin: boolean | null
          product_name: string
          profit_margin: number | null
          selling_price: number
          shipping_cost: number
          shopify_product_id: string | null
          sourcing_status: string | null
          stock_status: string | null
          supplier_id: string | null
          supplier_name: string
          supplier_product_id: string | null
          supplier_sku: string | null
          total_cost: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_reorder?: boolean | null
          cost_price?: number
          created_at?: string | null
          id?: string
          last_price_check?: string | null
          meets_60pct_margin?: boolean | null
          product_name: string
          profit_margin?: number | null
          selling_price?: number
          shipping_cost?: number
          shopify_product_id?: string | null
          sourcing_status?: string | null
          stock_status?: string | null
          supplier_id?: string | null
          supplier_name: string
          supplier_product_id?: string | null
          supplier_sku?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_reorder?: boolean | null
          cost_price?: number
          created_at?: string | null
          id?: string
          last_price_check?: string | null
          meets_60pct_margin?: boolean | null
          product_name?: string
          profit_margin?: number | null
          selling_price?: number
          shipping_cost?: number
          shopify_product_id?: string | null
          sourcing_status?: string | null
          stock_status?: string | null
          supplier_id?: string | null
          supplier_name?: string
          supplier_product_id?: string | null
          supplier_sku?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sourcing_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_connections"
            referencedColumns: ["id"]
          },
        ]
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
      profit_simulations: {
        Row: {
          completed_at: string | null
          confidence_level: number | null
          created_at: string
          id: string
          input_params: Json | null
          iterations: number | null
          market_research: Json | null
          results: Json | null
          simulated_profit: number | null
          simulation_type: string
          status: string | null
          target_profit: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          input_params?: Json | null
          iterations?: number | null
          market_research?: Json | null
          results?: Json | null
          simulated_profit?: number | null
          simulation_type?: string
          status?: string | null
          target_profit?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          confidence_level?: number | null
          created_at?: string
          id?: string
          input_params?: Json | null
          iterations?: number | null
          market_research?: Json | null
          results?: Json | null
          simulated_profit?: number | null
          simulation_type?: string
          status?: string | null
          target_profit?: number | null
          user_id?: string
        }
        Relationships: []
      }
      project_stripe_bindings: {
        Row: {
          created_at: string
          env: string
          id: string
          last_validated_at: string | null
          project_id: string
          reported_platform_account_id: string
          status: string
          updated_at: string
          validation_results: Json | null
        }
        Insert: {
          created_at?: string
          env: string
          id?: string
          last_validated_at?: string | null
          project_id: string
          reported_platform_account_id: string
          status?: string
          updated_at?: string
          validation_results?: Json | null
        }
        Update: {
          created_at?: string
          env?: string
          id?: string
          last_validated_at?: string | null
          project_id?: string
          reported_platform_account_id?: string
          status?: string
          updated_at?: string
          validation_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "project_stripe_bindings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "spine_projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          settings: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          settings?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          settings?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_assets: {
        Row: {
          approved_for: string[] | null
          asset_type: string
          brand_name: string | null
          created_at: string
          description: string | null
          id: string
          is_anonymized: boolean | null
          is_approved: boolean | null
          metric_unit: string | null
          metric_value: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_for?: string[] | null
          asset_type: string
          brand_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_anonymized?: boolean | null
          is_approved?: boolean | null
          metric_unit?: string | null
          metric_value?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_for?: string[] | null
          asset_type?: string
          brand_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_anonymized?: boolean | null
          is_approved?: boolean | null
          metric_unit?: string | null
          metric_value?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      publish_jobs: {
        Row: {
          created_at: string
          creative_id: string
          error: string | null
          external_post_id: string | null
          id: string
          platform: string
          status: string
          updated_at: string
          upload_pack_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          creative_id: string
          error?: string | null
          external_post_id?: string | null
          id?: string
          platform: string
          status?: string
          updated_at?: string
          upload_pack_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          creative_id?: string
          error?: string | null
          external_post_id?: string | null
          id?: string
          platform?: string
          status?: string
          updated_at?: string
          upload_pack_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          device_name: string | null
          endpoint: string
          failed_count: number | null
          id: string
          is_active: boolean
          last_used_at: string | null
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          device_name?: string | null
          endpoint: string
          failed_count?: number | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          device_name?: string | null
          endpoint?: string
          failed_count?: number | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quality_gate_decisions: {
        Row: {
          applied_at: string | null
          auto_applied: boolean | null
          created_at: string
          creative_id: string | null
          decision: string
          decision_reason: string | null
          id: string
          metrics_snapshot: Json | null
          score: number
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          auto_applied?: boolean | null
          created_at?: string
          creative_id?: string | null
          decision: string
          decision_reason?: string | null
          id?: string
          metrics_snapshot?: Json | null
          score: number
          user_id: string
        }
        Update: {
          applied_at?: string | null
          auto_applied?: boolean | null
          created_at?: string
          creative_id?: string | null
          decision?: string
          decision_reason?: string | null
          id?: string
          metrics_snapshot?: Json | null
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_gate_decisions_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string
          referred_user_id: string | null
          referrer_user_id: string
          reward_amount: number | null
          reward_type: string | null
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email: string
          referred_user_id?: string | null
          referrer_user_id: string
          reward_amount?: number | null
          reward_type?: string | null
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_user_id?: string
          reward_amount?: number | null
          reward_type?: string | null
          status?: string
        }
        Relationships: []
      }
      revenue_engine_config: {
        Row: {
          approved_phrases: string[] | null
          buying_cycle: string | null
          connected_integrations: string[] | null
          core_capabilities: Json | null
          created_at: string
          customer_id: string | null
          deal_size: string | null
          decision_makers: string[] | null
          forbidden_words: string[] | null
          id: string
          industry: string | null
          industry_config: Json | null
          is_active: boolean | null
          is_configured: boolean | null
          is_founder_instance: boolean | null
          is_self_marketing_active: boolean | null
          kpi_benchmarks: Json | null
          language_tone: string | null
          objections: string[] | null
          offer_type: string | null
          orchestrated_tools: string[] | null
          primary_kpis: string[] | null
          sales_motion: string | null
          secondary_kpis: string[] | null
          self_as_client: boolean | null
          tenant_mode: string | null
          triggers: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_phrases?: string[] | null
          buying_cycle?: string | null
          connected_integrations?: string[] | null
          core_capabilities?: Json | null
          created_at?: string
          customer_id?: string | null
          deal_size?: string | null
          decision_makers?: string[] | null
          forbidden_words?: string[] | null
          id?: string
          industry?: string | null
          industry_config?: Json | null
          is_active?: boolean | null
          is_configured?: boolean | null
          is_founder_instance?: boolean | null
          is_self_marketing_active?: boolean | null
          kpi_benchmarks?: Json | null
          language_tone?: string | null
          objections?: string[] | null
          offer_type?: string | null
          orchestrated_tools?: string[] | null
          primary_kpis?: string[] | null
          sales_motion?: string | null
          secondary_kpis?: string[] | null
          self_as_client?: boolean | null
          tenant_mode?: string | null
          triggers?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_phrases?: string[] | null
          buying_cycle?: string | null
          connected_integrations?: string[] | null
          core_capabilities?: Json | null
          created_at?: string
          customer_id?: string | null
          deal_size?: string | null
          decision_makers?: string[] | null
          forbidden_words?: string[] | null
          id?: string
          industry?: string | null
          industry_config?: Json | null
          is_active?: boolean | null
          is_configured?: boolean | null
          is_founder_instance?: boolean | null
          is_self_marketing_active?: boolean | null
          kpi_benchmarks?: Json | null
          language_tone?: string | null
          objections?: string[] | null
          offer_type?: string | null
          orchestrated_tools?: string[] | null
          primary_kpis?: string[] | null
          sales_motion?: string | null
          secondary_kpis?: string[] | null
          self_as_client?: boolean | null
          tenant_mode?: string | null
          triggers?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_events: {
        Row: {
          amount: number | null
          campaign_id: string | null
          created_at: string
          creative_id: string | null
          event_type: string
          id: string
          metadata: Json | null
          platform: string | null
          product_id: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          campaign_id?: string | null
          created_at?: string
          creative_id?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          product_id?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          campaign_id?: string | null
          created_at?: string
          creative_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          product_id?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_events_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopify_products"
            referencedColumns: ["id"]
          },
        ]
      }
      robot_deployments: {
        Row: {
          created_at: string
          id: string
          location: string | null
          revenue_attributed: number | null
          robot_type: string
          status: string | null
          task_type: string | null
          tasks_completed: number | null
          telemetry: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          revenue_attributed?: number | null
          robot_type: string
          status?: string | null
          task_type?: string | null
          tasks_completed?: number | null
          telemetry?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          revenue_attributed?: number | null
          robot_type?: string
          status?: string | null
          task_type?: string | null
          tasks_completed?: number | null
          telemetry?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rollout_status: {
        Row: {
          completed_at: string | null
          conditions_met: Json | null
          created_at: string
          id: string
          notes: string | null
          phase: number
          phase_name: string
          started_at: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          conditions_met?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          phase?: number
          phase_name: string
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          conditions_met?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          phase?: number
          phase_name?: string
          started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sales_page_embeds: {
        Row: {
          conversions: number | null
          created_at: string
          demo_id: string
          embed_code: string
          embed_config: Json | null
          embed_type: string
          engagement_time_seconds: number | null
          id: string
          page_name: string
          page_url: string | null
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          conversions?: number | null
          created_at?: string
          demo_id: string
          embed_code: string
          embed_config?: Json | null
          embed_type: string
          engagement_time_seconds?: number | null
          id?: string
          page_name: string
          page_url?: string | null
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          conversions?: number | null
          created_at?: string
          demo_id?: string
          embed_code?: string
          embed_config?: Json | null
          embed_type?: string
          engagement_time_seconds?: number | null
          id?: string
          page_name?: string
          page_url?: string | null
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_page_embeds_demo_id_fkey"
            columns: ["demo_id"]
            isOneToOne: false
            referencedRelation: "demo_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_team_agents: {
        Row: {
          agent_name: string
          agent_role: string
          agent_type: string
          configuration: Json | null
          created_at: string
          current_task: string | null
          debate_logs: Json | null
          id: string
          last_activity_at: string | null
          parent_agent_id: string | null
          performance_metrics: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_name: string
          agent_role?: string
          agent_type: string
          configuration?: Json | null
          created_at?: string
          current_task?: string | null
          debate_logs?: Json | null
          id?: string
          last_activity_at?: string | null
          parent_agent_id?: string | null
          performance_metrics?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_name?: string
          agent_role?: string
          agent_type?: string
          configuration?: Json | null
          created_at?: string
          current_task?: string | null
          debate_logs?: Json | null
          id?: string
          last_activity_at?: string | null
          parent_agent_id?: string | null
          performance_metrics?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_team_agents_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "sales_team_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      security_headers_config: {
        Row: {
          content_type_nosniff: boolean | null
          created_at: string | null
          csp_enabled: boolean | null
          frame_ancestors: string | null
          id: string
          referrer_policy: string | null
          updated_at: string | null
          user_id: string
          xss_protection: boolean | null
        }
        Insert: {
          content_type_nosniff?: boolean | null
          created_at?: string | null
          csp_enabled?: boolean | null
          frame_ancestors?: string | null
          id?: string
          referrer_policy?: string | null
          updated_at?: string | null
          user_id: string
          xss_protection?: boolean | null
        }
        Update: {
          content_type_nosniff?: boolean | null
          created_at?: string | null
          csp_enabled?: boolean | null
          frame_ancestors?: string | null
          id?: string
          referrer_policy?: string | null
          updated_at?: string | null
          user_id?: string
          xss_protection?: boolean | null
        }
        Relationships: []
      }
      security_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_suspicious: boolean | null
          last_active_at: string | null
          session_token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_suspicious?: boolean | null
          last_active_at?: string | null
          session_token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_suspicious?: boolean | null
          last_active_at?: string | null
          session_token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      self_heal_logs: {
        Row: {
          created_at: string | null
          error_message: string
          error_type: string
          fix_action: string
          fix_result: string | null
          id: string
          metadata: Json | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message: string
          error_type: string
          fix_action: string
          fix_result?: string | null
          id?: string
          metadata?: Json | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string
          error_type?: string
          fix_action?: string
          fix_result?: string | null
          id?: string
          metadata?: Json | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      shopify_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          performed_by: string | null
          shop_domain: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          performed_by?: string | null
          shop_domain?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          performed_by?: string | null
          shop_domain?: string | null
        }
        Relationships: []
      }
      shopify_config: {
        Row: {
          archived_credentials: Json | null
          confusion_state_detected: boolean | null
          created_at: string | null
          id: string
          last_reset_at: string | null
          last_reset_by: string | null
          multi_shop_mode: boolean | null
          primary_shop_domain: string
          primary_shop_id: string | null
          project_slug: string
          safe_mode_enabled: boolean | null
          safe_mode_reason: string | null
          safe_mode_started_at: string | null
          updated_at: string | null
        }
        Insert: {
          archived_credentials?: Json | null
          confusion_state_detected?: boolean | null
          created_at?: string | null
          id?: string
          last_reset_at?: string | null
          last_reset_by?: string | null
          multi_shop_mode?: boolean | null
          primary_shop_domain: string
          primary_shop_id?: string | null
          project_slug?: string
          safe_mode_enabled?: boolean | null
          safe_mode_reason?: string | null
          safe_mode_started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_credentials?: Json | null
          confusion_state_detected?: boolean | null
          created_at?: string | null
          id?: string
          last_reset_at?: string | null
          last_reset_by?: string | null
          multi_shop_mode?: boolean | null
          primary_shop_domain?: string
          primary_shop_id?: string | null
          project_slug?: string
          safe_mode_enabled?: boolean | null
          safe_mode_reason?: string | null
          safe_mode_started_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shopify_connections: {
        Row: {
          access_token_encrypted: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          is_verified: boolean | null
          last_verified_at: string | null
          project_slug: string
          role: string
          scopes: string[] | null
          shop_domain: string
          shop_id: string | null
          storefront_token: string | null
          updated_at: string | null
          webhook_id: string | null
          webhook_secret: string | null
          webhook_verified: boolean | null
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          is_verified?: boolean | null
          last_verified_at?: string | null
          project_slug?: string
          role?: string
          scopes?: string[] | null
          shop_domain: string
          shop_id?: string | null
          storefront_token?: string | null
          updated_at?: string | null
          webhook_id?: string | null
          webhook_secret?: string | null
          webhook_verified?: boolean | null
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          is_verified?: boolean | null
          last_verified_at?: string | null
          project_slug?: string
          role?: string
          scopes?: string[] | null
          shop_domain?: string
          shop_id?: string | null
          storefront_token?: string | null
          updated_at?: string | null
          webhook_id?: string | null
          webhook_secret?: string | null
          webhook_verified?: boolean | null
        }
        Relationships: []
      }
      shopify_orders: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discord_pinged_at: string | null
          financial_status: string | null
          fulfillment_status: string | null
          id: string
          line_items: Json | null
          order_number: string | null
          raw_payload: Json | null
          shipping_address: Json | null
          shopify_order_id: string
          sms_sent_at: string | null
          total_price: number | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discord_pinged_at?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          id?: string
          line_items?: Json | null
          order_number?: string | null
          raw_payload?: Json | null
          shipping_address?: Json | null
          shopify_order_id: string
          sms_sent_at?: string | null
          total_price?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discord_pinged_at?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          id?: string
          line_items?: Json | null
          order_number?: string | null
          raw_payload?: Json | null
          shipping_address?: Json | null
          shopify_order_id?: string
          sms_sent_at?: string | null
          total_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shopify_products: {
        Row: {
          compare_at_price: number | null
          created_at: string
          currency_code: string | null
          description: string | null
          handle: string
          id: string
          image_url: string | null
          inventory_quantity: number | null
          price: number
          product_type: string | null
          shopify_id: string
          status: string | null
          synced_at: string | null
          title: string
          updated_at: string
          user_id: string
          variant_id: string | null
          vendor: string | null
        }
        Insert: {
          compare_at_price?: number | null
          created_at?: string
          currency_code?: string | null
          description?: string | null
          handle: string
          id?: string
          image_url?: string | null
          inventory_quantity?: number | null
          price?: number
          product_type?: string | null
          shopify_id: string
          status?: string | null
          synced_at?: string | null
          title: string
          updated_at?: string
          user_id: string
          variant_id?: string | null
          vendor?: string | null
        }
        Update: {
          compare_at_price?: number | null
          created_at?: string
          currency_code?: string | null
          description?: string | null
          handle?: string
          id?: string
          image_url?: string | null
          inventory_quantity?: number | null
          price?: number
          product_type?: string | null
          shopify_id?: string
          status?: string | null
          synced_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          variant_id?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          followers_count: number | null
          handle: string | null
          health_status: string | null
          id: string
          is_connected: boolean | null
          is_test_mode: boolean | null
          last_post_at: string | null
          last_sync_at: string | null
          metadata: Json | null
          platform: string
          platform_user_id: string | null
          profile_image_url: string | null
          profile_url: string | null
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          followers_count?: number | null
          handle?: string | null
          health_status?: string | null
          id?: string
          is_connected?: boolean | null
          is_test_mode?: boolean | null
          last_post_at?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          platform: string
          platform_user_id?: string | null
          profile_image_url?: string | null
          profile_url?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          followers_count?: number | null
          handle?: string | null
          health_status?: string | null
          id?: string
          is_connected?: boolean | null
          is_test_mode?: boolean | null
          last_post_at?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          platform?: string
          platform_user_id?: string | null
          profile_image_url?: string | null
          profile_url?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          ad_id: string | null
          caption: string | null
          channel: string
          comments: number | null
          created_at: string
          creative_id: string | null
          error_message: string | null
          hashtags: string[] | null
          id: string
          likes: number | null
          metadata: Json | null
          post_id: string | null
          post_url: string | null
          posted_at: string | null
          revenue_attributed: number | null
          scheduled_at: string | null
          shares: number | null
          status: string | null
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          ad_id?: string | null
          caption?: string | null
          channel: string
          comments?: number | null
          created_at?: string
          creative_id?: string | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          likes?: number | null
          metadata?: Json | null
          post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          revenue_attributed?: number | null
          scheduled_at?: string | null
          shares?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          ad_id?: string | null
          caption?: string | null
          channel?: string
          comments?: number | null
          created_at?: string
          creative_id?: string | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          likes?: number | null
          metadata?: Json | null
          post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          revenue_attributed?: number | null
          scheduled_at?: string | null
          shares?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      social_tokens: {
        Row: {
          access_token_encrypted: string | null
          account_avatar: string | null
          account_id: string | null
          account_name: string | null
          channel: string
          created_at: string
          expires_at: string | null
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          refresh_token_encrypted: string | null
          scope: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          account_avatar?: string | null
          account_id?: string | null
          account_name?: string | null
          channel: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          refresh_token_encrypted?: string | null
          scope?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          account_avatar?: string | null
          account_id?: string | null
          account_name?: string | null
          channel?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          refresh_token_encrypted?: string | null
          scope?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spine_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          code: string
          created_at: string
          dedupe_key: string
          env: string | null
          id: string
          message: string
          meta_json: Json | null
          notification_channels: string[] | null
          notification_sent: boolean | null
          project_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          code: string
          created_at?: string
          dedupe_key: string
          env?: string | null
          id?: string
          message: string
          meta_json?: Json | null
          notification_channels?: string[] | null
          notification_sent?: boolean | null
          project_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          code?: string
          created_at?: string
          dedupe_key?: string
          env?: string | null
          id?: string
          message?: string
          meta_json?: Json | null
          notification_channels?: string[] | null
          notification_sent?: boolean | null
          project_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spine_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "spine_projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      spine_audit_log: {
        Row: {
          action: string
          actor: string
          actor_type: string
          created_at: string
          env: string | null
          id: string
          ip_address: string | null
          meta_json: Json | null
          project_id: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor: string
          actor_type: string
          created_at?: string
          env?: string | null
          id?: string
          ip_address?: string | null
          meta_json?: Json | null
          project_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor?: string
          actor_type?: string
          created_at?: string
          env?: string | null
          id?: string
          ip_address?: string | null
          meta_json?: Json | null
          project_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spine_audit_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "spine_projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      spine_projects: {
        Row: {
          created_at: string
          domain: string | null
          env: string
          id: string
          last_seen_at: string | null
          metadata: Json | null
          name: string
          project_id: string
          registered_at: string
          status: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          domain?: string | null
          env: string
          id?: string
          last_seen_at?: string | null
          metadata?: Json | null
          name: string
          project_id: string
          registered_at?: string
          status?: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          domain?: string | null
          env?: string
          id?: string
          last_seen_at?: string | null
          metadata?: Json | null
          name?: string
          project_id?: string
          registered_at?: string
          status?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      store_setups: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          generated_config: Json | null
          id: string
          industry: string
          products: Json | null
          status: string
          store_name: string
          target_audience: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          generated_config?: Json | null
          id?: string
          industry: string
          products?: Json | null
          status?: string
          store_name: string
          target_audience?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          generated_config?: Json | null
          id?: string
          industry?: string
          products?: Json | null
          status?: string
          store_name?: string
          target_audience?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      strategic_doctrine: {
        Row: {
          approved_language: string[]
          created_at: string
          excluded_audience: string
          forbidden_language: string[]
          id: string
          last_edited_by: string
          market_category: string
          north_star: string
          target_audience: string
          updated_at: string
        }
        Insert: {
          approved_language?: string[]
          created_at?: string
          excluded_audience: string
          forbidden_language?: string[]
          id?: string
          last_edited_by: string
          market_category: string
          north_star: string
          target_audience: string
          updated_at?: string
        }
        Update: {
          approved_language?: string[]
          created_at?: string
          excluded_audience?: string
          forbidden_language?: string[]
          id?: string
          last_edited_by?: string
          market_category?: string
          north_star?: string
          target_audience?: string
          updated_at?: string
        }
        Relationships: []
      }
      stripe_boot_validations: {
        Row: {
          account_id_matches: boolean | null
          connect_enabled: boolean | null
          duration_ms: number | null
          env: string
          id: string
          project_id: string
          status: string
          stripe_api_reachable: boolean | null
          validated_at: string
          validation_details: Json | null
          validation_mode: string
          webhooks_configured: boolean | null
        }
        Insert: {
          account_id_matches?: boolean | null
          connect_enabled?: boolean | null
          duration_ms?: number | null
          env: string
          id?: string
          project_id: string
          status: string
          stripe_api_reachable?: boolean | null
          validated_at?: string
          validation_details?: Json | null
          validation_mode: string
          webhooks_configured?: boolean | null
        }
        Update: {
          account_id_matches?: boolean | null
          connect_enabled?: boolean | null
          duration_ms?: number | null
          env?: string
          id?: string
          project_id?: string
          status?: string
          stripe_api_reachable?: boolean | null
          validated_at?: string
          validation_details?: Json | null
          validation_mode?: string
          webhooks_configured?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_boot_validations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "spine_projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      stripe_canonical: {
        Row: {
          check_results: Json | null
          created_at: string
          env: string
          id: string
          last_check_at: string | null
          status: string
          stripe_platform_account_id: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          check_results?: Json | null
          created_at?: string
          env: string
          id?: string
          last_check_at?: string | null
          status?: string
          stripe_platform_account_id: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          check_results?: Json | null
          created_at?: string
          env?: string
          id?: string
          last_check_at?: string | null
          status?: string
          stripe_platform_account_id?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          account: string | null
          api_version: string | null
          error: string | null
          id: string
          livemode: boolean | null
          payload_json: Json | null
          processed_at: string | null
          processing_time_ms: number | null
          project_id: string | null
          received_at: string
          request_id: string | null
          status: string | null
          stripe_event_id: string
          type: string
        }
        Insert: {
          account?: string | null
          api_version?: string | null
          error?: string | null
          id?: string
          livemode?: boolean | null
          payload_json?: Json | null
          processed_at?: string | null
          processing_time_ms?: number | null
          project_id?: string | null
          received_at?: string
          request_id?: string | null
          status?: string | null
          stripe_event_id: string
          type: string
        }
        Update: {
          account?: string | null
          api_version?: string | null
          error?: string | null
          id?: string
          livemode?: boolean | null
          payload_json?: Json | null
          processed_at?: string | null
          processing_time_ms?: number | null
          project_id?: string | null
          received_at?: string
          request_id?: string | null
          status?: string | null
          stripe_event_id?: string
          type?: string
        }
        Relationships: []
      }
      stripe_metrics_daily: {
        Row: {
          active_subscriptions: number | null
          churned_subscriptions: number | null
          created_at: string
          customers_created: number | null
          date: string
          disputes_closed: number | null
          disputes_opened: number | null
          env: string
          failed_payments: number | null
          id: string
          mrr_cents: number | null
          new_subscriptions: number | null
          project_id: string | null
          refunds_amount_cents: number | null
          refunds_count: number | null
          revenue_cents: number | null
          successful_payments: number | null
          updated_at: string
          webhook_events_count: number | null
          webhook_failures: number | null
        }
        Insert: {
          active_subscriptions?: number | null
          churned_subscriptions?: number | null
          created_at?: string
          customers_created?: number | null
          date: string
          disputes_closed?: number | null
          disputes_opened?: number | null
          env: string
          failed_payments?: number | null
          id?: string
          mrr_cents?: number | null
          new_subscriptions?: number | null
          project_id?: string | null
          refunds_amount_cents?: number | null
          refunds_count?: number | null
          revenue_cents?: number | null
          successful_payments?: number | null
          updated_at?: string
          webhook_events_count?: number | null
          webhook_failures?: number | null
        }
        Update: {
          active_subscriptions?: number | null
          churned_subscriptions?: number | null
          created_at?: string
          customers_created?: number | null
          date?: string
          disputes_closed?: number | null
          disputes_opened?: number | null
          env?: string
          failed_payments?: number | null
          id?: string
          mrr_cents?: number | null
          new_subscriptions?: number | null
          project_id?: string | null
          refunds_amount_cents?: number | null
          refunds_count?: number | null
          revenue_cents?: number | null
          successful_payments?: number | null
          updated_at?: string
          webhook_events_count?: number | null
          webhook_failures?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_metrics_daily_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "spine_projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          account: string | null
          api_version: string | null
          created: string
          error: string | null
          id: string
          livemode: boolean
          payload_json: Json
          processed_at: string | null
          processing_time_ms: number | null
          project_id: string | null
          received_at: string
          request_id: string | null
          status: string
          stripe_event_id: string
          type: string
        }
        Insert: {
          account?: string | null
          api_version?: string | null
          created: string
          error?: string | null
          id?: string
          livemode?: boolean
          payload_json: Json
          processed_at?: string | null
          processing_time_ms?: number | null
          project_id?: string | null
          received_at?: string
          request_id?: string | null
          status?: string
          stripe_event_id: string
          type: string
        }
        Update: {
          account?: string | null
          api_version?: string | null
          created?: string
          error?: string | null
          id?: string
          livemode?: boolean
          payload_json?: Json
          processed_at?: string | null
          processing_time_ms?: number | null
          project_id?: string | null
          received_at?: string
          request_id?: string | null
          status?: string
          stripe_event_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_webhook_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "spine_projects"
            referencedColumns: ["project_id"]
          },
        ]
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
          tier: string | null
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
          tier?: string | null
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
          tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
          videos_used_this_month?: number
        }
        Relationships: []
      }
      supplier_connections: {
        Row: {
          api_endpoint: string | null
          api_key_ref: string | null
          auto_source: boolean | null
          avg_cost_multiplier: number | null
          avg_shipping_days: number | null
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          priority_rank: number | null
          success_rate: number | null
          supplier_name: string
          supplier_type: string
          total_orders_fulfilled: number | null
          total_products_sourced: number | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_endpoint?: string | null
          api_key_ref?: string | null
          auto_source?: boolean | null
          avg_cost_multiplier?: number | null
          avg_shipping_days?: number | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          priority_rank?: number | null
          success_rate?: number | null
          supplier_name: string
          supplier_type?: string
          total_orders_fulfilled?: number | null
          total_products_sourced?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_endpoint?: string | null
          api_key_ref?: string | null
          auto_source?: boolean | null
          avg_cost_multiplier?: number | null
          avg_shipping_days?: number | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          priority_rank?: number | null
          success_rate?: number | null
          supplier_name?: string
          supplier_type?: string
          total_orders_fulfilled?: number | null
          total_products_sourced?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      system_checks: {
        Row: {
          check_name: string
          check_type: string
          error: string | null
          id: string
          ran_at: string
          result: Json | null
          status: string
          user_id: string
        }
        Insert: {
          check_name: string
          check_type: string
          error?: string | null
          id?: string
          ran_at?: string
          result?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          check_name?: string
          check_type?: string
          error?: string | null
          id?: string
          ran_at?: string
          result?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      system_diagnostics: {
        Row: {
          details: Json | null
          diagnostic_type: string
          id: string
          message: string | null
          run_at: string
          status: string
          user_id: string
        }
        Insert: {
          details?: Json | null
          diagnostic_type: string
          id?: string
          message?: string | null
          run_at?: string
          status: string
          user_id: string
        }
        Update: {
          details?: Json | null
          diagnostic_type?: string
          id?: string
          message?: string | null
          run_at?: string
          status?: string
          user_id?: string
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
      system_health: {
        Row: {
          component: string
          created_at: string
          id: string
          last_checked_at: string
          message: string | null
          meta_json: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          component: string
          created_at?: string
          id?: string
          last_checked_at?: string
          message?: string | null
          meta_json?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          component?: string
          created_at?: string
          id?: string
          last_checked_at?: string
          message?: string | null
          meta_json?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_products: {
        Row: {
          compare_at_price: number | null
          connection_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          handle: string | null
          id: string
          images: Json | null
          options: Json | null
          price: number | null
          product_type: string | null
          shopify_product_id: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          variants: Json | null
          vendor: string | null
        }
        Insert: {
          compare_at_price?: number | null
          connection_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          handle?: string | null
          id?: string
          images?: Json | null
          options?: Json | null
          price?: number | null
          product_type?: string | null
          shopify_product_id: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          variants?: Json | null
          vendor?: string | null
        }
        Update: {
          compare_at_price?: number | null
          connection_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          handle?: string | null
          id?: string
          images?: Json | null
          options?: Json | null
          price?: number | null
          product_type?: string | null
          shopify_product_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          variants?: Json | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_products_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "user_shopify_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      user_shopify_connections: {
        Row: {
          access_token_encrypted: string
          connected_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          orders_count: number | null
          products_count: number | null
          refresh_token_encrypted: string | null
          scopes: string[] | null
          shop_domain: string
          shop_name: string | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          connected_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          orders_count?: number | null
          products_count?: number | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          shop_domain: string
          shop_name?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          connected_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          orders_count?: number | null
          products_count?: number | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          shop_domain?: string
          shop_name?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_store_connections: {
        Row: {
          admin_access_token: string | null
          admin_token_encrypted: string | null
          connected_at: string
          encryption_key_id: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          last_synced_at: string | null
          orders_count: number | null
          products_count: number | null
          store_domain: string
          store_name: string
          storefront_access_token: string
          storefront_token_encrypted: string | null
          total_revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_access_token?: string | null
          admin_token_encrypted?: string | null
          connected_at?: string
          encryption_key_id?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          last_synced_at?: string | null
          orders_count?: number | null
          products_count?: number | null
          store_domain: string
          store_name: string
          storefront_access_token: string
          storefront_token_encrypted?: string | null
          total_revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_access_token?: string | null
          admin_token_encrypted?: string | null
          connected_at?: string
          encryption_key_id?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          last_synced_at?: string | null
          orders_count?: number | null
          products_count?: number | null
          store_domain?: string
          store_name?: string
          storefront_access_token?: string
          storefront_token_encrypted?: string | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_generation_logs: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          job_id: string
          level: string
          message: string
          step: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          job_id: string
          level?: string
          message: string
          step?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          job_id?: string
          level?: string
          message?: string
          step?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_generation_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      video_ideas_brain: {
        Row: {
          avatar_style: string | null
          body_duration_seconds: number | null
          body_script: string | null
          created_at: string
          cta: string
          cta_duration_seconds: number | null
          emotional_trigger: string | null
          full_script: string | null
          generated_video_id: string | null
          hashtags: string[] | null
          hook: string
          hook_duration_seconds: number | null
          id: string
          idea_number: number | null
          performance_metrics: Json | null
          product_focus: string
          product_id: string | null
          status: string | null
          target_audience: Json | null
          target_platforms: string[] | null
          title: string
          trending_elements: string[] | null
          updated_at: string
          user_id: string
          virality_reason: string | null
          virality_score: number | null
          visual_style: string | null
          visuals: string
        }
        Insert: {
          avatar_style?: string | null
          body_duration_seconds?: number | null
          body_script?: string | null
          created_at?: string
          cta: string
          cta_duration_seconds?: number | null
          emotional_trigger?: string | null
          full_script?: string | null
          generated_video_id?: string | null
          hashtags?: string[] | null
          hook: string
          hook_duration_seconds?: number | null
          id?: string
          idea_number?: number | null
          performance_metrics?: Json | null
          product_focus: string
          product_id?: string | null
          status?: string | null
          target_audience?: Json | null
          target_platforms?: string[] | null
          title: string
          trending_elements?: string[] | null
          updated_at?: string
          user_id: string
          virality_reason?: string | null
          virality_score?: number | null
          visual_style?: string | null
          visuals: string
        }
        Update: {
          avatar_style?: string | null
          body_duration_seconds?: number | null
          body_script?: string | null
          created_at?: string
          cta?: string
          cta_duration_seconds?: number | null
          emotional_trigger?: string | null
          full_script?: string | null
          generated_video_id?: string | null
          hashtags?: string[] | null
          hook?: string
          hook_duration_seconds?: number | null
          id?: string
          idea_number?: number | null
          performance_metrics?: Json | null
          product_focus?: string
          product_id?: string | null
          status?: string | null
          target_audience?: Json | null
          target_platforms?: string[] | null
          title?: string
          trending_elements?: string[] | null
          updated_at?: string
          user_id?: string
          virality_reason?: string | null
          virality_score?: number | null
          visual_style?: string | null
          visuals?: string
        }
        Relationships: []
      }
      video_jobs: {
        Row: {
          adherence_score: number | null
          completed_at: string | null
          created_at: string
          creative_id: string | null
          current_step: string | null
          duration_seconds: number | null
          error_message: string | null
          id: string
          progress: number
          prompt_spec: Json | null
          provider: string | null
          provider_request: Json | null
          provider_response: Json | null
          shot_list: Json | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
          video_size_bytes: number | null
          video_url: string | null
        }
        Insert: {
          adherence_score?: number | null
          completed_at?: string | null
          created_at?: string
          creative_id?: string | null
          current_step?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          progress?: number
          prompt_spec?: Json | null
          provider?: string | null
          provider_request?: Json | null
          provider_response?: Json | null
          shot_list?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          video_size_bytes?: number | null
          video_url?: string | null
        }
        Update: {
          adherence_score?: number | null
          completed_at?: string | null
          created_at?: string
          creative_id?: string | null
          current_step?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          progress?: number
          prompt_spec?: Json | null
          provider?: string | null
          provider_request?: Json | null
          provider_response?: Json | null
          shot_list?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          video_size_bytes?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_jobs_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      view_rate_limits: {
        Row: {
          insert_count: number | null
          viewer_fingerprint: string
          window_start: string | null
        }
        Insert: {
          insert_count?: number | null
          viewer_fingerprint: string
          window_start?: string | null
        }
        Update: {
          insert_count?: number | null
          viewer_fingerprint?: string
          window_start?: string | null
        }
        Relationships: []
      }
      war_room_alerts: {
        Row: {
          action_url: string | null
          alert_type: string
          created_at: string
          data: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string | null
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          alert_type: string
          created_at?: string
          data?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string | null
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          alert_type?: string
          created_at?: string
          data?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string | null
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      web3_revenue: {
        Row: {
          ar_conversions: number | null
          ar_revenue: number | null
          created_at: string
          id: string
          nft_revenue: number | null
          nft_royalties: number | null
          nft_sales_count: number | null
          revenue_date: string
          total_web3_revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ar_conversions?: number | null
          ar_revenue?: number | null
          created_at?: string
          id?: string
          nft_revenue?: number | null
          nft_royalties?: number | null
          nft_sales_count?: number | null
          revenue_date?: string
          total_web3_revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ar_conversions?: number | null
          ar_revenue?: number | null
          created_at?: string
          id?: string
          nft_revenue?: number | null
          nft_royalties?: number | null
          nft_sales_count?: number | null
          revenue_date?: string
          total_web3_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_health_metrics: {
        Row: {
          avg_processing_time_ms: number | null
          created_at: string
          env: string
          events_failed: number | null
          events_processed: number | null
          events_received: number | null
          id: string
          project_id: string | null
          signature_failures: number | null
          unique_event_types: string[] | null
          window_end: string
          window_start: string
        }
        Insert: {
          avg_processing_time_ms?: number | null
          created_at?: string
          env: string
          events_failed?: number | null
          events_processed?: number | null
          events_received?: number | null
          id?: string
          project_id?: string | null
          signature_failures?: number | null
          unique_event_types?: string[] | null
          window_end: string
          window_start: string
        }
        Update: {
          avg_processing_time_ms?: number | null
          created_at?: string
          env?: string
          events_failed?: number | null
          events_processed?: number | null
          events_received?: number | null
          id?: string
          project_id?: string | null
          signature_failures?: number | null
          unique_event_types?: string[] | null
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_health_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "spine_projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          method: string
          payload: Json | null
          processed: boolean | null
          processing_time_ms: number | null
          response_body: Json | null
          response_status: number | null
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          method: string
          payload?: Json | null
          processed?: boolean | null
          processing_time_ms?: number | null
          response_body?: Json | null
          response_status?: number | null
          source: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          method?: string
          payload?: Json | null
          processed?: boolean | null
          processing_time_ms?: number | null
          response_body?: Json | null
          response_status?: number | null
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_rate_limits: {
        Row: {
          identifier: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          identifier: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          identifier?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      winning_product_hunts: {
        Row: {
          added_at: string | null
          ads_generated: number | null
          ads_published: number | null
          ai_benefits: string[] | null
          ai_description: string | null
          ai_hooks: string[] | null
          aov_lift_percentage: number | null
          bundle_affinity_score: number | null
          bundle_suggestions: Json | null
          cac_estimate: string | null
          category: string
          competitor_refs: Json | null
          complements_products: string[] | null
          cost_price: number | null
          created_at: string
          discovered_at: string | null
          id: string
          image_urls: string[] | null
          kill_reason: string | null
          killed_at: string | null
          ltv_potential: string | null
          margin_percentage: number | null
          overall_score: number | null
          performance_status: string | null
          price_range: string | null
          product_name: string
          revenue: number | null
          roas: number | null
          sales_count: number | null
          shopify_handle: string | null
          shopify_product_id: string | null
          source: string
          source_product_id: string | null
          source_url: string | null
          status: string | null
          suggested_price: number | null
          tiktok_potential: number | null
          trend_tags: string[] | null
          updated_at: string
          user_id: string
          viral_score: number | null
        }
        Insert: {
          added_at?: string | null
          ads_generated?: number | null
          ads_published?: number | null
          ai_benefits?: string[] | null
          ai_description?: string | null
          ai_hooks?: string[] | null
          aov_lift_percentage?: number | null
          bundle_affinity_score?: number | null
          bundle_suggestions?: Json | null
          cac_estimate?: string | null
          category: string
          competitor_refs?: Json | null
          complements_products?: string[] | null
          cost_price?: number | null
          created_at?: string
          discovered_at?: string | null
          id?: string
          image_urls?: string[] | null
          kill_reason?: string | null
          killed_at?: string | null
          ltv_potential?: string | null
          margin_percentage?: number | null
          overall_score?: number | null
          performance_status?: string | null
          price_range?: string | null
          product_name: string
          revenue?: number | null
          roas?: number | null
          sales_count?: number | null
          shopify_handle?: string | null
          shopify_product_id?: string | null
          source: string
          source_product_id?: string | null
          source_url?: string | null
          status?: string | null
          suggested_price?: number | null
          tiktok_potential?: number | null
          trend_tags?: string[] | null
          updated_at?: string
          user_id: string
          viral_score?: number | null
        }
        Update: {
          added_at?: string | null
          ads_generated?: number | null
          ads_published?: number | null
          ai_benefits?: string[] | null
          ai_description?: string | null
          ai_hooks?: string[] | null
          aov_lift_percentage?: number | null
          bundle_affinity_score?: number | null
          bundle_suggestions?: Json | null
          cac_estimate?: string | null
          category?: string
          competitor_refs?: Json | null
          complements_products?: string[] | null
          cost_price?: number | null
          created_at?: string
          discovered_at?: string | null
          id?: string
          image_urls?: string[] | null
          kill_reason?: string | null
          killed_at?: string | null
          ltv_potential?: string | null
          margin_percentage?: number | null
          overall_score?: number | null
          performance_status?: string | null
          price_range?: string | null
          product_name?: string
          revenue?: number | null
          roas?: number | null
          sales_count?: number | null
          shopify_handle?: string | null
          shopify_product_id?: string | null
          source?: string
          source_product_id?: string | null
          source_url?: string | null
          status?: string | null
          suggested_price?: number | null
          tiktok_potential?: number | null
          trend_tags?: string[] | null
          updated_at?: string
          user_id?: string
          viral_score?: number | null
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          status: string | null
          trigger_source: string | null
          user_id: string
          workflow_name: string
          workflow_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string | null
          trigger_source?: string | null
          user_id: string
          workflow_name: string
          workflow_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string | null
          trigger_source?: string | null
          user_id?: string
          workflow_name?: string
          workflow_type?: string
        }
        Relationships: []
      }
      workspace_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token: string
          used: boolean | null
          used_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: string
          token: string
          used?: boolean | null
          used_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          token?: string
          used?: boolean | null
          used_at?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_view_rate_limit: { Args: { fingerprint: string }; Returns: boolean }
      decrypt_store_token: {
        Args: { encrypted_token: string; key_id: string }
        Returns: string
      }
      encrypt_store_token: {
        Args: { key_id: string; token: string }
        Returns: string
      }
      get_default_workspace: {
        Args: { check_user_id: string }
        Returns: string
      }
      get_org_role: {
        Args: { check_org_id: string; check_user_id: string }
        Returns: Database["public"]["Enums"]["org_role"]
      }
      get_user_org_ids: { Args: { check_user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_workspace_access: {
        Args: {
          check_user_id: string
          check_workspace_id: string
          min_role: string
        }
        Returns: boolean
      }
      is_admin_user: { Args: { check_user_id: string }; Returns: boolean }
      is_org_member: {
        Args: { check_org_id: string; check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      org_role: "owner" | "admin" | "operator" | "client"
      workspace_role: "owner" | "admin" | "editor" | "viewer"
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
      org_role: ["owner", "admin", "operator", "client"],
      workspace_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const

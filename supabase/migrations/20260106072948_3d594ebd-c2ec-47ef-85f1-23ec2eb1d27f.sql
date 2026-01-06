-- Complete security fixes for remaining tables (email_sequences policy already exists)

-- EMAIL_SEQUENCES - Force RLS and revoke anon (policies already exist)
ALTER TABLE public.email_sequences FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_sequences FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_sequences TO authenticated;

-- AI_LEARNINGS
ALTER TABLE public.ai_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learnings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own ai learnings" ON public.ai_learnings;
DROP POLICY IF EXISTS "Users can insert their own ai learnings" ON public.ai_learnings;
DROP POLICY IF EXISTS "Users can update their own ai learnings" ON public.ai_learnings;
CREATE POLICY "Users can view their own ai learnings" ON public.ai_learnings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ai learnings" ON public.ai_learnings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ai learnings" ON public.ai_learnings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.ai_learnings FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.ai_learnings TO authenticated;

-- DEMO_VIDEOS
ALTER TABLE public.demo_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_videos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own demo videos" ON public.demo_videos;
DROP POLICY IF EXISTS "Users can insert their own demo videos" ON public.demo_videos;
DROP POLICY IF EXISTS "Users can update their own demo videos" ON public.demo_videos;
DROP POLICY IF EXISTS "Users can delete their own demo videos" ON public.demo_videos;
CREATE POLICY "Users can view their own demo videos" ON public.demo_videos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own demo videos" ON public.demo_videos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own demo videos" ON public.demo_videos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own demo videos" ON public.demo_videos FOR DELETE TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.demo_videos FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_videos TO authenticated;

-- DEMO_ANALYTICS
ALTER TABLE public.demo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_analytics FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own demo analytics" ON public.demo_analytics;
DROP POLICY IF EXISTS "Users can insert their own demo analytics" ON public.demo_analytics;
DROP POLICY IF EXISTS "Users can update their own demo analytics" ON public.demo_analytics;
CREATE POLICY "Users can view their own demo analytics" ON public.demo_analytics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own demo analytics" ON public.demo_analytics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own demo analytics" ON public.demo_analytics FOR UPDATE TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.demo_analytics FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.demo_analytics TO authenticated;

-- DEMO_DEPLOYMENTS
ALTER TABLE public.demo_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_deployments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own demo deployments" ON public.demo_deployments;
DROP POLICY IF EXISTS "Users can insert their own demo deployments" ON public.demo_deployments;
DROP POLICY IF EXISTS "Users can update their own demo deployments" ON public.demo_deployments;
DROP POLICY IF EXISTS "Users can delete their own demo deployments" ON public.demo_deployments;
CREATE POLICY "Users can view their own demo deployments" ON public.demo_deployments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own demo deployments" ON public.demo_deployments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own demo deployments" ON public.demo_deployments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own demo deployments" ON public.demo_deployments FOR DELETE TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.demo_deployments FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_deployments TO authenticated;

-- DEMO_OPTIMIZATIONS
ALTER TABLE public.demo_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_optimizations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own demo optimizations" ON public.demo_optimizations;
DROP POLICY IF EXISTS "Users can insert their own demo optimizations" ON public.demo_optimizations;
DROP POLICY IF EXISTS "Users can update their own demo optimizations" ON public.demo_optimizations;
CREATE POLICY "Users can view their own demo optimizations" ON public.demo_optimizations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own demo optimizations" ON public.demo_optimizations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own demo optimizations" ON public.demo_optimizations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.demo_optimizations FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.demo_optimizations TO authenticated;

-- DEMO_CAPABILITY_PERFORMANCE
ALTER TABLE public.demo_capability_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_capability_performance FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own capability performance" ON public.demo_capability_performance;
DROP POLICY IF EXISTS "Users can insert their own capability performance" ON public.demo_capability_performance;
DROP POLICY IF EXISTS "Users can update their own capability performance" ON public.demo_capability_performance;
CREATE POLICY "Users can view their own capability performance" ON public.demo_capability_performance FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own capability performance" ON public.demo_capability_performance FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own capability performance" ON public.demo_capability_performance FOR UPDATE TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.demo_capability_performance FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.demo_capability_performance TO authenticated;

-- CRM_DEMO_TRIGGERS
ALTER TABLE public.crm_demo_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_demo_triggers FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own crm triggers" ON public.crm_demo_triggers;
DROP POLICY IF EXISTS "Users can insert their own crm triggers" ON public.crm_demo_triggers;
DROP POLICY IF EXISTS "Users can update their own crm triggers" ON public.crm_demo_triggers;
DROP POLICY IF EXISTS "Users can delete their own crm triggers" ON public.crm_demo_triggers;
CREATE POLICY "Users can view their own crm triggers" ON public.crm_demo_triggers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own crm triggers" ON public.crm_demo_triggers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own crm triggers" ON public.crm_demo_triggers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own crm triggers" ON public.crm_demo_triggers FOR DELETE TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.crm_demo_triggers FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_demo_triggers TO authenticated;

-- SALES_PAGE_EMBEDS
ALTER TABLE public.sales_page_embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_page_embeds FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own sales page embeds" ON public.sales_page_embeds;
DROP POLICY IF EXISTS "Users can insert their own sales page embeds" ON public.sales_page_embeds;
DROP POLICY IF EXISTS "Users can update their own sales page embeds" ON public.sales_page_embeds;
DROP POLICY IF EXISTS "Users can delete their own sales page embeds" ON public.sales_page_embeds;
CREATE POLICY "Users can view their own sales page embeds" ON public.sales_page_embeds FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sales page embeds" ON public.sales_page_embeds FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales page embeds" ON public.sales_page_embeds FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales page embeds" ON public.sales_page_embeds FOR DELETE TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.sales_page_embeds FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_page_embeds TO authenticated;

-- SYSTEM_EVENTS
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own system events" ON public.system_events;
DROP POLICY IF EXISTS "Users can insert their own system events" ON public.system_events;
CREATE POLICY "Users can view their own system events" ON public.system_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own system events" ON public.system_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
REVOKE ALL ON public.system_events FROM anon;
GRANT SELECT, INSERT ON public.system_events TO authenticated;

-- LEARNING_SIGNALS
ALTER TABLE public.learning_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_signals FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own learning signals" ON public.learning_signals;
DROP POLICY IF EXISTS "Users can insert their own learning signals" ON public.learning_signals;
CREATE POLICY "Users can view their own learning signals" ON public.learning_signals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own learning signals" ON public.learning_signals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
REVOKE ALL ON public.learning_signals FROM anon;
GRANT SELECT, INSERT ON public.learning_signals TO authenticated;

-- PERFORMANCE_SNAPSHOTS
ALTER TABLE public.performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_snapshots FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own performance snapshots" ON public.performance_snapshots;
DROP POLICY IF EXISTS "Users can insert their own performance snapshots" ON public.performance_snapshots;
CREATE POLICY "Users can view their own performance snapshots" ON public.performance_snapshots FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own performance snapshots" ON public.performance_snapshots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
REVOKE ALL ON public.performance_snapshots FROM anon;
GRANT SELECT, INSERT ON public.performance_snapshots TO authenticated;

-- PROOF_ASSETS
ALTER TABLE public.proof_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_assets FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own proof assets" ON public.proof_assets;
DROP POLICY IF EXISTS "Users can insert their own proof assets" ON public.proof_assets;
DROP POLICY IF EXISTS "Users can update their own proof assets" ON public.proof_assets;
DROP POLICY IF EXISTS "Users can delete their own proof assets" ON public.proof_assets;
CREATE POLICY "Users can view their own proof assets" ON public.proof_assets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own proof assets" ON public.proof_assets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own proof assets" ON public.proof_assets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own proof assets" ON public.proof_assets FOR DELETE TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.proof_assets FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proof_assets TO authenticated;

-- LANGUAGE_VIOLATIONS
ALTER TABLE public.language_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_violations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own language violations" ON public.language_violations;
DROP POLICY IF EXISTS "Users can insert their own language violations" ON public.language_violations;
CREATE POLICY "Users can view their own language violations" ON public.language_violations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own language violations" ON public.language_violations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
REVOKE ALL ON public.language_violations FROM anon;
GRANT SELECT, INSERT ON public.language_violations TO authenticated;

-- AUTOMATION_SETTINGS
ALTER TABLE public.automation_settings FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.automation_settings FROM anon;

-- STRATEGIC_DOCTRINE (shared company-wide, admin managed)
ALTER TABLE public.strategic_doctrine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_doctrine FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view doctrine" ON public.strategic_doctrine;
DROP POLICY IF EXISTS "Admins can manage doctrine" ON public.strategic_doctrine;
CREATE POLICY "Authenticated users can view doctrine" ON public.strategic_doctrine FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage doctrine" ON public.strategic_doctrine FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
REVOKE ALL ON public.strategic_doctrine FROM anon;
GRANT SELECT ON public.strategic_doctrine TO authenticated;

-- ROLLOUT_STATUS (system-wide, admin managed)
ALTER TABLE public.rollout_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollout_status FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view rollout status" ON public.rollout_status;
DROP POLICY IF EXISTS "Admins can manage rollout status" ON public.rollout_status;
CREATE POLICY "Authenticated users can view rollout status" ON public.rollout_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage rollout status" ON public.rollout_status FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
REVOKE ALL ON public.rollout_status FROM anon;
GRANT SELECT ON public.rollout_status TO authenticated;

-- USER_ROLES (critical security table)
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can view spine_projects" ON public.spine_projects;
DROP POLICY IF EXISTS "Authenticated users can view stripe_metrics_daily" ON public.stripe_metrics_daily;
DROP POLICY IF EXISTS "Authenticated users can view project_stripe_bindings" ON public.project_stripe_bindings;
DROP POLICY IF EXISTS "Authenticated users can view stripe_boot_validations" ON public.stripe_boot_validations;
DROP POLICY IF EXISTS "Authenticated users can view webhook_health_metrics" ON public.webhook_health_metrics;

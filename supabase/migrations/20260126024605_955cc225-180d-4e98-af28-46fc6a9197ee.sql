-- ============================================
-- SHOPIFY HARD RESET: Canonical Config + Multi-Shop Infrastructure
-- ============================================

-- 1. Create shopify_config table (single source of truth)
CREATE TABLE IF NOT EXISTS public.shopify_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug TEXT UNIQUE NOT NULL DEFAULT 'primary',
  
  -- Canonical store binding
  primary_shop_domain TEXT NOT NULL,
  primary_shop_id TEXT,
  
  -- Safe Mode controls
  safe_mode_enabled BOOLEAN DEFAULT false,
  safe_mode_started_at TIMESTAMPTZ,
  safe_mode_reason TEXT,
  
  -- Multi-shop capability (DISABLED by default)
  multi_shop_mode BOOLEAN DEFAULT false,
  
  -- Audit trail
  last_reset_at TIMESTAMPTZ,
  last_reset_by TEXT,
  confusion_state_detected BOOLEAN DEFAULT false,
  archived_credentials JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create shopify_connections table (multi-tenant ready but disabled)
CREATE TABLE IF NOT EXISTS public.shopify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug TEXT NOT NULL DEFAULT 'primary',
  
  -- Store binding
  shop_domain TEXT NOT NULL,
  shop_id TEXT,
  access_token_encrypted TEXT,
  storefront_token TEXT,
  scopes TEXT[],
  
  -- Role and status
  role TEXT NOT NULL DEFAULT 'secondary' CHECK (role IN ('primary', 'secondary')),
  enabled BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  
  -- Webhook registry
  webhook_id TEXT,
  webhook_secret TEXT,
  webhook_verified BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_project_shop UNIQUE (project_slug, shop_domain)
);

-- 3. Create shopify_audit_log for tracking all operations
CREATE TABLE IF NOT EXISTS public.shopify_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  shop_domain TEXT,
  action TEXT NOT NULL,
  details JSONB,
  performed_by TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopify_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (service role access)
CREATE POLICY "Service role full access on shopify_config" 
  ON public.shopify_config FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on shopify_connections" 
  ON public.shopify_connections FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on shopify_audit_log" 
  ON public.shopify_audit_log FOR ALL USING (true) WITH CHECK (true);

-- 4. Insert canonical configuration (HARD LOCK to primary store)
INSERT INTO public.shopify_config (
  project_slug,
  primary_shop_domain,
  safe_mode_enabled,
  multi_shop_mode,
  last_reset_at,
  last_reset_by,
  confusion_state_detected,
  archived_credentials
) VALUES (
  'primary',
  'lovable-project-7fb70.myshopify.com',
  false,
  false,
  now(),
  'system-hard-reset',
  true,
  '[{"domain": "lovable-project-i664s.myshopify.com", "archived_at": "2026-01-26", "reason": "secondary store archived"}]'::jsonb
) ON CONFLICT (project_slug) 
DO UPDATE SET
  primary_shop_domain = EXCLUDED.primary_shop_domain,
  last_reset_at = now(),
  last_reset_by = 'system-hard-reset',
  confusion_state_detected = false,
  updated_at = now();

-- 5. Insert primary connection record
INSERT INTO public.shopify_connections (
  project_slug,
  shop_domain,
  role,
  enabled,
  is_verified
) VALUES (
  'primary',
  'lovable-project-7fb70.myshopify.com',
  'primary',
  true,
  true
) ON CONFLICT (project_slug, shop_domain) 
DO UPDATE SET
  role = 'primary',
  enabled = true,
  is_verified = true,
  updated_at = now();

-- 6. Archive the secondary store (disable but don't delete)
UPDATE public.user_store_connections
SET is_active = false, is_primary = false
WHERE store_domain = 'lovable-project-i664s.myshopify.com';

-- 7. Ensure primary store is correctly marked
UPDATE public.user_store_connections
SET is_primary = true, is_active = true
WHERE store_domain = 'lovable-project-7fb70.myshopify.com';

-- 8. Log the reset event
INSERT INTO public.shopify_audit_log (
  event_type,
  shop_domain,
  action,
  details,
  performed_by
) VALUES (
  'HARD_RESET',
  'lovable-project-7fb70.myshopify.com',
  'Full Shopify surface reset completed',
  '{"confusion_state_resolved": true, "primary_locked": "lovable-project-7fb70.myshopify.com", "archived_stores": ["lovable-project-i664s.myshopify.com"], "safe_mode_exited": true, "multi_shop_enabled": false}'::jsonb,
  'system-hard-reset'
);

-- Enable realtime for audit log
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopify_audit_log;
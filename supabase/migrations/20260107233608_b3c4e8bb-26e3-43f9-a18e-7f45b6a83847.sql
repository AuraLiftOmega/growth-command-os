-- Add remaining tables to realtime publication (skip if already exists)
DO $$ 
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_contacts;
  EXCEPTION WHEN duplicate_object THEN 
    RAISE NOTICE 'crm_contacts already in publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_deals;
  EXCEPTION WHEN duplicate_object THEN 
    RAISE NOTICE 'crm_deals already in publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.creative_metrics;
  EXCEPTION WHEN duplicate_object THEN 
    RAISE NOTICE 'creative_metrics already in publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
  EXCEPTION WHEN duplicate_object THEN 
    RAISE NOTICE 'subscriptions already in publication';
  END;
END $$;

-- Set replica identity for better realtime updates
ALTER TABLE public.revenue_events REPLICA IDENTITY FULL;
ALTER TABLE public.crm_contacts REPLICA IDENTITY FULL;
ALTER TABLE public.crm_deals REPLICA IDENTITY FULL;
ALTER TABLE public.creative_metrics REPLICA IDENTITY FULL;
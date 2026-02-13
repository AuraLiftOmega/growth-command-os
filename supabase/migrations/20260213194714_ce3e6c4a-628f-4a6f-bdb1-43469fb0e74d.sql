-- Force all ads to live mode - no test mode anywhere
UPDATE public.ads SET test_mode = false WHERE test_mode = true;

-- Ensure default is always false (live)
ALTER TABLE public.ads ALTER COLUMN test_mode SET DEFAULT false;
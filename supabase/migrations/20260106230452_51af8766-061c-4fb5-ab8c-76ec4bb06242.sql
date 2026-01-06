-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule Geekbot sync to run daily at 9 AM UTC
SELECT cron.schedule(
  'geekbot-daily-sync',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://phpektarjfbgnuyqjnmj.supabase.co/functions/v1/geekbot-sync/sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGVrdGFyamZiZ251eXFqbm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTQ2NzAsImV4cCI6MjA4MzIzMDY3MH0.cfjCPnv0WGz4bbcsRNB9lE53L42RIJ3MzZY4zlxtF2E'
    ),
    body := jsonb_build_object('days', 1)
  ) AS request_id;
  $$
);
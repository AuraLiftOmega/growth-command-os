-- Move extensions to a dedicated schema for security best practices
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop and recreate extensions in the extensions schema
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

CREATE EXTENSION pg_cron SCHEMA extensions;
CREATE EXTENSION pg_net SCHEMA extensions;
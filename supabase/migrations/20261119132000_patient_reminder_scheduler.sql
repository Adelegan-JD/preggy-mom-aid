-- Enable Supabase's native scheduler and async HTTP client.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
create extension if not exists pg_net;

-- Store the non-sensitive project URL in Vault for scheduled invocation.
select vault.create_secret('https://segggjguspycgdwtgaraq.supabase.co', 'project_url')
where not exists (select 1 from vault.secrets where name = 'project_url');

-- Schedule opt-in reminder processing every 15 minutes. The request is sent
-- only after the owner stores the Supabase secret key in Vault as
-- 'supabase_secret_key'. The Edge Function verifies that key itself.
select cron.schedule(
  'preggy-mom-aid-patient-reminders',
  '*/15 * * * *',
  $job$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
             || '/functions/v1/process-patient-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_secret_key')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 10000
    )
    where exists (select 1 from vault.decrypted_secrets where name = 'supabase_secret_key');
  $job$
);

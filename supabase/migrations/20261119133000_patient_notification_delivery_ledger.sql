-- Idempotent notification delivery ledger for opt-in appointment reminders.
create table if not exists public.patient_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.patient_appointments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_type text not null default '24_hour' check (reminder_type in ('24_hour')),
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  provider_message_id text,
  error_code text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (appointment_id, reminder_type)
);
create index if not exists patient_notification_deliveries_user_idx
  on public.patient_notification_deliveries(user_id, created_at desc);
alter table public.patient_notification_deliveries enable row level security;
revoke all on public.patient_notification_deliveries from public, anon, authenticated;

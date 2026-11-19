-- Patient-controlled notification preferences and privacy requests.
-- Delivery is deliberately not enabled by this schema: preferences are stored
-- until a reviewed notification provider and scheduled delivery service exist.

create table if not exists public.patient_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  appointment_email_reminders boolean not null default false,
  product_email_updates boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.patient_notification_preferences enable row level security;
revoke all on public.patient_notification_preferences from anon, authenticated;
grant select, insert, update on public.patient_notification_preferences to authenticated;
drop policy if exists "Patients manage only their notification preferences" on public.patient_notification_preferences;
create policy "Patients manage only their notification preferences"
  on public.patient_notification_preferences for all to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  )
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  );

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','processing','completed','rejected')),
  requested_at timestamptz not null default now()
);
create index if not exists account_deletion_requests_user_requested_idx
  on public.account_deletion_requests(user_id, requested_at desc);
alter table public.account_deletion_requests enable row level security;
revoke all on public.account_deletion_requests from anon, authenticated;
grant select, insert on public.account_deletion_requests to authenticated;
drop policy if exists "Patients create and view their own deletion requests" on public.account_deletion_requests;
create policy "Patients create and view their own deletion requests"
  on public.account_deletion_requests for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Patients submit their own deletion requests"
  on public.account_deletion_requests for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  );

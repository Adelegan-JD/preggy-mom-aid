-- Patient-managed appointments. No provider-created appointments or notifications
-- are enabled by this table; entries are created and controlled by the patient.

create table if not exists public.patient_appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  appointment_type text not null default 'other'
    check (appointment_type in ('antenatal','postnatal','scan','laboratory','other')),
  scheduled_at timestamptz not null,
  location text check (location is null or char_length(location) <= 180),
  notes text check (notes is null or char_length(notes) <= 1500),
  status text not null default 'scheduled'
    check (status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patient_appointments_user_schedule_idx
  on public.patient_appointments(user_id, scheduled_at asc);

alter table public.patient_appointments enable row level security;
revoke all on public.patient_appointments from anon, authenticated;
grant select, insert, update, delete on public.patient_appointments to authenticated;

drop policy if exists "Patients manage only their own appointments" on public.patient_appointments;
create policy "Patients manage only their own appointments"
  on public.patient_appointments for all to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.account_type = 'patient'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.account_type = 'patient'
    )
  );

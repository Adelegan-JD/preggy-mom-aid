-- Patient-owned profile and pregnancy journey details.
-- This table is private to the patient; no practitioner policies are granted.

create table if not exists public.patient_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_name text check (preferred_name is null or char_length(preferred_name) <= 80),
  phone_number text check (phone_number is null or char_length(phone_number) <= 30),
  state_or_territory text check (state_or_territory is null or char_length(state_or_territory) <= 80),
  preferred_language text not null default 'en'
    check (preferred_language in ('en','yo','ig','ha','pcm','other')),
  pregnancy_status text not null default 'pregnant'
    check (pregnancy_status in ('pregnant','postpartum','not_currently_pregnant')),
  estimated_due_date date,
  birth_date date,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint patient_profile_journey_dates check (
    (pregnancy_status = 'pregnant' and birth_date is null)
    or (pregnancy_status = 'postpartum' and estimated_due_date is null)
    or (pregnancy_status = 'not_currently_pregnant' and estimated_due_date is null and birth_date is null)
  )
);

alter table public.patient_profiles enable row level security;
revoke all on public.patient_profiles from anon, authenticated;
grant select, insert, update, delete on public.patient_profiles to authenticated;

drop policy if exists "Patients manage only their own profile details" on public.patient_profiles;
create policy "Patients manage only their own profile details"
  on public.patient_profiles for all to authenticated
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

create index if not exists patient_profiles_status_idx
  on public.patient_profiles(pregnancy_status);

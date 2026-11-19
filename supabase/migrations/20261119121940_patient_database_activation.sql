-- Preggy Mom Aid: one-time patient database activation script.
-- Review the project reference and existing schema before running.
-- This script consolidates the current patient migrations in timestamp order.
-- Run once in Supabase Dashboard -> SQL Editor on the intended project.
-- It does not configure Auth email templates, Vercel secrets, or email delivery.
-- Do not run this alongside the individual migration files in the same session.

begin;

-- Lock down the pre-existing project-wide RLS event-trigger function.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

-- ===== Source: supabase/migrations/20261119000100_user_accounts_and_private_health_logs.sql =====
-- Account roles and first patient-owned health records.
-- No role can self-approve professional verification. No cross-user clinical access is granted here.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter table public.profiles
  add column if not exists account_type text not null default 'patient',
  add column if not exists professional_type text,
  add column if not exists verification_status text not null default 'not_applicable';

alter table public.profiles drop constraint if exists profiles_account_type_check;
alter table public.profiles add constraint profiles_account_type_check
  check (account_type in ('patient','professional'));
alter table public.profiles drop constraint if exists profiles_professional_type_check;
alter table public.profiles add constraint profiles_professional_type_check
  check (professional_type is null or professional_type in ('doctor','nurse','midwife'));
alter table public.profiles drop constraint if exists profiles_verification_status_check;
alter table public.profiles add constraint profiles_verification_status_check
  check (verification_status in ('not_applicable','pending','verified','rejected','expired'));

update public.profiles
set verification_status = case when account_type = 'professional' then 'pending' else 'not_applicable' end
where verification_status is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_type text;
  requested_profession text;
begin
  requested_type := coalesce(new.raw_user_meta_data ->> 'account_type', 'patient');
  if requested_type not in ('patient','professional') then
    requested_type := 'patient';
  end if;

  requested_profession := new.raw_user_meta_data ->> 'professional_type';
  if requested_profession not in ('doctor','nurse','midwife') then
    requested_profession := null;
  end if;

  insert into public.profiles (id, full_name, account_type, professional_type, verification_status)
  values (
    new.id,
    nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120), ''),
    requested_type,
    case when requested_type = 'professional' then requested_profession else null end,
    case when requested_type = 'professional' then 'pending' else 'not_applicable' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger functions must not be callable through the Data API.
revoke all on function public.handle_new_user() from public, anon, authenticated;

insert into public.profiles (id, full_name, account_type, professional_type, verification_status)
select
  users.id,
  nullif(left(trim(coalesce(users.raw_user_meta_data ->> 'full_name', '')), 120), ''),
  case when users.raw_user_meta_data ->> 'account_type' = 'professional' then 'professional' else 'patient' end,
  case
    when users.raw_user_meta_data ->> 'account_type' = 'professional'
     and users.raw_user_meta_data ->> 'professional_type' in ('doctor','nurse','midwife')
    then users.raw_user_meta_data ->> 'professional_type'
    else null
  end,
  case when users.raw_user_meta_data ->> 'account_type' = 'professional' then 'pending' else 'not_applicable' end
from auth.users as users
on conflict (id) do nothing;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.feedback_reviewers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.feedback_reviewers enable row level security;
revoke all on public.feedback_reviewers from anon, authenticated;
grant select on public.feedback_reviewers to authenticated;
drop policy if exists "Reviewers can read their own reviewer grant" on public.feedback_reviewers;
create policy "Reviewers can read their own reviewer grant"
  on public.feedback_reviewers for select to authenticated
  using ((select auth.uid()) = user_id);

do $$
begin
  if to_regclass('public.tester_feedback') is not null
     and to_regclass('public.product_feedback') is null then
    alter table public.tester_feedback rename to product_feedback;
  end if;
end;
$$;

create table if not exists public.product_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  area text not null check (char_length(area) between 1 and 80),
  comments text not null check (char_length(comments) between 1 and 2500),
  created_at timestamptz not null default now()
);
create index if not exists product_feedback_created_at_idx on public.product_feedback(created_at desc);
create index if not exists product_feedback_user_id_idx on public.product_feedback(user_id);
alter table public.product_feedback enable row level security;
revoke all on public.product_feedback from anon;
grant insert,select on public.product_feedback to authenticated;
drop policy if exists "Testers can submit feedback for themselves" on public.product_feedback;
drop policy if exists "Testers can read their own feedback" on public.product_feedback;
drop policy if exists "Approved feedback reviewers can read feedback" on public.product_feedback;
drop policy if exists "Users can submit their own product feedback" on public.product_feedback;
create policy "Users can submit their own product feedback"
  on public.product_feedback for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users can read their own product feedback" on public.product_feedback;
create policy "Users can read their own product feedback"
  on public.product_feedback for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.feedback_reviewers
      where feedback_reviewers.user_id = (select auth.uid())
    )
  );

create table if not exists public.blood_pressure_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  systolic smallint not null check (systolic between 60 and 300),
  diastolic smallint not null check (diastolic between 30 and 200),
  pulse smallint check (pulse between 25 and 250),
  measured_at timestamptz not null,
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);
-- Legacy entries may contain reversed values from the earlier form.
-- Do not rewrite a patient's historical health data automatically. NOT VALID
-- enforces this rule for new/updated rows while allowing existing rows to be
-- reviewed and corrected through a separate, auditable patient-data workflow.
alter table public.blood_pressure_readings drop constraint if exists bp_values_not_equal;
alter table public.blood_pressure_readings drop constraint if exists bp_values_ordered;
alter table public.blood_pressure_readings
  add constraint bp_values_ordered check (systolic > diastolic) not valid;
create index if not exists blood_pressure_readings_user_measured_idx
  on public.blood_pressure_readings(user_id, measured_at desc);
alter table public.blood_pressure_readings enable row level security;
revoke all on public.blood_pressure_readings from anon, authenticated;
grant select, insert, update, delete on public.blood_pressure_readings to authenticated;
drop policy if exists "Users manage their own blood pressure readings" on public.blood_pressure_readings;
create policy "Users manage their own blood pressure readings"
  on public.blood_pressure_readings for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.symptom_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symptom_tags text[] not null default '{}',
  description text check (description is null or char_length(description) <= 2000),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists symptom_reports_user_occurred_idx
  on public.symptom_reports(user_id, occurred_at desc);
alter table public.symptom_reports enable row level security;
revoke all on public.symptom_reports from anon, authenticated;
grant select, insert, update, delete on public.symptom_reports to authenticated;
drop policy if exists "Users manage their own symptom reports" on public.symptom_reports;
create policy "Users manage their own symptom reports"
  on public.symptom_reports for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.professional_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  profession text not null check (profession in ('doctor','nurse','midwife')),
  registration_number text not null check (char_length(registration_number) between 2 and 80),
  institution text check (institution is null or char_length(institution) <= 160),
  status text not null default 'pending' check (status in ('pending','verified','rejected','expired')),
  submitted_at timestamptz not null default now()
);
alter table public.professional_applications enable row level security;
revoke all on public.professional_applications from anon, authenticated;
grant select, insert on public.professional_applications to authenticated;
drop policy if exists "Professionals submit and view own application" on public.professional_applications;
create policy "Professionals submit and view own application"
  on public.professional_applications for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Professionals may submit their own application" on public.professional_applications;
create policy "Professionals may submit their own application"
  on public.professional_applications for insert to authenticated
  with check (
    status = 'pending'
    and (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.account_type = 'professional'
        and profiles.verification_status = 'pending'
    )
  );

-- No user-facing route can change verification status. An authorised internal
-- reviewer process must update both the profile and application after regulator checks.


-- ===== Source: supabase/migrations/20261119000200_patient_profiles.sql =====
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


-- ===== Source: supabase/migrations/20261119000300_patient_appointments.sql =====
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


-- ===== Source: supabase/migrations/20261119000400_patient_health_documents.sql =====
-- Private patient health-document storage.
-- Files are stored under the authenticated patient's UUID and are never public.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'patient-health-records',
  'patient-health-records',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png']
)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.patient_health_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  object_path text not null unique,
  display_name text not null check (char_length(display_name) between 1 and 180),
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png')),
  file_size_bytes integer not null check (file_size_bytes between 1 and 10485760),
  document_category text not null default 'other'
    check (document_category in ('antenatal_record','scan_result','laboratory_result','prescription','discharge_summary','other')),
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists patient_health_documents_user_created_idx
  on public.patient_health_documents(user_id, created_at desc);

alter table public.patient_health_documents enable row level security;
revoke all on public.patient_health_documents from anon, authenticated;
grant select, insert, delete on public.patient_health_documents to authenticated;

drop policy if exists "Patients view their own health documents" on public.patient_health_documents;
create policy "Patients view their own health documents"
  on public.patient_health_documents for select to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  );

drop policy if exists "Patients register their own health documents" on public.patient_health_documents;
create policy "Patients register their own health documents"
  on public.patient_health_documents for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and object_path like (select auth.uid())::text || '/%'
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  );

drop policy if exists "Patients delete their own health documents" on public.patient_health_documents;
create policy "Patients delete their own health documents"
  on public.patient_health_documents for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  );

drop policy if exists "Patients upload their own private health files" on storage.objects;
create policy "Patients upload their own private health files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'patient-health-records'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  );

drop policy if exists "Patients read their own private health files" on storage.objects;
create policy "Patients read their own private health files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'patient-health-records'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  );

drop policy if exists "Patients delete their own private health files" on storage.objects;
create policy "Patients delete their own private health files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'patient-health-records'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  );


-- ===== Source: supabase/migrations/20261119000600_patient_only_health_log_policies.sql =====
-- Restrict the patient health journals to patient accounts as well as row ownership.
-- This is defense in depth; it does not grant professionals access to patient records.
drop policy if exists "Users manage their own blood pressure readings" on public.blood_pressure_readings;
create policy "Patients manage only their own blood pressure readings"
  on public.blood_pressure_readings for all to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  )
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  );

drop policy if exists "Users manage their own symptom reports" on public.symptom_reports;
create policy "Patients manage only their own symptom reports"
  on public.symptom_reports for all to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  )
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.account_type = 'patient')
  );


-- ===== Source: supabase/migrations/20261119000700_patient_privacy_and_notification_preferences.sql =====
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
create unique index if not exists account_deletion_requests_one_open_per_user_idx
  on public.account_deletion_requests(user_id) where status in ('requested','processing');
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


commit;

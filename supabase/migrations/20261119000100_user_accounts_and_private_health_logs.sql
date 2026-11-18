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
grant select, insert, delete on public.blood_pressure_readings to authenticated;
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
grant select, insert, delete on public.symptom_reports to authenticated;
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

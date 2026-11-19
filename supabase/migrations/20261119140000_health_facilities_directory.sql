-- Public, informational facility directory. No fabricated facility rows are seeded.
-- Facility publication and verification are controlled by trusted server-side staff only.
create table if not exists public.health_facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 180),
  facility_type text not null check (facility_type in ('hospital', 'clinic', 'maternity_centre', 'medical_centre')),
  address text not null check (char_length(btrim(address)) between 4 and 500),
  city text not null check (char_length(btrim(city)) between 2 and 100),
  state text not null check (char_length(btrim(state)) between 2 and 100),
  phone text,
  emergency_phone text,
  website_url text,
  maternity_services text[] not null default '{}',
  has_emergency_department boolean not null default false,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'under_review', 'verified', 'rejected')),
  verification_sources text[] not null default '{}',
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint health_facilities_verified_metadata_check
    check (verification_status <> 'verified' or verified_at is not null)
);

create index if not exists health_facilities_published_state_city_idx
  on public.health_facilities (state, city, name)
  where is_published = true;

alter table public.health_facilities enable row level security;

revoke all on table public.health_facilities from anon, authenticated;
grant select on table public.health_facilities to anon, authenticated;
grant all on table public.health_facilities to service_role;

drop policy if exists "Public can read published health facilities" on public.health_facilities;
create policy "Public can read published health facilities"
  on public.health_facilities
  for select
  to anon, authenticated
  using (is_published = true and verification_status <> 'rejected');

-- Deliberately no client INSERT/UPDATE/DELETE policies. Unverified facilities may be
-- published as clearly labelled information, but must never be presented as verified.

-- GRID3 source provenance and geospatial fields for the facility directory.
-- This migration was applied to the production project as version 20261119172019.
alter table public.health_facilities
  add column if not exists source_dataset text,
  add column if not exists source_facility_id text,
  add column if not exists lga text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists functionality_status text,
  add column if not exists source_updated_at date,
  add column if not exists source_attributes jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'health_facilities_latitude_range_check') then
    alter table public.health_facilities add constraint health_facilities_latitude_range_check
      check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'health_facilities_longitude_range_check') then
    alter table public.health_facilities add constraint health_facilities_longitude_range_check
      check (longitude is null or longitude between -180 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'health_facilities_functionality_status_check') then
    alter table public.health_facilities add constraint health_facilities_functionality_status_check
      check (functionality_status is null or functionality_status in
        ('functional', 'not_functional', 'closed', 'unknown', 'not_reported'));
  end if;
end $$;

create unique index if not exists health_facilities_source_identity_uidx
  on public.health_facilities (source_dataset, source_facility_id)
  where source_dataset is not null and source_facility_id is not null;

create index if not exists health_facilities_coordinates_idx
  on public.health_facilities (latitude, longitude)
  where is_published = true and latitude is not null and longitude is not null;

create index if not exists health_facilities_lga_state_idx
  on public.health_facilities (state, lga, name);

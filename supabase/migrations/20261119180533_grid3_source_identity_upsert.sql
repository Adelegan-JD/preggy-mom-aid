-- Allow PostgREST/Supabase upsert to infer a conflict target for GRID3 source identity.
-- NULL source pairs remain permitted for manually curated directory entries.
drop index if exists public.health_facilities_source_identity_uidx;
create unique index health_facilities_source_identity_uidx
  on public.health_facilities (source_dataset, source_facility_id);

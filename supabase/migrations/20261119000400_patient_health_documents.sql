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

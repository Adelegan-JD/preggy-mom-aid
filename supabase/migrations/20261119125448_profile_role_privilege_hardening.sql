-- Keep account role and professional verification fields out of patient-controlled updates.
-- Authenticated users may read their own profile and update only their display name.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;

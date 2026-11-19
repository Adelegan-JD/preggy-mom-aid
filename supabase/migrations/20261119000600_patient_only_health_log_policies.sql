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

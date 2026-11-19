-- Explicitly deny client access to the internal notification delivery ledger.
-- Only trusted backend/service-role processes may read or mutate delivery state.
drop policy if exists "No client access to patient notification deliveries" on public.patient_notification_deliveries;
create policy "No client access to patient notification deliveries"
  on public.patient_notification_deliveries
  for all to anon, authenticated
  using (false)
  with check (false);

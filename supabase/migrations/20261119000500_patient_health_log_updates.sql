-- Patient-owned health log updates. This follow-up migration is required even if
-- the original account/health-log migration has already been applied.
grant update on public.blood_pressure_readings to authenticated;
grant update on public.symptom_reports to authenticated;

-- GRID3 does not report emergency-department availability.
-- NULL means not assessed; false should mean a facility was checked and confirmed not to have one.
alter table public.health_facilities
  alter column has_emergency_department drop not null,
  alter column has_emergency_department drop default;

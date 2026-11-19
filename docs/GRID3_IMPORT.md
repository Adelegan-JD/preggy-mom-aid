# GRID3 Nigeria health-facility import

The source workbook `GRID3_NGA_Health_Facilities_v4_0` contains 70,235 facility rows. The converter creates a Supabase-ready CSV and deliberately retains records without coordinates for name/LGA/state discovery.

## Convert the workbook

Install the one-off import dependency:

```sh
python -m pip install -r requirements-import.txt
python scripts/convert-grid3-xlsx.py ./GRID3_NGA_Health_Facilities_v4_0.xlsx ./grid3-health-facilities.csv
```

The converter validates the GRID3 headers and unique IDs, emits a conversion report, and preserves the original source columns in `source_attributes`.

## Safety and data interpretation

- Every imported row is `verification_status=unverified` and `is_published=false`.
- GRID3 does not provide maternity-service confirmation, emergency-department confirmation, phone numbers or verified street addresses. Those fields are left unknown/blank; do not infer them from facility names.
- The address field is explicitly a ward/LGA/state administrative locator and says the street address was not supplied.
- Missing GPS coordinates are preserved as NULL; those rows can be found by manual search after publication but cannot be returned by GPS-nearby search.
- GRID3 functionality values are mapped to `functional`, `not_functional`, `closed`, `unknown` or `not_reported`. The original values and all other source columns remain in `source_attributes`.
- The unique source identity index makes repeated imports idempotent when the CSV is upserted on `source_dataset,source_facility_id`.
- The GRID3 file is not copied into the public application bundle or committed to this repository.

## Database import

1. Confirm the two GRID3 schema migrations are present in Supabase.
2. In Supabase Table Editor, open `public.health_facilities` and import the generated CSV.
3. Choose upsert/merge on the unique source identity columns `source_dataset,source_facility_id`. The database has a full unique index on these columns (NULL pairs remain allowed), so PostgREST can infer the conflict target. Do not use plain INSERT for repeat imports; use upsert/merge.
4. Verify counts and sample records with the SQL checks in the release runbook.
5. Keep every row unpublished until the facility has been independently checked. Do not enable public display just because the source dataset is genuine.

The converter does not publish facilities and does not change the app's public-directory RLS policy.

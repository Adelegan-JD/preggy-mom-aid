# Supabase setup — Preggy Mom Aid

This guide is for activating the real patient application. Do not enter patient information until the migrations, authentication settings, storage policies and deployment have all been verified.

## 1. Confirm the project

Open the intended Supabase project in the Dashboard. Confirm its project reference, region and Project URL. The configured project reference is `segggjguspycgdwtgaraq`; confirm it matches before running SQL.

Record the region for the privacy and cross-border data-transfer assessment. Do not share database passwords, secret API keys, service-role keys, access tokens or recovery codes in chat or commit them to Git.

## 2. Configure email authentication

In **Authentication → Providers → Email**:
- Enable email/password sign-in.
- Require email confirmation.
- Keep anonymous sign-ins disabled.
- Do not enable phone sign-in until an SMS provider and Nigerian delivery have been tested.

In **Authentication → URL Configuration**:
- Set the Site URL to `https://preggy-mom-aid.vercel.app`.
- Add the exact callback URL used by the current application (the auth callback route is `/auth/callback`) to the allowed redirect URLs.
- Do not use broad wildcard redirect URLs.

Email confirmation must be tested end-to-end after the production deployment is available. A user must not be treated as signed in until Supabase confirms the account.

## 3. Configure application environment variables

In **Project Settings → API Keys**, obtain:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Publishable key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Add these values in Vercel → Project → Settings → Environment Variables for the intended environments, then redeploy when deployment quota is available. These are browser-safe values; never expose a secret key, service-role key, database password or access token in a `NEXT_PUBLIC_*` variable or GitHub.

The repository's `.env.example` contains placeholders only. Do not commit live credentials.

## 4. Apply database migrations

Use **Supabase Dashboard → SQL Editor**. Open each migration file from the merged `master` branch, paste its complete contents into a new SQL query, and run them in timestamp order. Run each file once, in order; do not skip earlier foundation migrations and do not manually invent tables or policies.

The patient feature migrations added in the current implementation sequence are:

1. `supabase/migrations/20261119000100_user_accounts_and_private_health_logs.sql`
   - Patient and professional account roles, profile foundation, private blood-pressure and symptom records, product feedback, and pending professional application records.
2. `supabase/migrations/20261119000200_patient_profiles.sql`
   - Patient-owned personal and pregnancy/postpartum profile.
3. `supabase/migrations/20261119000300_patient_appointments.sql`
   - Patient-owned personal appointment calendar.
4. `supabase/migrations/20261119000400_patient_health_documents.sql`
   - Private health-document metadata and private Storage bucket with per-user folder policies.
5. `supabase/migrations/20261119000500_patient_health_log_updates.sql`
   - Grants authenticated patients the database permission needed to edit their own blood-pressure and symptom entries; RLS continues to constrain ownership.
6. `supabase/migrations/20261119000600_patient_only_health_log_policies.sql`
   - Restricts blood-pressure and symptom log policies to patient accounts as well as row ownership.

Also apply any earlier identity and feedback foundation migrations already present in `supabase/migrations` before these files. Check the directory and use the complete timestamp order. If a migration has already been applied, do not rerun it manually without first checking the schema and migration history.

After applying, confirm in **Table Editor** that the expected tables exist and RLS is enabled. In **Storage**, confirm `patient-health-records` exists and is private. Do not make this bucket public.

## 5. Validate before inviting patients

Before real patient onboarding:
- Confirm the deployed app uses the correct Supabase project and browser-safe environment variables.
- Test signup, email confirmation, login, logout, password recovery and session expiry using designated internal accounts.
- Test two separate patient accounts and prove neither can read, edit, delete or download the other's profile, logs, appointments or documents.
- Test anonymous access is denied for all private records and Storage objects.
- Verify document upload, signed access, deletion and failure cleanup.
- Verify patient data export and deletion workflows before promising either capability.
- Complete the Nigeria Data Protection Act / NDPC review, privacy notices, consent, retention, cross-border transfer assessment, incident response and backup/restore checks.
- Obtain qualified Nigerian maternal-health clinical review of public health education and emergency guidance.

Do not enable clinician access to patient records. That requires verified professional identity, explicit patient consent, revocation, scope enforcement and audit logging, all tested independently.

## 6. Deployment status

The GitHub repository is the source of truth. Vercel deployment has previously been blocked by the project's build-usage quota. Development and CI can continue while that is resolved; do not split the production project across accounts simply to bypass the quota. After a successful production deployment, run authenticated smoke tests before opening public registration.

**Important:** Creating the Supabase project alone does not activate the application database. No live database connection or successful production deployment is claimed until it has been tested.

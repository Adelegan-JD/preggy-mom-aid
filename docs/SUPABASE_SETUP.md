# Supabase setup — Preggy Mom Aid

This guide prepares the Supabase project without opening patient registration or collecting clinical information.

## 1. Confirm the project

In the Supabase Dashboard, open the project you created and note:
- Project name and project reference
- Selected region
- Project URL

Record the region for the privacy and cross-border data-transfer assessment. Do not send database passwords, secret API keys, service-role keys, access tokens or recovery codes in chat or commit them to Git.

## 2. Authentication settings — keep onboarding closed for now

In **Authentication → Providers → Email**:
- Email/password can remain available as a provider for later testing.
- Require email confirmation before any account is considered verified.
- Keep public sign-ups disabled until the application-side release gates are complete.
- Keep anonymous sign-ins disabled.
- Do not enable phone sign-in until an SMS provider is configured and delivery to Nigerian networks is tested.

In **Authentication → URL Configuration**:
- Set the Site URL to `https://preggy-mom-aid.vercel.app`.
- Add only callback URLs confirmed by the application code. Do not guess paths or use broad wildcard redirect URLs.

Do not create real patient or clinician accounts during this foundation phase.

## 3. Obtain the browser-safe API values

In **Project Settings → API Keys** (and the project's API settings):
- Copy the Project URL.
- Copy the publishable key (normally starts with `sb_publishable_`).

These are the only Supabase values intended for the current browser client configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never put a secret key, legacy service-role key, database password or access token in a `NEXT_PUBLIC_*` variable. The publishable key is not a substitute for database security: RLS must enforce access.

The repository's `.env.example` contains placeholders only. Do not replace those placeholders with live credentials in GitHub.

## 4. Current database migrations

The repository currently contains these migrations in timestamp order:

1. `supabase/migrations/202611170001_identity_foundation.sql`
   - Creates a minimal `public.profiles` table linked to `auth.users`.
   - Enables RLS.
   - Allows a signed-in user to read only their own profile and update only their own display name.
   - Creates a profile row when an Auth user is created.
   - Does not define a user-editable role or professional privileges.

2. `supabase/migrations/202611180001_patient_tester_feedback.sql`
   - Creates a non-clinical tester-feedback table and a separately granted reviewer list.
   - Testers can submit and read only their own feedback.
   - Reviewer access requires an explicit database-owner grant.
   - It does not create patient records, clinical data or clinician access.

Review the SQL files from the merged `master` branch before applying them. In **SQL Editor → New query**, paste and run each complete migration once, in the order above. Then confirm both tables exist and RLS is enabled in **Table Editor**.

Do not manually create extra tables or policies in the Dashboard. Future schema changes should be committed as migrations and reviewed before application.

## 5. Do not connect production credentials yet

Do not add the project URL or publishable key to Vercel until the app-side authentication gates and callback flow have been checked. Once approved, add the two values above in Vercel → Project → Settings → Environment Variables for the intended environments, then redeploy.

Do not enable:
- patient self-registration or collection of pregnancy/health details;
- professional self-registration or self-assigned roles;
- clinician access to patient data;
- blood-pressure, symptom, appointment or care-note tables;
- public storage for identity or professional credential evidence.

## 6. Requirements before real-user onboarding

Before patient or professional onboarding is enabled, the project needs:
- Nigeria Data Protection Act / NDPC review, a Data Protection Impact Assessment, privacy notices and consent workflows;
- review of Supabase region, processor terms, international transfers, retention, backups and deletion;
- tested email delivery, secure recovery, abuse controls and MFA for professional/internal accounts;
- a restricted internal professional-verification workflow using the appropriate Nigerian regulator as the primary source;
- RLS tests covering anonymous visitors, two separate patients, pending professionals, verified but unassigned professionals, authorised professionals and revoked relationships;
- private evidence storage, audit logging, backup/restore tests and an incident-response process;
- clinical approval of maternal-health content and escalation guidance by qualified Nigerian maternal-health clinicians.

**Current state:** creating the Supabase project does not connect it to the application. No live connection has been verified here. Do not enter patient or clinician data during this phase.

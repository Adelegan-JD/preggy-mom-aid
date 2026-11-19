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

## 4. Patient database activation status

The connected Supabase project `segggjguspycgdwtgaraq` has now been activated directly. The consolidated patient schema is applied and recorded in Supabase migration history as `20261119121940_patient_database_activation`. The matching baseline migration is committed in `supabase/migrations/20261119121940_patient_database_activation.sql`.

**Do not paste or run `ACTIVATE_PATIENT_DATABASE.sql` again on this project.** The SQL Editor is a query workspace and does not automatically show files stored in GitHub. Its blank state is not a database error.

Verified on the live project:
- Patient account/profile and health-record tables exist.
- RLS is enabled on all 11 application tables.
- The `patient-health-records` Storage bucket exists and is private.
- The existing Auth user has a corresponding profile.
- The patient schema migration is recorded.
- Public execution of the profile trigger and the project's RLS event-trigger function has been revoked.

For a **new empty Supabase project**, use the single consolidated activation script once, or link the repository with the Supabase CLI and apply the committed baseline migration. Never apply the baseline on top of an already-populated schema without first comparing migration history and schema state.


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

**Important:** The database schema is now active and verified at the database level. Auth email delivery, full patient-side end-to-end testing, and production deployment still require separate validation.

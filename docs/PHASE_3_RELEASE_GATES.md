# Phase 3 patient release gates

## Implemented in repository
- Patient-owned records, appointments, private document storage and account settings.
- Role/verification field update restriction.
- Private notification delivery ledger with no client grants.
- Authenticated patient account-deletion Edge Function.
- Opt-in 24-hour appointment reminder Edge Function with a delivery ledger.
- Patient deletion is explicit: the patient submits a request, then types DELETE to confirm permanent removal.
- Reminder email contains no symptom, diagnosis, BP or appointment title/notes; it uses a generic message and Africa/Lagos time display.

## Required Supabase deployment configuration
Deploy the two functions from `supabase/functions`.
- `process-account-deletion`: JWT verification enabled. Uses platform-provided Supabase URL, publishable and secret keys (or legacy anon/service-role keys).
- `process-patient-reminders`: gateway JWT verification is disabled because the scheduled caller uses a Supabase secret API key in the `apikey` header; the function compares it with the Edge Function's `SUPABASE_SECRET_KEYS.default` value.
- A Supabase `pg_cron` job is active every 15 minutes and invokes the function through `pg_net`. It sends no request until the required Vault secret exists.
- In Supabase Dashboard > Database > Vault, add a secret named `supabase_secret_key` with the project's Supabase **secret API key** (Settings > API Keys). Do not use a publishable key. This allows the database scheduler to authenticate without exposing the key in SQL history or client code.
- Add `RESEND_API_KEY` and `REMINDER_FROM_EMAIL` as Edge Function secrets. Verify the sender domain and SPF/DKIM with Resend before enabling reminders for patients.

## Production gates not executable from source alone
- Configure and verify Vercel production environment variables and deploy a production build.
- Verify Supabase Auth Site URL, allowed redirect URLs and SMTP/email deliverability.
- Use two designated synthetic accounts to test signup, confirmation, recovery, all patient CRUD, Storage isolation, and cross-account denial.
- Manually validate keyboard, screen-reader, 200% zoom, 320px reflow, reduced motion, and contrast.
- Obtain qualified Nigerian clinical review of educational and emergency content and privacy/legal review against NDPA/NDPC obligations before public onboarding.
- Leaked-password protection remains a deferred plan-dependent Auth setting; record and recheck after plan upgrade.
- Do not use real patient data for test runs or public onboarding until all release gates are signed off.

## Email provider and scheduling setup

The reminder function and 15-minute Supabase cron job are deployed. Delivery remains disabled until the owner:
1. Adds the Supabase secret API key to Database > Vault under the exact name `supabase_secret_key`.
2. Adds `RESEND_API_KEY` and `REMINDER_FROM_EMAIL` under Edge Functions > Secrets.
3. Verifies the sender domain with Resend (including SPF/DKIM).

The deployed account-deletion function requires a valid signed-in patient JWT and a prior patient deletion request. It removes files from the private patient bucket before deleting the Auth user (which cascades the patient's database records). If file cleanup fails, it stops without deleting the account.

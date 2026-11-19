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
- `process-patient-reminders`: JWT verification disabled only because it authenticates a private `x-cron-secret` itself. Set `CRON_SECRET`, `RESEND_API_KEY`, and `REMINDER_FROM_EMAIL` as Edge Function secrets. Never commit these values.
- Schedule a POST to `/functions/v1/process-patient-reminders` every 15 minutes with `x-cron-secret`. Use a protected scheduler/worker. Do not expose CRON_SECRET to the browser.
- Configure Resend sender-domain verification and SPF/DKIM before enabling reminders for users.

## Production gates not executable from source alone
- Configure and verify Vercel production environment variables and deploy a production build.
- Verify Supabase Auth Site URL, allowed redirect URLs and SMTP/email deliverability.
- Use two designated synthetic accounts to test signup, confirmation, recovery, all patient CRUD, Storage isolation, and cross-account denial.
- Manually validate keyboard, screen-reader, 200% zoom, 320px reflow, reduced motion, and contrast.
- Obtain qualified Nigerian clinical review of educational and emergency content and privacy/legal review against NDPA/NDPC obligations before public onboarding.
- Leaked-password protection remains a deferred plan-dependent Auth setting; record and recheck after plan upgrade.
- Do not use real patient data for test runs or public onboarding until all release gates are signed off.

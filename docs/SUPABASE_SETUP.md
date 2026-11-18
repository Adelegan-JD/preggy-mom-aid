# Supabase setup — Preggy Mom Aid

This branch adds a minimal Supabase client and identity schema foundation. It does **not** enable patient registration, professional onboarding, or collection of health information.

## 1. Configure environment variables

Copy `.env.example` to `.env.local` for local development and add the project's **publishable** key from Supabase → Project Settings → API Keys.

In Vercel, add the same two variables to the intended deployment environments:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The publishable key is designed for client use when Row Level Security is correctly configured. Never put a secret key, legacy service-role key, database password, or access token in a `NEXT_PUBLIC_*` variable or commit one to Git.

## 2. Apply the identity migration

In the Supabase SQL Editor, review and run:

`supabase/migrations/202611170001_identity_foundation.sql`

It creates only a minimal `profiles` table linked to Supabase Auth. Users can read their own profile and update only their own `full_name`. It does not introduce a user-editable role, professional verification, patient records, or clinical tables.

## 3. Keep account creation closed

Keep public sign-ups disabled in Supabase Auth and do not expose registration routes until the privacy, security, clinical, support, and operational release gates have been signed off. The presence of a profile table is not permission to collect patient data.

## 4. Before patient data is introduced

- Complete a Nigeria Data Protection Act review and a Data Protection Impact Assessment.
- Confirm Supabase region, processor terms, cross-border transfer basis, retention, backup and deletion arrangements.
- Add server-side authorization and tested RLS policies before each new table or storage bucket.
- Add professional credential review with restricted evidence storage; never accept self-assigned clinician privileges.
- Test isolation between two patients, pending professionals, approved but unassigned professionals, and revoked care relationships.
- Obtain Nigerian maternal-health clinical approval for all clinical content and escalation behaviour.

## Current status

No migration has been applied by this code change, no Supabase connection has been verified, and no patient or clinician data is stored. The project owner must apply the migration and configure the publishable key.


## 5. Patient tester account and feedback release

Apply migrations in timestamp order in Supabase SQL Editor:

1. `supabase/migrations/202611170001_identity_foundation.sql`
2. `supabase/migrations/202611180001_patient_tester_feedback.sql`

Review each SQL file before running it. The second migration creates a non-clinical feedback table with row-level security. Testers can submit and read only their own feedback. A project reviewer can read all feedback only after an owner manually grants that reviewer access in the SQL Editor.

Before opening registration:

- Confirm the project URL and publishable key are set in Vercel for the Production environment (and Preview if testing there).
- In Supabase Authentication → URL Configuration, set the production Site URL to `https://preggy-mom-aid.vercel.app` and add `https://preggy-mom-aid.vercel.app/auth/callback` to the allowed redirect URLs. Add the exact Vercel Preview callback URL only if Preview testing is intended.
- Enable email/password sign-in and email confirmation. Set the minimum password length to at least 10 characters.
- Configure an appropriate CAPTCHA / abuse-prevention control and review Auth rate limits before sharing registration publicly.
- Confirm the confirmation-email template uses the Supabase redirect URL and test it with a project-owned email address.
- Keep anonymous access disabled for both tables. Do not create public read policies.
- Do not add a service-role key to Vercel client variables or to the repository.

### Granting the project owner feedback-review access

After the project owner has registered and confirmed their own account, run this statement in the Supabase SQL Editor, replacing the email with the exact project-owner account email:

```sql
insert into public.feedback_reviewers (user_id)
select id from auth.users where lower(email) = lower('OWNER_ACCOUNT_EMAIL')
on conflict (user_id) do nothing;
```

Only grant this to trusted project reviewers. The reviewer table has no client-side insert policy; grants are made by a database owner in the SQL Editor.

### Verification checklist

- Create a new tester account and confirm the email link returns to `/my-care`.
- Sign out, sign back in, and confirm the protected page redirects unauthenticated visitors to `/login`.
- Submit a non-clinical feedback review and confirm it appears in that tester's own session.
- Sign in as a second tester and confirm the first tester's feedback is not visible.
- Confirm a reviewer account can read feedback only after the explicit reviewer grant.
- Check that sign-up, feedback and all account routes work on mobile and desktop.

Do not begin clinical data collection, BP tracking, symptom capture, patient-clinician sharing or professional onboarding in this release. Those require separate privacy, security, data-protection and clinical sign-off.

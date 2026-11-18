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

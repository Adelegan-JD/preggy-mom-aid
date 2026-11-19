# Patient production smoke-test runbook

Use only two designated internal test accounts with synthetic test details. Do not use real patient records or invite the public until every gate passes. Never place passwords, confirmation links, API keys or patient data in GitHub issues or chat.

## Before testing

- Confirm the production deployment is the intended release and uses the intended Supabase project.
- Confirm Supabase email/password sign-up is enabled and email confirmation is required.
- Confirm the Site URL and exact allowed callback URL are correct.
- Confirm the consolidated patient database activation SQL completed successfully.
- Confirm all private tables have RLS enabled and the `patient-health-records` bucket is private.
- Confirm the privacy notice, data retention/deletion process, NDPA/NDPC review and clinical-content approval are complete.

## Account lifecycle

1. Register Patient A using an internal test email and a strong unique password.
2. Confirm the UI says to check email and does not treat an unconfirmed account as signed in.
3. Open the confirmation email and follow the link. Confirm the callback lands on the patient dashboard.
4. Sign out, sign back in, and confirm the patient dashboard opens.
5. Request password recovery, use the email link, set a new password and verify the old password no longer works.
6. Start an email-address change and confirm the new address only becomes active after Supabase confirmation.
7. Sign out and confirm private patient routes redirect to sign-in.

## Patient-owned records

Using Patient A only:
- Save and edit the pregnancy/postpartum profile.
- Create, edit, export and delete a blood-pressure entry.
- Create, edit, export and delete a symptom note.
- Add, edit, complete, cancel, restore and delete an appointment.
- Upload a PDF/JPG/PNG document, view/download it through authenticated access, and delete it.
- Export account data and verify the JSON contains Patient A's records and only document metadata.
- Save notification preferences and confirm they persist after sign-out/sign-in. Do not expect email delivery until a provider and scheduler are configured.
- Submit one account-deletion request and confirm it is visible as pending. Confirm the account remains active until the separate permanent-deletion confirmation.
- Using Patient B only, select **Confirm permanent deletion**, type `DELETE`, and verify the Edge Function removes Patient B's private Storage objects, Auth account and cascading patient records. Do not perform this destructive test on Patient A or a real user.
- After reminder secrets and the sender domain are configured, create a synthetic appointment about 24 hours ahead, enable appointment email reminders, and confirm one generic reminder is delivered and a single `sent` delivery-ledger row is recorded. Confirm the email contains no BP readings, symptoms, diagnoses, appointment notes or other clinical details.

## Isolation and denial tests

1. Register Patient B with a separate email and password.
2. Confirm Patient B sees an empty dashboard and cannot see Patient A's profile, readings, symptoms, appointments, documents or preferences.
3. Attempt cross-account reads, updates and deletes using Patient B's authenticated session; each must return no Patient A data or a permission error.
4. Attempt to download Patient A's Storage object as Patient B; access must be denied.
5. Confirm anonymous sessions cannot read or mutate any private patient tables or Storage objects.
6. Confirm a professional account cannot access patient routes or patient records, even when it knows a record UUID or Storage path.
7. Confirm a patient cannot change their own account role or professional verification status.

## Accessibility and device checks

- Run the repository Playwright/axe checks in CI.
- Manually complete keyboard-only navigation, visible focus, screen-reader labels and announcements, 200% zoom, 320 CSS-pixel reflow, reduced motion and light/dark/high-contrast checks.
- Check the actual patient profile, log, appointment, records and settings routes with an authenticated test session.

## Release decision

Do not open public registration until all account lifecycle, record CRUD, storage isolation, cross-account denial and accessibility checks pass; the deployment is live; and the clinical/privacy approvals are documented. Record pass/fail and a sanitized issue reference for each check. Delete synthetic test accounts and their uploaded test files after validation.

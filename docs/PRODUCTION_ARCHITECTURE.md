# Preggy Mom Aid — Production Architecture

**Status:** Proposed production target; not yet approved for collection of real patient health information. Will be updated in due time.

## 1. Product decisions

- Public website first. Public pages may launch while patient account creation remains disabled behind a server-controlled feature flag.
- Patient and healthcare-professional account types. Professional applications accept doctors, nurses and midwives, with profession-specific evidence and manual verification.
- Hospital directory may display public-source records only when provenance is stored and the listing is visibly labelled **Independently unverified**. A listing is not an endorsement, a confirmation of current services, or emergency routing advice. No invented facilities, contact details, capabilities, ratings or opening hours.
- No seeded patients, sample readings, fictional appointments, fabricated clinician profiles or synthetic health histories in production.

## 2. System shape

```text
Browser / mobile web
        |
        v
Next.js application on Vercel
  | public content and directory (read-only)
  | authenticated server routes / server actions
  | authorization and input validation
  | feature flags and rate limits
        |
        +---- Supabase Auth (email verification; MFA for professionals)
        +---- Supabase PostgreSQL (RLS on every user-data table)
        +---- Supabase private Storage (short-lived signed access)
        +---- audit/security event pipeline
```

Keep the existing Next.js application and Vercel deployment. Introduce Supabase only after a project, region, contractual terms, backup policy, access model and environment separation have been reviewed. Never expose the service-role key to browser code.

## 3. Identity, roles and access

- Public visitor: read approved public pages and directory entries only.
- Patient: self-register only when `PATIENT_REGISTRATION_ENABLED` is enabled; owns their profile and health records; can grant, review and revoke clinician access.
- Healthcare professional: applies as doctor, nurse or midwife; starts in `pending_verification`; cannot view patient data until an authorised reviewer verifies credentials and a patient separately authorises a care relationship.
- Internal verifier: no public sign-up role. Access is provisioned out-of-band to named staff, protected with MFA, least privilege and audit logging. Separate credential review from clinical access where practical.
- No user-editable role field, client-supplied role claim, or self-service privilege escalation.
- A clinician can access only the minimum records for patients with an active, explicit relationship. Revocation takes effect immediately for subsequent requests.

## 4. Core data model

Use UUID primary keys, UTC timestamps, explicit status enums, created/updated metadata, and soft deletion only where legally and operationally justified.

| Table                          | Purpose / key fields                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `profiles`                   | `user_id` (Auth FK), account type, display name, locale, contact preferences; no clinical role in user-editable fields    |
| `patient_profiles`           | patient-specific details, state/LGA, emergency contact only where necessary and consented                                   |
| `professional_applications`  | profession, registration body/number, evidence storage key, status, reviewer, decision timestamps                           |
| `professional_verifications` | verified profession, evidence references, verification source, verifier and expiry/recheck date                             |
| `consent_records`            | user, purpose, notice version, granted/revoked timestamps, capture method                                                   |
| `care_relationships`         | patient, professional, requested/active/revoked status, patient authorisation and scope                                     |
| `pregnancy_episodes`         | pregnancy/postpartum episode dates and patient-entered context                                                              |
| `blood_pressure_readings`    | patient, systolic, diastolic, pulse optional, measured-at, entered-at, source/device optional, note optional                |
| `symptom_reports`            | patient, structured answers, free text optional, reported-at; no automatic diagnosis field                                  |
| `appointments`               | patient, professional/facility optional, time, status, provenance; only real user-created or confirmed appointments         |
| `care_notes`                 | professional-authored note, patient, author, relationship, timestamps and visibility                                        |
| `facilities`                 | name, address, source URL/reference, source checked date, verification status, claim status, public visibility              |
| `audit_events`               | actor, action, resource type/id, outcome, timestamp, request correlation; exclude secrets and unnecessary clinical payloads |

Add indexes for patient/time queries and relationship lookups. Apply retention, correction, export and deletion policies only after legal review. Do not store uploaded credential evidence in a public bucket.

## 5. Authorization and privacy controls

- Enable and test PostgreSQL Row Level Security on every table containing personal or health information. Default deny; add explicit policies for patient ownership, active clinician relationship and narrowly scoped internal verification.
- Keep privileged operations in server-side code using validated sessions and explicit authorization checks. The service-role credential is server-only and used only where unavoidable.
- Private storage buckets; short-lived signed URLs; content-type/size limits; malware scanning where uploads are enabled.
- Email verification for all accounts; MFA required for professional and internal accounts; secure recovery and session revocation.
- Rate limiting, CSRF protections appropriate to the auth pattern, secure headers, input validation, output encoding, dependency scanning and secret rotation.
- Minimise data collected; separate identity/contact details from clinical records where practical. Encrypt transport and provider-managed data at rest; document key/backup controls.
- Maintain versioned privacy notice and consent records, access/export/correction workflows, breach response, retention schedule, processor agreements and a Data Protection Impact Assessment before real health data collection.
- Select hosting/database region only after assessing Nigerian Data Protection Act 2023 and NDPC requirements, cross-border transfer conditions, vendor terms and operational needs with qualified counsel/DPO.

## 6. Clinical safety boundary

- The app is not a diagnostic service, emergency dispatch service or substitute for maternity care.
- Do not release symptom scoring, blood-pressure escalation, medication advice or treatment recommendations until the content, thresholds, wording, workflows and governance have been approved by Nigerian obstetric clinicians and tested with intended users.
- Until then, public educational material must be source-attributed, dated, clinically reviewed and explicit about when users should seek in-person care. Emergency guidance must not depend on app availability or notifications.
- No AI chatbot for personal diagnosis, triage or treatment in the first production release. Any later assistant is limited to approved educational sources, with safety evaluation, monitoring and clear boundaries.

## 7. Public facility directory policy

- Store source, date accessed, exact fields supported by source, and a visible `unverified` state.
- Do not infer maternity capability, high-risk pregnancy services, emergency capacity, phone numbers or operating hours from a facility name alone.
- Provide a clear explanation that records are independently unverified and users must contact facilities/official services directly to confirm current services before travelling.
- Add a correction/claim process and a separate verified state only after direct confirmation using a documented verification procedure. Verification expiry/recheck dates are required.
- If reliable source/provenance is unavailable, do not publish the entry.

## 8. Environment and release separation

- Separate local, preview/staging and production Supabase projects and credentials.
- Production starts with patient registration disabled, professional applications either disabled or pending-only, and no clinical record-writing UI enabled until the relevant gates pass.
- Use migrations committed to Git; never edit production schema manually as the normal workflow.
- Backups, restore drills, monitoring, error reporting and security alerts must be configured before sensitive data is accepted.
- Keep secrets in Vercel environment settings; never commit `.env` files or production data.

## 9. Go-live gates

1. Nigerian privacy/legal review, DPIA, notices, consent, processor and transfer review.
2. Clinician-approved educational and emergency content; documented clinical governance.
3. Auth, MFA, RLS, storage, audit, backup/restore and incident response verified by tests and independent security review.
4. Directory provenance and unverified/verified states tested; no fictional records.
5. Accessibility, usability, low-bandwidth/mobile, abuse and failure-mode testing.
6. Staged rollout with monitoring, support ownership and a rollback plan.

A successful Vercel deployment alone does not satisfy these gates or make the platform ready for patient care.

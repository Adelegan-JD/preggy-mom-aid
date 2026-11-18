# Patient Experience Completion Plan

## Objective
Complete the patient-facing Preggy Mom Aid experience before beginning the healthcare-professional dashboard. The patient experience must use real authenticated accounts and real user-entered data. No fabricated patients, measurements, appointments, facilities, clinicians, or clinical outcomes.

## Patient product scope

### A. Account and personal profile
- Sign up, email confirmation, sign in, sign out, password reset, and session recovery.
- Patient profile: name, contact details, preferred language, date of birth (optional), location at an appropriate level, emergency contact (optional).
- Pregnancy profile: pregnancy stage/status, estimated due date or birth date, number of pregnancies (optional), care facility/provider fields only when supplied by the patient.
- Editable profile, privacy controls, account deletion/export request workflow.

### B. Patient home and pregnancy journey
- Role-aware patient dashboard with a useful overview and no placeholder sample data.
- Pregnancy and postpartum journey views driven by the patient's own dates/status.
- Clear education and appointment reminders; no fabricated gestational calculations when inputs are absent.
- Accessible, responsive, reduced-motion-friendly design.

### C. Health logs
- Blood pressure log with date/time, optional pulse and notes, edit/delete, history, export, and safe input validation.
- Symptom and wellbeing journal with date/time, tags, free-text notes, edit/delete and history.
- No automated diagnosis, risk score, treatment recommendation or unreviewed clinical threshold logic.
- Clear urgent-care guidance reviewed by qualified Nigerian maternal-health clinicians before public clinical use.

### D. Appointments and reminders
- Patient-created antenatal/postnatal appointments, edit/cancel, notes and reminders.
- Timezone-safe scheduling and notification preferences.
- No appointment should appear unless the patient creates it or a future consented provider workflow creates it.

### E. Health documents
- Private uploads for patient-owned records, metadata, preview/download, delete, and export.
- Supabase Storage private bucket, per-user object paths, strict storage RLS, file type/size limits, and signed access.
- No public file URLs or practitioner access without explicit patient consent.

### F. Care team and consent
- Patient can search a real, verified practitioner directory only after a verification process exists.
- Patient-initiated connection, explicit scopes, consent receipt, expiry/revocation, and audit history.
- Until practitioner verification and consent enforcement are complete, patient records remain private to the patient.

### G. Support and communication
- Patient notifications and reminders with preferences and delivery status.
- Secure messaging only after authentication, authorization, retention, abuse reporting and audit controls are designed.
- Health assistant limited to reviewed educational content and clear escalation to real clinical/emergency services; no diagnosis or automated triage.

### H. Hospital directory and emergency information
- Directory records must come from verifiable sources and be labelled by verification status.
- No invented facilities, phone numbers, opening hours, services or emergency availability.
- Emergency guidance must be clinically reviewed and localized before activation.

### I. Feedback and accessibility
- Ordinary product feedback remains available to signed-in users.
- Keyboard, screen-reader, contrast, reduced-motion and mobile testing for all patient flows.

## Delivery sequence
1. Foundation and migration safety: resolve review findings, ensure safe migrations and role/account behavior.
2. Patient profile and pregnancy profile: real editable data and patient dashboard personalization.
3. Blood pressure and symptom journal: robust CRUD, history, export and privacy.
4. Appointments and reminder preferences.
5. Private health document storage.
6. Patient privacy, data export/deletion workflows and account recovery.
7. Patient-facing care-team consent UX (without enabling provider data access until provider verification and RLS are complete).
8. Patient education, directory and emergency content: source validation and clinical review gates.
9. End-to-end, accessibility, RLS, storage, security and production-readiness validation.

## Production readiness gates
- Migrations reviewed and successfully applied to the intended Supabase project.
- RLS tests prove one patient cannot read or modify another patient's data.
- Storage tests prove private objects cannot be accessed cross-account.
- Signup, email confirmation, login, password reset, logout and session expiry verified.
- All patient workflows tested on mobile and desktop with keyboard and screen-reader checks.
- Clinical copy and escalation pathways signed off by qualified Nigerian maternal-health reviewers.
- No "in development" feature is presented as active; unavailable features are either completed or clearly withheld from launch.
- Vercel production deployment and post-deployment smoke tests pass.

## Explicit exclusions until separately approved
- No automatic diagnosis, triage, BP interpretation, treatment or risk scoring.
- No clinician access to patient records until practitioner verification, patient consent, revocation and audit logging are all implemented and tested.
- No fictional seed data in production.

# Preggy Mom Aid

Preggy Mom Aid is a public-first maternal health support platform focused on clear, responsible information for women affected by, or at risk of, pre-eclampsia/eclampsia.

## Product

The application is being built for real patient accounts and real user-entered information. Patient capabilities include account access, a personal profile and pregnancy/postpartum journey, private blood-pressure and symptom logs, a personal appointment calendar, private health-document storage, learning resources and product feedback.

Patient records are private to the signed-in patient. No practitioner access is enabled by the patient foundation. Any future care-team connection must require verified professional identity, explicit patient consent, revocation and audited access controls.

The patient experience must not display fabricated identities, clinical readings, appointments, clinicians, facilities or outcomes. The hospital directory remains unavailable until its listings and service details have verifiable sources and clear verification labels.

## Current implementation status

The patient foundation is in the repository, but a merged code change is not the same as a live, production-ready service. The Supabase migrations, authentication configuration, private storage policies, deployment and end-to-end security checks must be completed and verified before real patients are invited to enter sensitive health information.

See:
- [Patient experience completion plan](docs/PATIENT_EXPERIENCE_COMPLETION_PLAN.md)
- [Production architecture](docs/PRODUCTION_ARCHITECTURE.md)
- [Production implementation plan](docs/PRODUCTION_IMPLEMENTATION_PLAN.md)
- [Supabase setup and launch steps](docs/SUPABASE_SETUP.md)
- [Accessibility and personalisation standard](docs/ACCESSIBILITY_AND_PERSONALISATION_STANDARD.md)

## Real information and clinical safety

Public pages do not contain fictional patient identities, invented clinical readings, fabricated appointments, fake clinician accounts or made-up hospital listings. Publicly sourced facilities must be labelled independently unverified until directly confirmed.

Preggy Mom Aid is not an emergency service and does not diagnose, prescribe, interpret readings or replace professional maternity care. Clinical education, thresholds, symptom guidance and emergency pathways require documented approval by appropriately qualified Nigerian maternal-health clinicians before clinical use. Users with urgent concerns must seek medical assessment rather than wait for an app response.

## Local development

1. Install Node.js 20.9+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open http://localhost:3000.

## Validation

- `npm run typecheck` — TypeScript validation.
- `npm run build` — production build.
- `npx playwright test` — browser and accessibility coverage where configured.

A successful build or deployment does not by itself establish clinical, privacy, regulatory or security readiness.

## Privacy, security and accessibility

Before processing real patient information, complete the applicable Nigeria Data Protection Act / NDPC review, a Data Protection Impact Assessment, privacy notices and consent workflows, region and cross-border transfer review, retention and deletion rules, access-control testing, incident response and backup/restore checks.

The application is being developed toward WCAG 2.2 Level AA. Automated scans must be supplemented by manual keyboard, screen-reader, zoom and assistive-technology testing.

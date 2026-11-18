# Preggy Mom Aid

Preggy Mom Aid is a public-first maternal health support platform focused on clear, responsible information for women affected by, or at risk of, pre-eclampsia/eclampsia.

## Current release

The public website is the current release. It introduces the project, explains the staged approach to care support, provides general introductory health information and describes the facility directory and professional onboarding plans.

The following are intentionally not available yet: patient registration, patient profiles, personal health records, blood-pressure logging, symptom submissions, clinician accounts, appointments, messaging, referrals and emergency-response services.

## Real information only

Public pages do not contain fictional patient identities, invented clinical readings, fabricated appointments, fake clinician accounts or made-up hospital listings. The facility directory remains empty until source information is available. Publicly sourced listings will be marked independently unverified until directly confirmed.

Health information on the site is general introductory education. Detailed clinical content and any future clinical workflows require documented review and approval by appropriately qualified Nigerian maternal-health clinicians.

## Early reviewer guide

People reviewing the current public site should read [the early review guide](docs/TESTER_GUIDE.md). Reviewers must not submit personal or patient health information. The site is not a medical service or emergency service.

## Production architecture and implementation

- [Production architecture](docs/PRODUCTION_ARCHITECTURE.md)
- [Production implementation plan](docs/PRODUCTION_IMPLEMENTATION_PLAN.md)
- [Supabase setup](docs/SUPABASE_SETUP.md)

Target stack: Next.js on Vercel, Supabase Auth and PostgreSQL with row-level security, and private storage. Infrastructure region, vendor terms and data-transfer arrangements require privacy/legal review before sensitive health information is processed.

## Local development

1. Install Node.js 20.9+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open http://localhost:3000.

## Validation

- `npm run typecheck` — TypeScript validation.
- `npm run build` — production build.

A successful build or deployment does not establish clinical, privacy, regulatory or security readiness.

## Clinical, privacy and security boundaries

Preggy Mom Aid is not an emergency service and does not diagnose, prescribe or replace professional maternity care. Any clinical education, thresholds, symptom guidance or decision-support must be approved by appropriately qualified Nigerian maternal-health clinicians before release.

Before collecting real patient information, complete the applicable Nigerian privacy/legal review, Data Protection Impact Assessment, consent and notice workflows, security review, access-control testing, incident response and backup/restore checks.

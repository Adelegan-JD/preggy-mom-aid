# Preggy Mom Aid

A public-first maternal health support platform being developed for women affected by, or at risk of, pre-eclampsia/eclampsia.

## Current release status

The current branch replaces the former patient-demo dashboard with a public information site. Patient registration, professional accounts, patient health records, clinical decision-support and appointment workflows are **not open or implemented as production services**.

The public site intentionally contains:
- Product mission and staged platform approach.
- A facility-directory explanation with no invented facility entries.
- A professional onboarding information page; applications are not yet open.
- A clear launch-status notice and medical/emergency disclaimer.

## No demo health data

Production-facing pages must not contain fictional patient identities, seeded blood-pressure readings, fabricated symptom histories, demo appointments, fake clinician accounts, synthetic hospital entries or scripted chatbot answers presented as live services.

Development fixtures, if used for visual testing, must be isolated from production builds and clearly labelled. Never enter real patient health information into a prototype or an environment that has not passed the privacy and security release gates.

## Planned production architecture

See:
- [Production architecture](docs/PRODUCTION_ARCHITECTURE.md)
- [Production implementation plan](docs/PRODUCTION_IMPLEMENTATION_PLAN.md)

Target stack: Next.js on Vercel, Supabase Auth and PostgreSQL with row-level security, and private storage. Infrastructure, region, contractual terms and data-transfer arrangements must be reviewed before processing sensitive health information.

## Local development

1. Install Node.js 20.9+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open http://localhost:3000.

## Validation

- `npm run typecheck` — TypeScript validation.
- `npm run build` — production build.

A successful build or deployment does not establish clinical, privacy, regulatory or security readiness.

## Clinical and privacy boundaries

Preggy Mom Aid is not an emergency service and does not diagnose, prescribe or replace professional maternity care. Any clinical education, thresholds, symptom guidance or decision-support must be approved by appropriately qualified Nigerian maternal-health clinicians before release.

Before collecting real patient information, complete the applicable Nigerian privacy/legal review, Data Protection Impact Assessment, consent and notice workflows, security review, access-control testing, incident response and backup/restore checks.

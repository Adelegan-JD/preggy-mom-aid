# Preggy Mom Aid — Production Implementation Plan

This plan replaces the prototype's browser-only demo behaviour with a staged, auditable product. It is ordered so that the public website can be released before patient health-data collection.

## Phase 0 — Stabilise and remove demo behaviour

- Inventory every route, component, form, localStorage key, sample record, static answer and clinical prompt.
- Remove seeded patient identity, BP readings, symptom history, appointment records and fictional facility cards from production builds.
- Remove demo chat responses, unreviewed symptom scoring and threshold-based clinical instructions from production paths.
- Replace demo badges and copy with truthful product status and clear non-emergency/non-diagnostic boundaries.
- Add automated checks that fail if known demo names, seed arrays, `pma-demo-v1`, or demo facility fixtures are included in production.
- Keep a separate development-only fixture mechanism if needed for visual testing; never bundle it into production or use it as live patient data.

**Acceptance:** a fresh production session shows no patient record, no sample health data, no invented appointments and no fictional facilities.

## Phase 1 — Public website launch

- Deliver responsive public home, about, how-it-works, reviewed education, privacy, terms, contact and professional/hospital partnership enquiry pages.
- Publish only clinically reviewed, attributed and dated educational content.
- Publish directory entries only when public source provenance is recorded; label every unverified listing clearly and avoid unsupported claims.
- Add accessible forms with spam protection, data minimisation and a documented inbox owner. Do not collect symptoms or detailed medical histories through public enquiry forms.
- Add analytics only after privacy review, with no health data or sensitive URL/query-string leakage.
- Keep patient registration and health-record creation disabled by server-side feature flags.

**Acceptance:** public pages are usable on mobile/low bandwidth, content has named clinical review ownership, privacy/legal pages are approved, and no sensitive data can be submitted.

## Phase 2 — Secure identity and professional verification foundation

- Create separate Supabase projects for staging and production; choose region/vendor terms after privacy and transfer review.
- Add migrations for profiles, professional applications, verification records, consent, relationships and audit events.
- Integrate Supabase Auth with email verification, secure recovery, MFA for professionals/internal reviewers and server-side session validation.
- Implement patient and professional onboarding with server-controlled account types; professional statuses: `pending_verification`, `approved`, `rejected`, `suspended`, `expired`.
- Build internal, non-public credential review workflow for doctors, nurses and midwives; store evidence privately and restrict reviewer access.
- Add comprehensive RLS policies and tests for anonymous, patient A, patient B, unverified professional, verified-but-unassigned professional and authorised professional.

**Acceptance:** automated tests prove no cross-patient access, no access for pending professionals, no role escalation and immediate access removal after relationship revocation.

## Phase 3 — Patient-authorised care records

- Add pregnancy/postpartum episodes, BP readings, symptom reports, appointments and care notes with audit history.
- Validate input on the server; preserve measured time and entry time separately; record units and optional source/device details.
- Implement patient-controlled clinician invitations/approval, scopes, expiry/revocation and access history.
- Add patient data export/correction and account closure workflows subject to approved retention/legal rules.
- Add secure notification preferences; do not send sensitive clinical details in email/SMS/push content.

**Acceptance:** users can enter and retrieve only their own records; assigned clinicians see only authorised patients and permitted fields; all sensitive access is auditable.

## Phase 4 — Clinically governed functionality

- Convene Nigerian obstetric clinical reviewers and document content owner, approval date, sources, version and review cycle.
- Review symptom questions, BP thresholds, escalation wording, postpartum guidance and emergency instructions before enabling any decision-support workflow.
- Run hazard analysis and usability testing with patients and clinicians; test delayed, duplicate, missing, malformed and contradictory data, offline states and notification failures.
- Release only approved educational and monitoring workflows. Do not represent automated prompts as diagnosis or emergency response.

**Acceptance:** signed clinical approval, safety case/hazard log, tested escalation ownership and documented incident process.

## Phase 5 — Directory verification and partnerships

- Build a source/provenance ingestion workflow for public-source facility records.
- Publish only supported fields and show `Independently unverified` status prominently until direct verification.
- Add facility claim/correction and direct verification workflows, reviewer identity, evidence, verification date and recheck/expiry.
- Create hospital partnership onboarding and facility account permissions only after separate organisational verification.

**Acceptance:** no fabricated entries; every published field has provenance; users can distinguish unverified from directly verified facilities.

## Phase 6 — Production hardening and staged opening

- Complete DPIA, privacy/legal review, processor contracts, transfer assessment, incident/breach response and retention schedule.
- Complete independent penetration/security review, dependency and secret scans, RLS regression suite, backup restore drill and disaster-recovery runbook.
- Add observability, uptime/error alerts, audit monitoring, rate limits, abuse reporting and support escalation ownership.
- Perform accessibility (WCAG-oriented), mobile, low-bandwidth and real-device testing.
- Enable patient registration for a controlled cohort first; monitor and fix issues before broad public onboarding.
- Maintain rollback, feature-flag shutdown and user communication plans.

**Acceptance:** signed release checklist from engineering, security/privacy owner and clinical owner; support and incident response operational.

## Immediate engineering sequence

1. Review current `app/page.tsx` and styles; split the single large client component into public pages and isolated authenticated feature areas.
2. Remove the localStorage persistence layer and all seeded/demo records from production code.
3. Add schema migrations and generated database types; establish staging/production environments.
4. Implement auth and account-state guards before any health-record UI.
5. Implement and test RLS before connecting patient-facing forms to the database.
6. Add audited patient-authorised records and professional verification.
7. Complete clinical, privacy, security and operational gates before enabling real patient onboarding.

## Current repository findings

The public homepage and Learning Centre are now the production-facing public experience. The former patient dashboard and all known seeded records were removed from the homepage. The obsolete dashboard styling was also removed. The Learning Centre provides source-linked introductory drafts, a non-diagnostic care-conversation diagram and an urgent-warning panel; its content is explicitly marked as awaiting Nigerian clinical review. Patient identity, clinical records, professional applications and clinician access remain unimplemented and closed. The next engineering phase is secure identity and professional verification, beginning with a separate staging environment, reviewed migrations, server-side authentication and automated row-level-security tests. Do not enable patient health-data collection until privacy, security, clinical and operational release gates are signed off.

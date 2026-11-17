# Preggy Mom Aid

A mobile-first maternal health support prototype for people at risk of, living with, or recovering from pre-eclampsia/eclampsia.

## Run locally
1. Install Node.js 20.9+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open http://localhost:3000.

## Current prototype scope
- Local demo profile and seeded fictional data (browser localStorage).
- BP logging, history, trend chart and threshold prompts.
- Symptom reporting with deterministic escalation rules.
- Educational assistant with curated demo answers (not a diagnostic AI).
- Emergency information, user-supplied emergency contact calling, and print-friendly health summary.
- Hospital directory containing clearly labelled illustrative demo entries only.
- Appointment creation and reminder list.
- Educational library and profile editing.

## Important limitations
This is a usability prototype, not a certified medical device or clinical decision-support system. It does not diagnose, prescribe, contact emergency services, send SMS, or verify facilities. Demo facility records are fictional placeholders and must not be used to seek care. No real patient health information should be entered. Clinical thresholds and escalation wording require review by a Nigerian obstetric clinician before any real-world pilot.

The app's high BP and symptom prompts are safety-oriented prototype rules, not a diagnosis. Severe symptoms or possible seizure/eclampsia require immediate emergency assessment; do not wait for the app.

## Deploy to Vercel
Import this folder/repository into Vercel, use the Next.js preset, and deploy. No environment variables are required for demo mode. Add Supabase only after configuring authentication, database schema, and row-level security.

## Next production steps
1. Clinical review of all triage content and thresholds.
2. Privacy impact assessment and Nigeria Data Protection Act compliance review.
3. Secure authentication and database persistence with Supabase/PostgreSQL + RLS.
4. Verify hospital records and emergency contacts from authoritative sources.
5. Integrate clinician-reviewed knowledge retrieval and a secure server-side LLM endpoint.
6. Accessibility, security, and clinical safety testing with intended users and clinicians.

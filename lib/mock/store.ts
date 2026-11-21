import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MOCK_PATIENT_ID, MOCK_PROFESSIONAL_ID } from "./mode";
import { runQuery, type QueryResult, type QuerySpec } from "./query";

/** Demo data lives outside the repo, on this computer only. `npm run mock:reset` deletes it. */
export const MOCK_DB_PATH = path.join(os.tmpdir(), "preggy-mom-aid-mock-db.json");

type Tables = Record<string, Record<string, unknown>[]>;

function daysFromNow(days: number, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

/** Synthetic, clearly labelled fixtures. Never real patients, readings or facilities. */
function seed(): Tables {
  const due = new Date(); due.setDate(due.getDate() + 95);
  return {
    profiles: [
      { id: MOCK_PATIENT_ID, full_name: "Demo Patient", account_type: "patient", professional_type: null, verification_status: null, created_at: daysFromNow(-30) },
      { id: MOCK_PROFESSIONAL_ID, full_name: "Demo Midwife", account_type: "professional", professional_type: "midwife", verification_status: "pending", created_at: daysFromNow(-10) },
    ],
    patient_profiles: [
      { id: crypto.randomUUID(), user_id: MOCK_PATIENT_ID, preferred_name: "Demo", phone_number: null, state_or_territory: "Lagos", preferred_language: "en", pregnancy_status: "pregnant", estimated_due_date: due.toISOString().slice(0, 10), birth_date: null },
    ],
    blood_pressure_readings: [
      { id: crypto.randomUUID(), user_id: MOCK_PATIENT_ID, systolic: 118, diastolic: 76, pulse: 82, measured_at: daysFromNow(-1, 8), note: "TEST ONLY sample reading" },
      { id: crypto.randomUUID(), user_id: MOCK_PATIENT_ID, systolic: 121, diastolic: 79, pulse: null, measured_at: daysFromNow(-4, 9), note: null },
      { id: crypto.randomUUID(), user_id: MOCK_PATIENT_ID, systolic: 116, diastolic: 74, pulse: 78, measured_at: daysFromNow(-8, 19), note: null },
    ],
    symptom_reports: [
      { id: crypto.randomUUID(), user_id: MOCK_PATIENT_ID, symptom_tags: ["Headache"], description: "TEST ONLY sample note", occurred_at: daysFromNow(-2, 14) },
    ],
    patient_appointments: [
      { id: crypto.randomUUID(), user_id: MOCK_PATIENT_ID, title: "TEST ONLY antenatal check-up", appointment_type: "antenatal", scheduled_at: daysFromNow(6, 10), location: "Sample clinic (not real)", notes: "Bring blood-pressure log", status: "scheduled" },
      { id: crypto.randomUUID(), user_id: MOCK_PATIENT_ID, title: "TEST ONLY ultrasound scan", appointment_type: "scan", scheduled_at: daysFromNow(-12, 11), location: null, notes: null, status: "completed" },
    ],
    patient_health_documents: [
      { id: crypto.randomUUID(), user_id: MOCK_PATIENT_ID, object_path: `${MOCK_PATIENT_ID}/sample.pdf`, display_name: "TEST-ONLY-scan-result.pdf", mime_type: "application/pdf", file_size_bytes: 248000, document_category: "scan_result", notes: null, created_at: daysFromNow(-12) },
    ],
    patient_notification_preferences: [],
    account_deletion_requests: [],
    professional_applications: [],
    product_feedback: [],
    health_facilities: [],
  };
}

function load(): Tables {
  try { return JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf8")) as Tables; }
  catch { const tables = seed(); save(tables); return tables; }
}

function save(tables: Tables) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(tables, null, 2));
}

export async function executeMockQuery(spec: QuerySpec): Promise<QueryResult> {
  const tables = load();
  const result = runQuery(tables, spec);
  if (spec.action !== "select") save(tables);
  // Return copies so callers cannot mutate the store by reference.
  return JSON.parse(JSON.stringify(result)) as QueryResult;
}

/**
 * Local demo mode (`npm run dev:mock`). Replaces Supabase with a fake backend so
 * the app can be explored without credentials. Hard-disabled in production builds.
 */
export const isMockMode = process.env.NEXT_PUBLIC_PMA_MOCK === "1" && process.env.NODE_ENV !== "production";

export const MOCK_SESSION_COOKIE = "pma-mock-user";
export const MOCK_PATIENT_ID = "00000000-0000-4000-8000-000000000001";
export const MOCK_PROFESSIONAL_ID = "00000000-0000-4000-8000-000000000002";

/** Emails starting with "pro" sign in as the demo professional; anything else as the demo patient. */
export function mockUserIdForEmail(email: string) {
  return email.trim().toLowerCase().startsWith("pro") ? MOCK_PROFESSIONAL_ID : MOCK_PATIENT_ID;
}

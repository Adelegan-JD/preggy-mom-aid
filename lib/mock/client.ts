import { MOCK_PATIENT_ID, MOCK_PROFESSIONAL_ID, mockUserIdForEmail } from "./mode";
import { createQueryBuilder, type Executor } from "./query";

type Session = { get: () => string | undefined; set: (userId: string) => void; clear: () => void };

const ok = <T>(data: T) => Promise.resolve({ data, error: null });

function userFor(id: string | undefined) {
  if (id !== MOCK_PATIENT_ID && id !== MOCK_PROFESSIONAL_ID) return null;
  return { id, email: id === MOCK_PATIENT_ID ? "demo.patient@example.test" : "pro.demo@example.test", identities: [{ id }] };
}

/**
 * Supabase-shaped client for demo mode. Covers the auth, database, storage and
 * functions calls this app makes. Returned as `any` so it can stand in for the
 * real client type at the call sites.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockSupabase(execute: Executor, session: Session): any {
  return {
    from: (table: string) => createQueryBuilder(table, execute),
    auth: {
      getUser: () => ok({ user: userFor(session.get()) }),
      getSession: () => ok({ session: session.get() ? { user: userFor(session.get()) } : null }),
      signInWithPassword: ({ email }: { email: string }) => {
        const id = mockUserIdForEmail(email);
        session.set(id);
        return ok({ user: userFor(id), session: { user: userFor(id) } });
      },
      // Mirrors email-confirmation mode: no session until the link is clicked.
      signUp: () => ok({ user: { id: crypto.randomUUID(), identities: [{ id: "new" }] }, session: null }),
      resend: () => ok({}),
      resetPasswordForEmail: () => ok({}),
      updateUser: () => ok({ user: userFor(session.get()) }),
      exchangeCodeForSession: () => { session.set(MOCK_PATIENT_ID); return ok({ session: { user: userFor(MOCK_PATIENT_ID) } }); },
      signOut: () => { session.clear(); return Promise.resolve({ error: null }); },
    },
    storage: {
      from: () => ({
        upload: () => ok({ path: "demo" }),
        remove: () => ok([]),
        createSignedUrl: () => ok({ signedUrl: "/api/dev-mock?file=preview" }),
      }),
    },
    functions: { invoke: () => ok({ ok: true }) },
  };
}

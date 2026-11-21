import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isMockMode, MOCK_SESSION_COOKIE } from "@/lib/mock/mode";

type ServerClient = ReturnType<typeof createServerClient>;

export async function createClient(): Promise<ServerClient> {
  if (isMockMode) return createDemoClient();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components cannot write cookies. Middleware/actions handle refresh.
        }
      },
    },
  });
}

/** `npm run dev:mock` only: a local fake backend. Never active in production builds. */
async function createDemoClient(): Promise<ServerClient> {
  const [{ createMockSupabase }, { executeMockQuery }] = await Promise.all([import("@/lib/mock/client"), import("@/lib/mock/store")]);
  const cookieStore = await cookies();
  return createMockSupabase(executeMockQuery, {
    get: () => cookieStore.get(MOCK_SESSION_COOKIE)?.value,
    set: (userId: string) => { try { cookieStore.set(MOCK_SESSION_COOKIE, userId, { path: "/", sameSite: "lax" }); } catch { /* read-only in Server Components */ } },
    clear: () => { try { cookieStore.delete(MOCK_SESSION_COOKIE); } catch { /* read-only in Server Components */ } },
  }) as ServerClient;
}

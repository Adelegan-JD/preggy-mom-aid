import { createBrowserClient } from "@supabase/ssr";
import { isMockMode, MOCK_SESSION_COOKIE } from "@/lib/mock/mode";
import { createMockSupabase } from "@/lib/mock/client";
import type { QueryResult, QuerySpec } from "@/lib/mock/query";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (isMockMode) return (browserClient ??= createDemoBrowserClient());

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  browserClient ??= createBrowserClient(url, publishableKey);
  return browserClient;
}

/** `npm run dev:mock` only: browser calls go to the local /api/dev-mock route. */
function createDemoBrowserClient(): ReturnType<typeof createBrowserClient> {
  const readCookie = () => document.cookie.split("; ").find(part => part.startsWith(`${MOCK_SESSION_COOKIE}=`))?.split("=")[1];
  return createMockSupabase(
    async (spec: QuerySpec): Promise<QueryResult> => {
      const response = await fetch("/api/dev-mock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(spec) });
      return response.json() as Promise<QueryResult>;
    },
    {
      get: readCookie,
      set: (userId: string) => { document.cookie = `${MOCK_SESSION_COOKIE}=${userId}; Path=/; SameSite=Lax`; },
      clear: () => { document.cookie = `${MOCK_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`; },
    }
  ) as ReturnType<typeof createBrowserClient>;
}

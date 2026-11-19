import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

  let projectHost: string | null = null;
  try {
    projectHost = supabaseUrl ? new URL(supabaseUrl).host : null;
  } catch {
    projectHost = "invalid-url";
  }

  return NextResponse.json(
    {
      supabaseUrlPresent: Boolean(supabaseUrl),
      supabaseUrlValid: Boolean(projectHost && projectHost !== "invalid-url"),
      publishableKeyPresent: Boolean(publishableKey),
      projectHost,
      checkedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}

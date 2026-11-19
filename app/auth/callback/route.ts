import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/my-care";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_confirmation_code", url.origin));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] Supabase code exchange failed:", error.message);
      return NextResponse.redirect(new URL("/login?error=confirmation_failed", url.origin));
    }

    return NextResponse.redirect(new URL(next, url.origin));
  } catch (error) {
    console.error(
      "[auth/callback] Unexpected callback failure:",
      error instanceof Error ? error.message : "Unknown server error"
    );
    return NextResponse.redirect(new URL("/login?error=callback_unavailable", url.origin));
  }
}

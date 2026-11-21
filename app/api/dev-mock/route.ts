import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/mock/mode";
import type { QuerySpec } from "@/lib/mock/query";

export const dynamic = "force-dynamic";

/** Demo-mode backend for browser calls. Returns 404 unless `npm run dev:mock` is running. */
export async function POST(request: Request) {
  if (!isMockMode) return new NextResponse(null, { status: 404 });
  const { executeMockQuery } = await import("@/lib/mock/store");
  const spec = (await request.json()) as QuerySpec;
  return NextResponse.json(await executeMockQuery(spec));
}

/** Placeholder shown when "opening" a demo health document. */
export async function GET() {
  if (!isMockMode) return new NextResponse(null, { status: 404 });
  return new NextResponse("Demo mode: this is a placeholder for a private health document. No real file is stored.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

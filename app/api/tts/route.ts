import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeLanguage } from "@/lib/i18n/translations";

export const runtime = "nodejs";
const languageCodes = { en: "en", yo: "yo", ha: "ha", ig: "ig", pcm: "pcm" } as const;

export async function POST(request: NextRequest) {
  const apiKey = process.env.YARNGPT_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Speech service is not configured." }, { status: 503 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  let payload: { text?: unknown; language?: unknown };
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof payload.text !== "string" || !payload.text.trim() || payload.text.length > 15000) {
    return NextResponse.json({ error: "Text must contain 1 to 15,000 characters." }, { status: 400 });
  }

  const language = normalizeLanguage(payload.language);
  try {
    const upstream = await fetch("https://api.yarngpt.ai/api/v1/tts", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: payload.text.trim(), target_language: languageCodes[language], output_format: "mp3" }),
      cache: "no-store"
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("YarnGPT TTS request failed", upstream.status, detail.slice(0, 500));
      return NextResponse.json({ error: "Speech generation failed." }, { status: upstream.status === 429 ? 429 : 502 });
    }
    const audio = await upstream.arrayBuffer();
    return new NextResponse(audio, { status: 200, headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("YarnGPT TTS unavailable", error);
    return NextResponse.json({ error: "Speech service unavailable." }, { status: 502 });
  }
}

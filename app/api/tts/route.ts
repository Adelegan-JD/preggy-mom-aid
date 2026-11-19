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
    // YarnGPT's current TTS API is asynchronous for /tts and uses a short-lived
    // ticket for the low-latency /tts/prepare + /tts/stream flow. The patient's
    // translated text is already in the selected language, so do not ask the
    // provider to translate it a second time.
    const prepared = await fetch("https://api.yarngpt.ai/api/v1/tts/prepare", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: payload.text.trim(), output_format: "mp3" }),
      cache: "no-store"
    });
    if (!prepared.ok) {
      const detail = await prepared.text();
      console.error("YarnGPT TTS preparation failed", prepared.status, detail.slice(0, 500));
      return NextResponse.json({ error: "Speech generation failed." }, { status: prepared.status === 429 ? 429 : 502 });
    }
    const ticket = await prepared.json() as { stream_url?: unknown };
    if (typeof ticket.stream_url !== "string" || !ticket.stream_url.startsWith("/api/v1/tts/stream/")) {
      console.error("YarnGPT TTS returned an invalid stream ticket.");
      return NextResponse.json({ error: "Speech service returned an invalid response." }, { status: 502 });
    }
    const streamed = await fetch(new URL(ticket.stream_url, "https://api.yarngpt.ai"), {
      method: "GET",
      cache: "no-store",
      redirect: "follow"
    });
    if (!streamed.ok) {
      const detail = await streamed.text();
      console.error("YarnGPT TTS stream failed", streamed.status, detail.slice(0, 500));
      return NextResponse.json({ error: "Speech generation failed." }, { status: 502 });
    }
    const audio = await streamed.arrayBuffer();
    if (!audio.byteLength) return NextResponse.json({ error: "Speech service returned empty audio." }, { status: 502 });
    return new NextResponse(audio, { status: 200, headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("YarnGPT TTS unavailable", error);
    return NextResponse.json({ error: "Speech service unavailable." }, { status: 502 });
  }
}

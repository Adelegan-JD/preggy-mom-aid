import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeLanguage, type AppLanguage } from "@/lib/i18n/translations";

export const runtime = "nodejs";
const languageCodes: Record<AppLanguage, string> = { en: "en", yo: "yo", ha: "ha", ig: "ig", pcm: "pcm" };
const languageAliases: Record<AppLanguage, string[]> = {
  en: ["en", "english"], yo: ["yo", "yoruba"], ha: ["ha", "hausa"],
  ig: ["ig", "igbo"], pcm: ["pcm", "pidgin", "nigerian pidgin", "naija pidgin"],
};

type YarnVoice = {
  id?: unknown; name?: unknown; voice_id?: unknown; voice?: unknown; default?: unknown;
  languages?: unknown; language?: unknown; language_codes?: unknown; supported_languages?: unknown; supportedLanguages?: unknown;
};

function voiceList(payload: unknown): YarnVoice[] {
  if (Array.isArray(payload)) return payload as YarnVoice[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["voices", "data", "results"]) {
    if (Array.isArray(record[key])) return record[key] as YarnVoice[];
  }
  return [];
}

function voiceSupportsLanguage(voice: YarnVoice, language: AppLanguage): boolean {
  const raw = voice.languages ?? voice.language ?? voice.language_codes ?? voice.supported_languages ?? voice.supportedLanguages;
  const values = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(/[,;|]/) : [];
  const supported = values.map((item) => {
    if (typeof item === "string") return item.trim().toLowerCase();
    if (item && typeof item === "object") {
      const entry = item as Record<string, unknown>;
      return String(entry.code ?? entry.language_code ?? entry.name ?? "").trim().toLowerCase();
    }
    return "";
  });
  return supported.some((value) => languageAliases[language].some((alias) => value === alias || value.includes(alias)) || value.startsWith(languageCodes[language] + "-"));
}

async function selectLanguageVoice(apiKey: string, language: AppLanguage): Promise<string | null> {
  const response = await fetch("https://api.yarngpt.ai/api/v1/voices", {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "force-cache",
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error("Speech voice catalogue is unavailable.");
  const catalogue = voiceList(await response.json());
  const voice = catalogue.find((entry) => voiceSupportsLanguage(entry, language));
  const selected = voice?.name ?? voice?.id ?? voice?.voice_id ?? voice?.voice;
  return typeof selected === "string" && selected.trim() ? selected.trim() : null;
}

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
    // Choose a voice from YarnGPT's live catalogue that explicitly lists the
    // selected language. Do not translate already-localised clinical copy again.
    const voice = await selectLanguageVoice(apiKey, language);
    if (!voice) return NextResponse.json({ error: "No YarnGPT voice is currently listed for this language. Please use the text guidance or try again later." }, { status: 503 });

    const prepared = await fetch("https://api.yarngpt.ai/api/v1/tts/prepare", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: payload.text.trim(), voice, output_format: "mp3" }),
      cache: "no-store",
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
      method: "GET", cache: "no-store", redirect: "follow",
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

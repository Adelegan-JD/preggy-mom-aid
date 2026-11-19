"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const { language, t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function speak() {
    if (busy) {
      window.speechSynthesis?.cancel();
      setBusy(false);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language })
      });
      if (!response.ok) {
        if (response.status === 503) throw new Error(t("speechNotConfigured"));
        throw new Error(t("speechUnavailable"));
      }
      const audio = new Audio(URL.createObjectURL(await response.blob()));
      audio.onended = () => { URL.revokeObjectURL(audio.src); setBusy(false); };
      audio.onerror = () => { URL.revokeObjectURL(audio.src); setBusy(false); setMessage(t("speechUnavailable")); };
      await audio.play();
    } catch {
      setBusy(false);
      setMessage(t("speechNotConfigured"));
    }
  }

  return <span className={`pma-speak-control ${className}`}>
    <button type="button" onClick={speak} aria-pressed={busy}>
      {busy ? <VolumeX size={16}/> : <Volume2 size={16}/>} {busy ? t("stopSpeaking") : t("speak")}
    </button>
    {message && <small role="status">{message}</small>}
  </span>;
}

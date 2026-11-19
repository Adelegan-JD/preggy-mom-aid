"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { languageOptions } from "@/lib/i18n/translations";

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
        if (response.status === 503) {
          const option = languageOptions.find(item => item.code === language);
          const voices = window.speechSynthesis?.getVoices() ?? [];
          const prefix = language === "pcm" ? "pcm" : language;
          const voice = voices.find(item => item.lang.toLowerCase().startsWith(prefix));
          if (option && voice && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = option.speechCode;
            utterance.voice = voice;
            utterance.onend = () => setBusy(false);
            utterance.onerror = () => { setBusy(false); setMessage(t("speechUnavailable")); };
            window.speechSynthesis.speak(utterance);
            return;
          }
          throw new Error(t("speechNotConfigured"));
        }
        throw new Error(t("speechUnavailable"));
      }
      const audio = new Audio(URL.createObjectURL(await response.blob()));
      audio.onended = () => { URL.revokeObjectURL(audio.src); setBusy(false); };
      audio.onerror = () => { URL.revokeObjectURL(audio.src); setBusy(false); setMessage(t("speechUnavailable")); };
      await audio.play();
    } catch (error) {
      setBusy(false);
      setMessage(error instanceof Error ? error.message : t("speechNotConfigured"));
    }
  }

  return <span className={`pma-speak-control ${className}`}>
    <button type="button" onClick={speak} aria-pressed={busy}>
      {busy ? <VolumeX size={16}/> : <Volume2 size={16}/>} {busy ? t("stopSpeaking") : t("speak")}
    </button>
    {message && <small role="status">{message}</small>}
  </span>;
}

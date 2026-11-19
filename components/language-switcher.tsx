"use client";

import { useLanguage } from "@/components/language-provider";
import { languageOptions } from "@/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return <label className="pma-language-switcher">
    <span>{t("language")}</span>
    <select aria-label={t("chooseLanguage")} value={language} onChange={event => setLanguage(event.target.value as typeof language)}>
      {languageOptions.map(option => <option key={option.code} value={option.code}>{option.nativeLabel}</option>)}
    </select>
  </label>;
}

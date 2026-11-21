"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { ComboBox } from "@/components/combo-box";
import { languageOptions } from "@/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const id = useId();
  return <div className="pma-language-switcher">
    <label htmlFor={`language-${id}`}>{t("language")}</label>
    <ComboBox
      id={`language-${id}`}
      value={language}
      onValueChange={value => { setLanguage(value as typeof language); router.refresh(); }}
      options={languageOptions.map(option => ({ value: option.code, label: option.nativeLabel }))}
    />
  </div>;
}

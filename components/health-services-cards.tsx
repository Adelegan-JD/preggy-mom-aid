import Link from "next/link";
import { AppLanguage } from "@/lib/i18n/translations";
import { healthServicesText as t } from "@/lib/i18n/health-services";
import { Hospital, Siren } from "lucide-react";

export default function HealthServicesCards({ language }: { language: AppLanguage }) {
  return <section className="health-services-shortcuts" aria-label={t(language, "publicDirectory")}>
    <Link href="/hospitals"><span><Hospital size={21}/></span><div><b>{t(language, "directory")}</b><small>{t(language, "directoryIntro")}</small></div></Link>
    <Link href="/emergency" className="emergency-shortcut"><span><Siren size={21}/></span><div><b>{t(language, "emergencyPage")}</b><small>{t(language, "emergencyLead")}</small></div></Link>
  </section>;
}

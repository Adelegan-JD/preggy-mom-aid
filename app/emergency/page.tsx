import Link from "next/link";
import { cookies } from "next/headers";
import PatientShell from "@/components/patient-shell";
import SpeakButton from "@/components/speak-button";
import { normalizeLanguage } from "@/lib/i18n/translations";
import { healthServicesText as t } from "@/lib/i18n/health-services";
import { ExternalLink, MapPin, PhoneCall, ShieldAlert } from "lucide-react";
import { Callout } from "@/components/ds";

export const dynamic = "force-dynamic";
export const metadata = { title: "Emergency support | Preggy Mom Aid", description: "Emergency contact information for people in Nigeria." };

export default async function EmergencyPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  return <PatientShell active="emergency" publicFallback>
    <div className="ds-page ds-page-narrow">
      <section className="ds-emergency" aria-labelledby="emergency-title">
        <h1 className="ds-h1-lg" id="emergency-title">{t(language, "emergencyTitle")}</h1>
        <p className="ds-lede">{t(language, "emergencyLead")}</p>
        <a className="ds-emergency-call" href="tel:112"><PhoneCall size={26} aria-hidden="true"/><span><b>{t(language, "call112")}</b><small>{t(language, "nationalLine")}</small></span></a>
        <SpeakButton text={[t(language, "emergencyLead"), t(language, "askMedical"), t(language, "giveLocation"), t(language, "doNotWait")].join(" ")} />
      </section>

      <ol className="ds-emergency-steps" data-reveal data-reveal-stagger>
        <li><PhoneCall size={18} aria-hidden="true"/><p>{t(language, "askMedical")}</p></li>
        <li><MapPin size={18} aria-hidden="true"/><p>{t(language, "giveLocation")}</p></li>
        <li><ShieldAlert size={18} aria-hidden="true"/><p>{t(language, "doNotWait")}</p></li>
      </ol>

      <Callout tone="danger" title={t(language, "notMonitored")} className="ds-section">{t(language, "ifNoConnection")}</Callout>

      <div className="ds-section ds-form-actions">
        <Link className="ds-btn" href="/hospitals">{t(language, "browseDirectory")}</Link>
        <a className="ds-link ds-link-quiet" href="https://ncc.gov.ng/media/836/view" target="_blank" rel="noreferrer"><ExternalLink size={14} aria-hidden="true"/> {t(language, "source")}</a>
      </div>
    </div>
  </PatientShell>;
}

import Link from "next/link";
import { cookies } from "next/headers";
import PatientPageNavigation from "@/components/patient-page-navigation";
import { normalizeLanguage } from "@/lib/i18n/translations";
import { healthServicesText as t } from "@/lib/i18n/health-services";
import { AlertCircle, PhoneCall, MapPin, ShieldAlert, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Emergency support | Preggy Mom Aid", description: "Emergency contact information for people in Nigeria." };

export default async function EmergencyPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  return <main className="patient-dashboard patient-subpage health-services-page" id="main-content" tabIndex={-1}>
    <PatientPageNavigation active="emergency" />
    <section className="patient-dashboard-content">
      <div className="account-kicker">{t(language, "emergency")}</div>
      <div className="health-emergency-hero">
        <span><AlertCircle size={28}/></span>
        <h1>{t(language, "emergencyTitle")}</h1>
        <p>{t(language, "emergencyLead")}</p>
        <a className="health-call-button" href="tel:112"><PhoneCall size={22}/>{t(language, "call112")}</a>
        <small>{t(language, "nationalLine")}</small>
      </div>
      <div className="health-emergency-steps">
        <article><span><PhoneCall size={18}/></span><p>{t(language, "askMedical")}</p></article>
        <article><span><MapPin size={18}/></span><p>{t(language, "giveLocation")}</p></article>
        <article><span><ShieldAlert size={18}/></span><p>{t(language, "doNotWait")}</p></article>
      </div>
      <div className="health-emergency-warning"><AlertCircle size={20}/><div><b>{t(language, "notMonitored")}</b><p>{t(language, "ifNoConnection")}</p></div></div>
      <p className="health-emergency-source"><ExternalLink size={14}/><a href="https://ncc.gov.ng/media/836/view" target="_blank" rel="noreferrer">{t(language, "source")}</a></p>
      <p className="health-directory-footer"><Link href="/hospitals">{t(language, "browseDirectory")}</Link></p>
    </section>
  </main>;
}

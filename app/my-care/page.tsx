import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import PatientShell from "@/components/patient-shell";
import { Callout, PageHeader, UnavailablePage } from "@/components/ds";
import PregnancyJourneyVisual from "@/components/pregnancy-journey-visual";
import { normalizeLanguage, translate, TranslationKey } from "@/lib/i18n/translations";
import { healthServicesText as hs } from "@/lib/i18n/health-services";
import { postpartumCopy } from "@/lib/i18n/postpartum";
import { Activity, CalendarHeart, ClipboardList, FileHeart, HeartPulse, ShieldCheck, BookOpen, ArrowRight, Plus, ChevronRight, Hospital, PhoneCall } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "My health dashboard | Preggy Mom Aid" };

export default async function MyCarePage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  const t = (key: TranslationKey) => translate(language, key);
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <PatientShell active="overview"><UnavailablePage title={t("dashboardTitle")} message={t("unavailable")} /></PatientShell>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care");
  const { data: profile } = await supabase.from("profiles").select("full_name,account_type").eq("id", user.id).maybeSingle();
  if (profile?.account_type === "professional") redirect("/professional");

  const nowIso = new Date().toISOString();
  const [{ count: symptomCount }, { data: recentReadings }, { data: patientJourney }, { data: nextAppointment }, { data: latestSymptom }] = await Promise.all([
    supabase.from("symptom_reports").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("blood_pressure_readings").select("systolic,diastolic,pulse,measured_at").eq("user_id", user.id).order("measured_at", { ascending: false }).limit(3),
    supabase.from("patient_profiles").select("preferred_name,pregnancy_status,estimated_due_date,birth_date").eq("user_id", user.id).maybeSingle(),
    supabase.from("patient_appointments").select("title,scheduled_at,location").eq("user_id", user.id).eq("status", "scheduled").gte("scheduled_at", nowIso).order("scheduled_at", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("symptom_reports").select("symptom_tags,occurred_at").eq("user_id", user.id).order("occurred_at", { ascending: false }).limit(1).maybeSingle()
  ]);
  const locale = language === "yo" ? "yo-NG" : language === "ha" ? "ha-NG" : language === "ig" ? "ig-NG" : "en-NG";
  const formatWhen = (value: string) => new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  const latestReading = recentReadings?.[0] ?? null;

  const firstName = patientJourney?.preferred_name?.trim() || profile?.full_name?.trim().split(/\s+/)[0] || "there";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = patientJourney?.estimated_due_date ? new Date(`${patientJourney.estimated_due_date}T12:00:00`) : null;
  const birthDate = patientJourney?.birth_date ? new Date(`${patientJourney.birth_date}T12:00:00`) : null;
  const daysToDue = dueDate ? Math.round((dueDate.getTime() - today.getTime()) / 86400000) : null;
  const estimatedWeeks = daysToDue === null ? null : Math.max(0, Math.min(42, Math.floor((280 - daysToDue) / 7)));
  const daysPostpartum = birthDate ? Math.max(0, Math.floor((today.getTime() - birthDate.getTime()) / 86400000)) : null;
  const pp = postpartumCopy[language] ?? postpartumCopy.en;
  // Only nudge for the profile while key journey details are missing.
  const profileIncomplete = !patientJourney
    || (patientJourney.pregnancy_status === "pregnant" && !patientJourney.estimated_due_date)
    || (patientJourney.pregnancy_status === "postpartum" && !patientJourney.birth_date);

  return <PatientShell active="overview">
    <div className="ds-page">
      <PageHeader
        title={<>{t("welcome")}, {firstName}</>}
        lede={t("dashboardIntro")}
        actions={<>
          <Link href="/my-care/blood-pressure" className="ds-btn ds-btn-primary"><Plus size={16} aria-hidden="true"/> {t("logBloodPressure")}</Link>
          <Link href="/my-care/symptoms" className="ds-btn"><ClipboardList size={16} aria-hidden="true"/> {t("recordSymptomAction")}</Link>
        </>}
      />

      {profileIncomplete && <Callout tone="info" title={t("completeProfile")} action={<Link href="/my-care/profile" className="ds-btn ds-btn-sm">{t("updateProfile")}</Link>} className="ds-callout-spaced">{t("profilePrompt")}</Callout>}

      <div className="ds-grid-3" data-reveal data-reveal-stagger>
        <section className="ds-panel ds-summary" aria-labelledby="summary-bp">
          <h2 id="summary-bp"><Activity size={16} aria-hidden="true"/> {t("bloodPressure")}</h2>
          {latestReading ? <>
            <p className="ds-summary-value"><span className="ds-tabular">{latestReading.systolic}/{latestReading.diastolic}</span> <small>mmHg</small></p>
            <p className="ds-muted ds-small">{formatWhen(latestReading.measured_at)}{latestReading.pulse ? ` · ${latestReading.pulse} bpm` : ""}</p>
            {recentReadings && recentReadings.length > 1 && <ul className="ds-summary-history">{recentReadings.slice(1).map(reading => <li key={reading.measured_at}><span className="ds-tabular">{reading.systolic}/{reading.diastolic}</span><span>{formatWhen(reading.measured_at)}</span></li>)}</ul>}
          </> : <p className="ds-muted ds-small">{t("noDashboardReadings")}</p>}
          <Link href="/my-care/blood-pressure" className="ds-link ds-link-quiet">{latestReading ? t("viewHistory") : t("logBloodPressure")} <ArrowRight size={15} aria-hidden="true"/></Link>
        </section>

        <section className="ds-panel ds-summary" aria-labelledby="summary-appointment">
          <h2 id="summary-appointment"><CalendarHeart size={16} aria-hidden="true"/> {t("upcomingAppointments")}</h2>
          {nextAppointment ? <>
            <p className="ds-summary-title">{nextAppointment.title}</p>
            <p className="ds-muted ds-small">{formatWhen(nextAppointment.scheduled_at)}{nextAppointment.location ? ` · ${nextAppointment.location}` : ""}</p>
          </> : <p className="ds-muted ds-small">{t("noUpcomingAppointments")}</p>}
          <Link href="/my-care/appointments" className="ds-link ds-link-quiet">{nextAppointment ? t("viewAppointments") : t("addAppointment")} <ArrowRight size={15} aria-hidden="true"/></Link>
        </section>

        <section className="ds-panel ds-summary" aria-labelledby="summary-symptoms">
          <h2 id="summary-symptoms"><ClipboardList size={16} aria-hidden="true"/> {t("symptomNotes")}</h2>
          {latestSymptom ? <>
            <p className="ds-summary-value"><span className="ds-tabular">{symptomCount ?? 0}</span> <small>{t("savedNotes")}</small></p>
            <p className="ds-muted ds-small">{formatWhen(latestSymptom.occurred_at)}</p>
          </> : <p className="ds-muted ds-small">{t("noNotes")}</p>}
          <Link href="/my-care/symptoms" className="ds-link ds-link-quiet">{t("recordSymptomAction")} <ArrowRight size={15} aria-hidden="true"/></Link>
        </section>
      </div>

      <div className="ds-section" data-reveal>
        <PregnancyJourneyVisual pregnancyStatus={patientJourney?.pregnancy_status ?? null} estimatedWeeks={estimatedWeeks} daysPostpartum={daysPostpartum} language={language} />
      </div>

      <Callout tone="danger" title={t("urgentHelpTitle")} className="ds-section" action={<Link href="/emergency" className="ds-btn ds-btn-urgent ds-btn-sm"><PhoneCall size={15} aria-hidden="true"/> {hs(language, "emergencyPage")}</Link>}>{t("urgentHelpBody")} <Link href="/learn">{t("readWarningSigns")}</Link></Callout>

      <nav className="ds-section ds-mobile-only" aria-labelledby="overview-more" style={{ gap: "var(--ds-4)" }}>
        <h2 className="ds-h2" id="overview-more">{t("everythingInOnePlace")}</h2>
        <div className="ds-linklist">
          <Link href="/my-care/symptoms"><ClipboardList size={18} aria-hidden="true"/><span><b>{t("symptoms")}</b><small>{t("symptomCardText")}</small></span><ChevronRight size={16} aria-hidden="true"/></Link>
          <Link href="/my-care/postpartum"><HeartPulse size={18} aria-hidden="true"/><span><b>{t("postpartumJourney")}</b><small>{pp.organise}</small></span><ChevronRight size={16} aria-hidden="true"/></Link>
          <Link href="/learn"><BookOpen size={18} aria-hidden="true"/><span><b>{t("learningCentre")}</b><small>{t("learningCardText")}</small></span><ChevronRight size={16} aria-hidden="true"/></Link>
          <Link href="/hospitals"><Hospital size={18} aria-hidden="true"/><span><b>{hs(language, "directory")}</b></span><ChevronRight size={16} aria-hidden="true"/></Link>
          <Link href="/my-care/settings"><ShieldCheck size={18} aria-hidden="true"/><span><b>{t("privacySettings")}</b></span><ChevronRight size={16} aria-hidden="true"/></Link>
        </div>
      </nav>

      <div className="ds-section ds-note"><ShieldCheck size={16} aria-hidden="true"/><span><b>{t("privateHealth")}</b> {t("privateHealthText")} <Link href="/feedback">{t("shareExperience")}</Link></span></div>
    </div>
  </PatientShell>;
}

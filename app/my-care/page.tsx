import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import LanguageSwitcher from "@/components/language-switcher";
import SpeakButton from "@/components/speak-button";
import { normalizeLanguage, translate, TranslationKey } from "@/lib/i18n/translations";
import { Activity, CalendarHeart, ClipboardList, FileHeart, HeartPulse, MessageSquareText, ShieldCheck, BookOpen, ArrowRight, Home, UserRound, Settings, Plus, Clock3, Sparkles, Stethoscope, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "My health dashboard | Preggy Mom Aid" };

export default async function MyCarePage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  const t = (key: TranslationKey) => translate(language, key);
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <main className="patient-dashboard" id="main-content" tabIndex={-1}><section className="patient-dashboard-content"><div className="account-kicker">{t("personalSpace") }</div><h1>{t("dashboardTitle") }</h1><p className="account-intro">Your secure health space is temporarily unavailable because account services are not configured for this deployment.</p><div className="patient-safety-note"><ShieldCheck size={20}/><p>Your health information has not been loaded. Do not send medical details through feedback or email.</p></div><Link className="patient-back-link" href="/login">Return to sign in</Link></section></main>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care");
  const { data: profile } = await supabase.from("profiles").select("full_name,account_type").eq("id", user.id).maybeSingle();
  if (profile?.account_type === "professional") redirect("/professional");

  const [{ count: bpCount }, { count: symptomCount }, { data: recentReadings }, { data: patientJourney }] = await Promise.all([
    supabase.from("blood_pressure_readings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("symptom_reports").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("blood_pressure_readings").select("systolic,diastolic,measured_at").eq("user_id", user.id).order("measured_at", { ascending: false }).limit(3),
    supabase.from("patient_profiles").select("preferred_name,pregnancy_status,estimated_due_date,birth_date").eq("user_id", user.id).maybeSingle()
  ]);

  const firstName = patientJourney?.preferred_name?.trim() || profile?.full_name?.trim().split(/\s+/)[0] || "there";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = patientJourney?.estimated_due_date ? new Date(`${patientJourney.estimated_due_date}T12:00:00`) : null;
  const birthDate = patientJourney?.birth_date ? new Date(`${patientJourney.birth_date}T12:00:00`) : null;
  const daysToDue = dueDate ? Math.round((dueDate.getTime() - today.getTime()) / 86400000) : null;
  const estimatedWeeks = daysToDue === null ? null : Math.max(0, Math.min(42, Math.floor((280 - daysToDue) / 7)));
  const daysPostpartum = birthDate ? Math.max(0, Math.floor((today.getTime() - birthDate.getTime()) / 86400000)) : null;

  return <main className="patient-dashboard patient-dashboard-redesign" id="main-content" tabIndex={-1}>
    <aside className="patient-sidebar" aria-label={t("workspace")}>
      <Link href="/my-care" className="patient-sidebar-brand"><span className="account-brand-mark"><HeartPulse size={21}/></span><span><b>Preggy Mom Aid</b><small>{t("personalSpace")}</small></span></Link>
      <div className="patient-sidebar-label">{t("workspace") }</div>
      <nav className="patient-sidebar-nav" aria-label={t("workspace")}>
        <Link href="/my-care" aria-current="page"><Home size={18}/> {t("overview") }</Link>
        <Link href="/my-care/blood-pressure"><Activity size={18}/> {t("bloodPressure") }</Link>
        <Link href="/my-care/symptoms"><ClipboardList size={18}/> {t("symptoms") }</Link>
        <Link href="/my-care/appointments"><CalendarHeart size={18}/> {t("appointments") }</Link>
        <Link href="/my-care/records"><FileHeart size={18}/> {t("healthRecords") }</Link>
        <Link href="/learn"><BookOpen size={18}/> {t("learningCentre") }</Link>
      </nav>
      <div className="patient-sidebar-spacer"/>
      <div className="patient-sidebar-help"><span><ShieldCheck size={17}/></span><b>{t("privacyMatters") }</b><p>{t("privacyText") }</p><Link href="/my-care/settings">{t("privacySettings") } <ChevronRight size={14}/></Link></div>
      <Link href="/my-care/profile" className="patient-sidebar-account"><span className="patient-avatar"><UserRound size={17}/></span><span><b>{t("profile")}</b><small>{t("personalDetails") }</small></span><ChevronRight size={15}/></Link>
    </aside>
    <div className="patient-main-column">
    <header className="patient-dashboard-header"><Link href="/" className="account-brand"><span className="account-brand-mark"><HeartPulse size={20}/></span><span><b>Preggy Mom Aid</b><small>MY HEALTH SPACE</small></span></Link><nav aria-label={t("yourAccount") }><Link href="/learn">{t("learningCentre") }</Link><Link href="/my-care/settings">{t("privacySettings") }</Link><Link href="/feedback">Feedback</Link><LanguageSwitcher /><form action={async () => {"use server"; const client = await createClient(); await client.auth.signOut(); redirect("/login");}}><button className="account-signout">{t("signOut") }</button></form></nav></header>
    <section className="patient-dashboard-content">
      <div className="patient-welcome patient-welcome-hero"><div className="patient-welcome-copy"><div className="patient-hero-eyebrow"><Sparkles size={14}/> {t("personalSpace") }</div><h1>{t("welcome")}, {firstName} <span aria-hidden="true">♥</span></h1><p>{t("dashboardIntro") }</p><div className="patient-hero-actions"><Link href="/my-care/blood-pressure"><Plus size={16}/> {t("logBloodPressure") }</Link><Link href="/my-care/appointments"><CalendarHeart size={16}/> {t("addAppointment") }</Link></div></div><div className="patient-hero-art" aria-hidden="true"><div className="patient-hero-orbit orbit-one"/><div className="patient-hero-orbit orbit-two"/><span className="patient-hero-heart"><HeartPulse size={52}/></span><span className="patient-hero-sparkle"><Sparkles size={20}/></span></div></div>
      <div className="patient-safety-note"><ShieldCheck size={20}/><p><b>{t("privateHealth") }</b> {t("privateHealthText") }</p><SpeakButton text={t("privateHealthText") }/></div>
      <section className="patient-recent-panel"><div className="account-kicker">{t("yourJourney") }</div><h2>{patientJourney?.pregnancy_status === "postpartum" ? t("postpartumJourney") : patientJourney?.pregnancy_status === "not_currently_pregnant" ? t("healthSpace") : t("pregnancyJourney")}</h2>
        {patientJourney?.pregnancy_status === "pregnant" && estimatedWeeks !== null ? <p>Your estimated pregnancy stage is around <strong>{estimatedWeeks} {t("weeks") }</strong>{daysToDue !== null && daysToDue >= 0 ? `, with about ${daysToDue} ${t("daysUntilDue")}` : ""}. {t("calendarEstimate") }</p>
        : patientJourney?.pregnancy_status === "postpartum" && daysPostpartum !== null ? <p>You are around <strong>{daysPostpartum} days</strong> after the birth date you entered. Continue your postnatal care with your maternity team.</p>
        : patientJourney?.pregnancy_status === "not_currently_pregnant" ? <p>{t("healthSpace") }</p>
        : <p>Add your pregnancy status and estimated due date or birth date to see a personal journey summary here.</p>}
        <Link href="/my-care/profile">{t("updateJourney") } <ArrowRight size={15}/></Link>
      </section>
      <div className="patient-stat-grid patient-stat-grid-modern"><article><span className="patient-stat-icon"><Activity size={17}/></span><div><span>{t("bloodPressure") } logs</span><strong>{bpCount ?? 0}</strong><small>{t("savedReadings") }</small></div></article><article><span className="patient-stat-icon rose"><ClipboardList size={17}/></span><div><span>{t("symptomNotes") }</span><strong>{symptomCount ?? 0}</strong><small>{t("savedNotes") }</small></div></article><article><span className="patient-stat-icon sage"><ShieldCheck size={17}/></span><div><span>{t("privacyStatus") }</span><strong className="patient-private-value">{t("protected") }</strong><small>{t("controlRecords") }</small></div></article></div>
      <div className="patient-section-heading patient-section-heading-modern"><div><div className="account-kicker">{t("healthTools") }</div><h2>{t("everythingInOnePlace") }</h2><p>{t("chooseSpace")}</p></div><span className="patient-section-note"><ShieldCheck size={15}/> {t("privateToYou") }</span></div>
      <div className="patient-profile-prompt"><div><div className="account-kicker">{t("personalise") }</div><strong>{t("completeProfile") }</strong><p>{t("profilePrompt")}</p></div><Link href="/my-care/profile">{t("updateProfile") } <ArrowRight size={15}/></Link></div>
      <div className="patient-feature-grid patient-feature-grid-modern">
        <Link href="/my-care/blood-pressure" className="patient-feature-card"><span className="patient-feature-icon"><Activity/></span><h3>{t("bloodPressure") }</h3><p>{t("yourHealth")}. The app does not interpret readings or diagnose conditions.</p><span>{t("openBloodPressure")} <ArrowRight size={16}/></span></Link>
        <Link href="/my-care/symptoms" className="patient-feature-card"><span className="patient-feature-icon rose"><ClipboardList/></span><h3>{t("symptoms")}</h3><p>Keep a private record of symptoms and questions to discuss with your maternity team.</p><span>Record a symptom <ArrowRight size={16}/></span></Link>
        <Link href="/my-care/appointments" className="patient-feature-card"><span className="patient-feature-icon"><CalendarHeart/></span><h3>{t("appointments") }</h3><p>{t("appointments")}</p><span>{t("viewAppointments")} <ArrowRight size={16}/></span></Link>
        <Link href="/my-care/records" className="patient-feature-card"><span className="patient-feature-icon rose"><FileHeart/></span><h3>{t("healthRecords") }</h3><p>Upload and keep your own antenatal records, scan results and test reports in private storage.</p><span>Manage health records <ArrowRight size={16}/></span></Link>
        <Link href="/learn" className="patient-feature-card"><span className="patient-feature-icon"><BookOpen/></span><h3>{t("learningCentre") }</h3><p>Read pregnancy and postpartum education and learn when to seek urgent medical attention.</p><span>Explore learning <ArrowRight size={16}/></span></Link>
      </div>
      <section className="patient-recent-panel"><div><div className="account-kicker">RECENT READINGS</div><h2>Your latest blood pressure entries</h2></div>{recentReadings?.length ? <ul>{recentReadings.map((reading, index) => <li key={index}><strong>{reading.systolic}/{reading.diastolic} mmHg</strong><span>{new Date(reading.measured_at).toLocaleString()}</span></li>)}</ul> : <p>No blood pressure readings have been saved yet. When you add your own readings, they will appear here. No sample records are displayed.</p>}<Link href="/my-care/blood-pressure">View full history <ArrowRight size={15}/></Link></section>
      <section className="patient-urgent-panel" aria-labelledby="patient-urgent-title"><span className="patient-urgent-icon"><HeartPulse size={20}/></span><div><div className="account-kicker">IMPORTANT HEALTH INFORMATION</div><h2 id="patient-urgent-title">When you need urgent help</h2><p>If you have a severe or persistent headache, vision changes, severe upper abdominal pain, sudden swelling, feel very unwell, or have another urgent concern during pregnancy or after birth, seek urgent medical assessment. A seizure, collapse or severe difficulty breathing is an emergency. Do not wait for an app response.</p></div><Link href="/learn">Read warning signs <ArrowRight size={15}/></Link></section>
      <p className="patient-feedback-link"><MessageSquareText size={16}/> <Link href="/feedback">Share feedback about your experience</Link></p>
    </section>
    <footer className="patient-dashboard-footer">Preggy Mom Aid <span>•</span> Your care, your information, your choices</footer>
    </div>
    <div className="patient-mobile-language"><LanguageSwitcher /></div><nav className="patient-mobile-nav" aria-label={t("chooseLanguage")}><Link href="/my-care" aria-current="page"><Home size={18}/><span>{t("home")}</span></Link><Link href="/my-care/blood-pressure"><Activity size={18}/><span>{t("bpLog")}</span></Link><Link href="/my-care/appointments"><CalendarHeart size={18}/><span>{t("visits")}</span></Link><Link href="/my-care/records"><FileHeart size={18}/><span>{t("records")}</span></Link><Link href="/my-care/profile"><UserRound size={18}/><span>{t("profile")}</span></Link></nav>
  </main>;
}

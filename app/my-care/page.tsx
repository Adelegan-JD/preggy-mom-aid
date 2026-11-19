import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Activity, CalendarHeart, ClipboardList, FileHeart, HeartPulse, MessageSquareText, ShieldCheck, BookOpen, ArrowRight, Home, UserRound, Settings, Plus, Clock3, Sparkles, Stethoscope, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "My health dashboard | Preggy Mom Aid" };

export default async function MyCarePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <main className="patient-dashboard" id="main-content" tabIndex={-1}><section className="patient-dashboard-content"><div className="account-kicker">YOUR PERSONAL SPACE</div><h1>Your health dashboard</h1><p className="account-intro">Your secure health space is temporarily unavailable because account services are not configured for this deployment.</p><div className="patient-safety-note"><ShieldCheck size={20}/><p>Your health information has not been loaded. Do not send medical details through feedback or email.</p></div><Link className="patient-back-link" href="/login">Return to sign in</Link></section></main>;
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
    <aside className="patient-sidebar" aria-label="Patient navigation">
      <Link href="/my-care" className="patient-sidebar-brand"><span className="account-brand-mark"><HeartPulse size={21}/></span><span><b>Preggy Mom Aid</b><small>MY HEALTH SPACE</small></span></Link>
      <div className="patient-sidebar-label">WORKSPACE</div>
      <nav className="patient-sidebar-nav" aria-label="Main patient navigation">
        <Link href="/my-care" aria-current="page"><Home size={18}/> Overview</Link>
        <Link href="/my-care/blood-pressure"><Activity size={18}/> Blood pressure</Link>
        <Link href="/my-care/symptoms"><ClipboardList size={18}/> Symptoms &amp; notes</Link>
        <Link href="/my-care/appointments"><CalendarHeart size={18}/> Appointments</Link>
        <Link href="/my-care/records"><FileHeart size={18}/> Health records</Link>
        <Link href="/learn"><BookOpen size={18}/> Learning centre</Link>
      </nav>
      <div className="patient-sidebar-spacer"/>
      <div className="patient-sidebar-help"><span><ShieldCheck size={17}/></span><b>Your privacy matters</b><p>Your health space is private. You decide what to record.</p><Link href="/my-care/settings">Privacy controls <ChevronRight size={14}/></Link></div>
      <Link href="/my-care/profile" className="patient-sidebar-account"><span className="patient-avatar"><UserRound size={17}/></span><span><b>My profile</b><small>Personal details</small></span><ChevronRight size={15}/></Link>
    </aside>
    <div className="patient-main-column">
    <header className="patient-dashboard-header"><Link href="/" className="account-brand"><span className="account-brand-mark"><HeartPulse size={20}/></span><span><b>Preggy Mom Aid</b><small>MY HEALTH SPACE</small></span></Link><nav aria-label="Account navigation"><Link href="/learn">Learning Centre</Link><Link href="/my-care/settings">Privacy &amp; settings</Link><Link href="/feedback">Feedback</Link><form action={async () => {"use server"; const client = await createClient(); await client.auth.signOut(); redirect("/login");}}><button className="account-signout">Sign out</button></form></nav></header>
    <section className="patient-dashboard-content">
      <div className="patient-welcome patient-welcome-hero"><div className="patient-welcome-copy"><div className="patient-hero-eyebrow"><Sparkles size={14}/> YOUR PERSONAL SPACE</div><h1>Good to see you, {firstName} <span aria-hidden="true">♥</span></h1><p>A calm place to keep your pregnancy and postpartum care organised, one step at a time.</p><div className="patient-hero-actions"><Link href="/my-care/blood-pressure"><Plus size={16}/> Log blood pressure</Link><Link href="/my-care/appointments"><CalendarHeart size={16}/> Add an appointment</Link></div></div><div className="patient-hero-art" aria-hidden="true"><div className="patient-hero-orbit orbit-one"/><div className="patient-hero-orbit orbit-two"/><span className="patient-hero-heart"><HeartPulse size={52}/></span><span className="patient-hero-sparkle"><Sparkles size={20}/></span></div></div>
      <div className="patient-safety-note"><ShieldCheck size={20}/><p><b>Your health information is private.</b> This space stores information you choose to record. It is not continuously monitored and does not replace your maternity team or emergency care.</p></div>
      <section className="patient-recent-panel"><div className="account-kicker">YOUR JOURNEY</div><h2>{patientJourney?.pregnancy_status === "postpartum" ? "Your postpartum journey" : patientJourney?.pregnancy_status === "not_currently_pregnant" ? "Your health space" : "Your pregnancy journey"}</h2>
        {patientJourney?.pregnancy_status === "pregnant" && estimatedWeeks !== null ? <p>Your estimated pregnancy stage is around <strong>{estimatedWeeks} weeks</strong>{daysToDue !== null && daysToDue >= 0 ? `, with about ${daysToDue} days until your estimated due date` : ""}. This is a calendar estimate based only on the date you entered, not a clinical dating assessment.</p>
        : patientJourney?.pregnancy_status === "postpartum" && daysPostpartum !== null ? <p>You are around <strong>{daysPostpartum} days</strong> after the birth date you entered. Continue your postnatal care with your maternity team.</p>
        : patientJourney?.pregnancy_status === "not_currently_pregnant" ? <p>Your personal health space remains available for your wellbeing and records.</p>
        : <p>Add your pregnancy status and estimated due date or birth date to see a personal journey summary here.</p>}
        <Link href="/my-care/profile">Update journey details <ArrowRight size={15}/></Link>
      </section>
      <div className="patient-stat-grid patient-stat-grid-modern"><article><span className="patient-stat-icon"><Activity size={17}/></span><div><span>Blood pressure logs</span><strong>{bpCount ?? 0}</strong><small>Your saved readings</small></div></article><article><span className="patient-stat-icon rose"><ClipboardList size={17}/></span><div><span>Symptom notes</span><strong>{symptomCount ?? 0}</strong><small>Your saved notes</small></div></article><article><span className="patient-stat-icon sage"><ShieldCheck size={17}/></span><div><span>Privacy status</span><strong className="patient-private-value">Protected</strong><small>You control your records</small></div></article></div>
      <div className="patient-section-heading patient-section-heading-modern"><div><div className="account-kicker">YOUR HEALTH TOOLS</div><h2>Everything in one place</h2><p>Choose a space to view or update your personal health information.</p></div><span className="patient-section-note"><ShieldCheck size={15}/> Private to you</span></div>
      <div className="patient-profile-prompt"><div><div className="account-kicker">MAKE THIS SPACE YOURS</div><strong>Complete your personal and pregnancy profile</strong><p>Add your preferred name, language and pregnancy or postpartum dates to personalise your dashboard.</p></div><Link href="/my-care/profile">Update my profile <ArrowRight size={15}/></Link></div>
      <div className="patient-feature-grid patient-feature-grid-modern">
        <Link href="/my-care/blood-pressure" className="patient-feature-card"><span className="patient-feature-icon"><Activity/></span><h3>Blood pressure</h3><p>Record readings and review your own history. The app does not interpret readings or diagnose conditions.</p><span>Open blood pressure log <ArrowRight size={16}/></span></Link>
        <Link href="/my-care/symptoms" className="patient-feature-card"><span className="patient-feature-icon rose"><ClipboardList/></span><h3>Symptoms and notes</h3><p>Keep a private record of symptoms and questions to discuss with your maternity team.</p><span>Record a symptom <ArrowRight size={16}/></span></Link>
        <Link href="/my-care/appointments" className="patient-feature-card"><span className="patient-feature-icon"><CalendarHeart/></span><h3>Appointments</h3><p>Keep your antenatal and postnatal visits, scans and tests organised in your personal calendar.</p><span>Manage appointments <ArrowRight size={16}/></span></Link>
        <Link href="/my-care/records" className="patient-feature-card"><span className="patient-feature-icon rose"><FileHeart/></span><h3>Health records</h3><p>Upload and keep your own antenatal records, scan results and test reports in private storage.</p><span>Manage health records <ArrowRight size={16}/></span></Link>
        <Link href="/learn" className="patient-feature-card"><span className="patient-feature-icon"><BookOpen/></span><h3>Learning Centre</h3><p>Read pregnancy and postpartum education and learn when to seek urgent medical attention.</p><span>Explore learning <ArrowRight size={16}/></span></Link>
      </div>
      <section className="patient-recent-panel"><div><div className="account-kicker">RECENT READINGS</div><h2>Your latest blood pressure entries</h2></div>{recentReadings?.length ? <ul>{recentReadings.map((reading, index) => <li key={index}><strong>{reading.systolic}/{reading.diastolic} mmHg</strong><span>{new Date(reading.measured_at).toLocaleString()}</span></li>)}</ul> : <p>No blood pressure readings have been saved yet. When you add your own readings, they will appear here. No sample records are displayed.</p>}<Link href="/my-care/blood-pressure">View full history <ArrowRight size={15}/></Link></section>
      <section className="patient-urgent-panel" aria-labelledby="patient-urgent-title"><span className="patient-urgent-icon"><HeartPulse size={20}/></span><div><div className="account-kicker">IMPORTANT HEALTH INFORMATION</div><h2 id="patient-urgent-title">When you need urgent help</h2><p>If you have a severe or persistent headache, vision changes, severe upper abdominal pain, sudden swelling, feel very unwell, or have another urgent concern during pregnancy or after birth, seek urgent medical assessment. A seizure, collapse or severe difficulty breathing is an emergency. Do not wait for an app response.</p></div><Link href="/learn">Read warning signs <ArrowRight size={15}/></Link></section>
      <p className="patient-feedback-link"><MessageSquareText size={16}/> <Link href="/feedback">Share feedback about your experience</Link></p>
    </section>
    <footer className="patient-dashboard-footer">Preggy Mom Aid <span>•</span> Your care, your information, your choices</footer>
    </div>
    <nav className="patient-mobile-nav" aria-label="Quick navigation"><Link href="/my-care" aria-current="page"><Home size={18}/><span>Home</span></Link><Link href="/my-care/blood-pressure"><Activity size={18}/><span>BP log</span></Link><Link href="/my-care/appointments"><CalendarHeart size={18}/><span>Visits</span></Link><Link href="/my-care/records"><FileHeart size={18}/><span>Records</span></Link><Link href="/my-care/profile"><UserRound size={18}/><span>Profile</span></Link></nav>
  </main>;
}

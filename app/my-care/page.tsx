import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Activity, CalendarHeart, ClipboardList, FileHeart, HeartPulse, MessageSquareText, ShieldCheck, BookOpen, ArrowRight } from "lucide-react";

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

  return <main className="patient-dashboard" id="main-content" tabIndex={-1}>
    <header className="patient-dashboard-header"><Link href="/" className="account-brand"><span className="account-brand-mark"><HeartPulse size={20}/></span><span><b>Preggy Mom Aid</b><small>MY HEALTH SPACE</small></span></Link><nav aria-label="Account navigation"><Link href="/learn">Learning Centre</Link><Link href="/my-care/settings">Privacy &amp; settings</Link><Link href="/feedback">Feedback</Link><form action={async () => {"use server"; const client = await createClient(); await client.auth.signOut(); redirect("/login");}}><button className="account-signout">Sign out</button></form></nav></header>
    <section className="patient-dashboard-content">
      <div className="patient-welcome"><div><div className="account-kicker">YOUR PERSONAL SPACE</div><h1>Welcome, {firstName}</h1><p>Your pregnancy and postpartum support space. You control your information and who can access it.</p></div><span className="patient-welcome-mark"><HeartPulse size={34}/></span></div>
      <div className="patient-safety-note"><ShieldCheck size={20}/><p><b>Your health information is private.</b> This space stores information you choose to record. It is not continuously monitored and does not replace your maternity team or emergency care.</p></div>
      <section className="patient-recent-panel"><div className="account-kicker">YOUR JOURNEY</div><h2>{patientJourney?.pregnancy_status === "postpartum" ? "Your postpartum journey" : patientJourney?.pregnancy_status === "not_currently_pregnant" ? "Your health space" : "Your pregnancy journey"}</h2>
        {patientJourney?.pregnancy_status === "pregnant" && estimatedWeeks !== null ? <p>Your estimated pregnancy stage is around <strong>{estimatedWeeks} weeks</strong>{daysToDue !== null && daysToDue >= 0 ? `, with about ${daysToDue} days until your estimated due date` : ""}. This is a calendar estimate based only on the date you entered, not a clinical dating assessment.</p>
        : patientJourney?.pregnancy_status === "postpartum" && daysPostpartum !== null ? <p>You are around <strong>{daysPostpartum} days</strong> after the birth date you entered. Continue your postnatal care with your maternity team.</p>
        : patientJourney?.pregnancy_status === "not_currently_pregnant" ? <p>Your personal health space remains available for your wellbeing and records.</p>
        : <p>Add your pregnancy status and estimated due date or birth date to see a personal journey summary here.</p>}
        <Link href="/my-care/profile">Update journey details <ArrowRight size={15}/></Link>
      </section>
      <div className="patient-stat-grid"><article><span>Blood pressure entries</span><strong>{bpCount ?? 0}</strong><small>Records you have saved</small></article><article><span>Symptom notes</span><strong>{symptomCount ?? 0}</strong><small>Entries you have recorded</small></article><article><span>Care access</span><strong>Private</strong><small>No clinician access is enabled</small></article></div>
      <div className="patient-section-heading"><div><div className="account-kicker">YOUR HEALTH TOOLS</div><h2>Keep track of your care</h2></div></div>
      <div className="patient-profile-prompt"><div><div className="account-kicker">MAKE THIS SPACE YOURS</div><strong>Complete your personal and pregnancy profile</strong><p>Add your preferred name, language and pregnancy or postpartum dates to personalise your dashboard.</p></div><Link href="/my-care/profile">Update my profile <ArrowRight size={15}/></Link></div>
      <div className="patient-feature-grid">
        <Link href="/my-care/blood-pressure" className="patient-feature-card"><span className="patient-feature-icon"><Activity/></span><h3>Blood pressure</h3><p>Record readings and review your own history. The app does not interpret readings or diagnose conditions.</p><span>Open blood pressure log <ArrowRight size={16}/></span></Link>
        <Link href="/my-care/symptoms" className="patient-feature-card"><span className="patient-feature-icon rose"><ClipboardList/></span><h3>Symptoms and notes</h3><p>Keep a private record of symptoms and questions to discuss with your maternity team.</p><span>Record a symptom <ArrowRight size={16}/></span></Link>
        <Link href="/my-care/appointments" className="patient-feature-card"><span className="patient-feature-icon"><CalendarHeart/></span><h3>Appointments</h3><p>Keep your antenatal and postnatal visits, scans and tests organised in your personal calendar.</p><span>Manage appointments <ArrowRight size={16}/></span></Link>
        <Link href="/my-care/records" className="patient-feature-card"><span className="patient-feature-icon rose"><FileHeart/></span><h3>Health records</h3><p>Upload and keep your own antenatal records, scan results and test reports in private storage.</p><span>Manage health records <ArrowRight size={16}/></span></Link>
        <Link href="/learn" className="patient-feature-card"><span className="patient-feature-icon"><BookOpen/></span><h3>Learning Centre</h3><p>Read pregnancy and postpartum education and learn when to seek urgent medical attention.</p><span>Explore learning <ArrowRight size={16}/></span></Link>
      </div>
      <section className="patient-recent-panel"><div><div className="account-kicker">RECENT READINGS</div><h2>Your latest blood pressure entries</h2></div>{recentReadings?.length ? <ul>{recentReadings.map((reading, index) => <li key={index}><strong>{reading.systolic}/{reading.diastolic} mmHg</strong><span>{new Date(reading.measured_at).toLocaleString()}</span></li>)}</ul> : <p>No blood pressure readings have been saved yet. When you add your own readings, they will appear here. No sample records are displayed.</p>}<Link href="/my-care/blood-pressure">View full history <ArrowRight size={15}/></Link></section>
      <p className="patient-emergency-note">If you have a severe or persistent headache, vision changes, severe upper abdominal pain, sudden swelling, feel very unwell, or have any other urgent concern during pregnancy or after birth, seek urgent medical assessment. A seizure, collapse or severe difficulty breathing is an emergency. Do not wait for an app response.</p>
      <p className="patient-feedback-link"><MessageSquareText size={16}/> <Link href="/feedback">Share feedback about your experience</Link></p>
    </section>
  </main>;
}

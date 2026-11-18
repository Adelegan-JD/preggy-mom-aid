import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Activity,CalendarHeart,ClipboardList,FileHeart,HeartPulse,MessageSquareText,ShieldCheck,Stethoscope,BookOpen,ArrowRight } from "lucide-react";

export const dynamic="force-dynamic";
export const metadata={title:"My health dashboard | Preggy Mom Aid"};

export default async function MyCarePage(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?next=/my-care");
 const {data:profile}=await supabase.from("profiles").select("full_name,account_type,verification_status").eq("id",user.id).maybeSingle();
 if(profile?.account_type==="professional")redirect("/professional");
 const [{count:bpCount},{count:symptomCount},{data:recentReadings}]=await Promise.all([
  supabase.from("blood_pressure_readings").select("id",{count:"exact",head:true}).eq("user_id",user.id),
  supabase.from("symptom_reports").select("id",{count:"exact",head:true}).eq("user_id",user.id),
  supabase.from("blood_pressure_readings").select("systolic,diastolic,measured_at").eq("user_id",user.id).order("measured_at",{ascending:false}).limit(3)
 ]);
 const firstName=profile?.full_name?.trim().split(/\\s+/)[0]||"there";
 return <main className="patient-dashboard" id="main-content" tabIndex={-1}>
  <header className="patient-dashboard-header"><Link href="/" className="account-brand"><span className="account-brand-mark"><HeartPulse size={20}/></span><span><b>Preggy Mom Aid</b><small>MY HEALTH SPACE</small></span></Link><nav aria-label="Account navigation"><Link href="/learn">Learning Centre</Link><Link href="/feedback">Feedback</Link><form action={async()=>{"use server";const client=await createClient();await client.auth.signOut();redirect("/login");}}><button className="account-signout">Sign out</button></form></nav></header>
  <section className="patient-dashboard-content">
   <div className="patient-welcome"><div><div className="account-kicker">YOUR PERSONAL SPACE</div><h1>Welcome, {firstName}</h1><p>Your pregnancy and postpartum support space. You control your information and who can access it.</p></div><span className="patient-welcome-mark"><HeartPulse size={34}/></span></div>
   <div className="patient-safety-note"><ShieldCheck size={20}/><p><b>Your health information is private.</b> This space stores information you choose to record. It is not continuously monitored and does not replace your maternity team or emergency care.</p></div>
   <div className="patient-stat-grid"><article><span>Blood pressure entries</span><strong>{bpCount??0}</strong><small>Records you have saved</small></article><article><span>Symptom notes</span><strong>{symptomCount??0}</strong><small>Entries you have recorded</small></article><article><span>Care access</span><strong>Private</strong><small>No clinician access unless you authorise it</small></article></div>
   <div className="patient-section-heading"><div><div className="account-kicker">YOUR HEALTH TOOLS</div><h2>Keep track of your care</h2></div></div>
   <div className="patient-feature-grid">
    <Link href="/my-care/blood-pressure" className="patient-feature-card"><span className="patient-feature-icon"><Activity/></span><h3>Blood pressure</h3><p>Record readings and review your own history. The app does not interpret readings or diagnose conditions.</p><span>Open blood pressure log <ArrowRight size={16}/></span></Link>
    <Link href="/my-care/symptoms" className="patient-feature-card"><span className="patient-feature-icon rose"><ClipboardList/></span><h3>Symptoms and notes</h3><p>Keep a private record of symptoms and questions to discuss with your maternity team.</p><span>Record a symptom <ArrowRight size={16}/></span></Link>
    <article className="patient-feature-card coming"><span className="patient-feature-icon"><CalendarHeart/></span><h3>Appointments</h3><p>Appointment planning and reminders are being prepared. No appointments are booked by this page yet.</p><small>In development</small></article>
    <article className="patient-feature-card coming"><span className="patient-feature-icon rose"><FileHeart/></span><h3>Health records</h3><p>Secure document storage is being prepared with private file access and consent controls.</p><small>In development</small></article>
    <article className="patient-feature-card coming"><span className="patient-feature-icon"><Stethoscope/></span><h3>Your care team</h3><p>Connect with a verified professional only after you review and authorise the relationship.</p><small>Consent controls in development</small></article>
    <Link href="/learn" className="patient-feature-card"><span className="patient-feature-icon"><BookOpen/></span><h3>Learning Centre</h3><p>Read pregnancy and postpartum education and learn when to seek urgent medical attention.</p><span>Explore learning <ArrowRight size={16}/></span></Link>
   </div>
   <section className="patient-recent-panel"><div><div className="account-kicker">RECENT READINGS</div><h2>Your latest blood pressure entries</h2></div>{recentReadings?.length?<ul>{recentReadings.map((reading,index)=><li key={index}><strong>{reading.systolic}/{reading.diastolic} mmHg</strong><span>{new Date(reading.measured_at).toLocaleString()}</span></li>)}</ul>:<p>No blood pressure readings have been saved yet. When you add your own readings, they will appear here. No sample records are displayed.</p>}<Link href="/my-care/blood-pressure">View full history <ArrowRight size={15}/></Link></section>
   <p className="patient-emergency-note">If you have a severe or persistent headache, vision changes, severe upper abdominal pain, sudden swelling, feel very unwell, or have any other urgent concern during pregnancy or after birth, seek urgent medical assessment. A seizure, collapse or severe difficulty breathing is an emergency. Do not wait for an app response.</p>
   <p className="patient-feedback-link"><MessageSquareText size={16}/> <Link href="/feedback">Share feedback about your experience</Link></p>
  </section>
 </main>;
}

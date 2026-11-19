import PatientPageNavigation from "@/components/patient-page-navigation";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarHeart, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PatientAppointments from "@/components/patient-appointments";

export const dynamic = "force-dynamic";
export const metadata = { title: "My appointments | Preggy Mom Aid" };

export default async function PatientAppointmentsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}><PatientPageNavigation active="appointments"/><section className="patient-dashboard-content"><Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> Back to dashboard</Link><h1>My appointments</h1><p className="account-intro">Appointment services are temporarily unavailable because account services are not configured for this deployment.</p></section></main>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care/appointments");
  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type === "professional") redirect("/professional");
  const { data: appointments } = await supabase.from("patient_appointments")
    .select("id,title,appointment_type,scheduled_at,location,notes,status")
    .eq("user_id", user.id).order("scheduled_at", { ascending: true }).limit(200);

  return (
    <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}>
      <PatientPageNavigation active="appointments"/>
      <section className="patient-dashboard-content">
        <Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> Back to dashboard</Link>
        <div className="account-kicker">YOUR PERSONAL SPACE</div>
        <h1><CalendarHeart size={28}/> My appointments</h1>
        <p className="account-intro">Keep track of antenatal and postnatal visits, scans and tests you have arranged.</p>
        <div className="patient-safety-note"><ShieldCheck size={20}/><p>This is a personal calendar only. It does not contact a hospital, book a visit or send appointment reminders. Please confirm all arrangements directly with your care provider.</p></div>
        <PatientAppointments initialAppointments={appointments ?? []} />
      </section>
    </main>
  );
}

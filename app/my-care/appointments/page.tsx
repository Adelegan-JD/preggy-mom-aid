import PatientShell from "@/components/patient-shell";
import { getServerTranslator } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PatientAppointments from "@/components/patient-appointments";
import { Callout, PageHeader, UnavailablePage } from "@/components/ds";

export const dynamic = "force-dynamic";
export const metadata = { title: "My appointments | Preggy Mom Aid" };

export default async function PatientAppointmentsPage() {
  const { t } = await getServerTranslator();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <PatientShell active="appointments"><UnavailablePage title={t("appointments")} message={t("unavailable")} /></PatientShell>;
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
    <PatientShell active="appointments">
      <div className="ds-page">
        <PageHeader title={t("appointments")} lede={t("calendarIntro")} />
        <PatientAppointments initialAppointments={appointments ?? []} />
        <Callout tone="neutral" className="ds-section">{t("appointmentInfo")}</Callout>
      </div>
    </PatientShell>
  );
}

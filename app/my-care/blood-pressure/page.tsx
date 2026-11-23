import PatientShell from "@/components/patient-shell";
import { getServerTranslator } from "@/lib/i18n/server";
import SpeakButton from "@/components/speak-button";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BloodPressureLog from "@/components/blood-pressure-log";
import { Callout, PageHeader, UnavailablePage } from "@/components/ds";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blood pressure log | Preggy Mom Aid" };

export default async function BloodPressurePage() {
  const { t } = await getServerTranslator();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <PatientShell active="blood-pressure"><UnavailablePage title={t("bloodPressure")} message={t("unavailable")} /></PatientShell>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care/blood-pressure");
  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type === "professional") redirect("/professional");
  const { data: rows } = await supabase.from("blood_pressure_readings").select("id,systolic,diastolic,pulse,measured_at,note").eq("user_id", user.id).order("measured_at", { ascending: false }).limit(100);
  return (
    <PatientShell active="blood-pressure">
      <div className="ds-page">
        <PageHeader title={t("bloodPressure")} lede={t("bloodPressureCardText")} />
        <BloodPressureLog initialRows={rows ?? []} />
        <Callout tone="danger" className="ds-section" action={<SpeakButton text={t("emergencyNotice")} />}>{t("emergencyNotice")}</Callout>
      </div>
    </PatientShell>
  );
}

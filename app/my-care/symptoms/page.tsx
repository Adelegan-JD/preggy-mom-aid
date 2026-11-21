import PatientShell from "@/components/patient-shell";
import { getServerTranslator } from "@/lib/i18n/server";
import SpeakButton from "@/components/speak-button";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SymptomLog from "@/components/symptom-log";
import { Callout, PageHeader, UnavailablePage } from "@/components/ds";

export const dynamic = "force-dynamic";
export const metadata = { title: "Symptom notes | Preggy Mom Aid" };

export default async function SymptomsPage() {
  const { t } = await getServerTranslator();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <PatientShell active="symptoms"><UnavailablePage title={t("symptoms")} message={t("unavailable")} /></PatientShell>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care/symptoms");
  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type === "professional") redirect("/professional");
  const { data: rows } = await supabase.from("symptom_reports").select("id,symptom_tags,description,occurred_at").eq("user_id", user.id).order("occurred_at", { ascending: false }).limit(100);
  return (
    <PatientShell active="symptoms">
      <div className="ds-page">
        <PageHeader title={t("symptoms")} lede={t("symptomCardText")} />
        <SymptomLog initialRows={rows ?? []} />
        <Callout tone="danger" className="ds-section" action={<SpeakButton text={t("symptomUrgent")} />}>{t("symptomUrgent")}</Callout>
      </div>
    </PatientShell>
  );
}

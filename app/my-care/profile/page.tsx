import PatientShell from "@/components/patient-shell";
import { getServerTranslator } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Callout, PageHeader, UnavailablePage } from "@/components/ds";
import PatientProfileForm from "@/components/patient-profile-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "My profile | Preggy Mom Aid" };

export default async function PatientProfilePage() {
  const { t } = await getServerTranslator();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <PatientShell active="profile"><UnavailablePage title={t("profileTitle")} message={t("unavailable")} /></PatientShell>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care/profile");
  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type === "professional") redirect("/professional");
  const { data: patientProfile } = await supabase.from("patient_profiles").select("preferred_name,phone_number,state_or_territory,preferred_language,pregnancy_status,estimated_due_date,birth_date").eq("user_id", user.id).maybeSingle();

  return (
    <PatientShell active="profile">
      <div className="ds-page">
        <PageHeader title={t("profileTitle")} lede={t("profileIntro")} />
        <Callout tone="info" className="ds-callout-spaced">{t("profileSafety")}</Callout>
        <PatientProfileForm initialProfile={patientProfile} />
      </div>
    </PatientShell>
  );
}

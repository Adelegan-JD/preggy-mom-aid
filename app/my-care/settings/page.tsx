import PatientShell from "@/components/patient-shell";
import { getServerTranslator } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Callout, PageHeader, UnavailablePage } from "@/components/ds";
import PatientAccountSettings from "@/components/patient-account-settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy and account settings | Preggy Mom Aid" };

export default async function PatientSettingsPage() {
  const { t } = await getServerTranslator();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <PatientShell active="settings"><UnavailablePage title={t("settingsTitle")} message={t("unavailable")} /></PatientShell>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care/settings");
  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type === "professional") redirect("/professional");
  const [{ data: preferences }, { data: deletionRequest }] = await Promise.all([
    supabase.from("patient_notification_preferences").select("appointment_email_reminders,product_email_updates").eq("user_id", user.id).maybeSingle(),
    supabase.from("account_deletion_requests").select("id").eq("user_id", user.id).in("status", ["requested", "processing"]).limit(1).maybeSingle()
  ]);

  return <PatientShell active="settings">
      <div className="ds-page">
        <PageHeader title={t("settingsTitle")} lede={t("settingsIntro")} />
        <Callout tone="info" className="ds-callout-spaced">{t("clinicianAccessOff")}</Callout>
        <PatientAccountSettings initialPreferences={preferences ?? { appointment_email_reminders: false, product_email_updates: false }} initialDeletionRequested={Boolean(deletionRequest)}/>
      </div>
    </PatientShell>;
}

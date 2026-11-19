import PatientPageNavigation from "@/components/patient-page-navigation";
import { getServerTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Settings, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PatientAccountSettings from "@/components/patient-account-settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy and account settings | Preggy Mom Aid" };

export default async function PatientSettingsPage() {
  const { t } = await getServerTranslator();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}><PatientPageNavigation active="settings"/><section className="patient-dashboard-content"><Link href="/login" className="patient-back-link"><ArrowLeft size={16}/> Return to sign in</Link><h1>{t("settingsTitle")}</h1><p className="account-intro">{t("unavailable")}</p></section></main>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care/settings");
  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type !== "patient") redirect("/professional");
  const [{ data: preferences }, { data: deletionRequest }] = await Promise.all([
    supabase.from("patient_notification_preferences").select("appointment_email_reminders,product_email_updates").eq("user_id", user.id).maybeSingle(),
    supabase.from("account_deletion_requests").select("id").eq("user_id", user.id).in("status", ["requested", "processing"]).limit(1).maybeSingle()
  ]);

  return <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}>
    <PatientPageNavigation active="settings"/>
    <section className="patient-dashboard-content">
      <Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> {t("backDashboard")}</Link>
      <div className="account-kicker">YOUR PERSONAL SPACE</div><h1><Settings size={28}/> {t("settingsTitle")}</h1>
      <p className="account-intro">{t("settingsIntro")}</p>
      <div className="patient-safety-note"><ShieldCheck size={20}/><p>{t("clinicianAccessOff")}</p></div>
      <PatientAccountSettings initialPreferences={preferences ?? { appointment_email_reminders: false, product_email_updates: false }} initialDeletionRequested={Boolean(deletionRequest)}/>
    </section>
  </main>;
}

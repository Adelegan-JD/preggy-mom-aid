import PatientPageNavigation from "@/components/patient-page-navigation";
import { getServerTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Heart, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PatientProfileForm from "@/components/patient-profile-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "My profile | Preggy Mom Aid" };

export default async function PatientProfilePage() {
  const { t } = await getServerTranslator();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}><PatientPageNavigation active="profile"/><section className="patient-dashboard-content"><Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> {t("backDashboard")}</Link><h1>Your profile</h1><p className="account-intro">Profile services are temporarily unavailable because account services are not configured for this deployment.</p></section></main>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care/profile");
  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type === "professional") redirect("/professional");
  const { data: patientProfile } = await supabase.from("patient_profiles").select("preferred_name,phone_number,state_or_territory,preferred_language,pregnancy_status,estimated_due_date,birth_date").eq("user_id", user.id).maybeSingle();

  return (
    <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}>
      <PatientPageNavigation active="profile"/>
      <section className="patient-dashboard-content">
        <Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> {t("backDashboard")}</Link>
        <div className="account-kicker">YOUR PERSONAL SPACE</div>
        <h1><Heart size={28}/> {t("profileTitle")}</h1>
        <p className="account-intro">{t("profileIntro")}</p>
        <div className="patient-safety-note"><ShieldCheck size={20}/><p>Your profile details are private to your account. Saving them does not share your information with a healthcare professional.</p></div>
        <PatientProfileForm initialProfile={patientProfile} />
      </section>
    </main>
  );
}

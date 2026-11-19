import PatientPageNavigation from "@/components/patient-page-navigation";
import { getServerTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileHeart, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PatientHealthDocuments from "@/components/patient-health-documents";

export const dynamic = "force-dynamic";
export const metadata = { title: "My health records | Preggy Mom Aid" };

export default async function PatientHealthRecordsPage() {
  const { t } = await getServerTranslator();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}><PatientPageNavigation active="records"/><section className="patient-dashboard-content"><Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> {t("backDashboard")}</Link><h1>{t("healthRecords")}</h1><p className="account-intro">{t("unavailable")}</p></section></main>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care/records");
  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type === "professional") redirect("/professional");
  const { data: documents } = await supabase.from("patient_health_documents")
    .select("id,object_path,display_name,mime_type,file_size_bytes,document_category,notes,created_at")
    .eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);

  return (
    <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}>
      <PatientPageNavigation active="records"/>
      <section className="patient-dashboard-content">
        <Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> {t("backDashboard")}</Link>
        <div className="account-kicker">YOUR PERSONAL SPACE</div>
        <h1><FileHeart size={28}/> {t("healthRecords")}</h1>
        <p className="account-intro">{t("privateHealthText")}</p>
        <div className="patient-safety-note"><ShieldCheck size={20}/><p>{t("recordsSafety")}</p></div>
        <PatientHealthDocuments initialDocuments={documents ?? []} />
      </section>
    </main>
  );
}

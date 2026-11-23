import PatientShell from "@/components/patient-shell";
import { getServerTranslator } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Callout, PageHeader, UnavailablePage } from "@/components/ds";
import PatientHealthDocuments from "@/components/patient-health-documents";

export const dynamic = "force-dynamic";
export const metadata = { title: "My health records | Preggy Mom Aid" };

export default async function PatientHealthRecordsPage() {
  const { t } = await getServerTranslator();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <PatientShell active="records"><UnavailablePage title={t("healthRecords")} message={t("unavailable")} /></PatientShell>;
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
    <PatientShell active="records">
      <div className="ds-page">
        <PageHeader title={t("healthRecords")} lede={t("privateHealthText")} />
        <Callout tone="info" className="ds-callout-spaced">{t("recordsSafety")}</Callout>
        <PatientHealthDocuments initialDocuments={documents ?? []} />
      </div>
    </PatientShell>
  );
}

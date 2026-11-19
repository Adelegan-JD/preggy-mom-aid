import PatientPageNavigation from "@/components/patient-page-navigation";
import { getServerTranslator } from "@/lib/i18n/server";
import SpeakButton from "@/components/speak-button";
import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import SymptomLog from "@/components/symptom-log";
import {ArrowLeft,ClipboardList} from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"Symptom notes | Preggy Mom Aid"};
export default async function SymptomsPage(){
 const { t } = await getServerTranslator();
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY){return <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}><PatientPageNavigation active="symptoms"/><section className="patient-dashboard-content"><Link href="/login" className="patient-back-link">Return to sign in</Link><h1>Health log unavailable</h1><p className="account-intro">Secure account services are not configured for this deployment yet.</p></section></main>;}
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?next=/my-care/symptoms");
 const {data:account}=await supabase.from("profiles").select("account_type").eq("id",user.id).maybeSingle();if(account?.account_type==="professional")redirect("/professional");
 const {data:rows}=await supabase.from("symptom_reports").select("id,symptom_tags,description,occurred_at").eq("user_id",user.id).order("occurred_at",{ascending:false}).limit(100);
 return <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}><PatientPageNavigation active="symptoms"/><section className="patient-dashboard-content"><Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> {t("backDashboard")}</Link><div className="account-kicker">YOUR PRIVATE HEALTH LOG</div><h1><ClipboardList size={28}/> {t("symptoms")}</h1><p className="account-intro">{t("dashboardIntro")}</p><SymptomLog initialRows={rows??[]}/><div className="patient-emergency-note"><p>{t("symptomUrgent")}</p><SpeakButton text={t("symptomUrgent")}/></div></section></main>;
}

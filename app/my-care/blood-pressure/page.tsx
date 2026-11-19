import PatientPageNavigation from "@/components/patient-page-navigation";
import { getServerTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import BloodPressureLog from "@/components/blood-pressure-log";
import {ArrowLeft,Activity} from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"Blood pressure log | Preggy Mom Aid"};
export default async function BloodPressurePage(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY){return <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}><PatientPageNavigation active="blood-pressure"/><section className="patient-dashboard-content"><Link href="/login" className="patient-back-link">Return to sign in</Link><h1>Health log unavailable</h1><p className="account-intro">Secure account services are not configured for this deployment yet.</p></section></main>;}
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?next=/my-care/blood-pressure");
 const {data:account}=await supabase.from("profiles").select("account_type").eq("id",user.id).maybeSingle();if(account?.account_type==="professional")redirect("/professional");
 const {data:rows}=await supabase.from("blood_pressure_readings").select("id,systolic,diastolic,pulse,measured_at,note").eq("user_id",user.id).order("measured_at",{ascending:false}).limit(100);
 return <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}><PatientPageNavigation active="blood-pressure"/><section className="patient-dashboard-content"><Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> {t("backDashboard")}</Link><div className="account-kicker">YOUR PRIVATE HEALTH LOG</div><h1><Activity size={28}/> {t("bloodPressure")}</h1><p className="account-intro">{t("dashboardIntro")}</p><BloodPressureLog initialRows={rows??[]}/><p className="patient-emergency-note">{t("emergencyNotice")}</p></section></main>;
}

import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import BloodPressureLog from "@/components/blood-pressure-log";
import {ArrowLeft,Activity} from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"Blood pressure log | Preggy Mom Aid"};
export default async function BloodPressurePage(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?next=/my-care/blood-pressure");
 const {data:account}=await supabase.from("profiles").select("account_type").eq("id",user.id).maybeSingle();if(account?.account_type==="professional")redirect("/professional");\n const {data:rows}=await supabase.from("blood_pressure_readings").select("id,systolic,diastolic,pulse,measured_at,note").eq("user_id",user.id).order("measured_at",{ascending:false}).limit(100);
 return <main className="patient-dashboard" id="main-content" tabIndex={-1}><section className="patient-dashboard-content"><Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> Back to dashboard</Link><div className="account-kicker">YOUR PRIVATE HEALTH LOG</div><h1><Activity size={28}/> Blood pressure</h1><p className="account-intro">Record readings given to you by your healthcare team or taken using your own monitor. This page stores your entries; it does not interpret readings or provide a diagnosis.</p><BloodPressureLog initialRows={rows??[]}/><p className="patient-emergency-note">If you feel unwell or have warning symptoms, seek urgent medical assessment regardless of a reading. Do not wait for this app to respond.</p></section></main>;
}

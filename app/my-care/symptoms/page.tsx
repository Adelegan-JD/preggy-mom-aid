import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import SymptomLog from "@/components/symptom-log";
import {ArrowLeft,ClipboardList} from "lucide-react";
export const dynamic="force-dynamic";
export const metadata={title:"Symptom notes | Preggy Mom Aid"};
export default async function SymptomsPage(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?next=/my-care/symptoms");
 const {data:rows}=await supabase.from("symptom_reports").select("id,symptom_tags,description,occurred_at").eq("user_id",user.id).order("occurred_at",{ascending:false}).limit(100);
 return <main className="patient-dashboard" id="main-content" tabIndex={-1}><section className="patient-dashboard-content"><Link href="/my-care" className="patient-back-link"><ArrowLeft size={16}/> Back to dashboard</Link><div className="account-kicker">YOUR PRIVATE HEALTH LOG</div><h1><ClipboardList size={28}/> Symptoms and notes</h1><p className="account-intro">Keep a private note of symptoms or questions you want to discuss with your maternity team. Entries are not monitored and do not trigger a response.</p><SymptomLog initialRows={rows??[]}/><p className="patient-emergency-note">Severe headache, vision changes, severe pain below the ribs, sudden swelling or feeling very unwell need urgent medical assessment. A seizure, collapse or severe difficulty breathing is an emergency. Do not wait to record a symptom here.</p></section></main>;
}

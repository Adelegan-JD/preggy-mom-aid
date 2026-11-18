import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck,Stethoscope,BookOpen,MessageSquareText } from "lucide-react";
import ProfessionalApplicationForm from "@/components/professional-application-form";

export const dynamic="force-dynamic";
export const metadata={title:"Professional space | Preggy Mom Aid"};

export default async function ProfessionalPage(){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/login?next=/professional");
 const {data:profile}=await supabase.from("profiles").select("full_name,account_type,professional_type,verification_status").eq("id",user.id).maybeSingle();
 if(!profile||profile.account_type!=="professional")redirect("/my-care");
 const {data:application}=await supabase.from("professional_applications").select("status").eq("user_id",user.id).maybeSingle();
 const profession=profile.professional_type as "doctor"|"nurse"|"midwife"|null;
 return <main className="professional-dashboard" id="main-content" tabIndex={-1}>
  <header className="professional-dashboard-header"><Link href="/" className="account-brand"><span className="account-brand-mark"><Stethoscope size={20}/></span><span><b>Preggy Mom Aid</b><small>PROFESSIONAL SPACE</small></span></Link><form action={async()=>{"use server";const client=await createClient();await client.auth.signOut();redirect("/login");}}><button className="account-signout">Sign out</button></form></header>
  <section className="professional-dashboard-content">
   <div className="account-kicker">HEALTHCARE PROFESSIONAL PORTAL</div><h1>Welcome{profile.full_name?" "+profile.full_name.split(/\\s+/)[0]:""}</h1><p className="account-intro">A dedicated space for verified doctors, nurses and midwives supporting maternal health.</p>
   {profile.verification_status!=="verified"?<section className="professional-verification-panel"><span className="professional-verification-icon"><ShieldCheck size={26}/></span><h2>Professional verification required</h2><p>Your account is registered as a {profession??"healthcare"} professional. Practitioner tools and patient information remain restricted until your registration is checked by an authorised reviewer.</p><p className="verification-status">Current status: <strong>{application?.status??profile.verification_status??"pending"}</strong></p>{!application&&profession&&<><h3>Submit your professional details</h3><ProfessionalApplicationForm profession={profession}/></>}</section>:<section className="professional-verification-panel"><span className="professional-verification-icon"><ShieldCheck size={26}/></span><h2>Your professional account is verified</h2><p>Patient access is controlled separately. You will only see a patient’s information after that patient has explicitly authorised the relationship.</p><div className="professional-dashboard-links"><Link href="/learn"><BookOpen/> Learning Centre</Link><Link href="/feedback"><MessageSquareText/> Product feedback</Link></div></section>}
  </section>
 </main>;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, MessageSquareText, Stethoscope } from "lucide-react";
import SignOutButton from "@/components/sign-out-button";
import AuthLayout from "@/components/auth/auth-layout";
import { Callout } from "@/components/ds";
import ProfessionalApplicationForm from "@/components/professional-application-form";

export const dynamic="force-dynamic";
export const metadata={title:"Professional space | Preggy Mom Aid"};

async function signOut(){
 "use server";
 const client=await createClient();
 try{await client.auth.signOut();}finally{redirect("/login?signed_out=1");}
}

export default async function ProfessionalPage(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY){
  return <AuthLayout title="Professional space" lede="Secure account services are temporarily unavailable. Please try again later."><Link className="ds-btn" href="/">Return to Preggy Mom Aid</Link></AuthLayout>;
 }
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/login?next=/professional");
 const {data:profile}=await supabase.from("profiles").select("full_name,account_type,professional_type,verification_status").eq("id",user.id).maybeSingle();
 if(!profile||profile.account_type!=="professional")redirect("/my-care");
 const {data:application}=await supabase.from("professional_applications").select("status").eq("user_id",user.id).maybeSingle();
 const profession=profile.professional_type as "doctor"|"nurse"|"midwife"|null;
 const firstName=profile.full_name?profile.full_name.trim().split(/\s+/)[0]:"";
 const status=application?.status??profile.verification_status??"pending";
 const signOutForm=<SignOutButton action={signOut} label="Sign out" className="ds-btn ds-btn-ghost" />;
 if(profile.verification_status==="verified"){
  return <AuthLayout title={`Welcome${firstName?`, ${firstName}`:""}`} lede="Your professional account is verified." footer={signOutForm}>
   <Callout tone="success" title="Patient access is controlled separately">You will only see a patient&apos;s information after that patient has explicitly authorised it.</Callout>
   <div className="ds-form-actions"><Link className="ds-btn" href="/learn"><BookOpen size={16} aria-hidden="true"/> Learning Centre</Link><Link className="ds-btn" href="/feedback"><MessageSquareText size={16} aria-hidden="true"/> Product feedback</Link></div>
  </AuthLayout>;
 }
 return <AuthLayout title={`Welcome${firstName?`, ${firstName}`:""}`} lede={`Your account is registered as a ${profession??"healthcare"} professional. Practitioner tools and patient information stay restricted until an authorised reviewer checks your registration.`} footer={signOutForm}>
  <div className="ds-panel ds-panel-quiet ds-form-actions" style={{ justifyContent: "space-between" }}><span className="ds-label">Verification status</span><span className="ds-badge ds-badge-warning" style={{ textTransform: "capitalize" }}><Stethoscope size={13} aria-hidden="true"/> {String(status).replaceAll("_"," ")}</span></div>
  {!application&&profession&&<section className="ds-stack"><h2 className="ds-h2">Submit your professional details</h2><ProfessionalApplicationForm profession={profession}/></section>}
 </AuthLayout>;
}

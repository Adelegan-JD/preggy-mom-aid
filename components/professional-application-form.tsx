"use client";

import { FormEvent,useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfessionalApplicationForm({profession}:{profession:"doctor"|"nurse"|"midwife"}){
 const [registrationNumber,setRegistrationNumber]=useState("");
 const [institution,setInstitution]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setMessage("");setError("");
  try{
   const supabase=createClient();
   const {data:{user},error:userError}=await supabase.auth.getUser();
   if(userError||!user)throw new Error("Please sign in again to continue.");
   const {error:insertError}=await supabase.from("professional_applications").insert({user_id:user.id,profession,registration_number:registrationNumber.trim(),institution:institution.trim()||null});
   if(insertError)throw insertError;
   setMessage("Your application has been submitted. It will remain pending until an authorised reviewer checks your professional registration.");
   setRegistrationNumber("");setInstitution("");
  }catch(e){setError(e instanceof Error?e.message:"We could not submit your application. Please try again.");}
  finally{setBusy(false);}
 }
 return <form className="account-form professional-application-form" onSubmit={submit}>
  <label htmlFor="registrationNumber">Professional registration number</label><input id="registrationNumber" value={registrationNumber} onChange={e=>setRegistrationNumber(e.target.value)} required maxLength={80} autoComplete="off"/>
  <label htmlFor="institution">Current facility or institution (optional)</label><input id="institution" value={institution} onChange={e=>setInstitution(e.target.value)} maxLength={160}/>
  <p className="account-footnote">Your registration details are private and used only for credential verification. Do not upload identity documents through product feedback.</p>
  <button className="account-submit" disabled={busy}>{busy?"Submitting…":"Submit for verification"}</button>
  {error&&<p className="account-error" role="alert">{error}</p>}{message&&<p className="account-success" role="status">{message}</p>}
 </form>;
}

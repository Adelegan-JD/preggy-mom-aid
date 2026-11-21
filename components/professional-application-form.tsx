"use client";

import { FormEvent,useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfessionalApplicationForm({profession}:{profession:"doctor"|"nurse"|"midwife"}){
 const [registrationNumber,setRegistrationNumber]=useState("");
 const [institution,setInstitution]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const [submitted,setSubmitted]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setMessage("");setError("");
  try{
   const supabase=createClient();
   const {data:{user},error:userError}=await supabase.auth.getUser();
   if(userError||!user)throw new Error("Please sign in again to continue.");
   const {error:insertError}=await supabase.from("professional_applications").insert({user_id:user.id,profession,registration_number:registrationNumber.trim(),institution:institution.trim()||null});
   if(insertError)throw insertError;
   setMessage("Your application has been submitted. It will remain pending until an authorised reviewer checks your professional registration.");
   setRegistrationNumber("");setInstitution("");setSubmitted(true);
  }catch(e){setError(e instanceof Error?e.message:"We could not submit your application. Please try again.");}
  finally{setBusy(false);}
 }
 if(submitted)return <p className="ds-message ds-message-success" role="status">{message}</p>;
 return <form className="ds-form" onSubmit={submit}>
  <div className="ds-field"><label className="ds-label" htmlFor="registrationNumber">Professional registration number</label><input className="ds-input" id="registrationNumber" value={registrationNumber} onChange={e=>setRegistrationNumber(e.target.value)} required maxLength={80} autoComplete="off"/></div>
  <div className="ds-field"><label className="ds-label" htmlFor="institution">Current facility or institution <span className="ds-optional">Optional</span></label><input className="ds-input" id="institution" value={institution} onChange={e=>setInstitution(e.target.value)} maxLength={160}/></div>
  <p className="ds-hint">Your registration details are private and used only for credential verification. Do not send identity documents through product feedback.</p>
  <button className="ds-btn ds-btn-primary ds-btn-lg ds-btn-block" disabled={busy}>{busy?"Submitting…":"Submit for verification"}</button>
  {error&&<p className="ds-message ds-message-error" role="alert">{error}</p>}
 </form>;
}

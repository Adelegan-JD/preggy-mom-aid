"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { useConfirmations } from "@/contexts/confirmations-provider";
type Row={id:string;systolic:number;diastolic:number;pulse:number|null;measured_at:string;note:string|null};
function localValue(value?:string){const d=value?new Date(value):new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
function csv(rows:Row[]){const cell=(v:unknown)=>`"${String(v??"").replace(/"/g,'""')}"`;const data=[["Measured at","Systolic (mmHg)","Diastolic (mmHg)","Pulse (bpm)","Note"],...rows.map(r=>[r.measured_at,r.systolic,r.diastolic,r.pulse,r.note])].map(r=>r.map(cell).join(",")).join("\r\n");const url=URL.createObjectURL(new Blob(["\uFEFF",data],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="my-blood-pressure-records.csv";a.click();URL.revokeObjectURL(url)}
export default function BloodPressureLog({initialRows}:{initialRows:Row[]}){
 const { t, language } = useLanguage();
 const { openConfirmModal } = useConfirmations();
 const [rows,setRows]=useState(initialRows),[editing,setEditing]=useState<string|null>(null),[systolic,setSystolic]=useState(""),[diastolic,setDiastolic]=useState(""),[pulse,setPulse]=useState(""),[measuredAt,setMeasuredAt]=useState(localValue),[note,setNote]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 function reset(){setEditing(null);setSystolic("");setDiastolic("");setPulse("");setMeasuredAt(localValue());setNote("")}
 function edit(r:Row){setEditing(r.id);setSystolic(String(r.systolic));setDiastolic(String(r.diastolic));setPulse(r.pulse==null?"":String(r.pulse));setMeasuredAt(localValue(r.measured_at));setNote(r.note??"");setError("");setMessage("")}
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");setMessage("");try{const top=Number(systolic),bottom=Number(diastolic),pulseValue=pulse?Number(pulse):null;if(!Number.isInteger(top)||top<60||top>300||!Number.isInteger(bottom)||bottom<30||bottom>200||top<=bottom)throw new Error("Check the reading: the top number must be greater than the bottom number and both must be within the stated ranges.");if(pulseValue!==null&&(!Number.isInteger(pulseValue)||pulseValue<25||pulseValue>250))throw new Error("Enter a valid pulse or leave it blank.");const date=new Date(measuredAt);if(Number.isNaN(date.getTime()))throw new Error("Enter a valid date and time.");const supabase=createClient(),{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Your session has expired. Please sign in again.");const payload={systolic:top,diastolic:bottom,pulse:pulseValue,measured_at:date.toISOString(),note:note.trim()||null};if(editing){const {data,error}=await supabase.from("blood_pressure_readings").update(payload).eq("id",editing).eq("user_id",user.id).select("id,systolic,diastolic,pulse,measured_at,note").single();if(error)throw error;setRows(current=>current.map(r=>r.id===editing?data:r).sort((a,b)=>b.measured_at.localeCompare(a.measured_at)));setMessage(t("readingUpdated"))}else{const {data,error}=await supabase.from("blood_pressure_readings").insert({...payload,user_id:user.id}).select("id,systolic,diastolic,pulse,measured_at,note").single();if(error)throw error;setRows(current=>[data,...current].sort((a,b)=>b.measured_at.localeCompare(a.measured_at)));setMessage(t("readingSaved"))}reset()}catch(cause){setError(cause instanceof Error?cause.message:"We could not save this reading. Please try again.")}finally{setBusy(false)}}
 async function performRemove(r:Row){const {error}=await createClient().from("blood_pressure_readings").delete().eq("id",r.id);if(error){setError("We could not delete this entry. Please try again.");return}setRows(current=>current.filter(x=>x.id!==r.id));if(editing===r.id)reset();setMessage("Reading deleted.")}
 const locale = language === "yo" ? "yo-NG" : language === "ha" ? "ha-NG" : language === "ig" ? "ig-NG" : "en-NG";
 const when = (value: string) => new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
 return <div className="ds-split">
  <form className="ds-panel ds-form ds-sticky" onSubmit={submit} aria-labelledby="bp-form-title">
   <h2 className="ds-h2" id="bp-form-title">{editing ? t("editReading") : t("addReading")}</h2>
   <div className="ds-field-row">
    <div className="ds-field"><label className="ds-label" htmlFor="systolic">{t("systolicTop")}</label><input className="ds-input ds-tabular" id="systolic" type="number" inputMode="numeric" min="60" max="300" required value={systolic} onChange={e => setSystolic(e.target.value)} /></div>
    <div className="ds-field"><label className="ds-label" htmlFor="diastolic">{t("diastolicBottom")}</label><input className="ds-input ds-tabular" id="diastolic" type="number" inputMode="numeric" min="30" max="200" required value={diastolic} onChange={e => setDiastolic(e.target.value)} /></div>
   </div>
   <div className="ds-field-row">
    <div className="ds-field"><label className="ds-label" htmlFor="pulse">{t("pulseOptional")}</label><input className="ds-input ds-tabular" id="pulse" type="number" inputMode="numeric" min="25" max="250" value={pulse} onChange={e => setPulse(e.target.value)} /></div>
    <div className="ds-field"><label className="ds-label" htmlFor="measuredAt">{t("measuredDateTime")}</label><input className="ds-input" id="measuredAt" type="datetime-local" required value={measuredAt} onChange={e => setMeasuredAt(e.target.value)} /></div>
   </div>
   <div className="ds-field"><label className="ds-label" htmlFor="bpNote">{t("noteOptional")}</label><textarea className="ds-input" id="bpNote" maxLength={500} rows={3} value={note} onChange={e => setNote(e.target.value)} /></div>
   <div className="ds-form-actions">
    <button className="ds-btn ds-btn-primary" disabled={busy}>{busy ? t("saving") : editing ? t("saveChanges") : t("saveReading")}</button>
    {editing && <button type="button" className="ds-btn ds-btn-ghost" onClick={reset}>{t("cancelEditing")}</button>}
   </div>
   {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
   {message && <p className="ds-message ds-message-success" role="status">{message}</p>}
   <p className="ds-hint">{t("bpFormFootnote")}</p>
  </form>
  <section className="ds-panel" aria-labelledby="bp-history-title">
   <div className="ds-panel-header"><h2 className="ds-h2" id="bp-history-title">{t("history")}</h2><button type="button" className="ds-btn ds-btn-sm" disabled={!rows.length} onClick={() => csv(rows)}>{t("exportCsv")}</button></div>
   {rows.length ? <ul className="ds-list">{rows.map(r => <li key={r.id} className="ds-list-item">
    <div className="ds-list-main">
     <span className="ds-list-title ds-tabular">{r.systolic}/{r.diastolic} <span className="ds-muted ds-small">mmHg{r.pulse ? ` · ${r.pulse} bpm` : ""}</span></span>
     <span className="ds-list-meta">{when(r.measured_at)}</span>
     {r.note && <span className="ds-list-meta">{r.note}</span>}
    </div>
    <div className="ds-list-actions"><button type="button" className="ds-btn ds-btn-sm ds-btn-ghost" onClick={() => edit(r)}>{t("edit")}</button><button type="button" className="ds-btn ds-btn-sm ds-btn-danger" onClick={() => openConfirmModal(`Delete the reading ${r.systolic}/${r.diastolic} mmHg? This cannot be undone.`, () => performRemove(r), { title: "Delete this reading?", confirmText: t("delete"), isDelete: true })}>{t("delete")}</button></div>
   </li>)}</ul> : <div className="ds-empty"><b>{t("noReadings")}</b></div>}
  </section>
 </div>
}

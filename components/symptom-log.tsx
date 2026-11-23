"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { useConfirmations } from "@/contexts/confirmations-provider";
type Row={id:string;symptom_tags:string[];description:string|null;occurred_at:string};
const options=[{value:"Headache",key:"symptomHeadache"},{value:"Vision changes",key:"symptomVision"},{value:"Pain below the ribs / upper abdomen",key:"symptomPain"},{value:"Sudden swelling",key:"symptomSwelling"},{value:"Nausea or vomiting",key:"symptomNausea"},{value:"Feeling unusually unwell",key:"symptomUnwell"},{value:"Other",key:"symptomOther"}] as const;
function localValue(value?:string){const d=value?new Date(value):new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
function csv(rows:Row[]){const cell=(v:unknown)=>`"${String(v??"").replace(/"/g,'""')}"`;const data=[["Occurred at","Symptoms","Notes"],...rows.map(r=>[r.occurred_at,r.symptom_tags.join("; "),r.description])].map(r=>r.map(cell).join(",")).join("\r\n");const url=URL.createObjectURL(new Blob(["\uFEFF",data],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="my-symptom-notes.csv";a.click();URL.revokeObjectURL(url)}
export default function SymptomLog({initialRows}:{initialRows:Row[]}){const { t, language } = useLanguage();
 const { openConfirmModal } = useConfirmations(); const [rows,setRows]=useState(initialRows),[editing,setEditing]=useState<string|null>(null),[tags,setTags]=useState<string[]>([]),[description,setDescription]=useState(""),[occurredAt,setOccurredAt]=useState(localValue),[busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
function toggle(v:string){setTags(current=>current.includes(v)?current.filter(x=>x!==v):[...current,v])}function reset(){setEditing(null);setTags([]);setDescription("");setOccurredAt(localValue())}function edit(r:Row){setEditing(r.id);setTags(r.symptom_tags);setDescription(r.description??"");setOccurredAt(localValue(r.occurred_at));setError("");setMessage("")}
async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");setMessage("");try{const date=new Date(occurredAt);if(Number.isNaN(date.getTime()))throw new Error("Enter a valid date and time.");if(!tags.length&&!description.trim())throw new Error("Choose at least one symptom or add a note.");const supabase=createClient(),{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Your session has expired. Please sign in again.");const payload={symptom_tags:tags,description:description.trim()||null,occurred_at:date.toISOString()};if(editing){const {data,error}=await supabase.from("symptom_reports").update(payload).eq("id",editing).eq("user_id",user.id).select("id,symptom_tags,description,occurred_at").single();if(error)throw error;setRows(current=>current.map(r=>r.id===editing?data:r).sort((a,b)=>b.occurred_at.localeCompare(a.occurred_at)));setMessage(t("noteUpdated"))}else{const {data,error}=await supabase.from("symptom_reports").insert({...payload,user_id:user.id}).select("id,symptom_tags,description,occurred_at").single();if(error)throw error;setRows(current=>[data,...current].sort((a,b)=>b.occurred_at.localeCompare(a.occurred_at)));setMessage(t("noteSaved"))}reset()}catch(cause){setError(cause instanceof Error?cause.message:"We could not save this note. Please try again.")}finally{setBusy(false)}}
async function performRemove(r:Row){const {error}=await createClient().from("symptom_reports").delete().eq("id",r.id);if(error){setError("We could not delete this note. Please try again.");return}setRows(current=>current.filter(x=>x.id!==r.id));if(editing===r.id)reset();setMessage("Note deleted.")}
const locale = language === "yo" ? "yo-NG" : language === "ha" ? "ha-NG" : language === "ig" ? "ig-NG" : "en-NG";
const when = (value: string) => new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
const tagLabel = (tag: string) => { const match = options.find(option => option.value === tag); return match ? t(match.key) : tag; };
return <div className="ds-split">
 <form className="ds-panel ds-form ds-sticky" onSubmit={submit} aria-labelledby="symptom-form-title">
  <h2 className="ds-h2" id="symptom-form-title">{editing ? t("editSymptom") : t("recordSymptom")}</h2>
  <fieldset className="ds-fieldset"><legend>{t("whatRecord")}</legend>
   <div className="ds-choice-grid">{options.map(option => <label key={option.value} className="ds-choice"><input type="checkbox" checked={tags.includes(option.value)} onChange={() => toggle(option.value)} />{t(option.key)}</label>)}</div>
  </fieldset>
  <div className="ds-field"><label className="ds-label" htmlFor="symptomWhen">{t("whenHappen")}</label><input className="ds-input" id="symptomWhen" type="datetime-local" required value={occurredAt} onChange={e => setOccurredAt(e.target.value)} /></div>
  <div className="ds-field"><label className="ds-label" htmlFor="symptomDescription">{t("additionalNotes")}</label><textarea className="ds-input" id="symptomDescription" rows={4} maxLength={2000} value={description} onChange={e => setDescription(e.target.value)} /></div>
  <div className="ds-form-actions">
   <button className="ds-btn ds-btn-primary" disabled={busy || (!tags.length && !description.trim())}>{busy ? t("saving") : editing ? t("saveChanges") : t("savePrivateNote")}</button>
   {editing && <button type="button" className="ds-btn ds-btn-ghost" onClick={reset}>{t("cancelEditing")}</button>}
  </div>
  {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
  {message && <p className="ds-message ds-message-success" role="status">{message}</p>}
  <p className="ds-hint">{t("symptomFootnote")}</p>
 </form>
 <section className="ds-panel" aria-labelledby="symptom-history-title">
  <div className="ds-panel-header"><h2 className="ds-h2" id="symptom-history-title">{t("symptomNotesTitle")}</h2><button type="button" className="ds-btn ds-btn-sm" disabled={!rows.length} onClick={() => csv(rows)}>{t("exportCsv")}</button></div>
  {rows.length ? <ul className="ds-list">{rows.map(r => <li key={r.id} className="ds-list-item">
   <div className="ds-list-main">
    <span className="ds-list-title">{r.symptom_tags.map(tagLabel).join(", ") || "Personal note"}</span>
    <span className="ds-list-meta">{when(r.occurred_at)}</span>
    {r.description && <span className="ds-list-meta">{r.description}</span>}
   </div>
   <div className="ds-list-actions"><button type="button" className="ds-btn ds-btn-sm ds-btn-ghost" onClick={() => edit(r)}>{t("edit")}</button><button type="button" className="ds-btn ds-btn-sm ds-btn-danger" onClick={() => openConfirmModal("This note will be permanently removed from your account. This cannot be undone.", () => performRemove(r), { title: "Delete this symptom note?", confirmText: t("delete"), isDelete: true })}>{t("delete")}</button></div>
  </li>)}</ul> : <div className="ds-empty"><b>{t("noNotes")}</b></div>}
 </section>
</div>}

"use client";

import { useState } from "react";
import { Baby, CalendarHeart, HeartPulse } from "lucide-react";

const stages = [
 {id:"pregnancy",title:"During pregnancy",icon:HeartPulse,heading:"Keep routine antenatal checks",body:"Blood-pressure and urine checks are part of routine antenatal care. Keep appointments even when you feel well, and discuss new or worrying symptoms with your maternity team."},
 {id:"birth",title:"Around childbirth",icon:Baby,heading:"Keep your care team informed",body:"Share your health history and any symptoms with the professionals caring for you. Ask who to contact if you feel unwell after leaving the facility."},
 {id:"postpartum",title:"After birth",icon:CalendarHeart,heading:"Care continues after delivery",body:"Pre-eclampsia can sometimes first appear after birth. Keep recommended follow-up appointments and seek urgent assessment for warning symptoms."}
] as const;

export default function InteractiveMaternalJourney(){
 const [active,setActive]=useState<(typeof stages)[number]["id"]>("pregnancy");
 const current=stages.find(stage=>stage.id===active)!;
 return <section className="ds-panel ds-stack-lg" aria-labelledby="journey-title">
  <div className="ds-stack" style={{ gap: "var(--ds-2)" }}><h2 className="ds-h1" id="journey-title">Support through every stage</h2><p className="ds-muted">Select a stage to explore practical conversations to have with your maternity team.</p></div>
  <div className="ds-segmented" role="group" aria-label="Choose a stage">{stages.map(stage=>{const Icon=stage.icon;return <button key={stage.id} type="button" aria-pressed={active===stage.id} onClick={()=>setActive(stage.id)}><Icon size={16} aria-hidden="true" style={{ verticalAlign: "-3px", marginRight: 6 }}/>{stage.title}</button>;})}</div>
  <div className="ds-stack" key={current.id} aria-live="polite" style={{ gap: "var(--ds-2)" }}><h3 className="ds-h2">{current.heading}</h3><p className="ds-body">{current.body}</p></div>
  <p className="ds-hint">General education only. This guide does not assess individual risk or replace care from a qualified professional. A seizure, collapse or severe difficulty breathing is an emergency.</p>
 </section>;
}

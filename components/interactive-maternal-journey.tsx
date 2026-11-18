"use client";

import { useState } from "react";
import { Baby, CalendarHeart, HeartPulse, ShieldCheck } from "lucide-react";

const stages = [
 {id:"pregnancy",title:"During pregnancy",icon:HeartPulse,heading:"Keep routine antenatal checks",body:"Blood-pressure and urine checks are part of routine antenatal care. Keep appointments even when you feel well, and discuss new or worrying symptoms with your maternity team."},
 {id:"birth",title:"Around childbirth",icon:Baby,heading:"Keep your care team informed",body:"Share your health history and any symptoms with the professionals caring for you. Ask who to contact if you feel unwell after leaving the facility."},
 {id:"postpartum",title:"After birth",icon:CalendarHeart,heading:"Care continues after delivery",body:"Pre-eclampsia can sometimes first appear after birth. Keep recommended follow-up appointments and seek urgent assessment for warning symptoms."}
] as const;

export default function InteractiveMaternalJourney(){
 const [active,setActive]=useState<(typeof stages)[number]["id"]>("pregnancy");
 const current=stages.find(stage=>stage.id===active)!;
 return <section className="maternal-journey" aria-labelledby="journey-title">
  <div className="journey-heading"><span className="learn-kicker"><ShieldCheck size={14}/> INTERACTIVE CARE JOURNEY</span><h2 id="journey-title">Support through every stage</h2><p>Select a stage to explore practical conversations to have with your maternity team.</p></div>
  <div className="journey-visual">
   <svg className="journey-track" viewBox="0 0 720 120" role="img" aria-labelledby="journey-svg-title"><title id="journey-svg-title">A connected journey through pregnancy, childbirth and postpartum care</title><path className="journey-line" d="M110 60 C220 60 240 60 360 60 S500 60 610 60"/><path className="journey-line journey-line-active" d={active==="pregnancy"?"M110 60 L110 60":active==="birth"?"M110 60 L360 60":"M110 60 L610 60"}/>{stages.map((stage,index)=>{const x=[110,360,610][index];return <g key={stage.id} className={active===stage.id?"journey-node selected":"journey-node"}><circle cx={x} cy="60" r="28"/><circle cx={x} cy="60" r="19" className="journey-node-inner"/><text x={x} y="101" textAnchor="middle">{String(index+1).padStart(2,"0")}</text></g>;})}</svg>
   <div className="journey-stage-buttons">{stages.map(stage=>{const Icon=stage.icon;return <button key={stage.id} type="button" aria-pressed={active===stage.id} className={active===stage.id?"journey-stage active":"journey-stage"} onClick={()=>setActive(stage.id)}><Icon size={19}/><span>{stage.title}</span></button>;})}</div>
  </div>
  <div className="journey-detail" key={current.id} aria-live="polite"><span className="journey-detail-icon"><current.icon size={23}/></span><div><span className="journey-detail-label">{current.title}</span><h3>{current.heading}</h3><p>{current.body}</p></div></div>
  <p className="journey-disclaimer">General education only. This guide does not assess individual risk or replace care from a qualified professional. A seizure, collapse or severe difficulty breathing is an emergency.</p>
 </section>;
}

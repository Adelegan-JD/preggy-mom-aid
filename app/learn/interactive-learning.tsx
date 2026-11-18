"use client";

import { useState } from "react";
import { Activity, Baby, CalendarDays, ChevronDown, Eye, Hand, HeartPulse, ShieldAlert, Stethoscope, Zap } from "lucide-react";

const stages = [
  { id: "pregnancy", label: "During pregnancy", icon: Baby, title: "Keep your antenatal care connected", copy: "Attend the appointments arranged by your maternity team, ask what checks are planned, and make sure you know how to contact them between visits.", steps: ["Antenatal appointment", "Checks recommended by your clinician", "Discuss results and your follow-up plan"] },
  { id: "after-birth", label: "After birth", icon: HeartPulse, title: "Care continues after delivery", copy: "Some pregnancy-related blood-pressure problems can appear or continue after birth. Keep postnatal follow-up and take new or worrying symptoms seriously.", steps: ["Postnatal follow-up", "Discuss blood pressure and recovery", "Know who to contact if symptoms appear"] }
];

const warningCards = [
  { icon: Activity, title: "Severe or persistent headache", detail: "A headache that is severe, persistent or unusual needs urgent medical assessment, especially during pregnancy or after birth." },
  { icon: Eye, title: "Changes in vision", detail: "Blurred vision, flashing lights, spots or other sudden changes in vision should be assessed urgently." },
  { icon: HeartPulse, title: "Pain below the ribs", detail: "Severe pain in the upper abdomen or below the ribs can be a warning sign. Seek urgent assessment." },
  { icon: Hand, title: "Sudden swelling", detail: "Sudden swelling of the face or hands, particularly with other symptoms, needs prompt medical attention." },
  { icon: Zap, title: "Vomiting or feeling very unwell", detail: "New vomiting or feeling seriously unwell during pregnancy or after birth should not be ignored." },
  { icon: ShieldAlert, title: "Seizure, collapse or breathing difficulty", detail: "This is an emergency. Call local emergency services or get emergency medical help immediately. Do not wait for an app or message reply." }
];

export default function InteractiveLearning() {
  const [stage, setStage] = useState("pregnancy");
  const [expanded, setExpanded] = useState(0);
  const active = stages.find((item) => item.id === stage) ?? stages[0];
  return <div className="interactive-learning">
    <section className="interactive-stage" aria-labelledby="stage-heading">
      <div className="interactive-stage-heading">
        <div><span className="learn-kicker">CHOOSE A STAGE</span><h3 id="stage-heading">Your care journey</h3><p>Select a stage to explore questions you can discuss with your maternity team.</p></div>
        <div className="stage-switch" role="group" aria-label="Choose care stage">
          {stages.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={stage === item.id ? "stage-choice active" : "stage-choice"} aria-pressed={stage === item.id} onClick={() => setStage(item.id)}><Icon size={17}/>{item.label}</button>; })}
        </div>
      </div>
      <div className="stage-detail" aria-live="polite">
        <div className="stage-detail-copy"><span className="stage-detail-icon"><CalendarDays size={22}/></span><h4>{active.title}</h4><p>{active.copy}</p></div>
        <div className="stage-flow" aria-label="Care conversation steps">
          {active.steps.map((step, index) => <div className="stage-flow-step" key={step}><span>{index + 1}</span><b>{step}</b>{index < active.steps.length - 1 && <i aria-hidden="true">↓</i>}</div>)}
        </div>
      </div>
      <p className="interactive-footnote"><Stethoscope size={15}/> This is a conversation guide, not a personalised care plan. Your clinician decides which checks and follow-up are right for you.</p>
    </section>
    <section className="interactive-warning" aria-labelledby="warning-heading">
      <div className="interactive-warning-title"><span className="warning-icon"><ShieldAlert size={21}/></span><div><span className="learn-kicker">TAP TO LEARN</span><h3 id="warning-heading">Warning signs to take seriously</h3><p>Open each card for a short explanation. These symptoms need urgent medical assessment.</p></div></div>
      <div className="interactive-warning-grid">
        {warningCards.map((item, index) => { const Icon = item.icon; const open = expanded === index; return <button type="button" key={item.title} className={open ? "warning-card expanded" : "warning-card"} aria-expanded={open} onClick={() => setExpanded(open ? -1 : index)}><span className="warning-card-top"><Icon size={19}/><b>{item.title}</b><ChevronDown size={17} className="warning-chevron"/></span>{open && <span className="warning-card-detail">{item.detail}</span>}</button>; })}
      </div>
      <div className="interactive-emergency"><b>Seizure, collapse or severe difficulty breathing?</b><span>Seek emergency medical help immediately. Do not wait for an app, online assessment or message reply.</span></div>
    </section>
  </div>;
}

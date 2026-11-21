"use client";

import { useState } from "react";
import { Activity, ChevronDown, Eye, Hand, HeartPulse, ShieldAlert, Zap } from "lucide-react";

const warningCards = [
  { icon: Activity, title: "Severe or persistent headache", detail: "A headache that is severe, persistent or unusual needs urgent medical assessment, especially during pregnancy or after birth." },
  { icon: Eye, title: "Changes in vision", detail: "Blurred vision, flashing lights, spots or other sudden changes in vision should be assessed urgently." },
  { icon: HeartPulse, title: "Pain below the ribs", detail: "Severe pain in the upper abdomen or below the ribs can be a warning sign. Seek urgent assessment." },
  { icon: Hand, title: "Sudden swelling", detail: "Sudden swelling of the face or hands, particularly with other symptoms, needs prompt medical attention." },
  { icon: Zap, title: "Vomiting or feeling very unwell", detail: "New vomiting or feeling seriously unwell during pregnancy or after birth should not be ignored." },
  { icon: ShieldAlert, title: "Seizure, collapse or breathing difficulty", detail: "This is an emergency. Call local emergency services or get emergency medical help immediately. Do not wait for an app or message reply." }
];

export default function InteractiveLearning() {
  const [expanded, setExpanded] = useState(0);
  return <div className="ds-warning-list" aria-label="Warning signs to take seriously">
    <div>
      {warningCards.map((item, index) => { const Icon = item.icon; const open = expanded === index; return <div className="ds-disclosure" key={item.title}><button type="button" className="ds-disclosure-button" aria-expanded={open} onClick={() => setExpanded(open ? -1 : index)}><span><Icon size={17} aria-hidden="true"/>{item.title}</span><ChevronDown size={18} aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}/></button>{open && <div><p>{item.detail}</p></div>}</div>; })}
    </div>
    <p><b>A seizure, collapse or severe difficulty breathing is an emergency.</b> Do not wait for an app, message reply or online assessment.</p>
  </div>;
}

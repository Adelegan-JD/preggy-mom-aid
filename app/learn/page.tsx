import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Centre | Preggy Mom Aid",
  description: "Introductory information about pre-eclampsia, pregnancy and postpartum care, with clear clinical review status."
};
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import InteractiveLearning from "./interactive-learning";
import InteractiveMaternalJourney from "@/components/interactive-maternal-journey";
import { Activity, AlertTriangle, CalendarCheck, ExternalLink, Eye, Hand, HeartPulse, PhoneCall, ShieldCheck, Stethoscope, Zap } from "lucide-react";
import { Callout } from "@/components/ds";

const resources = [
 { title:"Pre-eclampsia: the basics", category:"Understanding the condition", description:"A pregnancy-related high-blood-pressure condition that can affect the health of the mother and baby. It may not cause obvious symptoms at first, which is one reason routine antenatal checks matter.", source:"World Health Organization", href:"https://www.who.int/news-room/fact-sheets/detail/pre-eclampsia" },
 { title:"Symptoms that need urgent attention", category:"Recognising warning signs", description:"Severe headache, vision changes, pain below the ribs, sudden swelling of the face or hands, vomiting or feeling very unwell should be assessed urgently by a healthcare professional.", source:"NHS", href:"https://www.nhs.uk/conditions/pre-eclampsia/" },
 { title:"Checks during pregnancy", category:"Antenatal care", description:"Blood-pressure and urine checks are part of routine antenatal care. A clinician may recommend further assessment depending on the person's symptoms, history and examination.", source:"NICE guideline NG133", href:"https://www.nice.org.uk/guidance/ng133" },
 { title:"After the baby is born", category:"Postpartum awareness", description:"Pre-eclampsia can sometimes first appear after birth. New or worrying symptoms in the days and weeks after delivery still deserve prompt medical attention.", source:"NHS", href:"https://www.nhs.uk/conditions/pre-eclampsia/" }
];
const warningSigns = [
 {icon:Activity,label:"Severe or persistent headache"},
 {icon:Eye,label:"Blurred vision, flashing lights or other vision changes"},
 {icon:HeartPulse,label:"Severe pain below the ribs or in the upper abdomen"},
 {icon:Hand,label:"Sudden swelling of the face or hands"},
 {icon:Zap,label:"Vomiting or feeling very unwell"}
];

export default function LearnPage(){
 return <div className="ds-site">
  <SiteHeader />
  <main id="main-content" tabIndex={-1}>
   <div className="ds-container">
    <div className="ds-learn-intro">
     <h1 className="ds-display" style={{ fontSize: "clamp(2.25rem,4.2vw,3.5rem)" }}>Knowledge that helps you ask the right questions</h1>
     <p className="ds-lede">Clear introductory information about pre-eclampsia, pregnancy and postpartum care. Learn at your own pace, and use it to support conversations with your maternity team.</p>
     <span className="ds-badge ds-badge-warning"><ShieldCheck size={13} aria-hidden="true"/> Clinical review in progress · Not personal medical advice</span>
    </div>
    <Callout tone="warning" title="This is an education resource, not a clinical service.">These pages are introductory drafts. They do not diagnose, calculate individual risk, recommend treatment or replace antenatal or postnatal care. The content is awaiting review by qualified Nigerian maternal-health clinicians.</Callout>

    <section className="ds-section" aria-labelledby="essentials-title" data-reveal>
     <h2 className="ds-h1" id="essentials-title">Understand the essentials</h2>
     <div data-reveal data-reveal-stagger className="ds-feature-list" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginTop: "var(--ds-6)" }}>
      {resources.map(item => <article className="ds-feature" key={item.title}>
       <span className="ds-badge">{item.category}</span>
       <h3 className="ds-h3">{item.title}</h3>
       <p>{item.description}</p>
       <a className="ds-link ds-small" href={item.href} target="_blank" rel="noreferrer">{item.source} <ExternalLink size={13} aria-hidden="true"/></a>
      </article>)}
     </div>
    </section>

    <section className="ds-section" data-reveal><InteractiveMaternalJourney /></section>

    <section className="ds-section" aria-labelledby="care-map-title" data-reveal>
     <h2 className="ds-h1" id="care-map-title">How routine checks fit together</h2>
     <p className="ds-lede" style={{ marginTop: "var(--ds-2)" }}>A conversation guide, not a diagnostic pathway. Your clinician decides which checks and next steps are right for you.</p>
     <ol className="ds-care-map" data-reveal data-reveal-stagger>
      <li><CalendarCheck size={20} aria-hidden="true"/><b>Attend routine appointments</b><p>Keep antenatal and postnatal visits, even when you feel well.</p></li>
      <li><Activity size={20} aria-hidden="true"/><b>Discuss recommended checks</b><p>Your team may check blood pressure, urine and other tests when indicated.</p></li>
      <li><Stethoscope size={20} aria-hidden="true"/><b>Agree the next step</b><p>Ask what results mean, when to return and who to contact if concerned.</p></li>
     </ol>
     <p className="ds-note" style={{ marginTop: "var(--ds-4)" }}><ShieldCheck size={16} aria-hidden="true"/><span>A normal-feeling day does not replace routine checks. If warning symptoms appear, do not wait for the next appointment.</span></p>
    </section>
   </div>

   <section className="ds-band ds-band-quiet ds-section" aria-labelledby="warning-title">
    <div className="ds-container ds-split-band" data-reveal data-reveal-stagger>
     <div className="ds-stack">
      <h2 className="ds-h1-lg" id="warning-title">When something feels wrong, seek help promptly</h2>
      <p className="ds-lede">During pregnancy or after birth, these symptoms need urgent medical assessment. Open each one for a short explanation, and contact your maternity team or seek urgent care now.</p>
      <div><Link className="ds-btn ds-btn-urgent ds-btn-lg" href="/emergency"><PhoneCall size={18} aria-hidden="true"/> Emergency help: call 112</Link></div>
     </div>
     <InteractiveLearning />
    </div>
   </section>

   <div className="ds-container">
    <section className="ds-section ds-split-band" aria-labelledby="after-birth-title" data-reveal data-reveal-stagger>
     <div className="ds-stack">
      <h2 className="ds-h1" id="after-birth-title">Your care still matters after delivery</h2>
      <p className="ds-lede">Having your baby does not mean every pregnancy-related risk has passed. Pre-eclampsia can sometimes develop for the first time after birth. Keep follow-up appointments and seek urgent help for warning symptoms.</p>
      <a className="ds-link" href="https://www.nhs.uk/conditions/pre-eclampsia/" target="_blank" rel="noreferrer">Read the NHS overview <ExternalLink size={14} aria-hidden="true"/></a>
     </div>
     <div className="ds-stack" id="sources" aria-labelledby="sources-title">
      <h2 className="ds-h3" id="sources-title">Trusted sources</h2>
      <div>
       <a className="ds-source" href="https://www.who.int/news-room/fact-sheets/detail/pre-eclampsia" target="_blank" rel="noreferrer"><span><b>World Health Organization</b><small>Pre-eclampsia fact sheet</small></span><ExternalLink size={16} aria-hidden="true"/></a>
       <a className="ds-source" href="https://www.nhs.uk/conditions/pre-eclampsia/" target="_blank" rel="noreferrer"><span><b>National Health Service</b><small>Pre-eclampsia: symptoms, checks and care</small></span><ExternalLink size={16} aria-hidden="true"/></a>
       <a className="ds-source" href="https://www.nice.org.uk/guidance/ng133" target="_blank" rel="noreferrer"><span><b>NICE</b><small>Hypertension in pregnancy: diagnosis and management</small></span><ExternalLink size={16} aria-hidden="true"/></a>
      </div>
      <p className="ds-hint">External links open the publisher&apos;s website. Guidance differs by country and changes over time; your Nigerian maternity team should advise on your individual care.</p>
     </div>
    </section>
   </div>
  </main>
  <SiteFooter />
 </div>;
}

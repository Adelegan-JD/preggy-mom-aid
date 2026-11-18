import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Centre | Preggy Mom Aid",
  description: "Introductory information about pre-eclampsia, pregnancy and postpartum care, with clear clinical review status."
};
import Link from "next/link";
import InteractiveLearning from "./interactive-learning";
import { ArrowLeft, ArrowRight, AlertTriangle, Baby, BookOpen, CalendarCheck, ClipboardList, HeartPulse, ShieldCheck, Stethoscope, Activity, Eye, Hand, Zap, ExternalLink } from "lucide-react";

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
 return <main className="learn-page">
  <header className="learn-topbar">
   <Link className="learn-back" href="/"><ArrowLeft size={16}/> Home</Link>
   <Link className="learn-brand" href="/"><span className="learn-brand-mark"><HeartPulse size={20}/></span><span><b>Preggy Mom Aid</b><small>LEARNING CENTRE</small></span></Link>
   <a className="learn-top-link" href="#sources">Trusted sources <ArrowRight size={15}/></a>
  </header>
  <section className="learn-hero">
   <div className="learn-hero-copy"><span className="learn-kicker"><BookOpen size={14}/> THE LEARNING CENTRE</span>
    <h1>Knowledge can help<br/><em>you ask the right questions.</em></h1>
    <p>Clear introductory information about pre-eclampsia, pregnancy and postpartum care. Learn at your own pace, and use what you read to support conversations with your maternity team.</p>
    <div className="learn-review-pill"><ShieldCheck size={15}/> Clinical review in progress · Not personal medical advice</div>
   </div>
   <div className="learn-hero-visual" role="img" aria-label="Illustration representing a mother and baby surrounded by care symbols">
    <div className="learn-orbit orbit-a"/><div className="learn-orbit orbit-b"/>
    <div className="learn-3d-disc"><div className="learn-mother"><div className="mother-hair"/><div className="mother-face"/><div className="mother-body"/><div className="baby-wrap"><span/></div></div></div>
    <span className="learn-float float-heart"><HeartPulse size={19}/></span><span className="learn-float float-book"><BookOpen size={18}/></span><span className="learn-float float-shield"><ShieldCheck size={18}/></span>
   </div>
  </section>
  <section className="learn-notice"><AlertTriangle size={19}/><div><b>Important: this is an education resource, not a clinical service.</b><p>These pages are introductory drafts. They do not diagnose, calculate individual risk, recommend treatment or replace antenatal/postnatal care. The content is awaiting review by qualified Nigerian maternal-health clinicians.</p></div></section>
  <section className="learn-section">
   <div className="learn-section-heading"><div><span className="learn-kicker">START HERE</span><h2>Understand the essentials</h2><p>Short explainers to help you have informed conversations with your care team.</p></div><span className="learn-heading-icon"><Baby size={26}/></span></div>
   <div className="learn-resource-grid">{resources.map((item,index)=><article className={`learn-resource-card resource-${index+1}`} key={item.title}>
    <span className="resource-number">0{index+1}</span><span className="resource-category">{item.category}</span><h3>{item.title}</h3><p>{item.description}</p><a href={item.href} target="_blank" rel="noreferrer">{item.source} <ExternalLink size={13}/></a>
   </article>)}</div>
  </section>
  <section className="learn-section learn-interactive-section"><InteractiveLearning /></section>
  <section className="learn-section learn-diagram-section">
   <div className="learn-section-heading"><div><span className="learn-kicker">A SIMPLE CARE MAP</span><h2>How routine checks fit together</h2><p>This is a conversation guide, not a diagnostic pathway. Your clinician decides which checks and next steps are appropriate.</p></div><span className="learn-heading-icon peach-heading"><ClipboardList size={26}/></span></div>
   <div className="care-map">
    <div className="care-map-step"><span className="care-map-icon"><CalendarCheck size={23}/></span><b>Attend routine appointments</b><p>Keep antenatal and postnatal visits, even when you feel well.</p></div>
    <span className="care-map-connector"><ArrowRight size={19}/></span>
    <div className="care-map-step"><span className="care-map-icon"><Activity size={23}/></span><b>Discuss recommended checks</b><p>Your team may check blood pressure, urine and other tests when indicated.</p></div>
    <span className="care-map-connector"><ArrowRight size={19}/></span>
    <div className="care-map-step"><span className="care-map-icon"><Stethoscope size={23}/></span><b>Agree the next step</b><p>Ask what results mean, when to return and who to contact if concerned.</p></div>
   </div>
   <p className="care-map-footnote"><ShieldCheck size={14}/> A normal-feeling day does not replace routine checks. If warning symptoms appear, do not wait for the next appointment.</p>
  </section>
  <section className="learn-section warning-section"><div className="warning-panel">
   <div className="warning-panel-head"><span><AlertTriangle size={18}/> KNOW THE WARNING SIGNS</span><small>Take symptoms seriously</small></div>
   <h2>When something feels wrong,<br/><em>seek help promptly.</em></h2>
   <p>During pregnancy or after birth, the following symptoms need urgent medical assessment. A seizure, collapse or severe difficulty breathing is an emergency.</p>
   <div className="warning-sign-grid">{warningSigns.map(({icon:Icon,label})=><div key={label}><Icon size={18}/><span>{label}</span></div>)}</div>
   <div className="warning-action"><b>Do not wait for an app, message reply or online assessment.</b><span>Contact your maternity team or seek urgent/emergency medical care now.</span></div>
  </div></section>
  <section className="learn-section postpartum-section">
   <div className="postpartum-art" role="img" aria-label="Soft sunrise illustration representing continued care after childbirth"><div className="postpartum-sun"/><div className="postpartum-crescent"/><span className="postpartum-star star-one">✦</span><span className="postpartum-star star-two">✧</span><div className="postpartum-caption">CARE CONTINUES AFTER BIRTH</div></div>
   <div className="postpartum-copy"><span className="learn-kicker">PREGNANCY AND BEYOND</span><h2>Your care still matters<br/><em>after delivery.</em></h2><p>Having your baby does not mean every pregnancy-related risk has passed. Pre-eclampsia can sometimes develop for the first time after birth. Keep follow-up appointments and seek urgent help for warning symptoms.</p><a href="https://www.nhs.uk/conditions/pre-eclampsia/" target="_blank" rel="noreferrer">Read the NHS overview <ExternalLink size={14}/></a></div>
  </section>
  <section className="learn-section sources-section" id="sources">
   <div className="learn-section-heading"><div><span className="learn-kicker">GO DEEPER</span><h2>Trusted starting points</h2><p>External clinical information used to prepare these introductory drafts.</p></div><span className="learn-heading-icon"><ShieldCheck size={26}/></span></div>
   <div className="source-list">
    <a href="https://www.who.int/news-room/fact-sheets/detail/pre-eclampsia" target="_blank" rel="noreferrer"><span><b>World Health Organization</b><small>Pre-eclampsia fact sheet</small></span><ExternalLink size={16}/></a>
    <a href="https://www.nhs.uk/conditions/pre-eclampsia/" target="_blank" rel="noreferrer"><span><b>National Health Service</b><small>Pre-eclampsia: symptoms, checks and care</small></span><ExternalLink size={16}/></a>
    <a href="https://www.nice.org.uk/guidance/ng133" target="_blank" rel="noreferrer"><span><b>National Institute for Health and Care Excellence</b><small>Hypertension in pregnancy: diagnosis and management</small></span><ExternalLink size={16}/></a>
   </div>
   <p className="learn-source-note">External links open the source publisher's website. Guidance can differ by country and may be updated; your Nigerian maternity team should advise on your individual care.</p>
  </section>
  <footer className="learn-footer"><Link href="/">← Back to Preggy Mom Aid</Link><span>Educational drafts · Clinical review pending · Not an emergency service</span></footer>
 </main>;
}
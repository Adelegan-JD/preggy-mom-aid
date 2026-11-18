"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight, HeartHandshake, ShieldCheck, BookOpen, Hospital, Users,
  Menu, X, LockKeyhole, AlertTriangle, Stethoscope, Baby, Utensils,
  Pill, Headphones, Mail
} from "lucide-react";

const nav = [
  { label: "Our mission", href: "#mission" },
  { label: "Learn", href: "/learn" },
  { label: "Facility directory", href: "#facilities" },
  { label: "For professionals", href: "#professionals" },
];

const topics = [
  {
    icon: AlertTriangle,
    title: "Know the warning signs",
    text: "Severe or persistent headache, changes in vision, severe pain beneath the ribs, sudden swelling of the face or hands, or feeling very unwell need urgent medical assessment. A seizure or collapse is an emergency.",
  },
  {
    icon: Baby,
    title: "Pregnancy and postpartum",
    text: "Pre-eclampsia can develop during pregnancy and after childbirth. Keep antenatal and postnatal appointments and follow the monitoring plan given by your maternity team.",
  },
  {
    icon: Pill,
    title: "Medicines and supplements",
    text: "Use medicines and supplements only as advised by a qualified healthcare professional. Do not start, stop or change prescribed treatment based on website information.",
  },
  {
    icon: Utensils,
    title: "Nutrition and wellbeing",
    text: "A balanced diet supports general health. Food cannot guarantee prevention of pre-eclampsia; ask your clinician about individual nutrition needs and any recommended supplements.",
  },
  {
    icon: Stethoscope,
    title: "Working with your care team",
    text: "Share concerns promptly, attend recommended checks and ask your clinician what symptoms should trigger urgent review in your circumstances.",
  },
  {
    icon: Headphones,
    title: "Accessible learning",
    text: "Explore our learning area for introductory explainers, practical care conversations and trusted external resources. Clinical review status is shown clearly.",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="public-site">\n      <a className="sr-only" href="#main-content">Skip to page content</a>
      <header className="public-header">
        <a className="public-brand" href="/" aria-label="Preggy Mom Aid home">
          <Image src="/logo.png" alt="" width={48} height={48} priority />
          <span><strong>Preggy Mom Aid</strong><small>MATERNAL HEALTH SUPPORT</small></span>
        </a>
        <nav id="primary-navigation" className={menuOpen ? "public-nav is-open" : "public-nav"} aria-label="Main navigation">
          {nav.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
        </nav>
        <div className="header-account-links"><a className="header-signin" href="/login">Sign in</a><a className="header-cta" href="/signup">Join as a tester <ArrowRight size={16} /></a></div>
        <button type="button" className="public-menu-toggle" aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="public-hero" id="main-content" aria-labelledby="hero-heading" tabIndex={-1}>
        <div className="hero-copy-public">
          <span className="eyebrow-public"><span /> SUPPORT THROUGH PREGNANCY AND BEYOND</span>
          <h1 id="hero-heading">Care, knowledge<br />and support for<br /><em>every step.</em></h1>
          <p>Preggy Mom Aid is being built to help women affected by, or at risk of, pre-eclampsia and eclampsia find clear information, understand warning signs and feel supported throughout pregnancy and after birth.</p>
          <div className="hero-actions">
            <a className="primary-public-btn" href="/learn">Explore health information <ArrowRight size={17} /></a>
            <a className="secondary-public-btn" href="#professionals">For healthcare professionals</a>
          </div>
          <div className="hero-note"><ShieldCheck size={17} /><span>Privacy-conscious design. Responsible information. Care led by qualified professionals.</span></div>
        </div>
        <div className="hero-art-public" aria-hidden="true">
          <div className="art-ring ring-one" /><div className="art-ring ring-two" />
          <div className="art-card"><Image src="/logo.png" alt="" width={104} height={104} /><span>With you, through every chapter.</span></div>
          <div className="art-leaf leaf-one">✦</div><div className="art-leaf leaf-two">✿</div>
          <div className="art-caption"><HeartHandshake size={18} /><span><b>Compassion first</b><small>Support that respects every journey</small></span></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Our principles">
        <div><ShieldCheck /><span><b>Privacy by design</b><small>Health information deserves care.</small></span></div>
        <div><BookOpen /><span><b>Responsible education</b><small>Content review status will be clear.</small></span></div>
        <div><Users /><span><b>Connected care</b><small>Qualified professionals at the centre.</small></span></div>
      </section>

      <section className="public-section mission-section" id="mission">
        <div className="section-kicker">WHY PREGGY MOM AID</div>
        <div className="section-intro"><h2>Every mother deserves<br /><em>to feel supported.</em></h2><p>Pre-eclampsia and eclampsia can bring uncertainty and serious health risks. Our goal is to make trustworthy information and continuity of support easier to access, while keeping qualified healthcare professionals at the centre of care.</p></div>
        <div className="mission-grid">
          <article><span className="mission-icon pink-icon"><HeartHandshake /></span><h3>Support without judgement</h3><p>A welcoming space designed around the real questions and concerns women may have during pregnancy and postpartum recovery.</p></article>
          <article><span className="mission-icon green-icon"><BookOpen /></span><h3>Information with context</h3><p>We will distinguish general education from personal medical advice and identify content that is awaiting clinical review.</p></article>
          <article><span className="mission-icon gold-icon"><ShieldCheck /></span><h3>Privacy matters</h3><p>Patient accounts and personal health records will remain closed until the required privacy, security and clinical safeguards are ready.</p></article>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-inner">
          <div><div className="section-kicker">A THOUGHTFUL APPROACH</div><h2>Designed for support.<br /><em>Built with care.</em></h2><p>We are releasing Preggy Mom Aid in stages so that every feature is ready for the responsibility it carries.</p></div>
          <div className="how-steps">
            <div><span>01</span><section><b>Learn and understand</b><p>Explore public information about warning signs, pregnancy, postpartum health and care conversations.</p></section></div>
            <div><span>02</span><section><b>Secure patient access</b><p>Patient accounts and personal health records will open only after privacy and security safeguards are in place.</p></section></div>
            <div><span>03</span><section><b>Work with care teams</b><p>Doctors, nurses and midwives will undergo profession-appropriate credential verification. Patient record access will require patient authorisation.</p></section></div>
          </div>
        </div>
      </section>

      <section className="public-section directory-section" id="facilities">
        <div className="directory-heading"><div><div className="section-kicker">FINDING MATERNITY CARE</div><h2>Facility directory</h2><p>We are preparing a directory using publicly available facility information. Listings will be clearly marked as independently unverified until details are confirmed directly.</p></div><span className="directory-icon"><Hospital size={28} /></span></div>
        <div className="directory-empty"><Hospital size={24} /><div><b>No facility listings published yet</b><p>We will not invent hospital names, contact details or service capabilities. Listings will be added only when source information is available.</p></div></div>
        <p className="directory-disclaimer"><ShieldCheck size={15} /> A public listing will not mean a facility has been inspected, endorsed or confirmed to provide emergency or specialist maternity services. Contact a facility directly to confirm current services.</p>
      </section>

      <section className="public-section" id="learn">
        <div className="section-kicker">LEARN AND STAY INFORMED</div>
        <div className="section-intro"><h2>Information for<br /><em>every stage.</em></h2><p>These short introductory notes are general signposts, not a substitute for clinical review or individual medical advice. Detailed learning materials will be published with sources and review information.</p></div>
        <div className="mission-grid">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return <article key={topic.title}><span className="mission-icon pink-icon"><Icon /></span><h3>{topic.title}</h3><p>{topic.text}</p></article>;
          })}
        </div>
        <div className="notice danger-notice" role="note"><AlertTriangle /><div><b>Warning signs need prompt attention.</b><p>If you have a severe or persistent headache, visual changes, severe pain beneath the ribs, sudden swelling of the face or hands, or feel very unwell, seek urgent medical assessment. A seizure, collapse or severe breathing difficulty requires emergency help. Do not wait for a website response.</p></div></div>
      </section>

      <section className="professional-section" id="professionals">
        <div className="professional-copy"><div className="section-kicker">FOR MATERNAL HEALTH PROFESSIONALS</div><h2>Better support is<br /><em>a shared effort.</em></h2><p>We welcome interest from doctors, nurses and midwives who share our commitment to respectful, evidence-informed maternal care.</p><p>Professional accounts will require credential verification. Access to a patient's records will require that patient's separate authorisation.</p></div>
        <div className="professional-card"><div className="professional-card-icon"><LockKeyhole /></div><h3>Professional onboarding is being prepared</h3><p>Applications and patient-record access are not open yet. We are completing the verification, privacy and security foundations first.</p><a href="#contact">Register your interest <ArrowRight size={16} /></a></div>
      </section>

      <section className="launch-status" id="launch-status"><div><span className="status-dot" /> CURRENT PLATFORM STATUS</div><h2>Public information first.<br /><em>Patient accounts later.</em></h2><p>The public information site is available for review. Patient registration, professional accounts and personal health records remain closed while the secure platform and clinical safeguards are completed.</p><span className="status-label"><LockKeyhole size={14} /> Patient registration is not open</span></section>

      <section className="public-section" id="contact">
        <div className="section-kicker">PARTNERSHIPS AND ENQUIRIES</div>
        <div className="section-intro"><h2>Let’s improve<br /><em>maternal support.</em></h2><p>Healthcare professionals, hospitals, public-health organisations and potential partners can contact the project team to discuss collaboration.</p></div>
        <div className="directory-empty"><Mail size={24} /><div><b>Contact channel coming soon</b><p>We are preparing a monitored contact address before publishing an enquiry channel. No unmonitored or invented contact details will be displayed.</p></div></div>
      </section>

      <footer className="footer"><div className="footer-brand"><Image src="/logo.png" alt="" width={26} height={26}/><b>Preggy Mom Aid</b></div><span>Care, knowledge & support through every step.</span><span>Educational information only · Not an emergency service</span></footer>
    </main>
  );
}

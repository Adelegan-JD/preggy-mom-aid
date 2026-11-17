"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, HeartHandshake, ShieldCheck, BookOpen, Hospital, Users, Menu, X, LockKeyhole, ExternalLink } from "lucide-react";

const nav = [
  { label: "Our mission", href: "#mission" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Facility directory", href: "#facilities" },
  { label: "For professionals", href: "#professionals" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="public-site">
      <header className="public-header">
        <a className="public-brand" href="#" aria-label="Preggy Mom Aid home">
          <Image src="/logo.png" alt="" width={48} height={48} priority />
          <span><strong>Preggy Mom Aid</strong><small>MATERNAL HEALTH SUPPORT</small></span>
        </a>
        <nav className={menuOpen ? "public-nav is-open" : "public-nav"} aria-label="Main navigation">
          {nav.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
        </nav>
        <a className="header-cta" href="#professionals">Partner with us <ArrowRight size={16} /></a>
        <button className="public-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="public-hero">
        <div className="hero-copy-public">
          <span className="eyebrow-public"><span /> SUPPORT THROUGH PREGNANCY AND BEYOND</span>
          <h1>Care, knowledge<br />and support for<br /><em>every step.</em></h1>
          <p>Preggy Mom Aid is being built to help women affected by, or at risk of, pre-eclampsia and eclampsia stay informed, connected and supported throughout pregnancy and after birth.</p>
          <div className="hero-actions">
            <a className="primary-public-btn" href="#mission">Discover our mission <ArrowRight size={17} /></a>
            <a className="secondary-public-btn" href="#professionals">For healthcare professionals</a>
          </div>
          <div className="hero-note"><ShieldCheck size={17} /><span>Built around privacy, trusted information and responsible care.</span></div>
        </div>
        <div className="hero-art-public" aria-hidden="true">
          <div className="art-ring ring-one" /><div className="art-ring ring-two" />
          <div className="art-card"><Image src="/logo.png" alt="" width={104} height={104} /><span>With you, through every chapter.</span></div>
          <div className="art-leaf leaf-one">✦</div><div className="art-leaf leaf-two">✿</div>
          <div className="art-caption"><HeartHandshake size={18} /><span><b>Compassion first</b><small>Support that respects every journey</small></span></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Our principles">
        <div><ShieldCheck /><span><b>Privacy by design</b><small>Your information deserves care.</small></span></div>
        <div><BookOpen /><span><b>Trusted education</b><small>Health content with clinical review.</small></span></div>
        <div><Users /><span><b>Connected care</b><small>Designed around women and care teams.</small></span></div>
      </section>

      <section className="public-section mission-section" id="mission">
        <div className="section-kicker">WHY PREGGY MOM AID</div>
        <div className="section-intro"><h2>Every mother deserves<br /><em>to feel supported.</em></h2><p>Pre-eclampsia can bring uncertainty to pregnancy and the weeks after birth. Our goal is to make reliable information and continuity of support easier to access, while keeping qualified healthcare professionals at the centre of care.</p></div>
        <div className="mission-grid">
          <article><span className="mission-icon pink-icon"><HeartHandshake /></span><h3>Support without judgement</h3><p>A welcoming space designed around the real questions and concerns women may have during pregnancy and postpartum recovery.</p></article>
          <article><span className="mission-icon green-icon"><BookOpen /></span><h3>Information you can trust</h3><p>Educational resources will be reviewed by appropriate maternal-health professionals and clearly distinguished from personal medical advice.</p></article>
          <article><span className="mission-icon gold-icon"><ShieldCheck /></span><h3>Privacy matters</h3><p>We are designing secure access and patient control into the platform before opening health-record features.</p></article>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-inner">
          <div><div className="section-kicker">A THOUGHTFUL APPROACH</div><h2>Designed for support.<br /><em>Built with care.</em></h2><p>We are developing Preggy Mom Aid in stages so that each feature is ready for the responsibility it carries.</p></div>
          <div className="how-steps">
            <div><span>01</span><section><b>Learn and understand</b><p>Access clear, reviewed information about pre-eclampsia, eclampsia and maternal wellbeing.</p></section></div>
            <div><span>02</span><section><b>Stay connected</b><p>Patient accounts and personal health records will open only after privacy and security safeguards are in place.</p></section></div>
            <div><span>03</span><section><b>Work with care teams</b><p>Verified healthcare professionals will be able to connect with patients who have authorised that relationship.</p></section></div>
          </div>
        </div>
      </section>

      <section className="public-section directory-section" id="facilities">
        <div className="directory-heading"><div><div className="section-kicker">FINDING MATERNITY CARE</div><h2>Facility directory</h2><p>We are preparing a directory using publicly available facility information. Listings will be clearly marked as independently unverified until details are confirmed directly.</p></div><span className="directory-icon"><Hospital size={28} /></span></div>
        <div className="directory-empty"><Hospital size={24} /><div><b>No facility listings published yet</b><p>We will not invent hospital names, contact details or service capabilities. Directory entries will be added only when their source information is recorded.</p></div></div>
        <p className="directory-disclaimer"><ShieldCheck size={15} /> A public listing will not mean a facility has been inspected, endorsed or confirmed to provide emergency or specialist maternity services. Always contact a facility or local emergency service directly to confirm current care options.</p>
      </section>

      <section className="professional-section" id="professionals">
        <div className="professional-copy"><div className="section-kicker">FOR MATERNAL HEALTH PROFESSIONALS</div><h2>Better support is<br /><em>a shared effort.</em></h2><p>We welcome interest from doctors, nurses and midwives who share our commitment to respectful, evidence-informed maternal care.</p><p>Professional accounts will require credential verification. Access to a patient's records will require that patient's separate authorisation.</p></div>
        <div className="professional-card"><div className="professional-card-icon"><LockKeyhole /></div><h3>Professional onboarding is being prepared</h3><p>Applications and patient-record access are not open yet. We are completing the verification, privacy and security foundations first.</p><a href="#launch-status">See launch status <ArrowRight size={16} /></a></div>
      </section>

      <section className="launch-status" id="launch-status"><div><span className="status-dot" /> CURRENT PLATFORM STATUS</div><h2>Public information first.<br /><em>Patient accounts later.</em></h2><p>The public website is being prepared. Patient registration, professional accounts and personal health records remain closed while the secure platform and clinical safeguards are developed.</p><span className="status-label"><LockKeyhole size={14} /> Patient registration is not open</span></section>

      <footer className="public-footer"><a className="public-brand" href="#"><Image src="/logo.png" alt="" width={40} height={40} /><span><strong>Preggy Mom Aid</strong><small>MATERNAL HEALTH SUPPORT</small></span></a><p>Supportive information. Responsible care. Privacy first.</p><span>© {new Date().getFullYear()} Preggy Mom Aid</span></footer>
      <div className="public-disclaimer">Preggy Mom Aid is not an emergency service and does not diagnose or treat medical conditions. Do not delay urgent medical assessment while using this website. For a medical emergency, contact local emergency services or go to the nearest appropriate emergency department.</div>
    </main>
  );
}

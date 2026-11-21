import Link from "next/link";
import { AlertTriangle, ArrowRight, LockKeyhole, PhoneCall, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const warningSigns = [
  "Severe or persistent headache",
  "Blurred vision, flashing lights or other changes in vision",
  "Severe pain below the ribs or in the upper abdomen",
  "Sudden swelling of the face or hands",
  "Vomiting or feeling very unwell",
];

const features = [
  { title: "Keep your own private record", text: "Log blood-pressure readings and symptom notes, keep appointments, and store copies of your health documents. Only your account can see them." },
  { title: "Prepare for every appointment", text: "Write down questions for your maternity team, track your journey through pregnancy and after birth, and export your records to share when you choose." },
  { title: "Find care and help", text: "Search the facility directory, see emergency guidance for Nigeria, and read clear introductory information in English, Yorùbá, Hausa, Igbo and Pidgin." },
];

export default function HomePage() {
  return (
    <div className="ds-site">
      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        <div className="ds-container">
          <section className="ds-hero" aria-labelledby="hero-heading">
            <div className="ds-hero-copy">
              <h1 id="hero-heading" className="ds-display">Care, knowledge and support for <em>every step.</em></h1>
              <p className="ds-lede">Preggy Mom Aid helps women in Nigeria affected by, or at risk of, pre-eclampsia and eclampsia find clear information, recognise warning signs and stay organised through pregnancy and after birth.</p>
              <div className="ds-form-actions">
                <Link className="ds-btn ds-btn-primary ds-btn-lg" href="/signup">Create your free account <ArrowRight size={18} aria-hidden="true" /></Link>
                <Link className="ds-btn ds-btn-lg" href="/learn">Explore health information</Link>
              </div>
              <p className="ds-note"><ShieldCheck size={16} aria-hidden="true" /><span>Private by design. Educational information only, with qualified professionals at the centre of care.</span></p>
            </div>
            <figure className="ds-hero-media">
              <img src="https://images.unsplash.com/photo-1752240880737-128cc8cbf65c?auto=format&fit=crop&w=1100&q=82" alt="Pregnant mother holding her baby bump in a warm, peaceful setting" fetchPriority="high" />
              <figcaption className="ds-photo-credit">Photo: Arturo Añez / Unsplash</figcaption>
            </figure>
          </section>
        </div>

        <section className="ds-band ds-band-quiet" aria-labelledby="warning-heading">
          <div className="ds-container ds-split-band" data-reveal data-reveal-stagger>
            <div className="ds-stack">
              <h2 id="warning-heading" className="ds-h1-lg">Know the warning signs</h2>
              <p className="ds-lede">During pregnancy or after birth, these symptoms need urgent medical assessment. Pre-eclampsia can develop after childbirth too.</p>
              <div className="ds-form-actions">
                <Link className="ds-btn ds-btn-urgent ds-btn-lg" href="/emergency"><PhoneCall size={18} aria-hidden="true" /> Emergency help: call 112</Link>
                <Link className="ds-link" href="/learn">Learn more <ArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>
            <div className="ds-warning-list">
              <ul>{warningSigns.map((sign) => <li key={sign}><AlertTriangle size={18} aria-hidden="true" />{sign}</li>)}</ul>
              <p><b>A seizure, collapse or severe difficulty breathing is an emergency.</b> Do not wait for a website or app response.</p>
            </div>
          </div>
        </section>

        <section className="ds-band" aria-labelledby="features-heading">
          <div className="ds-container">
            <div className="ds-section-head" data-reveal>
              <h2 id="features-heading" className="ds-h1-lg">One calm place for your care</h2>
              <p className="ds-lede">Patients can create a free private account. Features that need clinical review or patient consent are switched on only when their safeguards are complete.</p>
            </div>
            <div className="ds-feature-list" data-reveal data-reveal-stagger>
              {features.map((feature) => <article key={feature.title} className="ds-feature"><h3 className="ds-h3">{feature.title}</h3><p>{feature.text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="ds-band ds-band-tint" aria-labelledby="privacy-heading">
          <div className="ds-container ds-split-band" data-reveal data-reveal-stagger>
            <figure className="ds-photo">
              <img src="https://images.unsplash.com/photo-1558636411-95b6f3dbfa6a?auto=format&fit=crop&w=1000&q=80" alt="Expectant Black mother in a maternity portrait" loading="lazy" />
              <figcaption className="ds-photo-credit">Photo: Anna Civolani / Unsplash</figcaption>
            </figure>
            <div className="ds-stack-lg">
              <h2 id="privacy-heading" className="ds-h1-lg">Your information stays yours</h2>
              <div className="ds-stack">
                <p className="ds-lede">Patient records are private by default. A healthcare professional can never see them just by registering. Access will always need your separate, explicit permission.</p>
                <p className="ds-muted">We separate general education from personal medical advice, show when content is still awaiting clinical review, and never invent hospitals, contact details or services.</p>
              </div>
              <Link className="ds-link" href="/signup">Create your private account <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section className="ds-band ds-band-dark" id="professionals" aria-labelledby="professionals-heading">
          <div className="ds-container ds-split-band" data-reveal data-reveal-stagger>
            <div className="ds-stack">
              <h2 id="professionals-heading" className="ds-h1-lg">For doctors, nurses and midwives</h2>
              <p className="ds-lede">We welcome professionals who share our commitment to respectful, evidence-informed maternal care.</p>
            </div>
            <div className="ds-stack">
              <p className="ds-note"><LockKeyhole size={16} aria-hidden="true" /><span>Professional accounts stay restricted until an authorised reviewer verifies your registration. Access to a patient&apos;s records needs that patient&apos;s separate authorisation.</span></p>
              <div><Link className="ds-btn ds-btn-lg" href="/signup?type=professional">Create a professional account <ArrowRight size={18} aria-hidden="true" /></Link></div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, BookOpen, Heart, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = { title: "My space | Preggy Mom Aid" };

// This page contains private, cookie-dependent content and must never be statically
// generated. It also needs to remain safe to build before Supabase is provisioned.
export const dynamic = "force-dynamic";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default async function MyCarePage() {
  if (!supabaseConfigured) {
    return (
      <main className="account-shell">
        <section className="account-card">
          <Link href="/" className="account-brand">
            <span className="account-brand-mark"><Heart size={20} /></span>
            <span><b>Preggy Mom Aid</b><small>PATIENT TESTER ACCESS</small></span>
          </Link>
          <div className="account-kicker">PRIVATE TESTER SPACE</div>
          <h1>Account access is not active yet</h1>
          <p className="account-intro">
            The secure account service has not been connected to this deployment.
            Your private tester space will become available after authentication
            is configured and verified.
          </p>
          <div className="account-unavailable" role="status">
            <ShieldCheck size={20} />
            <p>
              No sign-in, patient profile or private health information is being
              collected through this page while account services are unavailable.
            </p>
          </div>
          <div className="account-available-links">
            <Link href="/learn"><BookOpen size={17} /> Explore the Learning Centre <ArrowRight size={15} /></Link>
            <Link href="/feedback"><MessageSquareText size={17} /> Share product feedback <ArrowRight size={15} /></Link>
          </div>
          <p className="account-footnote">
            Please do not include symptoms, pregnancy details, blood-pressure
            readings or other medical information in product feedback. For care
            concerns, contact your maternity team.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  async function signOut() {
    "use server";
    const client = await createClient();
    await client.auth.signOut();
    redirect("/login");
  }

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || "there";

  return (
    <main className="tester-space">
      <header className="tester-topbar">
        <Link href="/" className="account-brand">
          <span className="account-brand-mark"><Heart size={20} /></span>
          <span><b>Preggy Mom Aid</b><small>YOUR TESTER SPACE</small></span>
        </Link>
        <form action={signOut}><button className="tester-signout">Sign out</button></form>
      </header>
      <section className="tester-welcome">
        <div className="account-kicker">YOUR PATIENT TESTER SPACE</div>
        <h1>Hello, {firstName} <span>♥</span></h1>
        <p>Thank you for helping us make Preggy Mom Aid clearer, kinder and more useful. Explore the information and tell us about your experience.</p>
        <div className="tester-safe-note"><ShieldCheck size={19} /><span>This is a product-testing space, not a personal medical record or clinical care service.</span></div>
      </section>
      <section className="tester-grid">
        <article className="tester-feature">
          <span className="tester-feature-icon"><BookOpen /></span>
          <div className="account-kicker">LEARN</div>
          <h2>Explore the Learning Centre</h2>
          <p>Read introductory information about pre-eclampsia, warning signs, pregnancy and postpartum care.</p>
          <Link href="/learn">Open Learning Centre <ArrowRight size={16} /></Link>
        </article>
        <article className="tester-feature peach">
          <span className="tester-feature-icon"><MessageSquareText /></span>
          <div className="account-kicker">YOUR VOICE MATTERS</div>
          <h2>Share your review</h2>
          <p>Tell us what felt clear, what was difficult to use and what you would like us to improve.</p>
          <Link href="/feedback">Give feedback <ArrowRight size={16} /></Link>
        </article>
        <article className="tester-feature sage">
          <span className="tester-feature-icon"><Sparkles /></span>
          <div className="account-kicker">WHAT&apos;S NEXT</div>
          <h2>Help shape the experience</h2>
          <p>Your feedback will guide improvements to accessibility, navigation, language and the overall experience.</p>
          <Link href="/feedback">Suggest an improvement <ArrowRight size={16} /></Link>
        </article>
      </section>
      <p className="tester-boundary">
        Please do not submit pregnancy dates, symptoms, blood pressure readings,
        diagnoses, medication details or any other health information in your
        feedback. If you have a health concern, contact your maternity care team
        promptly. For emergencies, seek emergency medical care now.
      </p>
    </main>
  );
}

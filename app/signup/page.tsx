"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Heart, ShieldCheck } from "lucide-react";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"patient" | "professional">("patient");
  const [professionalType, setProfessionalType] = useState<"doctor" | "nurse" | "midwife">("doctor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim(), account_type: accountType, professional_type: accountType === "professional" ? professionalType : null },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/my-care`
        }
      });
      if (signUpError) throw signUpError;
      if (data.session) router.push("/my-care");
      else setMessage("Your account request has been received. Check your email for a confirmation link, then sign in. If the email does not arrive, check your spam folder.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="account-shell" id="main-content" tabIndex={-1}>
      <section className="account-card">
        <Link href="/" className="account-brand">
          <span className="account-brand-mark"><Heart size={22} /></span>
          <span><b>Preggy Mom Aid</b><small>CREATE YOUR ACCOUNT</small></span>
        </Link>
        <div className="account-kicker">A WELCOMING PLACE TO BEGIN</div>
        <h1>Create your account</h1>
        <p className="account-intro">
          Create an account as a patient or healthcare professional. We will guide you to the right secure space after email confirmation.
          
        </p>
        {supabaseConfigured ? (
          <form className="account-form" onSubmit={submit}>
            <label htmlFor="fullName">Your name</label>
            <input id="fullName" autoComplete="name" required maxLength={120} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" />
            <fieldset className="account-type-choice"><legend>How will you use Preggy Mom Aid?</legend><label><input type="radio" name="accountType" value="patient" checked={accountType === "patient"} onChange={() => setAccountType("patient")} /> Patient / pregnant or postpartum user</label><label><input type="radio" name="accountType" value="professional" checked={accountType === "professional"} onChange={() => setAccountType("professional")} /> Healthcare professional</label></fieldset>
            {accountType === "professional" && <div className="professional-signup-note"><label htmlFor="professionalType">Your profession</label><select id="professionalType" value={professionalType} onChange={e => setProfessionalType(e.target.value as "doctor" | "nurse" | "midwife")}><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="midwife">Midwife</option></select><p>Professional accounts require credential verification before practitioner features or patient information become available.</p></div>}
            <label htmlFor="signupEmail">Email address</label>
            <input id="signupEmail" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <label htmlFor="signupPassword">Password</label>
            <input id="signupPassword" type="password" autoComplete="new-password" minLength={10} required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 10 characters" />
            <button className="account-submit" disabled={busy}>{busy ? "Creating account…" : "Create account"} <ArrowRight size={17} /></button>
          </form>
        ) : (
          <div className="account-unavailable" role="status">
            <ShieldCheck size={20} />
            <p>
              Secure account services are not connected to this deployment yet,
              so new account registration is not active. No account or patient
              profile will be created until the service is configured and tested.
            </p>
          </div>
        )}
        {error && <p className="account-error" role="alert">{error}</p>}
        {message && <p className="account-success" role="status">{message}</p>}
        <div className="account-privacy">
          <ShieldCheck size={18} />
          <p><b>Your privacy matters.</b> Your account type determines which services you can request. Professional accounts remain restricted until credentials are verified, and patient information is never shared without permission.</p>
        </div>
        {supabaseConfigured && <p className="account-switch">Already registered? <Link href="/login">Sign in</Link></p>}
        <p className="account-footnote">
          Preggy Mom Aid is not an emergency or medical service. For urgent
          concerns, contact a qualified healthcare professional or emergency
          service. You can still explore the <Link href="/learn">Learning Centre</Link>.
        </p>
      </section>
    </main>
  );
}

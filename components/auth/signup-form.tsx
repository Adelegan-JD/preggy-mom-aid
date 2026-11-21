"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/auth/auth-layout";
import { Callout } from "@/components/ds";
import { createClient } from "@/lib/supabase/client";
import PasswordField from "@/components/password-field";
import { friendlyAuthError, isSupabaseConfigured, UNAVAILABLE_MESSAGE } from "@/lib/auth-messages";
import { ComboBox } from "@/components/combo-box";

type AccountType = "patient" | "professional";
type Profession = "doctor" | "nurse" | "midwife";

export default function SignUpForm({ initialAccountType = "patient" }: { initialAccountType?: AccountType }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
  const [professionalType, setProfessionalType] = useState<Profession>("doctor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [accountExists, setAccountExists] = useState(false);

  const redirectTo = () => `${window.location.origin}/auth/callback?next=/my-care`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setAccountExists(false);
    try {
      if (password.length < 10) throw new Error("Use at least 10 characters for your password.");
      const trimmedEmail = email.trim();
      const { data, error: signUpError } = await createClient().auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { full_name: fullName.trim(), account_type: accountType, professional_type: accountType === "professional" ? professionalType : null },
          emailRedirectTo: redirectTo()
        }
      });
      if (signUpError) throw signUpError;
      // With email confirmation enabled, Supabase hides whether an address is already
      // registered by returning a user with no identities instead of an error.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setAccountExists(true);
        throw { code: "user_already_exists" };
      }
      if (data.session) {
        router.push("/my-care");
        router.refresh();
        return;
      }
      setSentTo(trimmedEmail);
      setPassword("");
    } catch (cause) {
      setError(friendlyAuthError(cause, "We could not create your account. Please try again.").message);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const { error: resendError } = await createClient().auth.resend({ type: "signup", email: sentTo, options: { emailRedirectTo: redirectTo() } });
      if (resendError) throw resendError;
      setInfo("A new confirmation link has been sent. It can take a few minutes to arrive.");
    } catch (cause) {
      setError(friendlyAuthError(cause, "We could not resend the email. Please try again shortly.").message);
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your email"
        lede={<>We sent a confirmation link to <b>{sentTo}</b>. Open it on this device to activate your account.</>}
        footer={<>
          <p>Already confirmed? <Link href="/login">Sign in</Link></p>
          <p>Wrong email address? <button type="button" className="ds-text-button" onClick={() => { setSentTo(""); setInfo(""); setError(""); }}>Start again</button></p>
        </>}
      >
        <div className="ds-panel ds-panel-quiet ds-stack">
          <span className="ds-icon-tile"><MailCheck size={20} aria-hidden="true" /></span>
          <ul className="ds-steps">
            <li>It can take a few minutes, and may come from our secure account provider (Supabase) rather than a Preggy Mom Aid address.</li>
            <li>Check your spam or promotions folder if you cannot find it.</li>
            <li>The link works once. If it has expired, send a new one.</li>
          </ul>
        </div>
        <button type="button" className="ds-btn ds-btn-block" onClick={resend} disabled={busy}>{busy ? "Sending…" : "Resend confirmation email"}</button>
        {info && <p className="ds-message ds-message-success" role="status">{info}</p>}
        {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      lede="Free and private. Keep your readings, notes, appointments and records in one place."
      footer={<>
        <p>Already registered? <Link href="/login">Sign in</Link></p>
        <p className="ds-note"><ShieldCheck size={16} aria-hidden="true" /><span>Preggy Mom Aid is not an emergency or medical service. For urgent concerns, see <Link href="/emergency">emergency information</Link>.</span></p>
      </>}
    >
      {isSupabaseConfigured ? (
        <form className="ds-form" onSubmit={submit}>
          <div className="ds-field">
            <label className="ds-label" htmlFor="fullName">Your name</label>
            <input className="ds-input" id="fullName" autoComplete="name" required maxLength={120} value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <fieldset className="ds-fieldset">
            <legend>How will you use Preggy Mom Aid?</legend>
            <label className="ds-choice"><input type="radio" name="accountType" value="patient" checked={accountType === "patient"} onChange={() => setAccountType("patient")} /> I am pregnant or have recently given birth</label>
            <label className="ds-choice"><input type="radio" name="accountType" value="professional" checked={accountType === "professional"} onChange={() => setAccountType("professional")} /> I am a doctor, nurse or midwife</label>
          </fieldset>
          {accountType === "professional" && <div className="ds-field">
            <label className="ds-label" htmlFor="professionalType">Your profession</label>
            <ComboBox id="professionalType" value={professionalType} onValueChange={value => setProfessionalType(value as Profession)} describedBy="professionalHint" options={[{ value: "doctor", label: "Doctor" }, { value: "nurse", label: "Nurse" }, { value: "midwife", label: "Midwife" }]} />
            <p className="ds-hint" id="professionalHint">Professional accounts need credential verification before practitioner features open. Patient information is never shared without the patient&apos;s permission.</p>
          </div>}
          <div className="ds-field">
            <label className="ds-label" htmlFor="signupEmail">Email address</label>
            <input className="ds-input" id="signupEmail" type="email" inputMode="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="ds-field">
            <label className="ds-label" htmlFor="signupPassword">Password</label>
            <PasswordField id="signupPassword" autoComplete="new-password" minLength={10} value={password} onChange={setPassword} describedBy="signupPasswordHint" />
            <p className="ds-hint" id="signupPasswordHint">At least 10 characters. A short phrase of unrelated words is easy to remember and hard to guess.</p>
          </div>
          <button className="ds-btn ds-btn-primary ds-btn-lg ds-btn-block" disabled={busy}>{busy ? "Creating account…" : "Create account"} <ArrowRight size={17} aria-hidden="true" /></button>
          {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
          {accountExists && <p className="ds-small"><Link href="/login">Sign in</Link> · <Link href="/forgot-password">Reset password</Link></p>}
        </form>
      ) : (
        <Callout tone="warning">{UNAVAILABLE_MESSAGE}</Callout>
      )}
    </AuthLayout>
  );
}

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/auth/auth-layout";
import { Callout } from "@/components/ds";
import { createClient } from "@/lib/supabase/client";
import PasswordField from "@/components/password-field";
import { friendlyAuthError, isSupabaseConfigured, UNAVAILABLE_MESSAGE } from "@/lib/auth-messages";

type LoginFormProps = {
  next: string;
  /** Message from a redirect, e.g. an expired confirmation link. */
  initialError?: string;
  /** Neutral confirmation from a redirect, e.g. after signing out. */
  notice?: string;
};

export default function LoginForm({ next, initialError = "", notice = "" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [info, setInfo] = useState(notice);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    setUnconfirmed(false);
    try {
      const { error: authError } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      router.push(next);
      router.refresh();
    } catch (cause) {
      const friendly = friendlyAuthError(cause, "We could not sign you in. Check your details and try again.");
      setUnconfirmed(friendly.kind === "unconfirmed");
      setError(friendly.message);
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    if (!email.trim()) { setError("Enter your email address above, then send a new confirmation link."); return; }
    setBusy(true);
    setError("");
    try {
      const { error: resendError } = await createClient().auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` }
      });
      if (resendError) throw resendError;
      setUnconfirmed(false);
      setInfo("If that address has an unconfirmed account, a new confirmation link is on its way. Check your inbox and spam folder.");
    } catch (cause) {
      setError(friendlyAuthError(cause, "We could not send a new confirmation link. Please try again shortly.").message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      lede="Sign in to your private Preggy Mom Aid space."
      footer={<>
        <p>New to Preggy Mom Aid? <Link href="/signup">Create a free account</Link></p>
        <p className="ds-note"><ShieldCheck size={16} aria-hidden="true" /><span>Your health information is private. Professionals need verification, and patient information is only shared with the patient&apos;s permission.</span></p>
      </>}
    >
      {info && <p className="ds-message ds-message-success" role="status">{info}</p>}
      {isSupabaseConfigured ? (
        <form className="ds-form" onSubmit={submit}>
          <div className="ds-field">
            <label className="ds-label" htmlFor="loginEmail">Email address</label>
            <input className="ds-input" id="loginEmail" type="email" inputMode="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="ds-field">
            <span className="ds-label"><label htmlFor="loginPassword">Password</label><Link href="/forgot-password">Forgot password?</Link></span>
            <PasswordField id="loginPassword" autoComplete="current-password" value={password} onChange={setPassword} placeholder="Your password" />
          </div>
          <button className="ds-btn ds-btn-primary ds-btn-lg ds-btn-block" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <ArrowRight size={17} aria-hidden="true" /></button>
          {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
          {unconfirmed && <button type="button" className="ds-btn ds-btn-block" onClick={resendConfirmation} disabled={busy}>Send a new confirmation link</button>}
        </form>
      ) : (
        <>
          <Callout tone="warning">{UNAVAILABLE_MESSAGE}</Callout>
          {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
        </>
      )}
    </AuthLayout>
  );
}

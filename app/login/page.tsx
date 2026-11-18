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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push("/my-care");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not sign you in. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="account-shell">
      <section className="account-card">
        <Link href="/" className="account-brand">
          <span className="account-brand-mark"><Heart size={22} /></span>
          <span><b>Preggy Mom Aid</b><small>PATIENT TESTER ACCESS</small></span>
        </Link>
        <div className="account-kicker">WELCOME BACK</div>
        <h1>Sign in</h1>
        <p className="account-intro">Continue to your patient tester space and share your feedback with us.</p>
        {supabaseConfigured ? (
          <form className="account-form" onSubmit={submit}>
            <label htmlFor="loginEmail">Email address</label>
            <input id="loginEmail" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <label htmlFor="loginPassword">Password</label>
            <input id="loginPassword" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" />
            <button className="account-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"} <ArrowRight size={17} /></button>
          </form>
        ) : (
          <div className="account-unavailable" role="status">
            <ShieldCheck size={20} />
            <p>
              Secure account services are not connected to this deployment yet,
              so sign-in is unavailable. Please return after the project team has
              completed and tested the account setup.
            </p>
          </div>
        )}
        {error && <p className="account-error" role="alert">{error}</p>}
        <div className="account-privacy">
          <ShieldCheck size={18} />
          <p>Only use your own account. Please do not enter personal medical information during this testing phase.</p>
        </div>
        {supabaseConfigured && <p className="account-switch">New to the testing group? <Link href="/signup">Create an account</Link></p>}
        <p className="account-footnote">
          You can still explore the <Link href="/learn">Learning Centre</Link> and
          <Link href="/feedback"> share product feedback</Link>. Do not submit
          symptoms or other health information through feedback.
        </p>
      </section>
    </main>
  );
}

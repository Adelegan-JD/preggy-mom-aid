"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Heart, ShieldCheck } from "lucide-react";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      if (!configured) throw new Error("Account recovery is not available until secure account services are configured.");
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
      });
      if (resetError) throw resetError;
      setMessage("If an account exists for that email address, a password reset link will be sent. Check your inbox and spam folder.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We could not start password recovery. Please try again."); }
    finally { setBusy(false); }
  }
  return <main className="account-shell" id="main-content" tabIndex={-1}><section className="account-card">
    <Link href="/" className="account-brand"><span className="account-brand-mark"><Heart size={22}/></span><span><b>Preggy Mom Aid</b><small>ACCOUNT RECOVERY</small></span></Link>
    <div className="account-kicker">SECURE ACCOUNT ACCESS</div><h1>Reset your password</h1><p className="account-intro">Enter the email address associated with your account and we will send a secure reset link if an account is registered.</p>
    {configured ? <form className="account-form" onSubmit={submit}><label htmlFor="recoveryEmail">Email address</label><input id="recoveryEmail" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)}/><button className="account-submit" disabled={busy}>{busy?"Sending…":"Send reset link"}</button></form> : <div className="account-unavailable" role="status"><ShieldCheck size={20}/><p>Secure account services are not connected to this deployment yet.</p></div>}
    {error&&<p className="account-error" role="alert">{error}</p>}{message&&<p className="account-success" role="status">{message}</p>}
    <p className="account-switch"><Link href="/login"><ArrowLeft size={14}/> Back to sign in</Link></p>
  </section></main>;
}

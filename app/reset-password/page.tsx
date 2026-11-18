"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Heart, ShieldCheck } from "lucide-react";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (!configured) throw new Error("Account services are not configured.");
      if (password.length < 10) throw new Error("Use at least 10 characters for your new password.");
      if (password !== confirm) throw new Error("The passwords do not match.");
      const { data: { user }, error: userError } = await createClient().auth.getUser();
      if (userError || !user) throw new Error("This reset link is invalid or has expired. Request a new password reset link.");
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/login?password_updated=1"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We could not update your password. Request a new reset link and try again."); }
    finally { setBusy(false); }
  }
  return <main className="account-shell" id="main-content" tabIndex={-1}><section className="account-card">
    <Link href="/" className="account-brand"><span className="account-brand-mark"><Heart size={22}/></span><span><b>Preggy Mom Aid</b><small>ACCOUNT SECURITY</small></span></Link>
    <div className="account-kicker">SECURE ACCOUNT ACCESS</div><h1>Choose a new password</h1><p className="account-intro">Use a strong password you do not use on other websites.</p>
    {configured ? <form className="account-form" onSubmit={submit}><label htmlFor="newPassword">New password</label><input id="newPassword" type="password" autoComplete="new-password" minLength={10} required value={password} onChange={event=>setPassword(event.target.value)} /><label htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" type="password" autoComplete="new-password" minLength={10} required value={confirm} onChange={event=>setConfirm(event.target.value)} /><button className="account-submit" disabled={busy}>{busy?"Updating…":"Update password"}</button></form> : <div className="account-unavailable" role="status"><ShieldCheck size={20}/><p>Secure account services are not connected to this deployment yet.</p></div>}
    {error&&<p className="account-error" role="alert">{error}</p>}<p className="account-switch"><Link href="/login"><ArrowLeft size={14}/> Back to sign in</Link></p>
  </section></main>;
}

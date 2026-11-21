"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError, isSupabaseConfigured, UNAVAILABLE_MESSAGE } from "@/lib/auth-messages";
import AuthLayout from "@/components/auth/auth-layout";
import { Callout } from "@/components/ds";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
      });
      if (resetError) throw resetError;
      setMessage("If an account exists for that email address, a reset link is on its way. Check your inbox and spam folder.");
    } catch (cause) {
      setError(friendlyAuthError(cause, "We could not start password recovery. Please try again.").message);
    } finally { setBusy(false); }
  }

  return (
    <AuthLayout
      title="Reset your password"
      lede="Enter the email address you signed up with and we will send you a secure reset link."
      footer={<p><Link href="/login" className="ds-link"><ArrowLeft size={15} aria-hidden="true" /> Back to sign in</Link></p>}
    >
      {isSupabaseConfigured ? (
        <form className="ds-form" onSubmit={submit}>
          <div className="ds-field">
            <label className="ds-label" htmlFor="recoveryEmail">Email address</label>
            <input className="ds-input" id="recoveryEmail" type="email" inputMode="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
          </div>
          <button className="ds-btn ds-btn-primary ds-btn-lg ds-btn-block" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
          {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
          {message && <p className="ds-message ds-message-success" role="status">{message}</p>}
        </form>
      ) : <Callout tone="warning">{UNAVAILABLE_MESSAGE}</Callout>}
    </AuthLayout>
  );
}

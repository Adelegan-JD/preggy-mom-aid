"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError, isSupabaseConfigured, UNAVAILABLE_MESSAGE } from "@/lib/auth-messages";
import PasswordField from "@/components/password-field";
import AuthLayout from "@/components/auth/auth-layout";
import { Callout } from "@/components/ds";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (password.length < 10) throw new Error("Use at least 10 characters for your new password.");
      if (password !== confirm) throw new Error("The two passwords do not match.");
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("This reset link is invalid or has expired. Request a new password reset link.");
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/login?password_updated=1"); router.refresh();
    } catch (cause) {
      setError(friendlyAuthError(cause, "We could not update your password. Request a new reset link and try again.").message);
    } finally { setBusy(false); }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      lede="Use a strong password you do not use on other websites."
      footer={<p><Link href="/login" className="ds-link"><ArrowLeft size={15} aria-hidden="true" /> Back to sign in</Link></p>}
    >
      {isSupabaseConfigured ? (
        <form className="ds-form" onSubmit={submit}>
          <div className="ds-field">
            <label className="ds-label" htmlFor="newPassword">New password</label>
            <PasswordField id="newPassword" autoComplete="new-password" minLength={10} value={password} onChange={setPassword} describedBy="newPasswordHint" />
            <p className="ds-hint" id="newPasswordHint">At least 10 characters.</p>
          </div>
          <div className="ds-field">
            <label className="ds-label" htmlFor="confirmPassword">Confirm new password</label>
            <PasswordField id="confirmPassword" autoComplete="new-password" minLength={10} value={confirm} onChange={setConfirm} />
          </div>
          <button className="ds-btn ds-btn-primary ds-btn-lg ds-btn-block" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
          {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
        </form>
      ) : <Callout tone="warning">{UNAVAILABLE_MESSAGE}</Callout>}
    </AuthLayout>
  );
}

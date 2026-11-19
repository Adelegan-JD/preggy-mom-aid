"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Download, Mail, ShieldCheck, Trash2 } from "lucide-react";

type Preferences = { appointment_email_reminders: boolean; product_email_updates: boolean };

export default function PatientAccountSettings({ initialPreferences, initialDeletionRequested = false }: { initialPreferences: Preferences; initialDeletionRequested?: boolean }) {
  const router = useRouter();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletionRequested, setDeletionRequested] = useState(initialDeletionRequested);

  async function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Your session has expired. Sign in again.");
      const { error: saveError } = await supabase.from("patient_notification_preferences")
        .upsert({ user_id: user.id, ...preferences, updated_at: new Date().toISOString() });
      if (saveError) throw saveError;
      setMessage("Your notification preferences have been saved.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save preferences."); }
    finally { setBusy(false); }
  }

  async function changeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const { error: updateError } = await createClient().auth.updateUser({ email: email.trim() });
      if (updateError) throw updateError;
      setMessage("If your email change is accepted, Supabase will send confirmation instructions to the required email address(es). Your sign-in email changes only after confirmation.");
      setEmail("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start the email change."); }
    finally { setBusy(false); }
  }

  async function exportData() {
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Sign in again before exporting your information.");
      const [profile, journey, bp, symptoms, appointments, documents, prefs] = await Promise.all([
        supabase.from("profiles").select("full_name,account_type,created_at,updated_at").eq("id", user.id).maybeSingle(),
        supabase.from("patient_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("blood_pressure_readings").select("*").eq("user_id", user.id).order("measured_at", { ascending: false }),
        supabase.from("symptom_reports").select("*").eq("user_id", user.id).order("occurred_at", { ascending: false }),
        supabase.from("patient_appointments").select("*").eq("user_id", user.id).order("scheduled_at", { ascending: true }),
        supabase.from("patient_health_documents").select("id,display_name,mime_type,file_size_bytes,document_category,notes,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("patient_notification_preferences").select("appointment_email_reminders,product_email_updates,updated_at").eq("user_id", user.id).maybeSingle()
      ]);
      const failed = [profile, journey, bp, symptoms, appointments, documents, prefs].find(result => result.error);
      if (failed?.error) throw failed.error;
      const payload = { exported_at: new Date().toISOString(), account_email: user.email, profile: profile.data, patient_profile: journey.data, blood_pressure_readings: bp.data, symptom_reports: symptoms.data, appointments: appointments.data, health_document_metadata: documents.data, notification_preferences: prefs.data, note: "This export includes document metadata, not the private file contents. Download each document separately from Health records." };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "preggy-mom-aid-personal-data.json"; anchor.click();
      URL.revokeObjectURL(url);
      setMessage("Your personal account data export has been prepared.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not export your information."); }
    finally { setBusy(false); }
  }

  async function requestDeletion() {
    if (!window.confirm("Submit a request to delete your Preggy Mom Aid account and associated records? Your account will remain active until you separately confirm permanent deletion.")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Sign in again before requesting account deletion.");
      const { error: insertError } = await supabase.from("account_deletion_requests").insert({ user_id: user.id });
      if (insertError) throw insertError;
      setDeletionRequested(true);
      setMessage("Your deletion request has been recorded. You can now separately confirm permanent deletion.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not submit the deletion request."); }
    finally { setBusy(false); }
  }

  async function confirmDeletion() {
    const confirmation = window.prompt("Permanent account deletion cannot be undone. Type DELETE to remove your account and its associated stored health records.");
    if (confirmation !== "DELETE") return;
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { error: deletionError } = await supabase.functions.invoke("process-account-deletion", { body: { confirmation: "DELETE" } });
      if (deletionError) throw deletionError;
      await supabase.auth.signOut();
      router.replace("/?account_deleted=1");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Account deletion could not be completed. Your request remains open."); }
    finally { setBusy(false); }
  }

  return <div className="patient-settings-layout">
    <form className="account-card patient-profile-form" onSubmit={savePreferences}>
      <div className="account-kicker">YOUR COMMUNICATION CHOICES</div><h2>Notification preferences</h2>
      <p className="account-intro">Choose the emails you may want to receive. Appointment reminders are sent only when enabled. Reminder delivery requires the service to be configured by the site operator.</p>
      <label className="patient-setting-toggle"><input type="checkbox" checked={preferences.appointment_email_reminders} onChange={event => setPreferences(current => ({ ...current, appointment_email_reminders: event.target.checked }))}/> Appointment reminder emails</label>
      <label className="patient-setting-toggle"><input type="checkbox" checked={preferences.product_email_updates} onChange={event => setPreferences(current => ({ ...current, product_email_updates: event.target.checked }))}/> Product and service updates</label>
      <button className="account-submit" disabled={busy}>{busy ? "Saving…" : "Save preferences"}</button>
    </form>
    <section className="patient-settings-panel">
      <div className="account-kicker">ACCOUNT DETAILS</div><h2>Change sign-in email</h2><p className="account-intro">A change takes effect only after the required email confirmation is completed.</p>
      <form className="account-form" onSubmit={changeEmail}><label htmlFor="newAccountEmail">New email address</label><input id="newAccountEmail" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)}/><button className="account-submit" disabled={busy}><Mail size={16}/> Send confirmation</button></form>
      <p className="account-switch"><Link href="/forgot-password">Reset your password</Link></p>
    </section>
    <section className="patient-settings-panel">
      <div className="account-kicker">YOUR INFORMATION</div><h2>Download or delete your data</h2><p className="account-intro">You can download a copy of your account information. Document file contents remain in Health records and must be downloaded there separately.</p>
      <button className="account-submit" type="button" onClick={exportData} disabled={busy}><Download size={16}/> Download my data</button>
      <div className="patient-safety-note"><ShieldCheck size={18}/><p>First submit a deletion request. Then, when you are ready, select Confirm permanent deletion and type DELETE. This permanently removes your account and associated stored health records.</p></div>
      {deletionRequested ? <button className="patient-delete-request" type="button" onClick={confirmDeletion} disabled={busy}><Trash2 size={16}/> Confirm permanent deletion</button> : <button className="patient-delete-request" type="button" onClick={requestDeletion} disabled={busy}><Trash2 size={16}/> Request account deletion</button>}
    </section>
    {error && <p className="account-error" role="alert">{error}</p>}
    {message && <p className="account-success" role="status">{message}</p>}
  </div>;
}

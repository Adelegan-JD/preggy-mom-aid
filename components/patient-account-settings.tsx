"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Download, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type Preferences = { appointment_email_reminders: boolean; product_email_updates: boolean };

export default function PatientAccountSettings({ initialPreferences, initialDeletionRequested = false }: { initialPreferences: Preferences; initialDeletionRequested?: boolean }) {
  const router = useRouter();
  const { t } = useLanguage();
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
      if (!user) throw new Error(t("signInAgain"));
      const { error: saveError } = await supabase.from("patient_notification_preferences")
        .upsert({ user_id: user.id, ...preferences, updated_at: new Date().toISOString() });
      if (saveError) throw saveError;
      setMessage(t("notificationSaved"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("preferencesError")); }
    finally { setBusy(false); }
  }

  async function changeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const { error: updateError } = await createClient().auth.updateUser({ email: email.trim() });
      if (updateError) throw updateError;
      setMessage(t("emailChangeMessage"));
      setEmail("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("emailChangeError")); }
    finally { setBusy(false); }
  }

  async function exportData() {
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(t("signInAgain"));
      const [profile, journey, bp, symptoms, appointments, documents, prefs, deletionRequests] = await Promise.all([
        supabase.from("profiles").select("full_name,account_type,created_at,updated_at").eq("id", user.id).maybeSingle(),
        supabase.from("patient_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("blood_pressure_readings").select("*").eq("user_id", user.id).order("measured_at", { ascending: false }),
        supabase.from("symptom_reports").select("*").eq("user_id", user.id).order("occurred_at", { ascending: false }),
        supabase.from("patient_appointments").select("*").eq("user_id", user.id).order("scheduled_at", { ascending: true }),
        supabase.from("patient_health_documents").select("id,display_name,mime_type,file_size_bytes,document_category,notes,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("patient_notification_preferences").select("appointment_email_reminders,product_email_updates,updated_at").eq("user_id", user.id).maybeSingle(),
        supabase.from("account_deletion_requests").select("status,requested_at").eq("user_id", user.id).order("requested_at", { ascending: false })
      ]);
      const failed = [profile, journey, bp, symptoms, appointments, documents, prefs, deletionRequests].find(result => result.error);
      if (failed?.error) throw failed.error;
      const payload = { exported_at: new Date().toISOString(), account_email: user.email, profile: profile.data, patient_profile: journey.data, blood_pressure_readings: bp.data, symptom_reports: symptoms.data, appointments: appointments.data, health_document_metadata: documents.data, notification_preferences: prefs.data, account_deletion_requests: deletionRequests.data, note: "This export includes document metadata, not the private file contents. Download each document separately from Health records." };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "preggy-mom-aid-personal-data.json"; anchor.click();
      URL.revokeObjectURL(url);
      setMessage(t("exportReady"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("exportError")); }
    finally { setBusy(false); }
  }

  async function requestDeletion() {
    if (!window.confirm(t("deleteAccountConfirm"))) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Sign in again before requesting account deletion.");
      const { error: insertError } = await supabase.from("account_deletion_requests").insert({ user_id: user.id });
      if (insertError) throw insertError;
      setDeletionRequested(true);
      setMessage(t("deletionRequested"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("deletionError")); }
    finally { setBusy(false); }
  }

  async function confirmDeletion() {
    const confirmation = window.prompt(t("deleteAccountPrompt"));
    if (confirmation !== "DELETE") return;
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      const { error: deletionError } = await supabase.functions.invoke("process-account-deletion", { body: { confirmation: "DELETE" } });
      if (deletionError) throw deletionError;
      await supabase.auth.signOut();
      router.replace("/?account_deleted=1");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("deletionCompleteError")); }
    finally { setBusy(false); }
  }

  return <div className="patient-settings-layout">
    <form className="account-card patient-profile-form" onSubmit={savePreferences}>
      <div className="account-kicker">{t("communicationChoices")}</div><h2>{t("notificationPreferences")}</h2>
      <p className="account-intro">{t("notificationIntro")}</p>
      <label className="patient-setting-toggle"><input type="checkbox" checked={preferences.appointment_email_reminders} onChange={event => setPreferences(current => ({ ...current, appointment_email_reminders: event.target.checked }))}/> {t("appointmentReminderEmails")}</label>
      <label className="patient-setting-toggle"><input type="checkbox" checked={preferences.product_email_updates} onChange={event => setPreferences(current => ({ ...current, product_email_updates: event.target.checked }))}/> {t("productUpdates")}</label><p className="account-footnote">{t("notificationFootnote")}</p>
      <button className="account-submit" disabled={busy}>{busy ? t("saving") : t("savePreferences")}</button>
    </form>
    <section className="patient-settings-panel">
      <div className="account-kicker">{t("accountDetails")}</div><h2>{t("changeSignInEmail")}</h2><p className="account-intro">{t("emailChangeIntro")}</p>
      <form className="account-form" onSubmit={changeEmail}><label htmlFor="newAccountEmail">{t("newEmail")}</label><input id="newAccountEmail" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)}/><button className="account-submit" disabled={busy}><Mail size={16}/> {t("sendConfirmation")}</button></form>
      <p className="account-switch"><Link href="/forgot-password">{t("resetPassword")}</Link></p>
    </section>
    <section className="patient-settings-panel">
      <div className="account-kicker">{t("yourInformation")}</div><h2>{t("downloadDeleteData")}</h2><p className="account-intro">{t("dataIntro")}</p>
      <button className="account-submit" type="button" onClick={exportData} disabled={busy}><Download size={16}/> {t("downloadMyData")}</button>
      <div className="patient-safety-note"><ShieldCheck size={18}/><p>{t("deletionSteps")}</p></div>
      {deletionRequested ? <button className="patient-delete-request" type="button" onClick={confirmDeletion} disabled={busy}><Trash2 size={16}/> {t("confirmPermanentDeletion")}</button> : <button className="patient-delete-request" type="button" onClick={requestDeletion} disabled={busy}><Trash2 size={16}/> {t("requestAccountDeletion")}</button>}
    </section>
    {error && <p className="account-error" role="alert">{error}</p>}
    {message && <p className="account-success" role="status">{message}</p>}
  </div>;
}

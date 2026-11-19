"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";

type PatientProfile = {
  preferred_name: string | null;
  phone_number: string | null;
  state_or_territory: string | null;
  preferred_language: "en" | "yo" | "ig" | "ha" | "pcm" | "other";
  pregnancy_status: "pregnant" | "postpartum" | "not_currently_pregnant";
  estimated_due_date: string | null;
  birth_date: string | null;
};

export default function PatientProfileForm({ initialProfile }: { initialProfile: PatientProfile | null }) {
  const { language: appLanguage, setLanguage, t } = useLanguage();
  const [preferredName, setPreferredName] = useState(initialProfile?.preferred_name ?? "");
  const [phone, setPhone] = useState(initialProfile?.phone_number ?? "");
  const [state, setState] = useState(initialProfile?.state_or_territory ?? "");
  const [language, setProfileLanguage] = useState<PatientProfile["preferred_language"]>(initialProfile?.preferred_language ?? appLanguage);
  const [status, setStatus] = useState<PatientProfile["pregnancy_status"]>(initialProfile?.pregnancy_status ?? "pregnant");
  const [dueDate, setDueDate] = useState(initialProfile?.estimated_due_date ?? "");
  const [birthDate, setBirthDate] = useState(initialProfile?.birth_date ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    try {
      if (status === "pregnant" && !dueDate) throw new Error("Add your estimated due date, or choose another pregnancy status.");
      if (status === "postpartum" && !birthDate) throw new Error("Add your baby's date of birth to save your postpartum profile.");
      if (birthDate && new Date(birthDate) > new Date(new Date().toDateString())) throw new Error("The birth date cannot be in the future.");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Your session has expired. Please sign in again.");
      const { error: saveError } = await supabase.from("patient_profiles").upsert({
        user_id: user.id,
        preferred_name: preferredName.trim() || null,
        phone_number: phone.trim() || null,
        state_or_territory: state.trim() || null,
        preferred_language: language,
        pregnancy_status: status,
        estimated_due_date: status === "pregnant" ? dueDate || null : null,
        birth_date: status === "postpartum" ? birthDate || null : null,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
      if (saveError) throw saveError;
      setSaved(t("saved"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not save your profile. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="account-card patient-profile-form" onSubmit={submit}>
      <div className="account-kicker">YOUR DETAILS</div>
      <h2>Personal information</h2>
      <p className="account-intro">Only share details you are comfortable storing. Your profile is private to your account.</p>
      <label htmlFor="preferredName">What should we call you? <span>(optional)</span></label>
      <input id="preferredName" value={preferredName} maxLength={80} onChange={event => setPreferredName(event.target.value)} autoComplete="given-name" />
      <label htmlFor="patientPhone">Phone number <span>(optional)</span></label>
      <input id="patientPhone" type="tel" value={phone} maxLength={30} onChange={event => setPhone(event.target.value)} autoComplete="tel" placeholder="+234…" />
      <label htmlFor="patientState">State or territory <span>(optional)</span></label>
      <input id="patientState" value={state} maxLength={80} onChange={event => setState(event.target.value)} autoComplete="address-level1" placeholder="e.g. Lagos" />
      <label htmlFor="patientLanguage">{t("preferredLanguage")}</label>
      <select id="patientLanguage" value={language} onChange={event => { const next = event.target.value as PatientProfile["preferred_language"]; setProfileLanguage(next); if (next !== "other") setLanguage(next); }}>
        <option value="en">English</option>
        <option value="yo">Yorùbá</option>
        <option value="ig">Igbo</option>
        <option value="ha">Hausa</option>
        <option value="pcm">Nigerian Pidgin</option>
        <option value="other">Other</option>
      </select>
      <div className="patient-profile-divider" />
      <div className="account-kicker">YOUR JOURNEY</div>
      <h2>Where are you in your journey?</h2>
      <label htmlFor="pregnancyStatus">Current status</label>
      <select id="pregnancyStatus" value={status} onChange={event => setStatus(event.target.value as PatientProfile["pregnancy_status"])}>
        <option value="pregnant">I am pregnant</option>
        <option value="postpartum">I have given birth</option>
        <option value="not_currently_pregnant">I am not currently pregnant</option>
      </select>
      {status === "pregnant" && <>
        <label htmlFor="dueDate">Estimated due date</label>
        <input id="dueDate" type="date" required value={dueDate} onChange={event => setDueDate(event.target.value)} />
        <p className="account-footnote">This date is used to personalise your journey view. It is not a medical assessment or a substitute for dating advice from your maternity team.</p>
      </>}
      {status === "postpartum" && <>
        <label htmlFor="birthDate">Baby's date of birth</label>
        <input id="birthDate" type="date" required value={birthDate} onChange={event => setBirthDate(event.target.value)} />
        <p className="account-footnote">Postpartum support continues after birth. Keep following the care plan from your maternity team.</p>
      </>}
      <button className="account-submit" disabled={busy}>{busy ? t("saving") : t("saveProfile")}</button>
      {error && <p className="account-error" role="alert">{error}</p>}
      {saved && <p className="account-success" role="status">{saved}</p>}
      <p className="account-footnote">You can update these details at any time. Your profile does not give healthcare professionals access to your health records.</p>
    </form>
  );
}

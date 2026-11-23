"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { languageOptions } from "@/lib/i18n/translations";
import { ComboBox } from "@/components/combo-box";

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
  const router = useRouter();
  const [preferredName, setPreferredName] = useState(initialProfile?.preferred_name ?? "");
  const [phone, setPhone] = useState(initialProfile?.phone_number ?? "");
  const [state, setState] = useState(initialProfile?.state_or_territory ?? "");
  const [status, setStatus] = useState<PatientProfile["pregnancy_status"]>(initialProfile?.pregnancy_status ?? "pregnant");
  const [dueDate, setDueDate] = useState(initialProfile?.estimated_due_date ?? "");
  const [birthDate, setBirthDate] = useState(initialProfile?.birth_date ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (initialProfile?.preferred_language && initialProfile.preferred_language !== "other") {
      try { if (!window.localStorage.getItem("pma-language-v1")) { setLanguage(initialProfile.preferred_language); router.refresh(); } } catch { /* Keep the active session language. */ }
    }
  }, [initialProfile?.preferred_language, setLanguage]);

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
        preferred_language: appLanguage,
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
    <form className="ds-stack-lg" onSubmit={submit}>
      <section className="ds-panel ds-form" aria-labelledby="profile-personal-title">
        <div>
          <h2 className="ds-h2" id="profile-personal-title">{t("personalInfo")}</h2>
          <p className="ds-muted ds-small">Only share details you are comfortable storing. Your profile is private to your account.</p>
        </div>
        <div className="ds-field-row">
          <div className="ds-field">
            <label className="ds-label" htmlFor="preferredName">{t("preferredNameQuestion")} <span className="ds-optional">{t("optional")}</span></label>
            <input className="ds-input" id="preferredName" value={preferredName} maxLength={80} onChange={event => setPreferredName(event.target.value)} autoComplete="given-name" />
          </div>
          <div className="ds-field">
            <label className="ds-label" htmlFor="patientPhone">{t("phoneNumber")} <span className="ds-optional">{t("optional")}</span></label>
            <input className="ds-input" id="patientPhone" type="tel" value={phone} maxLength={30} onChange={event => setPhone(event.target.value)} autoComplete="tel" placeholder="+234…" />
          </div>
        </div>
        <div className="ds-field-row">
          <div className="ds-field">
            <label className="ds-label" htmlFor="patientState">{t("stateTerritory")} <span className="ds-optional">{t("optional")}</span></label>
            <input className="ds-input" id="patientState" value={state} maxLength={80} onChange={event => setState(event.target.value)} autoComplete="address-level1" placeholder="e.g. Lagos" />
          </div>
          <div className="ds-field">
            <label className="ds-label" htmlFor="patientLanguage">{t("preferredLanguage")}</label>
            <ComboBox id="patientLanguage" value={appLanguage} onValueChange={value => { setLanguage(value as typeof appLanguage); router.refresh(); }} options={languageOptions.map(option => ({ value: option.code, label: option.nativeLabel }))} />
          </div>
        </div>
      </section>

      <section className="ds-panel ds-form" aria-labelledby="profile-journey-title">
        <h2 className="ds-h2" id="profile-journey-title">{t("journeyQuestion")}</h2>
        <fieldset className="ds-fieldset">
          <legend>{t("currentStatus")}</legend>
          <div className="ds-choice-grid">
            {(["pregnant", "postpartum", "not_currently_pregnant"] as const).map(value => <label key={value} className="ds-choice"><input type="radio" name="pregnancyStatus" value={value} checked={status === value} onChange={() => setStatus(value)} />{t(value === "pregnant" ? "statusPregnant" : value === "postpartum" ? "statusPostpartum" : "statusNotPregnant")}</label>)}
          </div>
        </fieldset>
        {status === "pregnant" && <div className="ds-field">
          <label className="ds-label" htmlFor="dueDate">{t("estimatedDueDate")}</label>
          <input className="ds-input" id="dueDate" type="date" required value={dueDate} onChange={event => setDueDate(event.target.value)} aria-describedby="dueDateHint" style={{ maxWidth: 280 }} />
          <p className="ds-hint" id="dueDateHint">{t("dateFootnote")}</p>
        </div>}
        {status === "postpartum" && <div className="ds-field">
          <label className="ds-label" htmlFor="birthDate">{t("birthDate")}</label>
          <input className="ds-input" id="birthDate" type="date" required value={birthDate} onChange={event => setBirthDate(event.target.value)} aria-describedby="birthDateHint" style={{ maxWidth: 280 }} />
          <p className="ds-hint" id="birthDateHint">Postpartum support continues after birth. Keep following the care plan from your maternity team.</p>
        </div>}
      </section>

      <div className="ds-form-actions">
        <button className="ds-btn ds-btn-primary ds-btn-lg" disabled={busy}>{busy ? t("saving") : t("saveProfile")}</button>
        <p className="ds-hint">{t("profilePrivacyFootnote")}</p>
      </div>
      {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
      {saved && <p className="ds-message ds-message-success" role="status">{saved}</p>}
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { useConfirmations } from "@/contexts/confirmations-provider";
import { ComboBox } from "@/components/combo-box";

type Appointment = {
  id: string;
  title: string;
  appointment_type: "antenatal" | "postnatal" | "scan" | "laboratory" | "other";
  scheduled_at: string;
  location: string | null;
  notes: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

function localDateTimeValue(value?: string) {
  const date = value ? new Date(value) : new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function formatDate(value: string, language: string) {
  const locale = language === "yo" ? "yo-NG" : language === "ha" ? "ha-NG" : language === "ig" ? "ig-NG" : language === "pcm" ? "en-NG" : "en-NG";
  return new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

export default function PatientAppointments({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const { t, language } = useLanguage();
 const { openConfirmModal } = useConfirmations();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Appointment["appointment_type"]>("antenatal");
  const [scheduledAt, setScheduledAt] = useState(localDateTimeValue);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function resetForm() {
    setEditingId(null); setTitle(""); setType("antenatal"); setScheduledAt(localDateTimeValue()); setLocation(""); setNotes("");
  }
  function startEdit(item: Appointment) {
    setEditingId(item.id); setTitle(item.title); setType(item.appointment_type); setScheduledAt(localDateTimeValue(item.scheduled_at));
    setLocation(item.location ?? ""); setNotes(item.notes ?? ""); setError(""); setMessage("");
  }

  async function saveAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const date = new Date(scheduledAt);
      if (!title.trim() || title.trim().length < 2) throw new Error(t("appointmentTitleError"));
      if (Number.isNaN(date.getTime())) throw new Error(t("appointmentDateError"));
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t("appointmentSessionError"));
      const payload = { title: title.trim(), appointment_type: type, scheduled_at: date.toISOString(), location: location.trim() || null, notes: notes.trim() || null, updated_at: new Date().toISOString() };
      if (editingId) {
        const { data, error: updateError } = await supabase.from("patient_appointments").update(payload).eq("id", editingId).eq("user_id", user.id).select("id,title,appointment_type,scheduled_at,location,notes,status").single();
        if (updateError) throw updateError;
        setAppointments(current => current.map(item => item.id === editingId ? data : item).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)));
        setMessage(t("appointmentUpdated"));
      } else {
        const { data, error: insertError } = await supabase.from("patient_appointments").insert({ ...payload, user_id: user.id }).select("id,title,appointment_type,scheduled_at,location,notes,status").single();
        if (insertError) throw insertError;
        setAppointments(current => [...current, data].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)));
        setMessage(t("appointmentAdded"));
      }
      resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("appointmentSaveError"));
    } finally { setBusy(false); }
  }

  async function updateStatus(id: string, status: Appointment["status"]) {
    setError(""); setMessage("");
    const supabase = createClient();
    const { error: updateError } = await supabase.from("patient_appointments").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (updateError) { setError(t("appointmentUpdateError")); return; }
    setAppointments(current => current.map(item => item.id === id ? { ...item, status } : item));
    setMessage(t("appointmentUpdated"));
  }

  function removeAppointment(id: string) {
    openConfirmModal(t("deleteAppointmentConfirm"), () => performRemoveAppointment(id), { title: t("delete"), confirmText: t("delete"), isDelete: true });
  }

  async function performRemoveAppointment(id: string) {
    setError(""); setMessage("");
    const { error: deleteError } = await createClient().from("patient_appointments").delete().eq("id", id);
    if (deleteError) { setError(t("appointmentDeleteError")); return; }
    setAppointments(current => current.filter(item => item.id !== id));
    if (editingId === id) resetForm();
    setMessage(t("appointmentRemoved"));
  }

  const upcoming = appointments.filter(item => item.status === "scheduled" && new Date(item.scheduled_at).getTime() >= Date.now());
  const past = appointments.filter(item => !upcoming.some(next => next.id === item.id));

  const typeLabel = (value: Appointment["appointment_type"]) => t(value === "antenatal" ? "antenatalVisit" : value === "postnatal" ? "postnatalVisit" : value === "scan" ? "ultrasoundScan" : value === "laboratory" ? "labTest" : "other");

  return <div className="ds-split">
    <form className="ds-panel ds-form ds-sticky" onSubmit={saveAppointment} aria-labelledby="appointment-form-title">
      <h2 className="ds-h2" id="appointment-form-title">{editingId ? t("editAppointment") : t("addAppointmentTitle")}</h2>
      <div className="ds-field">
        <label className="ds-label" htmlFor="appointmentTitle">{t("appointmentTitle")}</label>
        <input className="ds-input" id="appointmentTitle" required minLength={2} maxLength={120} value={title} onChange={event => setTitle(event.target.value)} placeholder={t("appointmentTitlePlaceholder")} />
      </div>
      <div className="ds-field-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="appointmentType">{t("appointmentType")}</label>
          <ComboBox id="appointmentType" value={type} onValueChange={value => setType(value as Appointment["appointment_type"])} options={[{ value: "antenatal", label: t("antenatalVisit") }, { value: "postnatal", label: t("postnatalVisit") }, { value: "scan", label: t("ultrasoundScan") }, { value: "laboratory", label: t("labTest") }, { value: "other", label: t("other") }]} />
        </div>
        <div className="ds-field">
          <label className="ds-label" htmlFor="appointmentWhen">{t("dateTime")}</label>
          <input className="ds-input" id="appointmentWhen" type="datetime-local" required value={scheduledAt} onChange={event => setScheduledAt(event.target.value)} />
        </div>
      </div>
      <div className="ds-field">
        <label className="ds-label" htmlFor="appointmentLocation">{t("location")} <span className="ds-optional">{t("optional")}</span></label>
        <input className="ds-input" id="appointmentLocation" maxLength={180} value={location} onChange={event => setLocation(event.target.value)} placeholder={t("locationPlaceholder")} />
      </div>
      <div className="ds-field">
        <label className="ds-label" htmlFor="appointmentNotes">{t("notes")} <span className="ds-optional">{t("optional")}</span></label>
        <textarea className="ds-input" id="appointmentNotes" rows={3} maxLength={1500} value={notes} onChange={event => setNotes(event.target.value)} placeholder={t("appointmentNotesPlaceholder")} />
      </div>
      <div className="ds-form-actions">
        <button className="ds-btn ds-btn-primary" disabled={busy}>{busy ? t("saving") : editingId ? t("saveChanges") : t("addToCalendar")}</button>
        {editingId && <button type="button" className="ds-btn ds-btn-ghost" onClick={resetForm}>{t("cancelEditing")}</button>}
      </div>
      {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
      {message && <p className="ds-message ds-message-success" role="status">{message}</p>}
    </form>

    <div className="ds-stack-lg">
      <section className="ds-panel" aria-labelledby="upcoming-title">
        <div className="ds-panel-header"><h2 className="ds-h2" id="upcoming-title">{t("upcomingAppointments")}</h2>{upcoming.length > 0 && <span className="ds-badge">{upcoming.length}</span>}</div>
        {upcoming.length ? <ul className="ds-list">{upcoming.map(item => <li key={item.id} className="ds-list-item">
          <div className="ds-list-main">
            <span className="ds-list-title">{item.title}</span>
            <span className="ds-list-meta">{formatDate(item.scheduled_at, language)} · {typeLabel(item.appointment_type)}</span>
            {item.location && <span className="ds-list-meta">{item.location}</span>}
            {item.notes && <span className="ds-list-meta">{item.notes}</span>}
          </div>
          <div className="ds-list-actions">
            <button type="button" className="ds-btn ds-btn-sm" onClick={() => updateStatus(item.id, "completed")}>{t("markCompleted")}</button>
            <button type="button" className="ds-btn ds-btn-sm ds-btn-ghost" onClick={() => startEdit(item)}>{t("edit")}</button>
            <button type="button" className="ds-btn ds-btn-sm ds-btn-ghost" onClick={() => updateStatus(item.id, "cancelled")}>{t("cancelAppointment")}</button>
            <button type="button" className="ds-btn ds-btn-sm ds-btn-danger" onClick={() => removeAppointment(item.id)}>{t("delete")}</button>
          </div>
        </li>)}</ul> : <div className="ds-empty"><b>{t("noUpcomingAppointments")}</b></div>}
      </section>

      <section className="ds-panel" aria-labelledby="past-title">
        <div className="ds-panel-header"><h2 className="ds-h2" id="past-title">{t("pastAppointments")}</h2></div>
        {past.length ? <ul className="ds-list">{past.map(item => <li key={item.id} className="ds-list-item">
          <div className="ds-list-main">
            <span className="ds-list-title">{item.title}</span>
            <span className="ds-list-meta">{formatDate(item.scheduled_at, language)} · {typeLabel(item.appointment_type)}</span>
            <span className={`ds-badge ${item.status === "completed" ? "ds-badge-success" : item.status === "cancelled" ? "ds-badge-danger" : "ds-badge-warning"}`}>{t(item.status === "cancelled" ? "cancelled" : item.status === "completed" ? "completed" : "scheduled")}</span>
          </div>
          <div className="ds-list-actions">
            {item.status === "cancelled" && <button type="button" className="ds-btn ds-btn-sm" onClick={() => updateStatus(item.id, "scheduled")}>{t("restore")}</button>}
            {item.status !== "completed" && <button type="button" className="ds-btn ds-btn-sm ds-btn-ghost" onClick={() => startEdit(item)}>{t("edit")}</button>}
            <button type="button" className="ds-btn ds-btn-sm ds-btn-danger" onClick={() => removeAppointment(item.id)}>{t("delete")}</button>
          </div>
        </li>)}</ul> : <div className="ds-empty"><b>{t("noPastAppointments")}</b></div>}
      </section>
    </div>
  </div>;
}

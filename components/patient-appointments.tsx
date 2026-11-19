"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";

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
  const [appointments, setAppointments] = useState(initialAppointments);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Appointment["appointment_type"]>("antenatal");
  const [scheduledAt, setScheduledAt] = useState(localDateTimeValue);
  const [location, set{t("location")}] = useState("");
  const [notes, set{t("notes")}] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function resetForm() {
    setEditingId(null); setTitle(""); setType("antenatal"); setScheduledAt(localDateTimeValue()); set{t("location")}(""); set{t("notes")}("");
  }
  function startEdit(item: Appointment) {
    setEditingId(item.id); setTitle(item.title); setType(item.appointment_type); setScheduledAt(localDateTimeValue(item.scheduled_at));
    set{t("location")}(item.location ?? ""); set{t("notes")}(item.notes ?? ""); setError(""); setMessage("");
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

  async function removeAppointment(id: string) {
    if (!window.confirm(t("deleteAppointmentConfirm"))) return;
    setError(""); setMessage("");
    const { error: deleteError } = await createClient().from("patient_appointments").delete().eq("id", id);
    if (deleteError) { setError(t("appointmentDeleteError")); return; }
    setAppointments(current => current.filter(item => item.id !== id));
    if (editingId === id) resetForm();
    setMessage(t("appointmentRemoved"));
  }

  const upcoming = appointments.filter(item => item.status === "scheduled" && new Date(item.scheduled_at).getTime() >= Date.now());
  const past = appointments.filter(item => !upcoming.some(next => next.id === item.id));

  return <div className="patient-appointments-layout">
    <form className="account-card patient-profile-form" onSubmit={saveAppointment}>
      <div className="account-kicker">{t("apptKicker")}</div>
      <h2>{editingId ? t("editAppointment") : t("addAppointmentTitle")}</h2>
      <p className="account-intro">{t("calendarIntro")}</p>
      <label htmlFor="appointmentTitle">{t("appointmentTitle")}</label>
      <input id="appointmentTitle" required minLength={2} maxLength={120} value={title} onChange={event => setTitle(event.target.value)} placeholder="{t("appointmentTitlePlaceholder")}" />
      <label htmlFor="appointmentType">{t("appointmentType")}</label>
      <select id="appointmentType" value={type} onChange={event => setType(event.target.value as Appointment["appointment_type"])}>
        <option value="antenatal">{t("antenatalVisit")}</option><option value="postnatal">{t("postnatalVisit")}</option><option value="scan">{t("ultrasoundScan")}</option><option value="laboratory">{t("labTest")}</option><option value="other">Other</option>
      </select>
      <label htmlFor="appointmentWhen">{t("dateTime")}</label>
      <input id="appointmentWhen" type="datetime-local" required value={scheduledAt} onChange={event => setScheduledAt(event.target.value)} />
      <label htmlFor="appointment{t("location")}">{t("location")} <span>{t("optional")}</span></label>
      <input id="appointment{t("location")}" maxLength={180} value={location} onChange={event => set{t("location")}(event.target.value)} placeholder="{t("locationPlaceholder")}" />
      <label htmlFor="appointment{t("notes")}">{t("notes")} <span>{t("optional")}</span></label>
      <textarea id="appointment{t("notes")}" rows={3} maxLength={1500} value={notes} onChange={event => set{t("notes")}(event.target.value)} placeholder="{t("appointmentNotesPlaceholder")}" />
      <button className="account-submit" disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "{t("addToCalendar")}"}</button>
      {editingId && <button type="button" className="account-signout" onClick={resetForm}>{t("cancelEditing")}</button>}
      {error && <p className="account-error" role="alert">{error}</p>}
      {message && <p className="account-success" role="status">{message}</p>}
    </form>
    <section className="patient-appointment-list">
      <div className="patient-recent-panel"><div className="account-kicker">{t("upNext")}</div><h2>{t("upcomingAppointments")}</h2>
        {upcoming.length ? <ul>{upcoming.map(item => <li key={item.id} className="patient-appointment-item"><div><strong>{item.title}</strong><span>{formatDate(item.scheduled_at, language)} · {item.appointment_type.replace("_", " ")}</span>{item.location && <span>{item.location}</span>}{item.notes && <span>{item.notes}</span>}</div><div className="patient-appointment-actions"><button type="button" onClick={() => startEdit(item)}>{t("edit")}</button><button type="button" onClick={() => updateStatus(item.id, "completed")}>{t("markCompleted")}</button><button type="button" onClick={() => updateStatus(item.id, "cancelled")}>{t("cancelAppointment")}</button><button type="button" onClick={() => removeAppointment(item.id)}>{t("delete")}</button></div></li>)}</ul> : <p>{t("noUpcomingAppointments")}</p>}
      </div>
      <div className="patient-recent-panel"><div className="account-kicker">{t("yourHealth")}</div><h2>{t("pastAppointments")}</h2>
        {past.length ? <ul>{past.map(item => <li key={item.id} className="patient-appointment-item"><div><strong>{item.title}</strong><span>{formatDate(item.scheduled_at, language)}</span><span className={`appointment-status ${item.status}`}>{t(item.status === "cancelled" ? "cancelled" : item.status === "completed" ? "completed" : "scheduled")}</span></div><div className="patient-appointment-actions">{item.status === "cancelled" && <button type="button" onClick={() => updateStatus(item.id, "scheduled")}>{t("restore")}</button>}{item.status !== "completed" && <button type="button" onClick={() => startEdit(item)}>{t("edit")}</button>}<button type="button" onClick={() => removeAppointment(item.id)}>{t("delete")}</button></div></li>)}</ul> : <p>{t("noPastAppointments")}</p>}
      </div>
    </section>
  </div>;
}

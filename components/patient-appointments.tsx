"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Appointment = {
  id: string;
  title: string;
  appointment_type: "antenatal" | "postnatal" | "scan" | "laboratory" | "other";
  scheduled_at: string;
  location: string | null;
  notes: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

function localDateTimeValue() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function PatientAppointments({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Appointment["appointment_type"]>("antenatal");
  const [scheduledAt, setScheduledAt] = useState(localDateTimeValue);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function createAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const date = new Date(scheduledAt);
      if (!title.trim() || title.trim().length < 2) throw new Error("Enter an appointment title.");
      if (Number.isNaN(date.getTime())) throw new Error("Choose a valid appointment date and time.");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Your session has expired. Please sign in again.");
      const { data, error: insertError } = await supabase.from("patient_appointments").insert({
        user_id: user.id,
        title: title.trim(),
        appointment_type: type,
        scheduled_at: date.toISOString(),
        location: location.trim() || null,
        notes: notes.trim() || null
      }).select("id,title,appointment_type,scheduled_at,location,notes,status").single();
      if (insertError) throw insertError;
      setAppointments(current => [...current, data].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)));
      setTitle("");
      setLocation("");
      setNotes("");
      setScheduledAt(localDateTimeValue());
      setMessage("Your appointment has been added to your personal calendar.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not save this appointment. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, status: Appointment["status"]) {
    setError("");
    setMessage("");
    const supabase = createClient();
    const { error: updateError } = await supabase.from("patient_appointments").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (updateError) { setError("We could not update this appointment. Please try again."); return; }
    setAppointments(current => current.map(item => item.id === id ? { ...item, status } : item));
    setMessage("Appointment updated.");
  }

  async function removeAppointment(id: string) {
    setError("");
    setMessage("");
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("patient_appointments").delete().eq("id", id);
    if (deleteError) { setError("We could not delete this appointment. Please try again."); return; }
    setAppointments(current => current.filter(item => item.id !== id));
    setMessage("Appointment removed.");
  }

  const upcoming = appointments.filter(item => item.status === "scheduled" && new Date(item.scheduled_at).getTime() >= Date.now());
  const past = appointments.filter(item => !upcoming.some(next => next.id === item.id));

  return (
    <div className="patient-appointments-layout">
      <form className="account-card patient-profile-form" onSubmit={createAppointment}>
        <div className="account-kicker">YOUR CARE CALENDAR</div>
        <h2>Add an appointment</h2>
        <p className="account-intro">Add appointments you have arranged with your maternity team. This calendar does not book appointments with hospitals or send reminders yet.</p>
        <label htmlFor="appointmentTitle">Appointment title</label>
        <input id="appointmentTitle" required minLength={2} maxLength={120} value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Antenatal check-up" />
        <label htmlFor="appointmentType">Appointment type</label>
        <select id="appointmentType" value={type} onChange={event => setType(event.target.value as Appointment["appointment_type"])}>
          <option value="antenatal">Antenatal visit</option>
          <option value="postnatal">Postnatal visit</option>
          <option value="scan">Ultrasound / scan</option>
          <option value="laboratory">Laboratory / test</option>
          <option value="other">Other</option>
        </select>
        <label htmlFor="appointmentWhen">Date and time</label>
        <input id="appointmentWhen" type="datetime-local" required value={scheduledAt} onChange={event => setScheduledAt(event.target.value)} />
        <label htmlFor="appointmentLocation">Location <span>(optional)</span></label>
        <input id="appointmentLocation" maxLength={180} value={location} onChange={event => setLocation(event.target.value)} placeholder="Hospital, clinic or address" />
        <label htmlFor="appointmentNotes">Notes <span>(optional)</span></label>
        <textarea id="appointmentNotes" rows={3} maxLength={1500} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Questions to ask or items to bring" />
        <button className="account-submit" disabled={busy}>{busy ? "Saving…" : "Add to my calendar"}</button>
        {error && <p className="account-error" role="alert">{error}</p>}
        {message && <p className="account-success" role="status">{message}</p>}
      </form>

      <section className="patient-appointment-list">
        <div className="patient-recent-panel">
          <div className="account-kicker">UP NEXT</div>
          <h2>Upcoming appointments</h2>
          {upcoming.length ? <ul>{upcoming.map(item => <li key={item.id} className="patient-appointment-item">
            <div><strong>{item.title}</strong><span>{formatDate(item.scheduled_at)} · {item.appointment_type.replace("_", " ")}</span>{item.location && <span>{item.location}</span>}{item.notes && <span>{item.notes}</span>}</div>
            <div className="patient-appointment-actions"><button type="button" onClick={() => updateStatus(item.id, "completed")}>Mark completed</button><button type="button" onClick={() => updateStatus(item.id, "cancelled")}>Cancel</button><button type="button" onClick={() => removeAppointment(item.id)}>Delete</button></div>
          </li>)}</ul> : <p>No upcoming appointments yet. Add an appointment you have arranged with your care team.</p>}
        </div>
        <div className="patient-recent-panel">
          <div className="account-kicker">YOUR RECORD</div>
          <h2>Past and cancelled</h2>
          {past.length ? <ul>{past.map(item => <li key={item.id} className="patient-appointment-item">
            <div><strong>{item.title}</strong><span>{formatDate(item.scheduled_at)}</span><span className={`appointment-status ${item.status}`}>{item.status}</span></div>
            {item.status === "cancelled" && <button type="button" onClick={() => updateStatus(item.id, "scheduled")}>Restore</button>}
            <button type="button" onClick={() => removeAppointment(item.id)}>Delete</button>
          </li>)}</ul> : <p>Your completed, cancelled and past appointments will appear here.</p>}
        </div>
      </section>
    </div>
  );
}

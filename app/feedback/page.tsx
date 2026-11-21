"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/auth-layout";
import { Callout } from "@/components/ds";
import { ComboBox } from "@/components/combo-box";

const areas = ["Overall experience", "Creating an account and signing in", "Finding information", "Learning Centre content", "Colours, layout and readability", "Mobile experience", "Accessibility", "Something else"];
const ratings = [{ value: "5", label: "Excellent" }, { value: "4", label: "Good" }, { value: "3", label: "Okay" }, { value: "2", label: "Poor" }, { value: "1", label: "Very poor" }];

export default function FeedbackPage() {
  const [rating, setRating] = useState("5");
  const [area, setArea] = useState(areas[0]);
  const [comments, setComments] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setSuccess(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login?next=/feedback"; return; }
      const { error: insertError } = await supabase.from("product_feedback").insert({ user_id: user.id, rating: Number(rating), area, comments: comments.trim() });
      if (insertError) throw insertError;
      setSuccess(true); setComments("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your feedback could not be submitted. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <AuthLayout
      title="How was your experience?"
      lede="Your feedback helps us make Preggy Mom Aid easier to understand and use."
      footer={<p><Link href="/my-care" className="ds-link"><ArrowLeft size={15} aria-hidden="true" /> Back to your account</Link></p>}
    >
      <form className="ds-form" onSubmit={submit}>
        <fieldset className="ds-fieldset">
          <legend>Overall rating</legend>
          <div className="ds-segmented" role="radiogroup" aria-label="Overall rating" style={{ width: "100%" }}>
            {ratings.map(item => <label key={item.value} className="ds-rating"><input type="radio" name="rating" value={item.value} checked={rating === item.value} onChange={() => setRating(item.value)} className="ds-visually-hidden" /><span>{item.label}</span></label>)}
          </div>
        </fieldset>
        <div className="ds-field">
          <label className="ds-label" htmlFor="area">What are you reviewing?</label>
          <ComboBox id="area" value={area} onValueChange={setArea} options={areas.map(item => ({ value: item, label: item }))} />
        </div>
        <div className="ds-field">
          <span className="ds-label"><label htmlFor="comments">Your comments</label><span className="ds-optional ds-tabular" id="feedback-count">{comments.length}/2500</span></span>
          <textarea className="ds-input" id="comments" rows={6} maxLength={2500} required value={comments} onChange={event => setComments(event.target.value)} placeholder="What worked well? What was confusing? What should we improve?" aria-describedby="feedback-count feedback-privacy" />
        </div>
        <Callout tone="neutral"><span id="feedback-privacy">Please keep it non-clinical: no symptoms, pregnancy details, readings, diagnoses, medicines or anyone else&apos;s identifying information. Feedback is not monitored for medical help.</span></Callout>
        <button className="ds-btn ds-btn-primary ds-btn-lg ds-btn-block" disabled={busy}>{busy ? "Sending feedback…" : "Submit feedback"} <Send size={16} aria-hidden="true" /></button>
        {error && <p className="ds-message ds-message-error" role="alert">{error}</p>}
        {success && <p className="ds-message ds-message-success" role="status">Thank you. Your feedback has been submitted.</p>}
      </form>
    </AuthLayout>
  );
}

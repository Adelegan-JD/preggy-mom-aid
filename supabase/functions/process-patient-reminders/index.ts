import { createClient } from "npm:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };

function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: cors }); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const secretMap = Deno.env.get("SUPABASE_SECRET_KEYS");
  const adminKey = secretMap ? JSON.parse(secretMap).default : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  // The scheduler sends the Supabase secret key in the apikey header. This
  // function disables gateway JWT verification but enforces this secret itself.
  const suppliedKey = req.headers.get("apikey");
  if (!adminKey || !suppliedKey || suppliedKey !== adminKey) return json({ error: "Unauthorized" }, 401);
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REMINDER_FROM_EMAIL");
  if (!url || !adminKey || !resendKey || !from) return json({ error: "Reminder service is not fully configured" }, 503);

  const admin = createClient(url, adminKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const now = new Date();
  const start = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
  const end = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();
  const { data: appointments, error } = await admin.from("patient_appointments")
    .select("id,user_id,title,scheduled_at,status")
    .eq("status", "scheduled").gte("scheduled_at", start).lt("scheduled_at", end).limit(500);
  if (error) return json({ error: "Could not retrieve upcoming appointments" }, 500);

  let sent = 0, skipped = 0, failed = 0;
  for (const appointment of appointments ?? []) {
    const { data: pref } = await admin.from("patient_notification_preferences")
      .select("appointment_email_reminders").eq("user_id", appointment.user_id).maybeSingle();
    if (!pref?.appointment_email_reminders) { skipped++; continue; }
    const { data: ledger } = await admin.from("patient_notification_deliveries")
      .select("id,status").eq("appointment_id", appointment.id).eq("reminder_type", "24_hour").maybeSingle();
    if (ledger?.status === "sent") { skipped++; continue; }
    let ledgerId = ledger?.id;
    if (!ledgerId) {
      const { data: created, error: createError } = await admin.from("patient_notification_deliveries")
        .insert({ appointment_id: appointment.id, user_id: appointment.user_id, reminder_type: "24_hour", status: "pending" })
        .select("id").single();
      if (createError || !created) { skipped++; continue; }
      ledgerId = created.id;
    } else {
      await admin.from("patient_notification_deliveries").update({ status: "pending", error_code: null }).eq("id", ledgerId);
    }
    const { data: authData, error: authError } = await admin.auth.admin.getUserById(appointment.user_id);
    if (authError || !authData.user?.email) {
      await admin.from("patient_notification_deliveries").update({ status: "failed", error_code: "recipient_unavailable" }).eq("id", ledgerId);
      failed++; continue;
    }
    const when = new Date(appointment.scheduled_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [authData.user.email],
        subject: "A reminder about your upcoming appointment",
        text: `This is a reminder that you have an appointment scheduled for ${when}. Sign in to Preggy Mom Aid to view your appointment details. If you did not create this appointment, you can manage it in your account.`,
      }),
    });
    if (!response.ok) {
      await admin.from("patient_notification_deliveries").update({ status: "failed", error_code: `provider_${response.status}` }).eq("id", ledgerId);
      failed++; continue;
    }
    const payload = await response.json().catch(() => ({}));
    await admin.from("patient_notification_deliveries").update({ status: "sent", sent_at: new Date().toISOString(), provider_message_id: payload.id ?? null, error_code: null }).eq("id", ledgerId);
    sent++;
  }
  return json({ processed: appointments?.length ?? 0, sent, skipped, failed });
});
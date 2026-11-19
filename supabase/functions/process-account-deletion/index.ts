import { createClient } from "npm:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: cors }); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Sign in to continue" }, 401);
  const url = Deno.env.get("SUPABASE_URL");
  const secretMap = Deno.env.get("SUPABASE_SECRET_KEYS");
  const adminKey = secretMap ? JSON.parse(secretMap).default : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const publishableMap = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  const anonKey = publishableMap ? JSON.parse(publishableMap).default : Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !adminKey || !anonKey) return json({ error: "Account deletion service is not configured" }, 503);

  const token = authHeader.slice(7);
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } }, auth: { autoRefreshToken: false, persistSession: false } });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "Your session is invalid or expired" }, 401);
  const user = userData.user;
  const body = await req.json().catch(() => ({}));
  if (body.confirmation !== "DELETE") return json({ error: "Type DELETE to confirm permanent account removal" }, 400);

  const admin = createClient(url, adminKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: profile } = await admin.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (profile?.account_type !== "patient") return json({ error: "This self-service workflow is only available for patient accounts" }, 403);
  const { data: requestRow } = await admin.from("account_deletion_requests").select("id,status")
    .eq("user_id", user.id).in("status", ["requested", "processing"]).order("requested_at", { ascending: false }).limit(1).maybeSingle();
  if (!requestRow) return json({ error: "Submit an account deletion request in Privacy and account settings first" }, 409);

  await admin.from("account_deletion_requests").update({ status: "processing" }).eq("id", requestRow.id);
  const paths: string[] = [];
  for (let offset = 0; offset < 10000; offset += 100) {
    const { data: objects, error } = await admin.storage.from("patient-health-records").list(user.id, { limit: 100, offset });
    if (error) return json({ error: "Could not safely enumerate private files; account deletion has been paused" }, 500);
    for (const object of objects ?? []) if (object.name && object.id) paths.push(`${user.id}/${object.name}`);
    if (!objects || objects.length < 100) break;
  }
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await admin.storage.from("patient-health-records").remove(paths.slice(i, i + 100));
    if (error) return json({ error: "Could not remove all private files; account deletion has been paused" }, 500);
  }
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    await admin.from("account_deletion_requests").update({ status: "requested" }).eq("id", requestRow.id);
    return json({ error: "Account removal failed. Your request remains open for support review." }, 500);
  }
  return json({ deleted: true });
});
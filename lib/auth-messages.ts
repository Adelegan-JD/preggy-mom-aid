export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

/** Only allow same-site relative paths, so a crafted link cannot redirect users off-site. */
export function safeNextPath(value: string | null | undefined, fallback = "/my-care") {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : fallback;
}

export const UNAVAILABLE_MESSAGE =
  "Account services are temporarily unavailable. Please try again later. If you need urgent help, contact a healthcare professional or call 112.";

type MaybeAuthError = { message?: string; code?: string; status?: number; name?: string };

/** Turns raw Supabase/network errors into plain, actionable messages for patients. */
export function friendlyAuthError(cause: unknown, fallback: string): { message: string; kind?: "unconfirmed" | "exists" } {
  const error = (cause ?? {}) as MaybeAuthError;
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return { message: "The email address or password is not correct. Check them and try again, or reset your password." };
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return { kind: "unconfirmed", message: "Please confirm your email address before signing in. Check your inbox and spam folder for the confirmation link, or send a new one below." };
  }
  if (code === "user_already_exists" || message.includes("already registered")) {
    return { kind: "exists", message: "An account already exists for this email address. Sign in instead, or reset your password if you have forgotten it." };
  }
  if (code === "weak_password" || message.includes("password should")) {
    return { message: "Please choose a stronger password: at least 10 characters, ideally mixing words, numbers and symbols." };
  }
  if (code.includes("rate_limit") || message.includes("rate limit") || message.includes("for security purposes") || error.status === 429) {
    return { message: "Too many attempts in a short time. Please wait a minute, then try again." };
  }
  if (message.includes("failed to fetch") || message.includes("network") || message.includes("load failed")) {
    return { message: "We could not reach the account service. Check your internet connection and try again." };
  }
  if (message.includes("supabase is not configured")) return { message: UNAVAILABLE_MESSAGE };
  return { message: error.message || fallback };
}

/** Messages for the `?error=` codes set by /auth/callback. */
export function callbackErrorMessage(code: string | undefined) {
  switch (code) {
    case "confirmation_failed":
      return "This confirmation or reset link is invalid, has expired, or has already been used. Try signing in, or request a new link.";
    case "missing_confirmation_code":
      return "That link is incomplete. Open the most recent email from Preggy Mom Aid and use the full link, or request a new one.";
    case "callback_unavailable":
      return "We could not complete sign-in just now. Please try again in a few minutes.";
    default:
      return "";
  }
}

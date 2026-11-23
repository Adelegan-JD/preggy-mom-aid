import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";
import { callbackErrorMessage, safeNextPath } from "@/lib/auth-messages";

export const metadata: Metadata = { title: "Sign in | Preggy Mom Aid" };

type SearchParams = Promise<{ next?: string; error?: string; password_updated?: string; signed_out?: string; confirmed?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const notice = params.password_updated
    ? "Your password has been updated. Sign in with your new password."
    : params.signed_out
      ? "You have signed out. Your information stays private to your account."
      : "";
  return <LoginForm next={safeNextPath(params.next)} initialError={callbackErrorMessage(params.error)} notice={notice} />;
}

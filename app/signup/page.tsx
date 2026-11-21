import type { Metadata } from "next";
import SignUpForm from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create your account | Preggy Mom Aid" };

type SearchParams = Promise<{ type?: string }>;

export default async function SignUpPage({ searchParams }: { searchParams: SearchParams }) {
  const { type } = await searchParams;
  return <SignUpForm initialAccountType={type === "professional" ? "professional" : "patient"} />;
}

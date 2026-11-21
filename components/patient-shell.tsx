import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Activity, BookOpen, CalendarHeart, ClipboardList, FileHeart, HeartPulse, Home, Hospital,
  MessageSquareText, PhoneCall, Settings, UserRound
} from "lucide-react";
import LanguageSwitcher from "@/components/language-switcher";
import Brand from "@/components/brand";
import SignOutButton from "@/components/sign-out-button";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { normalizeLanguage, translate, TranslationKey } from "@/lib/i18n/translations";
import { healthServicesText as hs } from "@/lib/i18n/health-services";

export type PatientShellPage =
  | "overview" | "blood-pressure" | "symptoms" | "appointments" | "postpartum" | "records"
  | "profile" | "settings" | "hospitals" | "emergency";

type PatientShellProps = {
  active: PatientShellPage;
  children: React.ReactNode;
  /** Extra classes for the page (e.g. "postpartum-page", "health-services-page"). */
  className?: string;
  /**
   * Public routes (hospital directory, emergency information) are open to everyone.
   * Signed-out visitors get a simple public header instead of the private workspace.
   */
  publicFallback?: boolean;
};

async function hasSignedInUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}

async function signOut() {
  "use server";
  try {
    const client = await createClient();
    await client.auth.signOut();
  } finally {
    redirect("/login?signed_out=1");
  }
}

export default async function PatientShell({ active, children, className = "", publicFallback = false }: PatientShellProps) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  const t = (key: TranslationKey) => translate(language, key);
  const current = (key: PatientShellPage) => (active === key ? "page" as const : undefined);

  if (publicFallback && !(await hasSignedInUser())) {
    return <div className={`ds-site ${className}`}>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="ds-app-content">{children}</main>
      <SiteFooter />
    </div>;
  }

  const health = [
    { key: "overview", href: "/my-care", label: t("overview"), icon: Home },
    { key: "blood-pressure", href: "/my-care/blood-pressure", label: t("bloodPressure"), icon: Activity },
    { key: "symptoms", href: "/my-care/symptoms", label: t("symptoms"), icon: ClipboardList },
    { key: "appointments", href: "/my-care/appointments", label: t("appointments"), icon: CalendarHeart },
    { key: "postpartum", href: "/my-care/postpartum", label: t("postpartumJourney"), icon: HeartPulse },
    { key: "records", href: "/my-care/records", label: t("healthRecords"), icon: FileHeart },
  ] as const;
  const support = [
    { key: "learn", href: "/learn", label: t("learningCentre"), icon: BookOpen },
    { key: "hospitals", href: "/hospitals", label: hs(language, "directory"), icon: Hospital },
    { key: "emergency", href: "/emergency", label: hs(language, "emergencyPage"), icon: PhoneCall },
  ] as const;
  const account = [
    { key: "profile", href: "/my-care/profile", label: t("profile"), icon: UserRound },
    { key: "settings", href: "/my-care/settings", label: t("privacySettings"), icon: Settings },
  ] as const;
  const navLink = (item: { key: string; href: string; label: string; icon: typeof Home }) =>
    <Link key={item.key} href={item.href} aria-current={current(item.key as PatientShellPage)}><item.icon size={18} aria-hidden="true"/><span>{item.label}</span></Link>;

  return <div className={`ds-app ${className}`}>
    <aside className="ds-app-sidebar" aria-label={t("workspace")}>
      <Brand href="/my-care" />
      <nav className="ds-nav" aria-label={t("workspace")}>
        <p className="ds-nav-label">{t("yourHealth")}</p>
        {health.map(navLink)}
        <p className="ds-nav-label">{t("findSupport")}</p>
        {support.map(navLink)}
        <p className="ds-nav-label">{t("yourAccount")}</p>
        {account.map(navLink)}
      </nav>
      <div className="ds-app-sidebar-foot">
        <LanguageSwitcher />
        <SignOutButton action={signOut} label={t("signOut")} />
      </div>
    </aside>

    <div className="ds-app-main">
      <header className="ds-topbar">
        <Brand href="/my-care" hideSubtitle />
        <Link href="/feedback" className="ds-btn ds-btn-ghost ds-desktop-only"><MessageSquareText size={16} aria-hidden="true"/> {t("feedback")}</Link>
        <Link href="/emergency" className="ds-btn ds-btn-urgent" aria-label={hs(language, "emergencyPage")}><PhoneCall size={16} aria-hidden="true"/><span>{hs(language, "emergencyPage")}</span></Link>
        <Link href="/my-care/settings" className="ds-icon-btn ds-mobile-only" aria-label={t("privacySettings")}><Settings size={18} aria-hidden="true"/></Link>
        <SignOutButton action={signOut} label={t("signOut")} iconOnly className="ds-icon-btn" formClassName="ds-mobile-only" />
      </header>
      <main id="main-content" tabIndex={-1} className="ds-app-content">{children}</main>
    </div>

    <nav className="ds-bottomnav" aria-label={t("workspace")}>
      <Link href="/my-care" aria-current={current("overview")}><Home size={20} aria-hidden="true"/><span>{t("home")}</span></Link>
      <Link href="/my-care/blood-pressure" aria-current={current("blood-pressure")}><Activity size={20} aria-hidden="true"/><span>{t("bpLog")}</span></Link>
      <Link href="/my-care/appointments" aria-current={current("appointments")}><CalendarHeart size={20} aria-hidden="true"/><span>{t("visits")}</span></Link>
      <Link href="/my-care/records" aria-current={current("records")}><FileHeart size={20} aria-hidden="true"/><span>{t("records")}</span></Link>
      <Link href="/my-care/profile" aria-current={current("profile")}><UserRound size={20} aria-hidden="true"/><span>{t("profile")}</span></Link>
    </nav>
  </div>;
}

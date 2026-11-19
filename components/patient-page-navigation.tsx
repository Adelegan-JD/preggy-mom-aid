import Link from "next/link";
import { cookies } from "next/headers";
import { Activity, BookOpen, CalendarHeart, ClipboardList, FileHeart, HeartPulse, Home, UserRound } from "lucide-react";
import LanguageSwitcher from "@/components/language-switcher";
import SocialLinks from "@/components/social-links";
import { normalizeLanguage, translate, TranslationKey } from "@/lib/i18n/translations";
import { healthServicesText as hs } from "@/lib/i18n/health-services";

type PatientPageNavigationProps = {
  active: "blood-pressure" | "symptoms" | "appointments" | "records" | "profile" | "settings" | "hospitals" | "emergency";
};

export default async function PatientPageNavigation({ active }: PatientPageNavigationProps) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  const t = (key: TranslationKey) => translate(language, key);
  const links = [
    { href: "/my-care", label: t("overview"), icon: Home, key: "overview" },
    { href: "/my-care/blood-pressure", label: t("bloodPressure"), icon: Activity, key: "blood-pressure" },
    { href: "/my-care/symptoms", label: t("symptoms"), icon: ClipboardList, key: "symptoms" },
    { href: "/my-care/appointments", label: t("appointments"), icon: CalendarHeart, key: "appointments" },
    { href: "/my-care/records", label: t("healthRecords"), icon: FileHeart, key: "records" },
    { href: "/learn", label: t("learningCentre"), icon: BookOpen, key: "learn" },
    { href: "/hospitals", label: hs(language, "directory"), icon: BookOpen, key: "hospitals" },
    { href: "/emergency", label: hs(language, "emergencyPage"), icon: HeartPulse, key: "emergency" },
  ] as const;
  return <>
    <header className="patient-dashboard-header patient-subpage-header">
      <Link href="/my-care" className="account-brand">
        <span className="account-brand-mark"><HeartPulse size={20}/></span>
        <span><b>Preggy Mom Aid</b><small>{t("personalSpace")}</small></span>
      </Link>
      <nav aria-label={t("workspace")}>
        {links.map(item => <Link key={item.key} href={item.href} aria-current={active === item.key ? "page" : undefined}><item.icon size={15}/>{item.label}</Link>)}
        <Link href="/my-care/settings" aria-current={active === "settings" ? "page" : undefined}>{t("privacySettings")}</Link>
        <LanguageSwitcher />
      </nav>
      <div className="patient-nav-social"><SocialLinks compact /></div>
    </header>
    <div className="patient-mobile-language"><LanguageSwitcher /></div>
    <nav className="patient-mobile-nav patient-subpage-mobile-nav" aria-label={t("chooseLanguage")}>
      <Link href="/my-care"><Home size={18}/><span>{t("home")}</span></Link>
      <Link href="/my-care/blood-pressure" aria-current={active === "blood-pressure" ? "page" : undefined}><Activity size={18}/><span>{t("bpLog")}</span></Link>
      <Link href="/my-care/appointments" aria-current={active === "appointments" ? "page" : undefined}><CalendarHeart size={18}/><span>{t("visits")}</span></Link>
      <Link href="/my-care/records" aria-current={active === "records" ? "page" : undefined}><FileHeart size={18}/><span>{t("records")}</span></Link>
      <Link href="/my-care/profile" aria-current={active === "profile" ? "page" : undefined}><UserRound size={18}/><span>{t("profile")}</span></Link>
    </nav>
  </>;
}

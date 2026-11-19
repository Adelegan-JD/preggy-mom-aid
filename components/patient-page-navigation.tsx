import Link from "next/link";
import { Activity, BookOpen, CalendarHeart, ClipboardList, FileHeart, HeartPulse, Home, UserRound } from "lucide-react";

type PatientPageNavigationProps = {
  active: "blood-pressure" | "symptoms" | "appointments" | "records" | "profile" | "settings";
};

const links = [
  { href: "/my-care", label: "Overview", icon: Home, key: "overview" },
  { href: "/my-care/blood-pressure", label: "Blood pressure", icon: Activity, key: "blood-pressure" },
  { href: "/my-care/symptoms", label: "Symptoms", icon: ClipboardList, key: "symptoms" },
  { href: "/my-care/appointments", label: "Appointments", icon: CalendarHeart, key: "appointments" },
  { href: "/my-care/records", label: "Health records", icon: FileHeart, key: "records" },
  { href: "/learn", label: "Learning centre", icon: BookOpen, key: "learn" },
] as const;

export default function PatientPageNavigation({ active }: PatientPageNavigationProps) {
  return <>
    <header className="patient-dashboard-header patient-subpage-header">
      <Link href="/my-care" className="account-brand">
        <span className="account-brand-mark"><HeartPulse size={20}/></span>
        <span><b>Preggy Mom Aid</b><small>MY HEALTH SPACE</small></span>
      </Link>
      <nav aria-label="Patient workspace navigation">
        {links.map(item => <Link key={item.key} href={item.href} aria-current={active === item.key ? "page" : undefined}><item.icon size={15}/>{item.label}</Link>)}
        <Link href="/my-care/settings" aria-current={active === "settings" ? "page" : undefined}>Privacy &amp; settings</Link>
      </nav>
    </header>
    <nav className="patient-mobile-nav patient-subpage-mobile-nav" aria-label="Quick navigation">
      <Link href="/my-care"><Home size={18}/><span>Home</span></Link>
      <Link href="/my-care/blood-pressure" aria-current={active === "blood-pressure" ? "page" : undefined}><Activity size={18}/><span>BP log</span></Link>
      <Link href="/my-care/appointments" aria-current={active === "appointments" ? "page" : undefined}><CalendarHeart size={18}/><span>Visits</span></Link>
      <Link href="/my-care/records" aria-current={active === "records" ? "page" : undefined}><FileHeart size={18}/><span>Records</span></Link>
      <Link href="/my-care/profile" aria-current={active === "profile" ? "page" : undefined}><UserRound size={18}/><span>Profile</span></Link>
    </nav>
  </>;
}

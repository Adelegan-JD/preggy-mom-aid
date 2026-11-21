import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import PatientShell from "@/components/patient-shell";
import { normalizeLanguage } from "@/lib/i18n/translations";
import { postpartumCopy } from "@/lib/i18n/postpartum";
import { ArrowRight, Baby, BookOpen, CalendarHeart, ChevronDown, ChevronRight, ClipboardList, ExternalLink, FileHeart, MessageCircleHeart } from "lucide-react";
import { Callout, PageHeader, UnavailablePage } from "@/components/ds";

export const dynamic = "force-dynamic";
export const metadata = { title: "Postpartum support | Preggy Mom Aid" };

const copy = postpartumCopy;

export default async function PostpartumSupportPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  const t = copy[language] ?? copy.en;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <PatientShell active="postpartum"><UnavailablePage title={t.title} message={t.intro} /></PatientShell>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care/postpartum");
  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type === "professional") redirect("/professional");
  const { data: profile } = await supabase.from("patient_profiles").select("birth_date,pregnancy_status").eq("user_id", user.id).maybeSingle();
  const birthDate = profile?.birth_date ? new Date(`${profile.birth_date}T12:00:00`) : null;
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const days = birthDate ? Math.max(0, Math.floor((today.getTime() - birthDate.getTime()) / 86400000)) : null;
  const tools = [
    { href: "/my-care/appointments", label: t.appointments, icon: CalendarHeart },
    { href: "/my-care/symptoms", label: t.symptoms, icon: ClipboardList },
    { href: "/my-care/records", label: t.records, icon: FileHeart },
    { href: "/learn", label: t.learning, icon: BookOpen },
  ];
  return <PatientShell active="postpartum">
    <div className="ds-page">
      <PageHeader title={t.title} lede={t.intro} />

      <div className="ds-grid-2">
        <section className="ds-panel ds-summary" aria-labelledby="pp-days">
          <h2 id="pp-days"><Baby size={17} aria-hidden="true"/> {t.kicker.charAt(0) + t.kicker.slice(1).toLowerCase()}</h2>
          {days !== null
            ? <><p className="ds-summary-value ds-tabular">{days} <small>{t.days}</small></p><Link className="ds-link ds-link-quiet" href="/my-care/profile">{t.update} <ArrowRight size={15} aria-hidden="true"/></Link></>
            : <><p className="ds-muted">{t.noDate}</p><Link className="ds-link ds-link-quiet" href="/my-care/profile">{t.update} <ArrowRight size={15} aria-hidden="true"/></Link></>}
        </section>
        <section className="ds-panel" aria-labelledby="pp-tools">
          <h2 className="ds-h3" id="pp-tools" style={{ marginBottom: "var(--ds-2)" }}>{t.organise}</h2>
          <p className="ds-muted ds-small" style={{ marginBottom: "var(--ds-4)" }}>{t.organiseText}</p>
          <div className="ds-linklist">{tools.map(tool => <Link key={tool.href} href={tool.href}><tool.icon size={18} aria-hidden="true"/><span><b>{tool.label}</b></span><ChevronRight size={16} aria-hidden="true"/></Link>)}</div>
        </section>
      </div>

      <section className="ds-section" aria-labelledby="pp-questions">
        <h2 className="ds-h2" id="pp-questions">{t.conversation}</h2>
        <div className="ds-panel" style={{ marginTop: "var(--ds-4)" }}><ul className="ds-list ds-question-list">{t.questions.map(question => <li key={question}><span className="ds-icon-tile" aria-hidden="true"><MessageCircleHeart size={18}/></span><span>{question}</span></li>)}</ul></div>
      </section>

      <section className="ds-section" aria-labelledby="pp-topics">
        <h2 className="ds-h2" id="pp-topics">{t.kicker.charAt(0) + t.kicker.slice(1).toLowerCase()}</h2>
        <div style={{ marginTop: "var(--ds-4)" }}>{t.topics.map((topic, index) => <details key={topic} className="ds-disclosure"><summary>{topic}<ChevronDown size={18} aria-hidden="true"/></summary><div><p>{t.descriptions[index]}</p></div></details>)}</div>
      </section>

      <Callout tone="danger" title={t.safety} className="ds-section">{t.safetyText}</Callout>

      <section className="ds-section" aria-labelledby="pp-sources">
        <h2 className="ds-h3" id="pp-sources">{t.sources}</h2>
        <div style={{ marginTop: "var(--ds-3)" }}>
          <a className="ds-source" href="https://www.who.int/publications/i/item/9789240045989" target="_blank" rel="noreferrer"><span><b>{t.sourceText}</b><small>World Health Organization</small></span><ExternalLink size={16} aria-hidden="true"/></a>
          <a className="ds-source" href="https://www.nhs.uk/pregnancy/labour-and-birth/your-body/" target="_blank" rel="noreferrer"><span><b>{t.source2}</b><small>NHS</small></span><ExternalLink size={16} aria-hidden="true"/></a>
        </div>
      </section>
    </div>
  </PatientShell>;
}

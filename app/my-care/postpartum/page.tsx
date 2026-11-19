import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import PatientPageNavigation from "@/components/patient-page-navigation";
import { normalizeLanguage } from "@/lib/i18n/translations";
import { ArrowRight, Baby, BookOpen, CalendarHeart, ClipboardList, FileHeart, HeartHandshake, HeartPulse, MessageCircleHeart, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Postpartum support | Preggy Mom Aid" };

const copy = {
  en: {
    kicker: "CARE AFTER BIRTH", title: "You matter, too.", intro: "Your wellbeing deserves attention after your baby arrives. Use this space to organise your questions, appointments and personal health notes.",
    days: "days since the birth date you entered", noDate: "Add your birth date to your profile to see a simple calendar count here.", update: "Update my profile",
    topics: ["Physical recovery", "Emotional wellbeing", "Feeding and practical support", "Postnatal follow-up"],
    descriptions: ["Note changes or questions about your recovery that you want to discuss with your maternity team.", "Make space to talk about how you are feeling. You deserve support, and asking for it is okay.", "Write down the kind of feeding or day-to-day help you would like to discuss with a qualified professional.", "Keep the appointments you arrange with your care team and note any questions before you go."],
    organise: "Keep your care organised", organiseText: "These tools use only information you choose to enter. Nothing here is monitored in real time.",
    appointments: "Postnatal appointments", symptoms: "Personal health notes", records: "Health records", learning: "Learning centre",
    conversation: "Questions for your care team", questions: ["What changes should I expect during my recovery?", "Who should I contact if I feel worried or unwell?", "What follow-up appointments should I arrange?", "Where can I find emotional or practical support?"],
    safety: "Important", safetyText: "This page is an organiser, not a medical assessment or emergency service. Its content is introductory and awaiting review by qualified Nigerian maternal-health clinicians. If you feel seriously unwell or have urgent concerns, contact your maternity team or seek urgent medical care now. Do not wait for an app response.",
    sources: "Read trusted postnatal information", sourceText: "WHO postnatal care recommendations", source2: "NHS: Your body after the birth",
    back: "Back to my dashboard"
  },
  yo: {
    kicker: "ÌTỌ́JÚ LẸ́YÌN ÌBÍMỌ", title: "Ìlera rẹ náà ṣe pàtàkì.", intro: "Ìlera rẹ yẹ kí a máa tọ́jú lẹ́yìn tí ọmọ bá dé. Lo ibi yìí láti ṣètò àwọn ìbéèrè, ìpàdé àti àkọsílẹ̀ ìlera rẹ.",
    days: "ọjọ́ láti ọjọ́ ìbí tí o tẹ̀ sílẹ̀", noDate: "Fi ọjọ́ ìbí kún profaili rẹ láti rí ìṣírò ọjọ́ kalẹ́ńdà.", update: "Ṣe àtúnṣe profaili mi",
    topics: ["Ìmúbọ̀sípò ara", "Ìlera ọkàn", "Ìfún ọmọ ní oúnjẹ àti ìrànlọ́wọ́", "Ìtọ́jú lẹ́yìn ìbímọ"],
    descriptions: ["Kọ àwọn ìyípadà tàbí ìbéèrè nípa ìmúbọ̀sípò rẹ tí o fẹ́ bá ẹgbẹ́ ìtọ́jú rẹ sọ̀rọ̀.", "Ya ààyè sílẹ̀ láti sọ bí ara rẹ ṣe rí. O yẹ fún ìrànlọ́wọ́.", "Kọ irú ìrànlọ́wọ́ oúnjẹ ọmọ tàbí ojoojúmọ́ tí o fẹ́ bá amòye sọ̀rọ̀ nípa rẹ.", "Pa àwọn ìpàdé tí o ṣètò mọ́, kí o sì kọ àwọn ìbéèrè rẹ sílẹ̀ ṣáájú wọn."],
    organise: "Ṣètò ìtọ́jú rẹ", organiseText: "Àwọn irinṣẹ́ wọ̀nyí lo ìwífún tí o bá yàn láti tẹ̀ sílẹ̀. Kò sí ẹni tó ń ṣe àkíyèsí wọn ní àkókò gidi.",
    appointments: "Ìpàdé lẹ́yìn ìbímọ", symptoms: "Àkọsílẹ̀ ìlera ara ẹni", records: "Àkọsílẹ̀ ìlera", learning: "Ibi ẹ̀kọ́",
    conversation: "Àwọn ìbéèrè fún ẹgbẹ́ ìtọ́jú rẹ", questions: ["Àwọn ìyípadà wo ni mo lè retí nígbà ìmúbọ̀sípò?", "Ta ni mo lè kàn sí bí ara mi kò bá yá?", "Àwọn ìpàdé ìtọ́jú wo ni mo yẹ kí n ṣètò?", "Níbo ni mo ti lè rí ìrànlọ́wọ́ ọkàn tàbí ti ara?"],
    safety: "Àkíyèsí pàtàkì", safetyText: "Ojú-ewé yìí jẹ́ ohun èlò ìṣètò, kì í ṣe àyẹ̀wò ìṣègùn tàbí iṣẹ́ pajawiri. Àwọn àlàyé rẹ ń dúró de àyẹ̀wò àwọn onímọ̀ ìlera ìyá ní Nàìjíríà. Bí ara rẹ kò bá yá gan-an tàbí o bá ní àníyàn pajawiri, kàn sí ẹgbẹ́ ìtọ́jú rẹ tàbí wá ìtọ́jú pajawiri. Má ṣe dúró de ìdáhùn app.",
    sources: "Ka ìwífún ìtọ́jú lẹ́yìn ìbímọ", sourceText: "Àwọn ìmọ̀ràn WHO nípa ìtọ́jú lẹ́yìn ìbímọ", source2: "NHS: Ara rẹ lẹ́yìn ìbímọ",
    back: "Padà sí dashboard mi"
  },
  ha: {
    kicker: "KULA BAYAN HAIHUWA", title: "Lafiyarki ma tana da muhimmanci.", intro: "Lafiyarki tana bukatar kulawa bayan haihuwa. Yi amfani da wannan wuri wajen tsara tambayoyi, alƙawura da bayanan lafiyarki.",
    days: "kwanaki tun ranar haihuwar da kika shigar", noDate: "Ƙara ranar haihuwa a bayanan ki domin ganin ƙididdigar kwanaki.", update: "Sabunta bayanan kaina",
    topics: ["Murmurewar jiki", "Lafiyar zuciya da tunani", "Shayarwa da taimakon yau da kullum", "Binciken lafiya bayan haihuwa"],
    descriptions: ["Rubuta canje-canje ko tambayoyi game da murmurewarki da kike son tattaunawa da ma'aikatan lafiyarki.", "Ki ba kanki damar magana game da yadda kike ji. Kin cancanci tallafi.", "Rubuta irin taimakon shayarwa ko na yau da kullum da kike son tattaunawa da ƙwararre.", "Ki tsara alƙawuran da kika yi da ma'aikatan lafiyarki, tare da tambayoyi."],
    organise: "Tsara kulawarki", organiseText: "Waɗannan kayan aiki suna amfani da bayanan da kika zaɓa ki shigar. Ba a sa ido a kansu kai tsaye.",
    appointments: "Alƙawuran bayan haihuwa", symptoms: "Bayanan lafiyata", records: "Takardun lafiya", learning: "Cibiyar koyo",
    conversation: "Tambayoyi ga ma'aikatan lafiyarki", questions: ["Waɗanne canje-canje zan iya tsammani yayin murmurewa?", "Wa zan kira idan ban ji daɗi ba?", "Waɗanne alƙawuran duba lafiya zan tsara?", "A ina zan sami tallafin tunani ko na yau da kullum?"],
    safety: "Muhimmin bayani", safetyText: "Wannan shafi na tsara bayanai ne, ba gwajin likita ko sabis na gaggawa ba. Bayanin yana jiran bitar ƙwararrun lafiyar uwa a Najeriya. Idan kina jin rashin lafiya sosai ko kina da damuwa ta gaggawa, tuntubi ma'aikatan lafiyarki ko nemi kulawar gaggawa yanzu. Kada ki jira amsar manhaja.",
    sources: "Karanta ingantaccen bayani bayan haihuwa", sourceText: "Shawarwarin WHO kan kula bayan haihuwa", source2: "NHS: Jikinki bayan haihuwa",
    back: "Komawa shafin lafiyata"
  },
  ig: {
    kicker: "NLEKỌTA MGBA AMỤCHARA", title: "Ahụike gị dịkwa mkpa.", intro: "Ahụike gị kwesịrị nlekọta mgbe nwa gị bịarutere. Jiri ebe a hazie ajụjụ, oge nleta na ihe ndekọ ahụike gị.",
    days: "ụbọchị kemgbe ụbọchị ọmụmụ ị tinyere", noDate: "Tinye ụbọchị ọmụmụ na profaịlụ gị ka ịhụ ngụkọta ụbọchị.", update: "Melite profaịlụ m",
    topics: ["Mgbake ahụ", "Ahụike mmetụta uche", "Inye nwa nri na enyemaka", "Nleta nlekọta mgbe ọmụmụ gasịrị"],
    descriptions: ["Dee mgbanwe ma ọ bụ ajụjụ gbasara mgbake gị nke ịchọrọ ịkọrọ ndị otu nlekọta ahụike gị.", "Nye onwe gị ohere ikwu otú obi dị gị. I kwesịrị inweta nkwado.", "Dee ụdị enyemaka inye nwa nri ma ọ bụ nke ụbọchị niile ịchọrọ ịkọrọ ọkachamara.", "Hazie oge nleta gị na ndị na-elekọta gị ma dee ajụjụ tupu oge ahụ."],
    organise: "Hazie nlekọta gị", organiseText: "Ngwaọrụ ndị a na-eji naanị ozi ị họọrọ itinye. Ọ dịghị onye na-enyocha ha ozugbo.",
    appointments: "Oge nleta mgbe ọmụmụ gasịrị", symptoms: "Ihe ndekọ ahụike nke m", records: "Ihe ndekọ ahụike", learning: "Ebe mmụta",
    conversation: "Ajụjụ maka ndị na-elekọta ahụike gị", questions: ["Kedu mgbanwe m kwesịrị ịtụ anya n'oge mgbake?", "Onye ka m ga-akpọ ma ọ bụrụ na ahụ adịghị m mma?", "Kedu oge nleta ahụike m kwesịrị ịhazi?", "Ebee ka m ga-enweta nkwado mmetụta uche ma ọ bụ enyemaka?"],
    safety: "Ozi dị mkpa", safetyText: "Peeji a bụ ngwa nhazi, ọ bụghị nyocha ahụike ma ọ bụ ọrụ mberede. Ozi ya na-eche nyocha ndị ọkachamara ahụike nne na Nigeria. Ọ bụrụ na ahụ adịghị gị nke ukwuu ma ọ bụ nwee nchegbu mberede, kpọtụrụ ndị otu nlekọta gị ma ọ bụ chọọ enyemaka ahụike mberede ugbu a. Echela azịza ngwa.",
    sources: "Gụọ ozi nlekọta mgbe ọmụmụ gasịrị", sourceText: "Ntuziaka WHO maka nlekọta mgbe ọmụmụ gasịrị", source2: "NHS: Ahụ gị mgbe ọmụmụ gasịrị",
    back: "Laghachi na dashboard m"
  },
  pcm: {
    kicker: "CARE AFTER BIRTH", title: "Your own wellbeing matter too.", intro: "Your health still need attention after your baby don come. Use this place to arrange your questions, appointments and personal health notes.",
    days: "days since the birth date wey you enter", noDate: "Add your birth date for your profile make you see simple day count here.", update: "Update my profile",
    topics: ["Body recovery", "How you dey feel", "Baby feeding and practical support", "After-birth check-up"],
    descriptions: ["Write changes or questions about your recovery wey you wan discuss with your maternity team.", "Make space to talk about how you dey feel. You deserve support.", "Write the kind feeding or everyday help wey you wan discuss with trained health worker.", "Keep the appointments wey you arrange with your care team and note your questions before you go."],
    organise: "Arrange your care", organiseText: "These tools use only the information wey you choose to enter. Nobody dey monitor am live.",
    appointments: "After-birth appointments", symptoms: "My health notes", records: "Health records", learning: "Learning centre",
    conversation: "Questions for your care team", questions: ["Which changes I fit expect as my body dey recover?", "Who I go contact if I no dey feel well?", "Which follow-up appointments I suppose arrange?", "Where I fit get emotional or practical support?"],
    safety: "Important", safetyText: "This page na organiser, no be medical assessment or emergency service. The information dey wait for review by qualified Nigerian maternal-health clinicians. If you dey seriously unwell or get urgent concern, contact your maternity team or go for urgent medical care now. No wait for app reply.",
    sources: "Read trusted after-birth information", sourceText: "WHO postnatal care recommendations", source2: "NHS: Your body after the birth",
    back: "Back to my dashboard"
  }
} as const;

export default async function PostpartumSupportPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  const t = copy[language] ?? copy.en;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <main className="patient-dashboard patient-subpage" id="main-content" tabIndex={-1}><PatientPageNavigation active="postpartum"/><section className="patient-dashboard-content"><h1>{t.title}</h1><p>{t.intro}</p></section></main>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-care/postpartum");
  const { data: profile } = await supabase.from("patient_profiles").select("birth_date,pregnancy_status").eq("user_id", user.id).maybeSingle();
  const birthDate = profile?.birth_date ? new Date(`${profile.birth_date}T12:00:00`) : null;
  const today = new Date(); today.setHours(12,0,0,0);
  const days = birthDate ? Math.max(0, Math.floor((today.getTime() - birthDate.getTime()) / 86400000)) : null;
  return <main className="patient-dashboard patient-subpage postpartum-page" id="main-content" tabIndex={-1}>
    <PatientPageNavigation active="postpartum"/>
    <section className="patient-dashboard-content">
      <Link href="/my-care" className="patient-back-link"><ArrowRight size={15}/> {t.back}</Link>
      <div className="postpartum-hero">
        <div className="postpartum-hero-copy"><span className="postpartum-kicker"><HeartHandshake size={15}/> {t.kicker}</span><h1>{t.title}</h1><p>{t.intro}</p>{days !== null ? <div className="postpartum-day-count"><Baby size={20}/><strong>{days}</strong><span>{t.days}</span></div> : <div className="postpartum-date-prompt"><p>{t.noDate}</p><Link href="/my-care/profile">{t.update} <ArrowRight size={14}/></Link></div>}</div>
        <div className="postpartum-hero-art" aria-hidden="true"><div className="postpartum-art-sun"/><div className="postpartum-art-mother"><span/></div><span className="postpartum-art-heart"><HeartPulse size={22}/></span></div>
      </div>
      <div className="postpartum-notice"><ShieldCheck size={20}/><div><b>{t.safety}</b><p>{t.safetyText}</p></div></div>
      <div className="postpartum-section-heading"><span>01</span><div><h2>{t.organise}</h2><p>{t.organiseText}</p></div></div>
      <div className="postpartum-tool-grid">
        <Link href="/my-care/appointments"><CalendarHeart/><b>{t.appointments}</b><span><ArrowRight size={15}/></span></Link>
        <Link href="/my-care/symptoms"><ClipboardList/><b>{t.symptoms}</b><span><ArrowRight size={15}/></span></Link>
        <Link href="/my-care/records"><FileHeart/><b>{t.records}</b><span><ArrowRight size={15}/></span></Link>
        <Link href="/learn"><BookOpen/><b>{t.learning}</b><span><ArrowRight size={15}/></span></Link>
      </div>
      <div className="postpartum-section-heading"><span>02</span><div><h2>{t.conversation}</h2><p>{t.organiseText}</p></div></div>
      <div className="postpartum-question-list">{t.questions.map((question,index)=><div key={question}><span>0{index+1}</span><p>{question}</p><MessageCircleHeart size={17}/></div>)}</div>
      <div className="postpartum-topics"><div className="postpartum-section-heading"><span>03</span><div><h2>{t.kicker}</h2><p>{t.intro}</p></div></div><div className="postpartum-topic-grid">{t.topics.map((topic,index)=><details key={topic}><summary><span>0{index+1}</span>{topic}<ArrowRight size={15}/></summary><p>{t.descriptions[index]}</p></details>)}</div></div>
      <div className="postpartum-source-links"><b>{t.sources}</b><a href="https://www.who.int/publications/i/item/9789240045989" target="_blank" rel="noreferrer">{t.sourceText} <ArrowRight size={14}/></a><a href="https://www.nhs.uk/pregnancy/labour-and-birth/your-body/" target="_blank" rel="noreferrer">{t.source2} <ArrowRight size={14}/></a></div>
    </section>
  </main>;
}

"use client";

import { useState } from "react";
import { ArrowRight, Baby, CalendarDays, Heart, Leaf, Sparkles } from "lucide-react";
import Link from "next/link";

type Props = {
  pregnancyStatus: string | null;
  estimatedWeeks: number | null;
  daysPostpartum: number | null;
  language?: string;
};

const copy: Record<string, {
  title: string; intro: string; week: string; calendar: string; postpartum: string;
  days: string; wellbeing: string; profile: string; stages: string[];
  stageNotes: string[]; selected: string; note: string;
}> = {
  en: {
    title: "Your journey, at your pace", intro: "A calm place to keep track of the details you choose to share.",
    week: "Week", calendar: "of 40 · calendar estimate, not a clinical assessment",
    postpartum: "Your postpartum journey", days: "days since birth",
    wellbeing: "Your wellbeing journey", profile: "Add your journey details",
    stages: ["First chapter", "Middle chapter", "Final chapter"],
    stageNotes: ["A space to note questions, plan appointments and talk through your care with your maternity team.",
      "Keep your appointments and the questions you want to raise with your care team together in one place.",
      "Prepare your birth and post-birth questions with the qualified professionals supporting you."],
    selected: "Journey chapter", note: "These chapters are organisational prompts, not medical milestones or a substitute for antenatal advice."
  },
  yo: {
    title: "Irin-ajo rẹ, ni iyara tirẹ", intro: "Ibi ifọkanbalẹ lati tọju awọn alaye ti o yan lati pin.",
    week: "Ọsẹ", calendar: ninu("ti 40 · iṣiro kalẹnda, kii ṣe ayẹwo iṣoogun"),
    postpartum: "Irin-ajo rẹ lẹ́yìn ìbímọ", days: "ọjọ́ lati ìbí",
    wellbeing: "Irin-ajo ìlera rẹ", profile: "Fi awọn alaye irin-ajo rẹ kun",
    stages: ["Ìbẹ̀rẹ̀", "Àárín", "Ìparí"],
    stageNotes: ["Kọ awọn ibeere rẹ silẹ ki o jiroro itọju pẹlu ẹgbẹ alaboyun rẹ.", "Pa awọn ipinnu lati pade ati awọn ibeere rẹ mọ ni ibi kan.", "Mura awọn ibeere nipa ibimọ ati itọju lẹhin ibimọ pẹlu awọn amoye ilera rẹ."],
    selected: "Abala irin-ajo", note: "Awọn abala wọnyi jẹ iranlọwọ iṣeto nikan, kii ṣe awọn ami iṣoogun."
  },
  ha: {
    title: "Tafiyarku, a hankali", intro: "Wuri mai natsuwa don tsara bayanan da kuka zaɓa ku raba.",
    week: "Mako", calendar: "na 40 · ƙididdigar kalanda ce, ba gwajin likita ba",
    postpartum: "Lokacin murmurewa bayan haihuwa", days: "kwanaki tun haihuwa",
    wellbeing: "Tafiyar lafiyarku", profile: "Ƙara bayanan tafiyarku",
    stages: ["Farko", "Tsakiya", "Ƙarshe"],
    stageNotes: ["Rubuta tambayoyinku kuma ku tattauna kulawa da ma'aikatan lafiyar uwa.", "Ajiye ranakun ziyara da tambayoyinku wuri guda.", "Shirya tambayoyin haihuwa da bayan haihuwa tare da ƙwararrun ma'aikatan lafiya."],
    selected: "Matakin tafiya", note: "Waɗannan matakai na taimakon tsari ne kawai, ba alamomin lafiya ba."
  },
  ig: {
    title: "Njem gị, n'oge nke gị", intro: "Ebe dị jụụ iji hazie nkọwa ị họọrọ ịkekọrịta.",
    week: "Izu", calendar: "n'ime 40 · atụmatụ kalenda, ọ bụghị nyocha ahụike",
    postpartum: "Njem gị mgbe ị mụsịrị nwa", days: "ụbọchị kemgbe ọmụmụ",
    wellbeing: "Njem ahụike gị", profile: "Tinye nkọwa njem gị",
    stages: ["Mmalite", "Etiti", "Ọgwụgwụ"],
    stageNotes: ["Dee ajụjụ gị ma soro ndị na-elekọta ahụike nne kparịta ya.", "Debe oge nleta na ajụjụ gị n'otu ebe.", "Soro ndị ọkachamara ahụike gị kwadebe ajụjụ gbasara ọmụmụ na nlekọta mgbe ọmụmụ gasịrị."],
    selected: "Akụkụ njem", note: "Akụkụ ndị a bụ enyemaka nhazi, ọ bụghị akara ahụike."
  },
  pcm: {
    title: "Your journey, your pace", intro: "One calm place to organise the details you choose to share.",
    week: "Week", calendar: "of 40 · calendar estimate, no be medical assessment",
    postpartum: "Your after-birth journey", days: "days since birth",
    wellbeing: "Your wellbeing journey", profile: "Add your journey details",
    stages: ["Start", "Middle", "Final stage"],
    stageNotes: ["Write down your questions and discuss your care with your maternity team.", "Keep your appointments and questions together in one place.", "Prepare birth and after-birth questions with your qualified care team."],
    selected: "Journey chapter", note: "These chapters help you organise information; they are not medical milestones."
  }
};

function ninu(value: string) { return value; }

export default function PregnancyJourneyVisual({ pregnancyStatus, estimatedWeeks, daysPostpartum, language = "en" }: Props) {
  const t = copy[language] ?? copy.en;
  const isPregnant = pregnancyStatus === "pregnant" && estimatedWeeks !== null;
  const isPostpartum = pregnancyStatus === "postpartum";
  const week = estimatedWeeks ?? 0;
  const currentStage = week < 14 ? 0 : week < 28 ? 1 : 2;
  const [selectedStage, setSelectedStage] = useState(currentStage);
  const progress = Math.max(0, Math.min(100, Math.round((week / 40) * 100)));

  return (
    <section className="pma-journey-visual" aria-labelledby="pma-journey-title">
      <div className="pma-journey-photo">
        <img src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&w=1100&q=85" alt="Expectant mother in a peaceful maternity portrait" loading="lazy" />
        <span className="pma-photo-chip"><Heart size={14} fill="currentColor"/> Care with compassion</span>
        <div className="pma-photo-caption"><span>YOUR STORY MATTERS</span><strong>Every journey deserves care.</strong></div>
      </div>
      <div className="pma-journey-panel">
        <div className="pma-journey-heading">
          <span className="pma-journey-icon"><Sparkles size={17}/></span>
          <div><span className="pma-journey-kicker">PREGGY MOM AID · YOUR SPACE</span><h2 id="pma-journey-title">{isPregnant ? t.title : isPostpartum ? t.postpartum : t.wellbeing}</h2></div>
        </div>
        {isPregnant ? (
          <>
            <div className="pma-week-count"><strong>{t.week} {week}</strong><span>{t.calendar}</span></div>
            <div className="pma-progress-track" role="progressbar" aria-label="Calendar-based pregnancy progress estimate" aria-valuemin={0} aria-valuemax={40} aria-valuenow={week}><span style={{ width: progress + "%" }}/></div>
            <div className="pma-progress-labels"><span>Week 1</span><span>Week 40</span></div>
            <div className="pma-stage-tabs" role="group" aria-label="Explore journey chapters">
              {t.stages.map((stage, index) => <button type="button" key={stage} className={selectedStage === index ? "is-active" : ""} aria-pressed={selectedStage === index} onClick={() => setSelectedStage(index)}><span>0{index + 1}</span>{stage}</button>)}
            </div>
            <div className="pma-stage-detail" aria-live="polite"><span className="pma-stage-detail-icon"><Leaf size={18}/></span><div><b>{t.selected}: {t.stages[selectedStage]}</b><p>{t.stageNotes[selectedStage]}</p></div></div>
            <p className="pma-journey-disclaimer">{t.note}</p>
          </>
        ) : isPostpartum ? (
          <div className="pma-postpartum-count"><Baby size={25}/><strong>{Math.max(0, daysPostpartum ?? 0)} <small>{t.days}</small></strong><p>{t.intro}</p></div>
        ) : (
          <div className="pma-wellbeing-copy"><p>{t.intro}</p><Link href="/my-care/profile">{t.profile} <ArrowRight size={15}/></Link></div>
        )}
        <Link className="pma-journey-link" href="/my-care/profile">Update your journey <ArrowRight size={15}/></Link>
      </div>
    </section>
  );
}

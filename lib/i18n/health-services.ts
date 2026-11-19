import type { AppLanguage } from "@/lib/i18n/translations";

const copy = {
  en: {
    directory: "Hospital & maternity directory", directoryIntro: "Browse facility information by state or city. Only real entries approved for publication appear here.",
    search: "Search", clear: "Clear", city: "City", state: "State", facilityType: "Facility type", allTypes: "All facility types",
    hospital: "Hospital", clinic: "Clinic", maternityCentre: "Maternity centre", medicalCentre: "Medical centre",
    noFacilities: "No facilities are listed yet", noFacilitiesText: "We have not added any facility records yet. We will not fill this directory with invented hospitals or contact details.",
    noMatches: "No facilities match those filters.", directoryNotice: "This directory is informational, not an endorsement. Confirm the address, opening hours, maternity services, emergency capacity and fees directly with the facility before travelling.",
    verified: "Independently verified", unverified: "Not independently verified", underReview: "Verification in progress",
    address: "Address", phone: "Phone", emergencyPhone: "Emergency contact", services: "Maternity services",
    emergencyDepartment: "Emergency department listed", confirmDirectly: "Confirm details directly", publicDirectory: "Public directory",
    emergency: "Emergency support", emergencyTitle: "Need urgent help?", emergencyLead: "If someone may be in immediate danger, call Nigeria's national emergency number now.",
    call112: "Call 112", nationalLine: "Nigeria national emergency services number", askMedical: "Tell the operator you need medical or ambulance assistance.",
    giveLocation: "Give your exact location and a nearby landmark. Follow the operator's instructions.",
    notMonitored: "Preggy Mom Aid is not an emergency service. Messages and health logs are not monitored for emergencies, and this app cannot dispatch an ambulance.",
    doNotWait: "Do not wait for an app response before seeking urgent in-person help.", ifNoConnection: "If the call does not connect, ask someone nearby to help contact local emergency services or the nearest emergency department while you seek in-person help.",
    source: "Source: Nigerian Communications Commission (NCC)", browseDirectory: "Browse the hospital directory", emergencyPage: "Emergency support",
    listingNote: "Call the facility to confirm this information before travelling.", noDirectoryData: "Facility information is not available yet."
  },
  yo: {
    directory: "Àkójọ ilé ìwòsàn àti ìtọ́jú oyún", directoryIntro: "Wo ìsọfúnni àwọn ilé ìlera nípa ìpínlẹ̀ tàbí ìlú. Àwọn àkọsílẹ̀ gidi tí a fọwọ́ sí nìkan ni yóò hàn.",
    search: "Wá", clear: "Pa àṣàyàn rẹ́", city: "Ìlú", state: "Ìpínlẹ̀", facilityType: "Irú ilé ìlera", allTypes: "Gbogbo irú",
    hospital: "Ilé ìwòsàn", clinic: "Kílíníkì", maternityCentre: "Ibi ìtọ́jú aboyún", medicalCentre: "Ibi ìtọ́jú ìlera",
    noFacilities: "Kò sí ilé ìwòsàn tí a ti fi síbí", noFacilitiesText: "A kò tíì fi àkọsílẹ̀ ilé ìlera kankan síbí. A kò ní dá orúkọ tàbí nọ́ńbà ìbánisọ̀rọ̀ ilé ìwòsàn sílẹ̀.",
    noMatches: "Kò sí ilé ìlera tó bá àṣàyàn yìí mu.", directoryNotice: "Àkójọ yìí jẹ́ fún ìsọfúnni, kì í ṣe ìfọwọ́sí. Jọ̀wọ́ jẹ́rìí sí àdírẹ́sì, àkókò iṣẹ́, iṣẹ́ ìtọ́jú oyún, agbára pajawiri àti owó pẹ̀lú ilé ìlera kí o tó lọ.",
    verified: "A ti jẹ́rìí rẹ̀ lọ́tọ̀", unverified: "A kò tíì jẹ́rìí rẹ̀ lọ́tọ̀", underReview: "Ìjẹ́rìí ṣì ń lọ",
    address: "Àdírẹ́sì", phone: "Fóònù", emergencyPhone: "Fóònù pajawiri", services: "Iṣẹ́ ìtọ́jú oyún",
    emergencyDepartment: "A ti tọ́ka sí ẹ̀ka pajawiri", confirmDirectly: "Jẹ́rìí sí i pẹ̀lú ilé ìlera", publicDirectory: "Àkójọ gbogbogbò",
    emergency: "Ìrànlọ́wọ́ pajawiri", emergencyTitle: "Ṣé ẹ nílò ìrànlọ́wọ́ kíákíá?", emergencyLead: "Tí ẹnikẹ́ni bá lè wà nínú ewu lẹ́sẹ̀kẹsẹ̀, pe nọ́ńbà pajawiri orílẹ̀-èdè Nàìjíríà báyìí.",
    call112: "Pe 112", nationalLine: "Nọ́ńbà iṣẹ́ pajawiri orílẹ̀-èdè Nàìjíríà", askMedical: "Sọ fún ẹni tó dáhùn pé ẹ nílò ìrànlọ́wọ́ ìṣègùn tàbí ọkọ̀ aláìsàn.",
    giveLocation: "Sọ ibi tí ẹ wà gan-an àti àmì ibi tó sún mọ́ yín. Tẹ̀lé ìtọ́ni ẹni tó dáhùn.",
    notMonitored: "Preggy Mom Aid kì í ṣe iṣẹ́ pajawiri. A kì í ṣe àbójútó ìfiranṣẹ́ tàbí àkọsílẹ̀ ìlera fún pajawiri, app yìí kò sì lè rán ọkọ̀ aláìsàn.",
    doNotWait: "Ẹ má ṣe dúró de ìdáhùn app kí ẹ tó wá ìtọ́jú pajawiri ní ojúkojú.", ifNoConnection: "Tí ìpè kò bá wọlé, bẹ̀rẹ̀ sí í wá ìrànlọ́wọ́ lọ́wọ́ ẹni tó wà nítòsí láti kàn sí iṣẹ́ pajawiri tàbí ẹ̀ka pajawiri ilé ìwòsàn.",
    source: "Orísun: Nigerian Communications Commission (NCC)", browseDirectory: "Wo àkójọ ilé ìwòsàn", emergencyPage: "Ìrànlọ́wọ́ pajawiri",
    listingNote: "Pe ilé ìlera láti jẹ́rìí sí ìsọfúnni yìí kí ẹ tó lọ.", noDirectoryData: "A kò tíì ní ìsọfúnni ilé ìlera."
  },
  ha: {
    directory: "Jerin asibitoci da wuraren kula da masu juna biyu", directoryIntro: "Duba bayanan wuraren lafiya ta jiha ko birni. Bayanan wuraren da aka amince a wallafa ne kawai za su bayyana.",
    search: "Nema", clear: "Share", city: "Birni", state: "Jiha", facilityType: "Nau'in wurin lafiya", allTypes: "Dukkan nau'o'i",
    hospital: "Asibiti", clinic: "Klinik", maternityCentre: "Cibiyar kula da masu juna biyu", medicalCentre: "Cibiyar lafiya",
    noFacilities: "Ba a saka wani asibiti ba tukuna", noFacilitiesText: "Ba mu saka bayanan wani wurin lafiya ba tukuna. Ba za mu ƙirƙiri sunayen asibitoci ko lambobin waya na ƙarya ba.",
    noMatches: "Babu wurin lafiya da ya dace da waɗannan zaɓuɓɓuka.", directoryNotice: "Wannan jerin bayanai ne kawai, ba amincewa da wurin ba. Tabbatar da adireshi, lokutan aiki, hidimomin haihuwa, ƙarfin gaggawa da kuɗi kai tsaye kafin tafiya.",
    verified: "An tantance da kansa", unverified: "Ba a tantance da kansa ba", underReview: "Ana ci gaba da tantancewa",
    address: "Adireshi", phone: "Waya", emergencyPhone: "Lambar gaggawa", services: "Hidimomin kula da masu juna biyu",
    emergencyDepartment: "An nuna sashen gaggawa", confirmDirectly: "Tabbatar kai tsaye", publicDirectory: "Jerin jama'a",
    emergency: "Taimakon gaggawa", emergencyTitle: "Kuna buƙatar taimako cikin gaggawa?", emergencyLead: "Idan wani na cikin haɗari nan take, kira lambar gaggawa ta ƙasa yanzu.",
    call112: "Kira 112", nationalLine: "Lambar ayyukan gaggawa ta Najeriya", askMedical: "Faɗa wa mai amsa cewa kuna buƙatar taimakon likita ko motar asibiti.",
    giveLocation: "Faɗi ainihin inda kuke da sanannen wurin kusa. Bi umarnin mai amsawa.",
    notMonitored: "Preggy Mom Aid ba sabis ɗin gaggawa ba ne. Ba a sa ido kan saƙonni ko bayanan lafiya don gaggawa, kuma wannan manhaja ba za ta iya aika motar asibiti ba.",
    doNotWait: "Kada ku jira amsar manhaja kafin neman taimakon gaggawa kai tsaye.", ifNoConnection: "Idan kiran bai shiga ba, nemi taimakon wanda ke kusa don tuntuɓar jami'an gaggawa ko sashen gaggawa na asibiti yayin da kuke neman taimako kai tsaye.",
    source: "Madogara: Nigerian Communications Commission (NCC)", browseDirectory: "Duba jerin asibitoci", emergencyPage: "Taimakon gaggawa",
    listingNote: "Kira wurin lafiya don tabbatar da wannan bayani kafin tafiya.", noDirectoryData: "Ba a samu bayanan wuraren lafiya ba tukuna."
  },
  ig: {
    directory: "Ndepụta ụlọ ọgwụ na ebe nlekọta afọ ime", directoryIntro: "Chọọ ozi ebe nlekọta ahụike site na steeti ma ọ bụ obodo. Naanị ezigbo ndekọ akwadoro ka a ga-ebipụta.",
    search: "Chọọ", clear: "Kpochapụ", city: "Obodo", state: "Steeti", facilityType: "Ụdị ebe ahụike", allTypes: "Ụdị niile",
    hospital: "Ụlọ ọgwụ", clinic: "Klinik", maternityCentre: "Ebe nlekọta ndị dị ime", medicalCentre: "Ebe nlekọta ahụike",
    noFacilities: "Enweghị ụlọ ọgwụ edepụtara ugbu a", noFacilitiesText: "Anyị etinyebeghị ndekọ ebe ahụike ọ bụla. Anyị agaghị emepụta aha ụlọ ọgwụ ma ọ bụ nọmba ekwentị ụgha.",
    noMatches: "Enweghị ebe ahụike dabara na nhọrọ ndị a.", directoryNotice: "Ndepụta a bụ maka ozi, ọ bụghị nkwado. Kwenye adreesị, oge ọrụ, ọrụ nlekọta afọ ime, ikike mberede na ụgwọ ozugbo n'ebe ahụ tupu njem.",
    verified: "E nyochara ma kwenye ya", unverified: "A nyochabeghị ya n'onwe ya", underReview: "A ka na-enyocha ya",
    address: "Adreesị", phone: "Ekwentị", emergencyPhone: "Ekwentị mberede", services: "Ọrụ nlekọta afọ ime",
    emergencyDepartment: "Edepụtara ngalaba mberede", confirmDirectly: "Kwenye ozugbo", publicDirectory: "Ndepụta ọha",
    emergency: "Enyemaka mberede", emergencyTitle: "Ị chọrọ enyemaka ozugbo?", emergencyLead: "Ọ bụrụ na mmadụ nọ n'ihe ize ndụ ugbu a, kpọọ nọmba mberede mba ahụ ozugbo.",
    call112: "Kpọọ 112", nationalLine: "Nọmba ọrụ mberede mba Naịjirịa", askMedical: "Gwa onye zara oku na ị chọrọ enyemaka ahụike ma ọ bụ ụgbọ mberede.",
    giveLocation: "Kwuo kpọmkwem ebe ị nọ na akara ama ama dị nso. Soro ntuziaka onye zara oku.",
    notMonitored: "Preggy Mom Aid abụghị ọrụ mberede. A naghị elele ozi ma ọ bụ ndekọ ahụike maka mberede, ngwa a enweghịkwa ike izipu ụgbọ mberede.",
    doNotWait: "Echela azịza ngwa tupu ịchọ enyemaka ozugbo n'ebe ahụ.", ifNoConnection: "Ọ bụrụ na oku ahụ abanyeghị, rịọ onye nọ nso ka o nyere aka kpọtụrụ ndị ọrụ mberede ma ọ bụ ngalaba mberede ụlọ ọgwụ ka ị na-achọ enyemaka ozugbo.",
    source: "Isi mmalite: Nigerian Communications Commission (NCC)", browseDirectory: "Lelee ndepụta ụlọ ọgwụ", emergencyPage: "Enyemaka mberede",
    listingNote: "Kpọọ ebe ahụike ka ị kwenye ozi a tupu njem.", noDirectoryData: "Enweghị ozi ebe ahụike ugbu a."
  },
  pcm: {
    directory: "Hospital and maternity centre directory", directoryIntro: "Check health facility information by state or city. Na only real entries we approve for publishing go show here.",
    search: "Search", clear: "Clear", city: "City", state: "State", facilityType: "Facility type", allTypes: "All types",
    hospital: "Hospital", clinic: "Clinic", maternityCentre: "Maternity centre", medicalCentre: "Medical centre",
    noFacilities: "No hospital don enter this directory yet", noFacilitiesText: "We never add any facility record yet. We no go make up hospital names or phone numbers.",
    noMatches: "No facility match those filters.", directoryNotice: "This directory na information only, e no mean say we endorse any place. Confirm address, opening time, maternity services, emergency capacity and fees directly before you travel.",
    verified: "Independently verified", unverified: "Dem never independently verify am", underReview: "Verification dey ongoing",
    address: "Address", phone: "Phone", emergencyPhone: "Emergency contact", services: "Maternity services",
    emergencyDepartment: "Emergency department listed", confirmDirectly: "Confirm details directly", publicDirectory: "Public directory",
    emergency: "Emergency support", emergencyTitle: "You need urgent help?", emergencyLead: "If person fit dey immediate danger, call Nigeria national emergency number now.",
    call112: "Call 112", nationalLine: "Nigeria national emergency services number", askMedical: "Tell the operator say you need medical or ambulance help.",
    giveLocation: "Tell dem your exact location and one landmark near you. Follow the operator instruction.",
    notMonitored: "Preggy Mom Aid no be emergency service. Nobody dey monitor messages or health logs for emergency, and this app no fit send ambulance.",
    doNotWait: "No wait for app reply before you find urgent help face to face.", ifNoConnection: "If the call no connect, ask person near you to help contact local emergency service or nearest hospital emergency department while you find help.",
    source: "Source: Nigerian Communications Commission (NCC)", browseDirectory: "Browse hospital directory", emergencyPage: "Emergency support",
    listingNote: "Call the facility make dem confirm this information before you travel.", noDirectoryData: "Facility information never dey available yet."
  }
} satisfies Record<AppLanguage, Record<string, string>>;

export type HealthServicesKey = keyof typeof copy.en;
export function healthServicesText(language: AppLanguage, key: HealthServicesKey): string {
  return copy[language][key] ?? copy.en[key];
}

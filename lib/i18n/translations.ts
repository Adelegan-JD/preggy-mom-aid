export const languageOptions = [
  { code: "en", label: "English", nativeLabel: "English", speechCode: "en-NG", yarnCode: "en" },
  { code: "yo", label: "Yoruba", nativeLabel: "Yorùbá", speechCode: "yo-NG", yarnCode: "yo" },
  { code: "ha", label: "Hausa", nativeLabel: "Hausa", speechCode: "ha-NG", yarnCode: "ha" },
  { code: "ig", label: "Igbo", nativeLabel: "Igbo", speechCode: "ig-NG", yarnCode: "ig" },
  { code: "pcm", label: "Nigerian Pidgin", nativeLabel: "Naija Pidgin", speechCode: "pcm-NG", yarnCode: "pcm" },
] as const;

export type AppLanguage = typeof languageOptions[number]["code"];

const en = {
  language: "Language", chooseLanguage: "Choose language", overview: "Overview", bloodPressure: "Blood pressure",
  symptoms: "Symptoms & notes", appointments: "Appointments", healthRecords: "Health records", learningCentre: "Learning centre",
  privacySettings: "Privacy & settings", home: "Home", bpLog: "BP log", visits: "Visits", records: "Records",
  profile: "My profile", personalDetails: "Personal details", signOut: "Sign out", backDashboard: "Back to dashboard",
  personalSpace: "YOUR PERSONAL SPACE", workspace: "WORKSPACE", yourJourney: "YOUR JOURNEY", healthTools: "YOUR HEALTH TOOLS",
  welcome: "Good to see you", dashboardTitle: "Your health dashboard",
  dashboardIntro: "A calm place to keep your pregnancy and postpartum care organised, one step at a time.",
  logBloodPressure: "Log blood pressure", addAppointment: "Add an appointment", privacyMatters: "Your privacy matters",
  privacyText: "Your health space is private. You decide what to record.", privateHealth: "Your health information is private.",
  privateHealthText: "This space stores information you choose to record. It is not continuously monitored and does not replace your maternity team or emergency care.",
  pregnancyJourney: "Your pregnancy journey", postpartumJourney: "Your postpartum journey", healthSpace: "Your health space",
  weeks: "weeks", daysUntilDue: "days until your estimated due date", daysAfterBirth: "days after the birth date you entered",
  calendarEstimate: "This is a calendar estimate based only on the date you entered, not a clinical dating assessment.",
  updateJourney: "Update journey details", bpLogs: "Blood pressure logs", symptomNotes: "Symptom notes", savedReadings: "Your saved readings",
  savedNotes: "Your saved notes", privacyStatus: "Privacy status", protected: "Protected", controlRecords: "You control your records",
  everythingInOnePlace: "Everything in one place", chooseSpace: "Choose a space to view or update your personal health information.",
  privateToYou: "Private to you", personalise: "MAKE THIS SPACE YOURS", completeProfile: "Complete your personal and pregnancy profile",
  profilePrompt: "Add your preferred name, language and pregnancy or postpartum dates to personalise your dashboard.",
  updateProfile: "Update my profile", openBloodPressure: "Open blood pressure log", viewSymptoms: "View symptom notes",
  viewAppointments: "View appointments", viewRecords: "View health records", yourAccount: "Your account",
  back: "Back", returnSignIn: "Return to sign in", unavailable: "This service is temporarily unavailable.",
  settingsTitle: "Privacy and account settings", settingsIntro: "Manage communication choices, account details and requests concerning your personal information.",
  clinicianAccessOff: "Your account and health records are private to you. Clinician access is not enabled.",
  profileTitle: "My profile", profileIntro: "Keep your personal details and pregnancy or postpartum journey information up to date.",
  preferredLanguage: "Preferred language", saveProfile: "Save my profile", saving: "Saving…", saved: "Saved",
  speak: "Listen", stopSpeaking: "Stop listening", speechUnavailable: "Audio playback is not available right now.",
  speechNotConfigured: "Audio is not configured yet. Please try again later.", listenToText: "Listen to this information",
  yourHealth: "Your health", emergencyNotice: "If you feel unwell or have warning symptoms, seek urgent medical assessment. Do not wait for this app to respond.",
} as const;

export type TranslationKey = keyof typeof en;

const yo: Record<keyof typeof en, string> = {
  language:"Èdè",chooseLanguage:"Yan èdè",overview:"Àkótán",bloodPressure:"Ìfúnpá ẹ̀jẹ̀",symptoms:"Àmì àìsàn àti àkọsílẹ̀",appointments:"Àwọn ìpàdé",healthRecords:"Àkọsílẹ̀ ìlera",learningCentre:"Ibi ẹ̀kọ́",
  privacySettings:"Ìpamọ́ àti ètò",home:"Ilé",bpLog:"Àkọsílẹ̀ ìfúnpá",visits:"Ìbẹ̀wò",records:"Àkọsílẹ̀",profile:"Àkọọ́lẹ̀ mi",personalDetails:"Àlàyé ara ẹni",signOut:"Jáde",
  backDashboard:"Padà sí ojú ìṣàkóso",personalSpace:"ÀÀBÒ ARA ẸNI",workspace:"IṢẸ́",yourJourney:"ÌRÌNÀJÒ RẸ",healthTools:"OHUN ÈLÒ ÌLERA",welcome:"Inú wa dùn láti tún rí ọ",dashboardTitle:"Ojú ìṣàkóso ìlera rẹ",
  dashboardIntro:"Ibì kan láti ṣètò ìtọ́jú oyún àti ìlera lẹ́yìn ìbímọ, ní ìgbésẹ̀ kan lẹ́ẹ̀kan.",logBloodPressure:"Kọ ìfúnpá ẹ̀jẹ̀ sílẹ̀",addAppointment:"Fi ìpàdé kún un",privacyMatters:"Ìpamọ́ rẹ ṣe pàtàkì",
  privacyText:"Ààyè ìlera rẹ jẹ́ tìrẹ. Ìwọ ló pinnu ohun tí o fẹ́ kọ sílẹ̀.",privateHealth:"Àlàyé ìlera rẹ jẹ́ àṣírí.",privateHealthText:"Ààyè yìí ń tọ́jú ohun tí o yàn láti kọ sílẹ̀. A kì í ṣe àbójútó rẹ nígbà gbogbo, kò sì rọ́pò ẹgbẹ́ ìtọ́jú oyún rẹ tàbí ìtọ́jú pajawiri.",
  pregnancyJourney:"Ìrìnàjò oyún rẹ",postpartumJourney:"Ìrìnàjò rẹ lẹ́yìn ìbímọ",healthSpace:"Ààyè ìlera rẹ",weeks:"ọ̀sẹ̀",daysUntilDue:"ọjọ́ sí ọjọ́ ìbímọ tí a fojú díwọ̀n",daysAfterBirth:"ọjọ́ lẹ́yìn ọjọ́ ìbímọ tí o tẹ̀ sílẹ̀",
  calendarEstimate:"Èyí jẹ́ ìṣírò ọjọ́ kalẹ́ńdà láti ọjọ́ tí o tẹ̀ sílẹ̀ nìkan; kì í ṣe àyẹ̀wò ọjọ́ oyún láti ọ̀dọ̀ dókítà.",updateJourney:"Ṣàtúnṣe àlàyé ìrìnàjò",bpLogs:"Àwọn àkọsílẹ̀ ìfúnpá ẹ̀jẹ̀",symptomNotes:"Àkọsílẹ̀ àmì àìsàn",
  savedReadings:"Àwọn ìwọ̀n tí o fi pamọ́",savedNotes:"Àwọn àkọsílẹ̀ tí o fi pamọ́",privacyStatus:"Ipò ìpamọ́",protected:"A dáàbò bo",controlRecords:"Ìwọ ló ń ṣàkóso àkọsílẹ̀ rẹ",
  everythingInOnePlace:"Gbogbo rẹ̀ ní ibi kan",chooseSpace:"Yan ibi kan láti wo tàbí ṣe àtúnṣe sí àlàyé ìlera rẹ.",privateToYou:"Tìrẹ nìkan",personalise:"ṢE ÀÀBÒ YÌÍ TÓ FẸ́RẸ́ RẸ",completeProfile:"Parí àlàyé ara ẹni àti oyún rẹ",
  profilePrompt:"Fi orúkọ tí o fẹ́, èdè àti ọjọ́ oyún tàbí ìbímọ kún un láti ṣe àtúnṣe ojú ìṣàkóso rẹ.",updateProfile:"Ṣàtúnṣe àkọọ́lẹ̀ mi",openBloodPressure:"Ṣí àkọsílẹ̀ ìfúnpá ẹ̀jẹ̀",viewSymptoms:"Wo àkọsílẹ̀ àmì àìsàn",
  viewAppointments:"Wo àwọn ìpàdé",viewRecords:"Wo àkọsílẹ̀ ìlera",yourAccount:"Àkọọ́lẹ̀ rẹ",back:"Padà",returnSignIn:"Padà sí ìwọlé",unavailable:"Iṣẹ́ yìí kò sí fún ìgbà díẹ̀.",
  settingsTitle:"Ìpamọ́ àti ètò àkọọ́lẹ̀",settingsIntro:"Ṣàkóso ìbánisọ̀rọ̀, àlàyé àkọọ́lẹ̀ àti àwọn ìbéèrè nípa ìwífún ara ẹni.",clinicianAccessOff:"Àkọọ́lẹ̀ àti àkọsílẹ̀ ìlera rẹ jẹ́ tìrẹ. A kò tíì ṣí ààyè dókítà sílẹ̀.",
  profileTitle:"Àkọọ́lẹ̀ mi",profileIntro:"Jẹ́ kí àlàyé ara ẹni àti ìrìnàjò oyún tàbí lẹ́yìn ìbímọ rẹ wà ní tuntun.",preferredLanguage:"Èdè tí o fẹ́",saveProfile:"Fi àkọọ́lẹ̀ mi pamọ́",saving:"Ó ń pamọ́…",saved:"A ti pamọ́",
  speak:"Gbọ́",stopSpeaking:"Dá gbigbọ́ dúró",speechUnavailable:"Kò ṣeé ṣe láti gbọ́ ohùn báyìí.",speechNotConfigured:"A kò tíì ṣètò ohùn. Jọ̀wọ́ tún gbìyànjú lẹ́yìn náà.",listenToText:"Gbọ́ ìwífún yìí",
  yourHealth:"Ìlera rẹ",emergencyNotice:"Tí ara rẹ kò bá yá tàbí o ní àmì ewu, wá ìtọ́jú ìlera kíákíá. Má ṣe dúró de ìdáhùn láti inú app yìí."
};

const ha: Record<keyof typeof en, string> = {
  language:"Harshe",chooseLanguage:"Zaɓi harshe",overview:"Taƙaitaccen bayani",bloodPressure:"Hawan jini",symptoms:"Alamomi da bayanai",appointments:"Alƙawura",healthRecords:"Bayanan lafiya",learningCentre:"Cibiyar koyo",
  privacySettings:"Sirri da saituna",home:"Gida",bpLog:"Bayanan hawan jini",visits:"Ziyara",records:"Bayanan",profile:"Bayanan martaba",personalDetails:"Bayanan kai",signOut:"Fita",
  backDashboard:"Komawa shafin kula da lafiya",personalSpace:"WURINKI NA KANKI",workspace:"AIKI",yourJourney:"TAFIYARKI",healthTools:"KAYAN LAFIYA",welcome:"Mun yi farin cikin sake ganinki",dashboardTitle:"Shafin kula da lafiyarki",
  dashboardIntro:"Wuri mai natsuwa don tsara kula da ciki da bayan haihuwa, mataki-mataki.",logBloodPressure:"Rubuta hawan jini",addAppointment:"Ƙara alƙawari",privacyMatters:"Sirrinki yana da muhimmanci",
  privacyText:"Wurin lafiyarki na kanki ne. Ke ce za ki zaɓi abin da za ki rubuta.",privateHealth:"Bayanan lafiyarki sirri ne.",privateHealthText:"Wannan wuri yana adana bayanan da kika zaɓa ki rubuta. Ba a sa ido a kai koyaushe, kuma ba ya maye gurbin ƙungiyar kula da cikin ki ko kulawar gaggawa.",
  pregnancyJourney:"Tafiyar cikinki",postpartumJourney:"Tafiyarki bayan haihuwa",healthSpace:"Wurin lafiyarki",weeks:"makonni",daysUntilDue:"kwanaki kafin ranar haihuwa da aka kiyasta",daysAfterBirth:"kwanaki bayan ranar haihuwar da kika shigar",
  calendarEstimate:"Wannan ƙididdigar kalanda ce bisa ranar da kika shigar kawai; ba tantancewar likita ba ce.",updateJourney:"Sabunta bayanan tafiya",bpLogs:"Rubutun hawan jini",symptomNotes:"Bayanan alamomi",
  savedReadings:"Ma'aunai da kika adana",savedNotes:"Bayanan da kika adana",privacyStatus:"Matsayin sirri",protected:"An kare",controlRecords:"Ke ce ke kula da bayananki",
  everythingInOnePlace:"Komai a wuri guda",chooseSpace:"Zaɓi wuri don duba ko sabunta bayanan lafiyarki.",privateToYou:"Naki kaɗai",personalise:"KEƁANCE WANNAN WURI",completeProfile:"Kammala bayanan kanki da na cikinki",
  profilePrompt:"Ƙara sunan da kika fi so, harshe da kwanakin ciki ko haihuwa don keɓance shafinki.",updateProfile:"Sabunta bayanan martaba",openBloodPressure:"Buɗe bayanan hawan jini",viewSymptoms:"Duba bayanan alamomi",
  viewAppointments:"Duba alƙawura",viewRecords:"Duba bayanan lafiya",yourAccount:"Asusunki",back:"Komawa",returnSignIn:"Komawa shiga",unavailable:"Ba a samun wannan sabis na ɗan lokaci.",
  settingsTitle:"Sirri da saitunan asusu",settingsIntro:"Sarrafa zaɓin sadarwa, bayanan asusu da buƙatun da suka shafi bayanan kanki.",clinicianAccessOff:"Asusunki da bayanan lafiyarki na kanki ne. Ba a kunna damar ma'aikatan lafiya ba.",
  profileTitle:"Bayanan martaba na",profileIntro:"Sabunta bayanan kanki da na tafiyar ciki ko bayan haihuwa.",preferredLanguage:"Harshen da kika fi so",saveProfile:"Ajiye bayanan martaba",saving:"Ana ajiyewa…",saved:"An ajiye",
  speak:"Saurara",stopSpeaking:"Dakatar da sauraro",speechUnavailable:"Ba a samun sauti a yanzu.",speechNotConfigured:"Ba a saita sauti ba tukuna. A sake gwadawa daga baya.",listenToText:"Saurari wannan bayani",
  yourHealth:"Lafiyarki",emergencyNotice:"Idan ba ki jin daɗi ko kina da alamun haɗari, nemi kulawar lafiya cikin gaggawa. Kada ki jira wannan manhaja ta amsa."
};

const ig: Record<keyof typeof en, string> = {
  language:"Asụsụ",chooseLanguage:"Họrọ asụsụ",overview:"Nchịkọta",bloodPressure:"Ọbara mgbali",symptoms:"Ihe mgbaàmà na ndetu",appointments:"Nhọpụta",healthRecords:"Ndekọ ahụike",learningCentre:"Ebe mmụta",
  privacySettings:"Nzuzo na ntọala",home:"Ụlọ",bpLog:"Ndekọ ọbara mgbali",visits:"Nleta",records:"Ndekọ",profile:"Profaịlụ m",personalDetails:"Nkọwa onwe onye",signOut:"Pụọ",
  backDashboard:"Laghachi na peeji ahụike",personalSpace:"OHERE GỊ ONWE GỊ",workspace:"ỌRỤ",yourJourney:"NJE GỊ",healthTools:"NGWA AHỤIKE",welcome:"Ọ dị mma ịhụ gị ọzọ",dashboardTitle:"Peeji nchịkwa ahụike gị",
  dashboardIntro:"Ebe dị jụụ iji hazie nlekọta afọ ime na mgbe ị mụsịrị nwa, otu nzọụkwụ n'otu oge.",logBloodPressure:"Dekọọ ọbara mgbali",addAppointment:"Tinye nhọpụta",privacyMatters:"Nzuzo gị dị mkpa",
  privacyText:"Oghere ahụike gị bụ nke gị. Ị na-ekpebi ihe ị ga-edekọ.",privateHealth:"Ozi ahụike gị bụ nke nzuzo.",privateHealthText:"Ebe a na-echekwa ozi ị họọrọ idekọ. A naghị ele ya anya mgbe niile, ọ naghịkwa anọchi anya ndị na-elekọta afọ ime gị ma ọ bụ enyemaka mberede.",
  pregnancyJourney:"Njem afọ ime gị",postpartumJourney:"Njem gị mgbe ị mụsịrị nwa",healthSpace:"Oghere ahụike gị",weeks:"izu",daysUntilDue:"ụbọchị fọdụrụ ruo ụbọchị ọmụmụ e mere atụmatụ",daysAfterBirth:"ụbọchị kemgbe ụbọchị ọmụmụ nwa i tinyere",
  calendarEstimate:"Nke a bụ atụmatụ kalenda dabere naanị na ụbọchị i tinyere; ọ bụghị nyocha ahụike.",updateJourney:"Melite nkọwa njem",bpLogs:"Ndekọ ọbara mgbali",symptomNotes:"Ndekọ mgbaàmà",
  savedReadings:"Ọgụgụ i chekwara",savedNotes:"Ndetu i chekwara",privacyStatus:"Ọnọdụ nzuzo",protected:"Echekwara",controlRecords:"Ị na-achịkwa ndekọ gị",
  everythingInOnePlace:"Ihe niile n'otu ebe",chooseSpace:"Họrọ ebe ị ga-ele ma ọ bụ melite ozi ahụike nke gị.",privateToYou:"Nke gị naanị",personalise:"HAZIE EBE A KA Ọ DỊRỊ GỊ",completeProfile:"Mezuo profaịlụ onwe gị na nke afọ ime",
  profilePrompt:"Tinye aha ị họọrọ, asụsụ na ụbọchị afọ ime ma ọ bụ ọmụmụ nwa iji hazie peeji gị.",updateProfile:"Melite profaịlụ m",openBloodPressure:"Mepee ndekọ ọbara mgbali",viewSymptoms:"Lee ndekọ mgbaàmà",
  viewAppointments:"Lee nhọpụta",viewRecords:"Lee ndekọ ahụike",yourAccount:"Akaụntụ gị",back:"Laghachi",returnSignIn:"Laghachi na nbanye",unavailable:"Ọrụ a adịghị nwa oge.",
  settingsTitle:"Nzuzo na ntọala akaụntụ",settingsIntro:"Jikwaa nhọrọ nkwukọrịta, nkọwa akaụntụ na arịrịọ gbasara ozi nkeonwe gị.",clinicianAccessOff:"Akaụntụ gị na ndekọ ahụike gị bụ nke gị. Emeghebeghị ohere ndị ọrụ ahụike.",
  profileTitle:"Profaịlụ m",profileIntro:"Debe nkọwa onwe gị na ozi afọ ime ma ọ bụ mgbe ọmụmụ nwa ka ọ dị ọhụrụ.",preferredLanguage:"Asụsụ ị họọrọ",saveProfile:"Chekwaa profaịlụ m",saving:"A na-echekwa…",saved:"Echekwara",
  speak:"Gee ntị",stopSpeaking:"Kwụsị ige ntị",speechUnavailable:"Enweghị ike ịkpọ ụda ugbu a.",speechNotConfigured:"Emebeghị ntọala ụda. Biko nwaa ọzọ ma emechaa.",listenToText:"Gee ozi a ntị",
  yourHealth:"Ahụike gị",emergencyNotice:"Ọ bụrụ na ahụ adịghị gị mma ma ọ bụ nwee ihe mgbaàmà dị ize ndụ, chọọ nlekọta ahụike ozugbo. Echela ka ngwa a zaa."
};

const pcm: Record<keyof typeof en, string> = {
  language:"Language",chooseLanguage:"Choose language",overview:"Quick look",bloodPressure:"Blood pressure",symptoms:"Symptoms & notes",appointments:"Appointments",healthRecords:"Health records",learningCentre:"Learning centre",
  privacySettings:"Privacy & settings",home:"Home",bpLog:"BP log",visits:"Visits",records:"Records",profile:"My profile",personalDetails:"Personal details",signOut:"Sign out",
  backDashboard:"Go back to dashboard",personalSpace:"YOUR OWN SPACE",workspace:"YOUR SPACE",yourJourney:"YOUR JOURNEY",healthTools:"YOUR HEALTH TOOLS",welcome:"Good to see you again",dashboardTitle:"Your health dashboard",
  dashboardIntro:"A calm place to arrange your pregnancy and after-birth care, one step at a time.",logBloodPressure:"Record blood pressure",addAppointment:"Add appointment",privacyMatters:"Your privacy matter",
  privacyText:"Na your health space. Na you decide wetin you wan record.",privateHealth:"Your health information na private.",privateHealthText:"This space keep the things wey you choose to record. Nobody dey monitor am all the time, and e no replace your maternity team or emergency care.",
  pregnancyJourney:"Your pregnancy journey",postpartumJourney:"Your after-birth journey",healthSpace:"Your health space",weeks:"weeks",daysUntilDue:"days till your estimated due date",daysAfterBirth:"days after the birth date wey you enter",
  calendarEstimate:"Na calendar estimate based only on the date wey you enter; e no be medical assessment.",updateJourney:"Update journey details",bpLogs:"Blood pressure records",symptomNotes:"Symptom notes",
  savedReadings:"Your saved readings",savedNotes:"Your saved notes",privacyStatus:"Privacy status",protected:"Protected",controlRecords:"Na you dey control your records",
  everythingInOnePlace:"Everything for one place",chooseSpace:"Choose where you wan check or update your health information.",privateToYou:"Na only you fit see am",personalise:"MAKE THIS SPACE YOUR OWN",completeProfile:"Complete your personal and pregnancy profile",
  profilePrompt:"Add the name wey you like, your language and pregnancy or birth dates to personalise your dashboard.",updateProfile:"Update my profile",openBloodPressure:"Open blood pressure log",viewSymptoms:"See symptom notes",
  viewAppointments:"See appointments",viewRecords:"See health records",yourAccount:"Your account",back:"Back",returnSignIn:"Go back to sign in",unavailable:"This service no dey available for now.",
  settingsTitle:"Privacy and account settings",settingsIntro:"Manage your communication choices, account details and requests about your personal information.",clinicianAccessOff:"Your account and health records na your own. Health workers no get access now.",
  profileTitle:"My profile",profileIntro:"Keep your personal details and pregnancy or after-birth journey information up to date.",preferredLanguage:"Your preferred language",saveProfile:"Save my profile",saving:"E dey save…",saved:"Saved",
  speak:"Listen",stopSpeaking:"Stop listening",speechUnavailable:"Audio no dey available right now.",speechNotConfigured:"We never set up audio yet. Abeg try again later.",listenToText:"Listen to this information",
  yourHealth:"Your health",emergencyNotice:"If you no dey feel well or you get warning signs, go get urgent medical care. No wait make this app respond."
};

export const translations = { en, yo, ha, ig, pcm } as const;

export function translate(language: AppLanguage, key: TranslationKey): string {
  return translations[language][key] ?? translations.en[key];
}

export function normalizeLanguage(value: unknown): AppLanguage {
  return languageOptions.some(option => option.code === value) ? value as AppLanguage : "en";
}

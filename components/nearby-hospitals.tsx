"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, LocateFixed, MapPin, Navigation, Phone, Search } from "lucide-react";
import hospitalData from "@/data/hospitals.json";
import { filterHospitalsByTown, findNearbyHospitals, type NearbyHospital } from "@/lib/nearby-hospitals";
import type { AppLanguage } from "@/lib/i18n/translations";

const records = hospitalData as NearbyHospital[];
const labels: Record<AppLanguage, Record<string, string>> = {
  en: { kicker:"LOCAL FACILITY FINDER", title:"Nearby hospitals", intro:"Find facilities using your device location or search by town, LGA or state.", locate:"Use my location", locating:"Finding location…", search:"Search town or LGA (e.g. Sapele)", permission:"Location permission was not granted. Search by town or LGA instead.", unavailable:"Location is unavailable. Check your device settings or search manually.", within:"Showing facilities within 20 km straight-line distance. Road distance and drive time are estimates, not live traffic or routing data.", fixtures:"Include clearly marked synthetic Sapele test records (never use for navigation)", emptyTitle:"No facility records found", emptyGps:"No imported facility records are within 20 km. Try the manual town/LGA search.", emptySearch:"Search by town or LGA. The local data file contains test-only fixtures, not real hospital listings.", maternityYes:"Maternity Ward: Yes", maternityNo:"Maternity Ward: No", maternityUnknown:"Maternity Ward: Unverified — Call Ahead", test:"TEST ONLY — NOT REAL", directions:"Get Directions", distance:"straight-line", road:"by road", drive:"min drive", disclaimer:"Synthetic test data with approximate coordinates. Not a real facility. Directions and calls are disabled.", footnote:"Distance uses the Haversine formula, a 1.35 road-distance multiplier and an assumed average speed of 30 km/h. Actual routes, traffic, access and facility services may differ. Confirm directly before travelling." },
  yo: { kicker:"WÍWÁ ILÉ ÌWÒSÀN NÍ ÀGBÈGBÈ", title:"Àwọn ilé ìwòsàn tó sún mọ́ ọ", intro:"Lo ibi tí fóònù rẹ wà tàbí wá nípa ìlú, LGA tàbí ìpínlẹ̀.", locate:"Lo ibi tí mo wà", locating:"A ń wá ibi rẹ…", search:"Wá ìlú tàbí LGA (àpẹẹrẹ Sapele)", permission:"O kò fún wa ní àṣẹ ibi rẹ. Wá nípa ìlú tàbí LGA.", unavailable:"A kò rí ibi rẹ. Ṣàyẹ̀wò ètò fóònù rẹ tàbí wá pẹ̀lú ọwọ́.", within:"Àwọn ilé ìlera tó wà láàárín 20 km ni a ń fihàn. Àfojúsùn ni ìjìnnà ojú ọ̀nà àti àkókò ìrìn.", fixtures:"Fi àwọn àkọsílẹ̀ ìdánwò Sapele tí kì í ṣe gidi hàn (má ṣe lo fún ìtọ́sọ́nà)", emptyTitle:"A kò rí àkọsílẹ̀ ilé ìlera", emptyGps:"Kò sí àkọsílẹ̀ gidi tó wà láàárín 20 km. Gbìyànjú wíwá nípa ìlú/LGA.", emptySearch:"Wá nípa ìlú tàbí LGA. Àwọn àkọsílẹ̀ ìdánwò kì í ṣe ilé ìwòsàn gidi.", maternityYes:"Ibi ìtọ́jú oyún: Bẹ́ẹ̀ni", maternityNo:"Ibi ìtọ́jú oyún: Rárá", maternityUnknown:"Ibi ìtọ́jú oyún: A kò jẹ́rìí sí i — Pe wọn", test:"ÌDÁNWÒ NÌKAN — KÌ Í ṢE GIDI", directions:"Gba ìtọ́sọ́nà", distance:"ìjìnnà tààrà", road:"ní ojú ọ̀nà", drive:"ìṣẹ́jú ìrìn", disclaimer:"Àkọsílẹ̀ ìdánwò pẹ̀lú ibi àfojúsùn. Kì í ṣe ilé ìlera gidi. A ti pa ìtọ́sọ́nà àti ìpè fóònù.", footnote:"A lo ìṣirò Haversine, ìlọ́po 1.35 fún ojú ọ̀nà àti iyára àfojúsùn 30 km/wákàtí. Ìrìn gidi àti iṣẹ́ ilé ìlera lè yàtọ̀. Jẹ́rìí sí i kí o tó lọ." },
  ha: { kicker:"NEMAN ASIBITI NA KUSA", title:"Asibitocin da ke kusa", intro:"Yi amfani da wurin wayarka ko bincika ta gari, LGA ko jiha.", locate:"Yi amfani da wurina", locating:"Ana neman wuri…", search:"Nemi gari ko LGA (misali Sapele)", permission:"Ba a ba da izinin wurinka ba. Nemi ta gari ko LGA.", unavailable:"Ba a samu wurinka ba. Duba saitunan na'ura ko bincika da hannu.", within:"Ana nuna wuraren da ke cikin kilomita 20 a madaidaiciyar hanya. Nisan hanya da lokacin tuƙi ƙiyasi ne.", fixtures:"Nuna bayanan gwajin Sapele na ƙirƙira (kada a yi amfani da su don hanya)", emptyTitle:"Ba a sami bayanan wurin lafiya ba", emptyGps:"Babu bayanan wurin lafiya na gaske cikin kilomita 20. Gwada neman gari/LGA.", emptySearch:"Nemi ta gari ko LGA. Bayanan gwajin da ke cikin fayil ɗin ba asibitoci na gaske ba ne.", maternityYes:"Sashen haihuwa: Eh", maternityNo:"Sashen haihuwa: A'a", maternityUnknown:"Sashen haihuwa: Ba a tantance ba — Kira kafin zuwa", test:"GWaji KAWAI — BA NA GASKE BA", directions:"Samun hanya", distance:"madaidaiciyar hanya", road:"ta hanya", drive:"minti tuƙi", disclaimer:"Bayanan gwaji ne da wurare na ƙiyasi. Ba wurin lafiya na gaske ba ne. An kashe kira da jagorar hanya.", footnote:"An yi amfani da lissafin Haversine, ninka nisan hanya da 1.35 da matsakaicin gudu 30 km/h. Haƙiƙanin hanya da ayyuka na iya bambanta. Tabbatar kafin tafiya." },
  ig: { kicker:"CHỌỌ ỤLỌ ỌGWỤ NỌ N'AKWỤ", title:"Ụlọ ọgwụ ndị dị nso", intro:"Jiri ebe ekwentị gị nọ ma ọ bụ chọọ site n'obodo, LGA ma ọ bụ steeti.", locate:"Jiri ebe m nọ", locating:"A na-achọ ebe gị…", search:"Chọọ obodo ma ọ bụ LGA (dịka Sapele)", permission:"E nyeghị ikike ebe ị nọ. Chọọ site n'obodo ma ọ bụ LGA.", unavailable:"Enweghị ike ịchọta ebe gị. Lelee ntọala ekwentị ma ọ bụ chọọ aka gị.", within:"A na-egosi ebe dị n'ime kilomita 20 n'ahịrị kwụ ọtọ. Njem okporo ụzọ na oge bụ atụmatụ.", fixtures:"Gosi ndekọ nnwale Sapele e chepụtara (ejila ha maka ntụziaka)", emptyTitle:"Enweghị ndekọ ebe ahụike", emptyGps:"Enweghị ezigbo ndekọ n'ime kilomita 20. Gbalịa chọọ obodo/LGA.", emptySearch:"Chọọ obodo ma ọ bụ LGA. Ndekọ nnwale abụghị ụlọ ọgwụ n'ezie.", maternityYes:"Ụlọ ọmụmụ: Ee", maternityNo:"Ụlọ ọmụmụ: Mba", maternityUnknown:"Ụlọ ọmụmụ: Ekwenyeghị — Kpọọ tupu ị gawa", test:"NNWALE KEDỌ — Ọ BỤGHỊ EZIOKWU", directions:"Nweta ntụziaka", distance:"anya kwụ ọtọ", road:"n'okporo ụzọ", drive:"nkeji njem", disclaimer:"Nke a bụ data nnwale nwere ebe e mere atụmatụ. Ọ bụghị ebe ahụike n'ezie. Agbanyụrụ oku na ntụziaka.", footnote:"A na-eji usoro Haversine, ọnụọgụ 1.35 maka okporo ụzọ na ọsọ atụmatụ 30 km/h. Ụzọ na ọrụ n'ezie nwere ike ịdị iche. Kwenye tupu njem." },
  pcm: { kicker:"FIND HOSPITAL WEY DEY NEAR YOU", title:"Hospitals wey dey near you", intro:"Use your phone location or search by town, LGA or state.", locate:"Use my location", locating:"We dey find your location…", search:"Search town or LGA (e.g. Sapele)", permission:"You no give location permission. Search by town or LGA instead.", unavailable:"We no fit get your location. Check phone settings or search by yourself.", within:"We dey show facilities within 20 km straight-line distance. Road distance and drive time na estimate, no be live traffic.", fixtures:"Show clearly marked Sapele test records (no use am for directions)", emptyTitle:"No facility record dey here", emptyGps:"No real facility record dey within 20 km. Try search by town/LGA.", emptySearch:"Search by town or LGA. The test records no be real hospitals.", maternityYes:"Maternity Ward: Yes", maternityNo:"Maternity Ward: No", maternityUnknown:"Maternity Ward: Dem never confirm — Call first", test:"TEST ONLY — NO BE REAL", directions:"Get Directions", distance:"straight-line", road:"by road", drive:"min drive", disclaimer:"Na synthetic test data with approximate location. E no be real facility. We don disable directions and calls.", footnote:"We use Haversine formula, 1.35 road-distance multiplier and assume 30 km/h average speed. Real route, traffic and facility service fit different. Confirm before you travel." }
};

export default function NearbyHospitals({ language }: { language: AppLanguage }) {
  const t = labels[language] ?? labels.en;
  const [position, setPosition] = useState<{lat:number;lng:number}|null>(null);
  const [locationState, setLocationState] = useState<"idle"|"loading"|"denied"|"error">("idle");
  const [query, setQuery] = useState("");
  const [includeFixtures, setIncludeFixtures] = useState(false);
  const canShowFixtures = process.env.NODE_ENV !== "production";
  const available = useMemo(() => records.filter((item) => !item.is_placeholder || (canShowFixtures && includeFixtures)), [canShowFixtures, includeFixtures]);
  const results = useMemo(() => position
    ? findNearbyHospitals(available, position, 20, includeFixtures)
    : filterHospitalsByTown(available, query, includeFixtures), [available, position, query, includeFixtures]);

  function locate() {
    if (!navigator.geolocation) { setLocationState("error"); return; }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (result) => { setPosition({lat:result.coords.latitude,lng:result.coords.longitude}); setLocationState("idle"); },
      (error) => setLocationState(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      {enableHighAccuracy:false,timeout:10000,maximumAge:300000},
    );
  }

  return <section className="nearby-hospitals" aria-labelledby="nearby-hospitals-title">
    <div className="nearby-hospitals-heading"><div><span className="account-kicker">{t.kicker}</span><h2 id="nearby-hospitals-title">{t.title}</h2><p>{t.intro}</p></div><button type="button" className="nearby-location-button" onClick={locate} disabled={locationState === "loading"}><LocateFixed size={17}/>{locationState === "loading" ? t.locating : t.locate}</button></div>
    <div className="nearby-search-row"><label htmlFor="nearby-hospital-search"><Search size={17}/><span className="sr-only">{t.search}</span></label><input id="nearby-hospital-search" value={query} onChange={(event)=>{setQuery(event.target.value);setPosition(null);setLocationState("idle");}} placeholder={t.search} maxLength={80}/></div>
    {locationState === "denied" && <p className="nearby-status"><AlertTriangle size={15}/>{t.permission}</p>}
    {locationState === "error" && <p className="nearby-status"><AlertTriangle size={15}/>{t.unavailable}</p>}
    {position && <p className="nearby-status">{t.within}</p>}
    {canShowFixtures && <label className="nearby-fixture-toggle"><input type="checkbox" checked={includeFixtures} onChange={(event)=>setIncludeFixtures(event.target.checked)}/>{t.fixtures}</label>}
    {results.length === 0 ? <div className="nearby-empty"><MapPin size={23}/><b>{t.emptyTitle}</b><p>{position ? t.emptyGps : t.emptySearch}</p></div> : <div className="nearby-results">{results.map((facility)=>{
      const placeholder=Boolean(facility.is_placeholder);
      const distance="straightDistanceKm" in facility ? facility : null;
      const directions=`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`;
      return <article className="nearby-hospital-card" key={facility.name}>
        <div className="nearby-card-title"><div><h3>{facility.name}</h3><p><MapPin size={14}/>{facility.lga}, {facility.state}, Nigeria</p></div>{placeholder && <span className="nearby-test-badge">{t.test}</span>}</div>
        <div className="nearby-card-meta"><span>{facility.facility_level}</span><span className={facility.has_maternity===true?"maternity-yes":facility.has_maternity===false?"maternity-no":"maternity-unknown"}>{facility.has_maternity===true?t.maternityYes:facility.has_maternity===false?t.maternityNo:t.maternityUnknown}</span></div>
        {distance && <p className="nearby-distance"><b>{distance.straightDistanceKm.toFixed(1)} km</b> {t.distance} · approx. {distance.estimatedRoadDistanceKm.toFixed(1)} km {t.road} · {distance.estimatedDriveMinutes} {t.drive}</p>}
        {facility.phone && !placeholder && <a className="nearby-phone" href={`tel:${facility.phone}`}><Phone size={15}/>{facility.phone}</a>}
        {placeholder ? <p className="nearby-disclaimer">{t.disclaimer}</p> : <a className="nearby-directions" href={directions} target="_blank" rel="noreferrer"><Navigation size={15}/>{t.directions}</a>}
      </article>;
    })}</div>}
    <p className="nearby-footnote">{t.footnote}</p>
  </section>;
}

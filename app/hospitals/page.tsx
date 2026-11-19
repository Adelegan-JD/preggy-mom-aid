import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import PatientPageNavigation from "@/components/patient-page-navigation";
import { normalizeLanguage } from "@/lib/i18n/translations";
import { healthServicesText as t } from "@/lib/i18n/health-services";
import { MapPin, Phone, ShieldCheck, AlertTriangle, Search } from "lucide-react";
import NearbyHospitals from "@/components/nearby-hospitals";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hospital directory | Preggy Mom Aid", description: "Public information about maternity and healthcare facilities in Nigeria." };

type SearchParams = Promise<{ city?: string; state?: string; type?: string }>;
const facilityTypes = ["hospital", "clinic", "maternity_centre", "medical_centre"] as const;

export default async function HospitalsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const city = (params.city ?? "").trim().slice(0, 80);
  const state = (params.state ?? "").trim().slice(0, 80);
  const type = facilityTypes.includes(params.type as typeof facilityTypes[number]) ? params.type : "";
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  let facilities: any[] = [];
  let directoryUnavailable = false;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    try {
      const supabase = await createClient();
      let query = supabase.from("health_facilities").select("id,name,facility_type,address,city,state,phone,emergency_phone,maternity_services,has_emergency_department,verification_status").eq("is_published", true).order("name", { ascending: true }).limit(100);
      if (city) query = query.ilike("city", "%" + city + "%");
      if (state) query = query.ilike("state", "%" + state + "%");
      if (type) query = query.eq("facility_type", type);
      const result = await query;
      if (result.error) directoryUnavailable = true;
      else facilities = result.data ?? [];
    } catch {
      directoryUnavailable = true;
    }
  } else {
    directoryUnavailable = true;
  }

  const facilityTypeLabel = (value: string) => {
    const key = value === "maternity_centre" ? "maternityCentre" : value === "medical_centre" ? "medicalCentre" : value;
    return t(language, key as "hospital" | "clinic" | "maternityCentre" | "medicalCentre");
  };

  return <main className="patient-dashboard patient-subpage health-services-page" id="main-content" tabIndex={-1}>
    <PatientPageNavigation active="hospitals" />
    <section className="patient-dashboard-content">
      <div className="account-kicker">{t(language, "publicDirectory")}</div>
      <h1>{t(language, "directory")}</h1>
      <p className="account-intro">{t(language, "directoryIntro")}</p>
      <div className="health-directory-notice"><ShieldCheck size={20}/><p>{t(language, "directoryNotice")}</p></div>
      <NearbyHospitals language={language} />
      <form method="get" className="health-directory-filters" aria-label={t(language, "search")}>
        <label>{t(language, "city")}<input name="city" defaultValue={city} maxLength={80}/></label>
        <label>{t(language, "state")}<input name="state" defaultValue={state} maxLength={80}/></label>
        <label>{t(language, "facilityType")}<select name="type" defaultValue={type}><option value="">{t(language, "allTypes")}</option>{facilityTypes.map(item => <option key={item} value={item}>{facilityTypeLabel(item)}</option>)}</select></label>
        <button type="submit"><Search size={16}/>{t(language, "search")}</button>
        <Link href="/hospitals">{t(language, "clear")}</Link>
      </form>
      {directoryUnavailable ? <div className="health-directory-empty"><AlertTriangle size={26}/><h2>{t(language, "noFacilities")}</h2><p>{t(language, "noDirectoryData")}</p></div>
      : facilities.length === 0 ? <div className="health-directory-empty"><MapPin size={26}/><h2>{city || state || type ? t(language, "noMatches") : t(language, "noFacilities")}</h2><p>{t(language, "noFacilitiesText")}</p></div>
      : <div className="health-facility-grid">{facilities.map(facility => {
        const verified = facility.verification_status === "verified";
        return <article className="health-facility-card" key={facility.id}>
          <div className="health-facility-card-top"><span className={verified ? "health-verification verified" : "health-verification unverified"}>{verified ? <ShieldCheck size={14}/> : <AlertTriangle size={14}/>} {t(language, verified ? "verified" : facility.verification_status === "under_review" ? "underReview" : "unverified")}</span><small>{facilityTypeLabel(facility.facility_type)}</small></div>
          <h2>{facility.name}</h2>
          <p><MapPin size={15}/>{facility.address}, {facility.city}, {facility.state}, Nigeria</p>
          {facility.phone ? <p><Phone size={15}/><a href={"tel:" + facility.phone}>{facility.phone}</a></p> : null}
          {facility.emergency_phone ? <p><Phone size={15}/>{t(language, "emergencyPhone")}: <a href={"tel:" + facility.emergency_phone}>{facility.emergency_phone}</a></p> : null}
          {facility.maternity_services?.length ? <div><b>{t(language, "services")}</b><ul>{facility.maternity_services.map((service: string) => <li key={service}>{service}</li>)}</ul></div> : null}
          {facility.has_emergency_department ? <p className="health-facility-emergency">{t(language, "emergencyDepartment")}</p> : null}
          <small>{t(language, "listingNote")}</small>
        </article>;
      })}</div>}
      <p className="health-directory-footer"><Link href="/emergency">{t(language, "emergencyPage")}</Link></p>
    </section>
  </main>;
}

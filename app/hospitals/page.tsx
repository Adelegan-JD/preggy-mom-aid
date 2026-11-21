import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import PatientShell from "@/components/patient-shell";
import { normalizeLanguage } from "@/lib/i18n/translations";
import { healthServicesText as t } from "@/lib/i18n/health-services";
import { AlertTriangle, ArrowRight, MapPin, Phone, Search, ShieldCheck } from "lucide-react";
import { Callout, PageHeader } from "@/components/ds";
import NearbyHospitals from "@/components/nearby-hospitals";
import type { NearbyHospital } from "@/lib/nearby-hospitals";
import { ComboBox } from "@/components/combo-box";

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
      let query = supabase.from("health_facilities").select("id,name,facility_type,address,city,state,lga,latitude,longitude,phone,emergency_phone,maternity_services,has_emergency_department,verification_status").eq("is_published", true).order("name", { ascending: true }).limit(100);
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

  return <PatientShell active="hospitals" publicFallback>
    <div className="ds-page">
      <PageHeader title={t(language, "directory")} lede={t(language, "directoryIntro")} />
      <Callout tone="neutral" className="ds-callout-spaced">{t(language, "directoryNotice")}</Callout>

      <NearbyHospitals
        language={language}
        facilities={facilities.map((facility): NearbyHospital => ({
          name: facility.name,
          state: facility.state,
          lga: facility.lga ?? facility.city,
          city: facility.city,
          lat: facility.latitude,
          lng: facility.longitude,
          facility_level: facility.facility_type,
          // An empty services list means unknown, not confirmed absence.
          has_maternity: facility.maternity_services?.length ? true : null,
          phone: facility.phone,
          verification_status: facility.verification_status,
        }))}
      />

      <section className="ds-section" aria-labelledby="directory-browse-title">
        <h2 className="ds-h2" id="directory-browse-title">{t(language, "search")}</h2>
        <form method="get" className="ds-panel ds-directory-filters" aria-label={t(language, "search")}>
          <div className="ds-field"><label className="ds-label" htmlFor="dirCity">{t(language, "city")}</label><input className="ds-input" id="dirCity" name="city" defaultValue={city} maxLength={80}/></div>
          <div className="ds-field"><label className="ds-label" htmlFor="dirState">{t(language, "state")}</label><input className="ds-input" id="dirState" name="state" defaultValue={state} maxLength={80}/></div>
          <div className="ds-field"><label className="ds-label" htmlFor="dirType">{t(language, "facilityType")}</label><ComboBox id="dirType" name="type" defaultValue={type ?? ""} allowEmpty placeholder={t(language, "allTypes")} options={facilityTypes.map(item => ({ value: item, label: facilityTypeLabel(item) }))} /></div>
          <div className="ds-form-actions"><button type="submit" className="ds-btn ds-btn-primary"><Search size={16} aria-hidden="true"/>{t(language, "search")}</button><Link className="ds-btn ds-btn-ghost" href="/hospitals">{t(language, "clear")}</Link></div>
        </form>

        <div style={{ marginTop: "var(--ds-6)" }}>
        {directoryUnavailable ? <div className="ds-empty"><b>{t(language, "noFacilities")}</b><p>{t(language, "noDirectoryData")}</p></div>
        : facilities.length === 0 ? <div className="ds-empty"><b>{city || state || type ? t(language, "noMatches") : t(language, "noFacilities")}</b><p>{t(language, "noFacilitiesText")}</p></div>
        : <div className="ds-grid-2">{facilities.map(facility => {
          const verified = facility.verification_status === "verified";
          return <article className="ds-panel ds-stack" key={facility.id} style={{ gap: "var(--ds-2)" }}>
            <div className="ds-form-actions"><span className={verified ? "ds-badge ds-badge-success" : "ds-badge ds-badge-warning"}>{verified ? <ShieldCheck size={13} aria-hidden="true"/> : <AlertTriangle size={13} aria-hidden="true"/>} {t(language, verified ? "verified" : facility.verification_status === "under_review" ? "underReview" : "unverified")}</span><span className="ds-badge">{facilityTypeLabel(facility.facility_type)}</span></div>
            <h3 className="ds-h3">{facility.name}</h3>
            <p className="ds-muted ds-small ds-note"><MapPin size={15} aria-hidden="true"/>{[facility.address, facility.city, facility.state, "Nigeria"].filter(Boolean).join(", ")}</p>
            {facility.phone ? <a className="ds-link ds-link-quiet" href={"tel:" + facility.phone}><Phone size={15} aria-hidden="true"/>{facility.phone}</a> : null}
            {facility.emergency_phone ? <a className="ds-link ds-link-quiet" href={"tel:" + facility.emergency_phone}><Phone size={15} aria-hidden="true"/>{t(language, "emergencyPhone")}: {facility.emergency_phone}</a> : null}
            {facility.maternity_services?.length ? <div className="ds-small"><b>{t(language, "services")}</b><ul className="ds-steps">{facility.maternity_services.map((service: string) => <li key={service}>{service}</li>)}</ul></div> : null}
            {facility.has_emergency_department ? <span className="ds-badge ds-badge-accent">{t(language, "emergencyDepartment")}</span> : null}
            <p className="ds-hint">{t(language, "listingNote")}</p>
          </article>;
        })}</div>}
        </div>
      </section>
      <p className="ds-section"><Link className="ds-link" href="/emergency">{t(language, "emergencyPage")} <ArrowRight size={15} aria-hidden="true"/></Link></p>
    </div>
  </PatientShell>;
}

"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, LocateFixed, MapPin, Navigation, Phone, Search } from "lucide-react";
import hospitalData from "@/data/hospitals.json";
import { filterHospitalsByTown, findNearbyHospitals, type NearbyHospital } from "@/lib/nearby-hospitals";

const fixtures = hospitalData as NearbyHospital[];
const showFixtures = process.env.NEXT_PUBLIC_ENABLE_HOSPITAL_TEST_FIXTURES === "true";

type Position = { lat: number; lng: number };

export default function NearbyHospitals() {
  const [position, setPosition] = useState<Position | null>(null);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "denied" | "error">("idle");
  const [query, setQuery] = useState("");
  const [includeFixtures, setIncludeFixtures] = useState(false);

  const availableRecords = useMemo(() => fixtures.filter((item) => !item.is_placeholder || (showFixtures && includeFixtures)), [includeFixtures]);
  const results = useMemo(() => {
    if (position) return findNearbyHospitals(availableRecords, position);
    return filterHospitalsByTown(availableRecords, query);
  }, [availableRecords, position, query]);

  function locate() {
    if (!navigator.geolocation) { setLocationState("error"); return; }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({ lat: result.coords.latitude, lng: result.coords.longitude });
        setLocationState("ready");
      },
      (error) => setLocationState(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <section className="nearby-hospitals" aria-labelledby="nearby-hospitals-title">
      <div className="nearby-hospitals-heading">
        <div><span className="account-kicker">LOCAL FACILITY FINDER</span><h2 id="nearby-hospitals-title">Nearby hospitals</h2><p>Find facilities using your device location or search by town, LGA or state.</p></div>
        <button type="button" className="nearby-location-button" onClick={locate} disabled={locationState === "loading"}><LocateFixed size={17}/>{locationState === "loading" ? "Finding location…" : "Use my location"}</button>
      </div>
      <div className="nearby-search-row">
        <label htmlFor="nearby-hospital-search"><Search size={17}/><span className="sr-only">Search by town, LGA or state</span></label>
        <input id="nearby-hospital-search" value={query} onChange={(event) => { setQuery(event.target.value); setPosition(null); setLocationState("idle"); }} placeholder="Search town or LGA (e.g. Sapele)" maxLength={80}/>
      </div>
      {locationState === "denied" && <p className="nearby-status"><AlertTriangle size={15}/> Location permission was not granted. Search by town or LGA instead.</p>}
      {locationState === "error" && <p className="nearby-status"><AlertTriangle size={15}/> Location is unavailable. Check your device settings or search manually.</p>}
      {position && <p className="nearby-status">Showing facilities within 20 km straight-line distance. Road distance and drive time are estimates, not live traffic or routing data.</p>}
      {showFixtures && <label className="nearby-fixture-toggle"><input type="checkbox" checked={includeFixtures} onChange={(event) => setIncludeFixtures(event.target.checked)}/> Include clearly marked synthetic Sapele test records (never use for navigation)</label>}
      {results.length === 0 ? <div className="nearby-empty"><MapPin size={23}/><b>No facility records found</b><p>{position ? "No imported facility records are within 20 km. Try the manual town/LGA search." : "Search by town or LGA. The local data file contains test-only fixtures, not real hospital listings."}</p></div> : (
        <div className="nearby-results">
          {results.map((facility) => {
            const placeholder = Boolean(facility.is_placeholder);
            const distance = "straightDistanceKm" in facility ? facility : null;
            const directions = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`;
            return <article className="nearby-hospital-card" key={facility.name}>
              <div className="nearby-card-title"><div><h3>{facility.name}</h3><p><MapPin size={14}/>{facility.lga}, {facility.state}, Nigeria</p></div>{placeholder && <span className="nearby-test-badge">TEST ONLY — NOT REAL</span>}</div>
              <div className="nearby-card-meta"><span>{facility.facility_level}</span><span className={facility.has_maternity === true ? "maternity-yes" : facility.has_maternity === false ? "maternity-no" : "maternity-unknown"}>Maternity Ward: {facility.has_maternity === true ? "Yes" : facility.has_maternity === false ? "No" : "Unverified — Call Ahead"}</span></div>
              {distance && <p className="nearby-distance"><b>{distance.straightDistanceKm.toFixed(1)} km</b> straight-line · approx. {distance.estimatedRoadDistanceKm.toFixed(1)} km by road · {distance.estimatedDriveMinutes} min drive</p>}
              {facility.phone && <a className="nearby-phone" href={`tel:${facility.phone}`}><Phone size={15}/>{facility.phone}</a>}
              {placeholder ? <p className="nearby-disclaimer">Synthetic test data with approximate coordinates. Not a real facility. Directions and calls are disabled.</p> : <a className="nearby-directions" href={directions} target="_blank" rel="noreferrer"><Navigation size={15}/>Get Directions</a>}
            </article>;
          })}
        </div>
      )}
      <p className="nearby-footnote">Distance uses the Haversine formula, a 1.35 road-distance multiplier and an assumed average speed of 30 km/h. Actual routes, traffic, access and facility services may differ. Confirm directly before travelling.</p>
    </section>
  );
}

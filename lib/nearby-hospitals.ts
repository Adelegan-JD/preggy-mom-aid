export type NearbyHospital = {
  name: string; state: string; lga: string; lat: number; lng: number;
  facility_level: string; has_maternity: boolean | null; phone: string | null;
  is_placeholder?: boolean; source?: string;
};
export type NearbyHospitalResult = NearbyHospital & {
  straightDistanceKm: number; estimatedRoadDistanceKm: number; estimatedDriveMinutes: number;
};
const EARTH_RADIUS_KM = 6371;
export const NEARBY_RADIUS_KM = 20;

export function haversineDistanceKm(lat1:number,lng1:number,lat2:number,lng2:number):number {
  const rad=(degrees:number)=>(degrees*Math.PI)/180;
  const dLat=rad(lat2-lat1), dLng=rad(lng2-lng1);
  const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLng/2)**2;
  return 2*EARTH_RADIUS_KM*Math.asin(Math.sqrt(Math.min(1,a)));
}
export function findNearbyHospitals(
  facilities:NearbyHospital[], origin:{lat:number;lng:number}, radiusKm=NEARBY_RADIUS_KM, includePlaceholders=false,
):NearbyHospitalResult[] {
  if(!Number.isFinite(origin.lat)||!Number.isFinite(origin.lng)) return [];
  return facilities.filter(f=>includePlaceholders||!f.is_placeholder).map(f=>{
    const straightDistanceKm=haversineDistanceKm(origin.lat,origin.lng,f.lat,f.lng);
    const estimatedRoadDistanceKm=straightDistanceKm*1.35;
    return {...f,straightDistanceKm,estimatedRoadDistanceKm,estimatedDriveMinutes:Math.ceil(estimatedRoadDistanceKm/30*60)};
  }).filter(f=>f.straightDistanceKm<=radiusKm).sort((a,b)=>a.straightDistanceKm-b.straightDistanceKm);
}
export function filterHospitalsByTown(facilities:NearbyHospital[],search:string,includePlaceholders=false):NearbyHospital[] {
  const term=search.trim().toLocaleLowerCase();
  return facilities.filter(f=>(includePlaceholders||!f.is_placeholder)
    && (!term||`${f.lga} ${f.state} ${f.name}`.toLocaleLowerCase().includes(term)));
}

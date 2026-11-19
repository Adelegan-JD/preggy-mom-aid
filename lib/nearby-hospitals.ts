export type NearbyHospital = {
  name: string;
  state: string;
  lga: string;
  lat: number;
  lng: number;
  facility_level: string;
  has_maternity: boolean | null;
  phone: string | null;
  is_placeholder?: boolean;
  source?: string;
};

export type NearbyHospitalResult = NearbyHospital & {
  straightDistanceKm: number;
  estimatedRoadDistanceKm: number;
  estimatedDriveMinutes: number;
};

const EARTH_RADIUS_KM = 6371;
export const NEARBY_RADIUS_KM = 20;

export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, a)));
}

export function findNearbyHospitals(
  facilities: NearbyHospital[],
  origin: { lat: number; lng: number },
  radiusKm = NEARBY_RADIUS_KM,
): NearbyHospitalResult[] {
  if (!Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) return [];
  return facilities
    .filter((facility) => !facility.is_placeholder)
    .map((facility) => {
      const straightDistanceKm = haversineDistanceKm(origin.lat, origin.lng, facility.lat, facility.lng);
      const estimatedRoadDistanceKm = straightDistanceKm * 1.35;
      return {
        ...facility,
        straightDistanceKm,
        estimatedRoadDistanceKm,
        estimatedDriveMinutes: Math.ceil((estimatedRoadDistanceKm / 30) * 60),
      };
    })
    .filter((facility) => facility.straightDistanceKm <= radiusKm)
    .sort((a, b) => a.straightDistanceKm - b.straightDistanceKm);
}

export function filterHospitalsByTown(facilities: NearbyHospital[], search: string): NearbyHospital[] {
  const term = search.trim().toLocaleLowerCase();
  if (!term) return facilities.filter((facility) => !facility.is_placeholder);
  return facilities.filter((facility) => !facility.is_placeholder
    && `${facility.lga} ${facility.state} ${facility.name}`.toLocaleLowerCase().includes(term));
}

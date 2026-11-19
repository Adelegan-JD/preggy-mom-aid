import assert from "node:assert/strict";
import { filterHospitalsByTown, findNearbyHospitals, haversineDistanceKm } from "../lib/nearby-hospitals.ts";

const sample = [
  { name: "Nearest", state: "Delta", lga: "Sapele", lat: 0, lng: 0.05, facility_level: "Clinic", has_maternity: null, phone: null },
  { name: "Second", state: "Delta", lga: "Sapele", lat: 0, lng: 0.1, facility_level: "Hospital", has_maternity: true, phone: null },
  { name: "Outside radius", state: "Delta", lga: "Sapele", lat: 0, lng: 0.25, facility_level: "Hospital", has_maternity: false, phone: null },
  { name: "Synthetic fixture", state: "Delta", lga: "Sapele", lat: 0, lng: 0.01, facility_level: "Test", has_maternity: null, phone: null, is_placeholder: true },
  { name: "No GPS facility", state: "Delta", lga: "Sapele", city: "Amukpe", lat: null, lng: null, facility_level: "Clinic", has_maternity: null, phone: null },
];
assert.ok(Math.abs(haversineDistanceKm(0, 0, 0, 1) - 111.195) < 0.1);
const nearby = findNearbyHospitals(sample, { lat: 0, lng: 0 }, 20);
assert.deepEqual(nearby.map((facility) => facility.name), ["Nearest", "Second"]);
assert.deepEqual(filterHospitalsByTown(sample, "Amukpe").map((facility) => facility.name), ["No GPS facility"]);
assert.ok(Math.abs(nearby[0].estimatedRoadDistanceKm - nearby[0].straightDistanceKm * 1.35) < 1e-9);
assert.equal(nearby[0].estimatedDriveMinutes, Math.ceil(nearby[0].estimatedRoadDistanceKm / 30 * 60));
assert.deepEqual(filterHospitalsByTown(sample, "Sapele").map((facility) => facility.name), ["Nearest", "Second", "Outside radius", "No GPS facility"]);
assert.deepEqual(filterHospitalsByTown(sample, ""), []);
assert.equal(filterHospitalsByTown(sample, "Sapele", true).length, 5);
console.log("Nearby hospital distance and search checks passed.");

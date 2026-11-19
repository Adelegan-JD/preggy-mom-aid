import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "pma-hospitals-"));
try {
  const input = path.join(directory, "registry.csv");
  const output = path.join(directory, "hospitals.json");
  fs.writeFileSync(input, [
    "Facility Name,State,Local Government Area,Latitude,Longitude,Facility Level,Has Maternity,Phone Number",
    '"Test Clinic, Sapele",Delta,Sapele,5.9,5.67,Primary Health Centre,Yes,08012345678',
    "Missing GPS,Delta,Sapele,,,Clinic,No,08000000000",
  ].join("\n"));
  execFileSync(process.execPath, ["scripts/convert-nhfr-csv.mjs", input, output], { stdio: "pipe" });
  const rows = JSON.parse(fs.readFileSync(output, "utf8"));
  assert.equal(rows.length, 1, "rows without coordinates must be skipped");
  assert.equal(rows[0].name, "Test Clinic, Sapele");
  assert.equal(rows[0].state, "Delta");
  assert.equal(rows[0].lga, "Sapele");
  assert.equal(rows[0].lat, 5.9);
  assert.equal(rows[0].lng, 5.67);
  assert.equal(rows[0].facility_level, "Primary Health Centre");
  assert.equal(rows[0].has_maternity, true);
  assert.equal(rows[0].phone, "08012345678");
  assert.equal(rows[0].is_placeholder, false);
  assert.equal(rows[0].verification_status, "unverified");
  console.log("Hospital CSV converter checks passed.");
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}

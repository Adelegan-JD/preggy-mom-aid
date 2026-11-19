#!/usr/bin/env node
/**
 * Convert an NHFR/GRID3-style CSV to data/hospitals.json.
 * Usage: node scripts/convert-nhfr-csv.mjs input.csv [output.json]
 * Review source column mappings and facility records before publishing.
 */
import fs from "node:fs";
import path from "node:path";

const [input, output = "data/hospitals.json"] = process.argv.slice(2);
if (!input) {
  console.error("Usage: node scripts/convert-nhfr-csv.mjs input.csv [output.json]");
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim()); cell = "";
      if (row.some(value => value !== "")) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows.shift().map(value => value.replace(/^\uFEFF/, "").trim().toLowerCase());
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

const first = (record, names) => {
  for (const name of names) if (record[name] !== undefined && record[name] !== "") return record[name];
  return "";
};
const number = value => {
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
};
const maternity = value => {
  const v = String(value).trim().toLowerCase();
  if (["yes", "y", "true", "1", "available"].includes(v)) return true;
  if (["no", "n", "false", "0", "unavailable"].includes(v)) return false;
  return null;
};

const records = parseCsv(fs.readFileSync(input, "utf8")).map((row, index) => {
  const lat = number(first(row, ["lat", "latitude", "gps_latitude", "y"]));
  const lng = number(first(row, ["lng", "lon", "long", "longitude", "gps_longitude", "x"]));
  const name = first(row, ["name", "facility_name", "facilityname", "health_facility_name"]);
  const state = first(row, ["state", "state_name"]);
  const lga = first(row, ["lga", "lga_name", "local_government_area", "district"]);
  if (!name || !state || !lga || lat === null || lng === null || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return {
    name: name.trim(), state: state.trim(), lga: lga.trim(), lat, lng,
    facility_level: first(row, ["facility_level", "facility_type", "level", "ownership_type"]) || "Unclassified",
    has_maternity: maternity(first(row, ["has_maternity", "maternity", "maternity_services", "delivery_services"])),
    phone: first(row, ["phone", "telephone", "phone_number", "contact_phone"]) || null,
    is_placeholder: false,
    source: first(row, ["source", "dataset", "source_name"]) || "Imported CSV — verify against original registry",
  };
}).filter(Boolean);

if (!records.length) {
  console.error("No valid rows found. Expected name, state, LGA, latitude and longitude columns (see script header).");
  process.exit(2);
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(records, null, 2) + "\n");
console.log(`Wrote ${records.length} facility records to ${output}. Verify every record and its maternity status before publishing.`);

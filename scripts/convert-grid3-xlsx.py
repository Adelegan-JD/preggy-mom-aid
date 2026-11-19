#!/usr/bin/env python3
"""Convert the official GRID3 Nigeria health-facility XLSX into a Supabase import CSV.

All source rows are retained, including facilities without GPS coordinates.
Nothing is marked verified or published. GRID3 does not confirm maternity or
emergency-department services, so those fields remain unknown.
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import sys
from collections import Counter
from datetime import date, datetime
from pathlib import Path
from typing import Any

from openpyxl import load_workbook

DATASET = "GRID3_NGA_Health_Facilities_v4_0"
OUTPUT_COLUMNS = [
    "name", "facility_type", "address", "city", "state", "phone",
    "emergency_phone", "website_url", "maternity_services",
    "has_emergency_department", "verification_status",
    "verification_sources", "verified_at", "verified_by", "is_published",
    "source_dataset", "source_facility_id", "lga", "latitude", "longitude",
    "functionality_status", "source_updated_at", "source_attributes",
]
REQUIRED_COLUMNS = {
    "unique_id", "facility_name", "state_standard", "lga_standard",
    "latitude", "longitude", "functional",
}


def clean(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    return str(value).strip()


def as_number(value: Any, minimum: float, maximum: float) -> str:
    if value is None or clean(value) == "":
        return ""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return ""
    if not math.isfinite(number) or not minimum <= number <= maximum:
        return ""
    return format(number, ".8f").rstrip("0").rstrip(".")


def facility_category(raw_type: str, raw_level: str) -> str:
    value = f"{raw_type} {raw_level}".lower()
    if "maternity home" in value or "maternity centre" in value or "maternity center" in value:
        return "maternity_centre"
    if "medical center" in value or "medical centre" in value:
        return "medical_centre"
    if "hospital" in value:
        return "hospital"
    return "clinic"


def functionality(raw: str) -> str:
    value = raw.strip().lower().replace("-", " ").replace("_", " ")
    if value == "functional":
        return "functional"
    if value in {"not functional", "non functional"}:
        return "not_functional"
    if value == "closed":
        return "closed"
    if value in {"unknown", "partially functional", "partial"}:
        return "unknown"
    return "not_reported"


def date_only(value: Any) -> str:
    if value is None or clean(value) == "":
        return ""
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    raw = clean(value)
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).date().isoformat()
    except ValueError:
        return ""


def json_safe_row(row: dict[str, Any]) -> str:
    safe: dict[str, Any] = {}
    for key, value in row.items():
        if value is None or (isinstance(value, float) and math.isnan(value)):
            safe[key] = None
        elif isinstance(value, (datetime, date)):
            safe[key] = value.isoformat()
        elif isinstance(value, float) and not math.isfinite(value):
            safe[key] = None
        else:
            safe[key] = value
    return json.dumps(safe, ensure_ascii=False, separators=(",", ":"), default=str)


def transform(row: dict[str, Any]) -> dict[str, str]:
    name = clean(row.get("facility_name"))
    state = clean(row.get("state_standard"))
    lga = clean(row.get("lga_standard"))
    source_id = clean(row.get("unique_id"))
    if not all((name, state, lga, source_id)):
        raise ValueError("A source row is missing facility name, state, LGA or unique_id")

    ward = clean(row.get("ward_standard"))
    locality = f"Ward {ward}, {lga}, {state}" if ward else f"{lga}, {state}"
    address = f"{locality} (street address not supplied)"
    settlement = clean(row.get("settlement_name")) or lga
    raw_type = clean(row.get("facility_type"))
    raw_level = clean(row.get("facility_level"))
    raw_functional = clean(row.get("functional"))

    return {
        "name": name[:180],
        "facility_type": facility_category(raw_type, raw_level),
        "address": address[:500],
        "city": settlement[:100],
        "state": state[:100],
        "phone": "",
        "emergency_phone": "",
        "website_url": "",
        "maternity_services": "{}",
        "has_emergency_department": "",
        "verification_status": "unverified",
        "verification_sources": '{"GRID3_NGA_Health_Facilities_v4_0"}',
        "verified_at": "",
        "verified_by": "",
        "is_published": "false",
        "source_dataset": DATASET,
        "source_facility_id": source_id,
        "lga": lga,
        "latitude": as_number(row.get("latitude"), -90, 90),
        "longitude": as_number(row.get("longitude"), -180, 180),
        "functionality_status": functionality(raw_functional),
        "source_updated_at": date_only(row.get("date_created")),
        "source_attributes": json_safe_row(row),
    }


def convert(source: Path, destination: Path) -> dict[str, Any]:
    workbook = load_workbook(source, read_only=True, data_only=True)
    try:
        sheet = workbook[workbook.sheetnames[0]]
        iterator = sheet.iter_rows(values_only=True)
        headers = [clean(value).lstrip("\ufeff") for value in next(iterator)]
        missing = sorted(REQUIRED_COLUMNS - set(headers))
        if missing:
            raise ValueError(f"Workbook is missing required GRID3 columns: {', '.join(missing)}")

        destination.parent.mkdir(parents=True, exist_ok=True)
        counts: Counter[str] = Counter()
        seen_ids: set[str] = set()
        total = 0
        with destination.open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=OUTPUT_COLUMNS, extrasaction="ignore")
            writer.writeheader()
            for values in iterator:
                if not any(value is not None and clean(value) for value in values):
                    continue
                total += 1
                source_row = dict(zip(headers, values))
                record = transform(source_row)
                source_id = record["source_facility_id"]
                if source_id in seen_ids:
                    raise ValueError(f"Duplicate GRID3 unique_id detected: {source_id}")
                seen_ids.add(source_id)
                counts[record["functionality_status"]] += 1
                counts["with_coordinates" if record["latitude"] and record["longitude"] else "without_coordinates"] += 1
                writer.writerow(record)

        return {
            "source_rows": total,
            "output_rows": len(seen_ids),
            "with_coordinates": counts["with_coordinates"],
            "without_coordinates": counts["without_coordinates"],
            "functionality": {
                key: counts[key]
                for key in ("functional", "not_functional", "closed", "unknown", "not_reported")
            },
            "all_unverified": True,
            "all_unpublished": True,
            "maternity_services_inferred": False,
            "emergency_services_inferred": False,
            "output": str(destination),
        }
    finally:
        workbook.close()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_xlsx", type=Path)
    parser.add_argument("output_csv", type=Path, nargs="?", default=Path("data/import/grid3-health-facilities.csv"))
    args = parser.parse_args()
    try:
        report = convert(args.input_xlsx, args.output_csv)
    except Exception as error:
        print(f"GRID3 conversion failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps(report, indent=2))
    print("\nImport this CSV into public.health_facilities only after the source and migration have been reviewed.")
    print("Do not publish rows until each facility's location, contact details and services are verified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

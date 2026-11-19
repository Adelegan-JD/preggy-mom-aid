# Nearby hospitals local data

The directory's "Nearby hospitals" panel reads `data/hospitals.json` at build time. It uses the browser's Geolocation API and local Haversine calculations; it does not load a map SDK or call a routing API.

## Import real registry data

1. Download a CSV from the Nigeria Health Facility Registry (NHFR) or GRID3.
2. Run:

```sh
npm run convert:hospitals -- ./path/to/facilities.csv
```

You can choose a different output path:

```sh
node scripts/convert-nhfr-csv.mjs ./facilities.csv ./data/hospitals.json
```

The converter recognises common header aliases for facility name, state, LGA, latitude, longitude, facility level, maternity status and phone. It skips rows missing a name, state, LGA or valid coordinates. Inspect the resulting JSON and compare it with the source registry before committing/deploying.

## Record schema

```json
{
  "name": "Facility name",
  "state": "Delta",
  "lga": "Sapele",
  "lat": 5.9,
  "lng": 5.67,
  "facility_level": "General hospital",
  "has_maternity": null,
  "phone": null,
  "is_placeholder": false,
  "verification_status": "unverified",
  "source": "NHFR download date / source reference"
}
```

Use `has_maternity: true` only when maternity service is confirmed, `false` only when absence is confirmed, and `null` when unknown. Unknown displays "Unverified — Call Ahead".

The five initial Sapele rows in `hospitals.json` are synthetic fixtures with approximate coordinates. They are excluded from production results and cannot open directions or call numbers. In development, enable the fixture checkbox to test the UI. Do not publish fixture records as real facilities.

## Distance behaviour

- 20 km filter is based on straight-line Haversine distance.
- Estimated road distance = straight-line distance × 1.35.
- Estimated drive time = estimated road distance ÷ 30 km/h.
- Results are sorted nearest-first.
- Estimates are not live traffic, verified roads or emergency response times.
- Get Directions hands off to Google Maps using a standard URL; no Google Maps SDK or Directions API is used.

Geolocation requires a secure context (HTTPS or localhost). Manual town/LGA/state search remains available when permission is declined or GPS is unavailable.

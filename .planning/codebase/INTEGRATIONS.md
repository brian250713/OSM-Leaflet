# INTEGRATIONS
_Last updated: 2026-04-29_

## Summary
The application integrates three external services: the Taipei City Government YouBike 2.0 JSON feed for station data, the OpenStreetMap tile CDN for map tiles, and the public OSRM demo server for walking-route calculation. All URLs are hardcoded constants — no environment variables or secrets are required to run the app.

## APIs & External Services

### YouBike 2.0 Station Feed

- **Purpose:** Real-time YouBike station availability data for Taipei
- **URL:** `https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json`
- **Protocol:** HTTPS GET, returns a JSON array of station objects
- **Auth:** None (public endpoint)
- **Polling interval:** Every 2 minutes (managed by `setInterval` in `src/components/MapView.vue`)
- **Client:** Native browser `fetch()` in `src/stores/stationStore.js` (`fetchStations()` action)
- **Key fields consumed:** `sno`, `available_rent_bikes`, `available_return_bikes`, `act`, `updateTime`, station lat/lng

### OpenStreetMap Tile CDN

- **Purpose:** Raster map tiles (base layer)
- **URL template:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Attribution:** Required by ODbL licence — rendered as `© OpenStreetMap contributors`
- **Client:** `L.tileLayer(...)` in `src/components/MapView.vue`
- **Auth:** None (public CDN)

### OSRM Demo Routing Server

- **Purpose:** Walking route calculation between user location and a selected YouBike station
- **URL:** `https://router.project-osrm.org/route/v1`
- **Client:** `L.Routing.control` (Leaflet Routing Machine) in `src/components/MapView.vue` (~line 222)
- **Auth:** None (public demo server)
- **Risk:** This is the OSRM *demo* server — not intended for production use; subject to rate limiting and downtime.

## Browser APIs Used

| API | Purpose | File |
|-----|---------|------|
| `navigator.geolocation.watchPosition` | Live user location tracking and follow-mode | `src/components/MapView.vue` |
| `document.visibilityState` / Page Visibility API | Auto-pause polling when tab is hidden | `src/components/MapView.vue` |
| `fetch` | YouBike JSON fetch | `src/stores/stationStore.js` |

## Data Storage

**Databases:** None

**File Storage:** None — all data is fetched at runtime and held in memory (Pinia store `stationsMap: Map<sno, StationData>`)

**Caching:** None — no service worker, no localStorage, no IndexedDB

## Authentication & Identity

None — the application has no user authentication layer.

## Monitoring & Observability

**Error Tracking:** None (errors logged to `console.error` only)

**Logs:** `console.error` in `fetchStations()` catch block (`src/stores/stationStore.js`)

## CI/CD & Deployment

**Hosting:** GitHub Pages at `https://<user>.github.io/OSM-Leaflet/`

**CI Pipeline:** None — deployment is manual via `npm run deploy`

**Deploy command:** `vite build && gh-pages -d dist` (pushes `dist/` to `gh-pages` branch)

## Environment Configuration

**Required env vars:** None — all external URLs are hardcoded constants.

**`.env` files:** Not present in the repository.

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** None

## Red Flags
- The OSRM routing endpoint (`router.project-osrm.org`) is a public demo server not suitable for production traffic — it can be rate-limited or taken offline without notice. A self-hosted OSRM instance or a paid routing API (e.g., Mapbox, GraphHopper) should be used for any production deployment.
- No request timeout or retry logic on the YouBike `fetch()` call — a slow or failed response will silently drop the update cycle until the next 2-minute interval.
- No CORS proxy or fallback: if the Taipei blob storage endpoint changes its CORS policy, the app will break with no graceful degradation.

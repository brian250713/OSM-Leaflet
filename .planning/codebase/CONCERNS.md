# CONCERNS
_Last updated: 2026-04-29_

## Summary
This is a small single-page Vue 3 + Leaflet app with no test suite and no linter configured. The most pressing concerns are its reliance on the OSRM public demo server for routing (unreliable in production), the `window.startRoute` global pollution pattern required by Leaflet popup HTML, and duplicated colour logic across two components. No TODO/FIXME comments exist in source; all issues are structural.

---

## Technical Debt

**Duplicated station colour logic — MED**
- The `getMarkerColor()` function is defined independently in both `src/components/MapView.vue` (line 58) and `src/components/NearbyPanel.vue` (line 66). The colour constants (`#DC2626`, `#EA580C`, `#65A30D`, `#A8947E`) are also hardcoded in `src/App.vue` inline styles (legend section).
- If thresholds or colours change, all three files must be updated in sync.
- Fix: Extract to `src/utils/colors.js` and import everywhere.

**`window.startRoute` global — MED**
- `src/components/MapView.vue` (line 344) assigns `window.startRoute = startRoute` in `onMounted` and unsets it in `onUnmounted`.
- This is required because popup HTML is built as a raw string (line 100) with `onclick="startRoute(...)"`, which cannot reference a closure directly.
- Risk: any other script on the page can call or overwrite `window.startRoute`; breaks if the component is unmounted while a popup is still open.
- Fix: Use Leaflet's `popup.on('click', ...)` event delegation or render popups via Vue teleport instead of raw HTML strings.

**Raw HTML string injection in popups — MED**
- `buildPopupHTML()` in `src/components/MapView.vue` (line 76) concatenates station data directly into an HTML string: `${name}`, `${station.sarea}`, etc.
- If station names ever contain `<`, `>`, or `"` characters (non-Latin data is common in Taiwanese open data), this would produce malformed or exploitable HTML.
- Fix: Escape values before interpolation, or switch to a DOM-based popup builder.

**Hardcoded map centre and zoom — LOW**
- `src/components/MapView.vue` line 269: `map.setView([25.046, 121.517], 14)` — Taipei coordinates baked in with no config.
- The app is Taipei-only by design, but this makes it non-portable and harder to test.
- Fix: Move to a config constant or environment variable.

**Hardcoded accuracy circle radius — LOW**
- `src/components/MapView.vue` line 305: `radius: 100` is fixed regardless of GPS accuracy. The `GeolocationCoordinates.accuracy` property (metres) is available in the `coords` object but is ignored.
- Fix: Use `coords.accuracy` as the circle radius.

**No polling error recovery / back-off — LOW**
- `src/stores/stationStore.js` (line 39): fetch errors are caught and logged, but the 2-minute `setInterval` in `MapView.vue` (line 256) continues without any back-off or user notification. Repeated failures are silent.
- Fix: Track consecutive error count; show a toast/banner after N failures.

**`onVisibilityChange` re-registration risk — LOW**
- `src/components/MapView.vue` line 357: `onVisibilityChange` calls `startInterval()` on tab re-focus which always calls `setInterval`. If `clearInterval` in the hidden branch somehow fails (e.g., race condition with a slow fetch), two intervals could run simultaneously.
- Fix: Guard `startInterval()` with a null-check: `if (!intervalId) startInterval()`.

**No linter or formatter configured — LOW**
- `package.json` contains no ESLint, Prettier, or Biome dependency. Code style is enforced only by convention.
- Fix: Add `eslint` + `@eslint/js` + `eslint-plugin-vue` and a `.prettierrc`.

---

## Security Concerns

**Unescaped station data in popup HTML — MED**
- As noted above, `buildPopupHTML()` in `src/components/MapView.vue` interpolates `station.sna` and `station.sarea` directly into an HTML string without sanitisation. The YouBike API is a trusted government source today, but supply-chain compromise or API spoofing could inject arbitrary HTML/JS into the popup.
- Mitigation: sanitise with `textContent` assignment or a small escape utility before interpolation.

**`window.startRoute` global — LOW**
- Exposes the routing function to any third-party script loaded on the page (e.g., ads, analytics injected by browser extensions). An attacker with script execution could call `window.startRoute(lat, lng)` to manipulate the displayed route.

---

## Scalability Concerns

**OSRM public demo server — HIGH**
- `src/components/MapView.vue` line 222: `serviceUrl: 'https://router.project-osrm.org/route/v1'` is the OSRM project's own demo instance. It is rate-limited, has no SLA, and is explicitly not intended for production use per OSRM documentation.
- If this app gains real users, routing requests will be throttled or blocked.
- Fix: Self-host OSRM, or replace with a commercial provider (Google Directions, Mapbox Directions, HERE Routing).

**Full dataset rebuild on every poll — MED**
- `src/stores/stationStore.js` (line 25): every 2-minute fetch creates a brand-new `Map` from the full JSON (~500+ stations), then runs `diffUpdate()` over the entire old map.
- At current Taipei scale (~1,500 stations) this is negligible. If the API expanded to a multi-city dataset, the O(n) diff would become noticeable on low-end devices.

**Supercluster rebuilt in full on every poll — MED**
- `src/components/MapView.vue` (line 246): after every refresh, `loadSupercluster()` discards and rebuilds the entire R-tree index from all stations. Supercluster does not support incremental updates, so this is unavoidable with the current library, but it means ~1,500 GeoJSON feature objects are allocated every 2 minutes.

**No request deduplication or cancellation — LOW**
- `fetchStations()` in `src/stores/stationStore.js` does not use `AbortController`. If a fetch takes longer than 2 minutes (slow network), a second interval tick could fire and overlap with the first, resulting in two concurrent writes to `stationsMap`.

**API endpoint is a public Azure Blob URL — LOW**
- `src/stores/stationStore.js` line 4: the API URL (`tcgbusfs.blob.core.windows.net`) is a public static blob. There is no API key, authentication, or CORS restriction. This is intentional for open data, but means the endpoint could change without notice and the app would silently stop updating.

---

## Known TODOs / FIXMEs

None found. No `TODO`, `FIXME`, `HACK`, or `XXX` comments exist anywhere in `src/`.

---

## Red Flags

**OSRM demo server in production** (`src/components/MapView.vue` line 222) — The routing feature is non-functional at any meaningful traffic level. This is the single highest-priority concern if the app is intended for real users.

**No test suite** — `package.json` has no test runner. There are zero test files in the repository. Any refactor of the store diff logic, clustering, or colour thresholds carries undetected regression risk.

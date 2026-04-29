# ARCHITECTURE
_Last updated: 2026-04-29_

## Summary

A single-page Vue 3 + Pinia app that renders real-time YouBike 2.0 station data on a Leaflet/OpenStreetMap base. Vue owns reactive UI state while Leaflet owns the map imperatively — markers are never rendered through Vue's virtual DOM. The core efficiency mechanism is a diff-based update cycle that only redraws mutated markers, combined with a Supercluster R-tree that renders only markers visible in the current viewport.

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        App.vue (root)                        │
│  stacks MapView + FilterControl overlay + legend + NearbyPanel│
└────┬────────────────┬────────────────────────┬───────────────┘
     │                │                        │
     ▼                ▼                        ▼
┌─────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│Filter   │  │   MapView.vue    │  │     NearbyPanel.vue      │
│Control  │  │ (all Leaflet)    │  │  (bottom slide-up panel) │
│.vue     │  │`src/components/  │  │`src/components/          │
│(toggle) │  │ MapView.vue`     │  │ NearbyPanel.vue`         │
└────┬────┘  └────────┬─────────┘  └───────────┬──────────────┘
     │                │                        │
     └────────────────┼────────────────────────┘
                      ▼
          ┌───────────────────────┐
          │   stationStore.js     │
          │   (Pinia store)       │
          │ `src/stores/          │
          │  stationStore.js`     │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │  YouBike 2.0 API      │
          │  (Taipei City blob)   │
          │  fetch every 2 min    │
          └───────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App.vue` | Root container; composes all components and colour legend | `src/App.vue` |
| `MapView.vue` | All Leaflet logic: map init, markers, clustering, geolocation, follow-mode, routing, Page Visibility pause | `src/components/MapView.vue` |
| `NearbyPanel.vue` | Bottom slide-up panel; computes 5 nearest stations with bikes via haversine; triggers `store.flyTo()` | `src/components/NearbyPanel.vue` |
| `FilterControl.vue` | Checkbox toggle bound directly to `store.filterHasNoBikes` | `src/components/FilterControl.vue` |
| `stationStore.js` | Pinia store: fetches API, holds `stationsMap`, runs `diffUpdate()`, exposes `flyTo(sno)` | `src/stores/stationStore.js` |
| `geo.js` | Pure utility: haversine distance formula | `src/utils/geo.js` |

## Pattern Overview

**Overall:** Imperative map + reactive state bridge

**Key Characteristics:**
- Vue reactive state lives in Pinia; Leaflet state lives in module-scope variables inside `MapView.vue`
- Markers are `L.Marker` with `L.divIcon` (SVG gear icons) — never Vue components
- Watchers in `MapView.vue` bridge the two worlds: `watch(() => store.filterHasNoBikes, ...)` and `watch(() => store.targetSno, ...)`
- No two-way binding between Leaflet and Vue — communication is one-directional (store → watcher → Leaflet imperative call)

## Layers

**Pinia Store Layer:**
- Purpose: Single source of truth for station data and UI state flags
- Location: `src/stores/stationStore.js`
- Contains: `stationsMap` (Map<sno, StationData>), `userLocation`, `filterHasNoBikes`, `lastUpdateTime`, `isLoading`, `changedCount`, `targetSno`
- Depends on: YouBike 2.0 REST API
- Used by: All three Vue components

**Map/Rendering Layer:**
- Purpose: Imperative Leaflet management; completely owns all map objects
- Location: `src/components/MapView.vue`
- Contains: Module-scope `map`, `markersLayer`, `markersMap`, `clusterMap`, `superclusterIndex`, `userMarker`, `routingControl`, `followMode`
- Depends on: `stationStore`, `leaflet`, `leaflet-routing-machine`, `supercluster`
- Used by: Nothing (leaf node)

**UI Panel Layer:**
- Purpose: Reactive Vue UI panels that read store state and dispatch store actions
- Location: `src/components/NearbyPanel.vue`, `src/components/FilterControl.vue`
- Contains: Computed properties, refs, store bindings
- Depends on: `stationStore`, `geo.js` (NearbyPanel only)
- Used by: `App.vue`

**Utility Layer:**
- Purpose: Pure, framework-agnostic helper functions
- Location: `src/utils/geo.js`
- Contains: `haversineDistance(lat1, lng1, lat2, lng2)` returning metres
- Depends on: Nothing
- Used by: `NearbyPanel.vue`

## Data Flow

### Primary Request Path (API → Map)

1. `stationStore.fetchStations()` — fetches YouBike JSON blob, builds `newMap` (`src/stores/stationStore.js:18`)
2. `diffUpdate(newMap)` — computes `{ added, changed, removed }` sets by comparing `available_rent_bikes` and `available_return_bikes` (`src/stores/stationStore.js:48`)
3. `this.stationsMap = newMap` — Pinia reactive state updated (`src/stores/stationStore.js:35`)
4. `loadSupercluster(store.stationsMap)` — rebuilds Supercluster R-tree index from all station points (`src/components/MapView.vue:190`)
5. `renderVisibleMarkers()` — queries viewport bbox from Supercluster, adds/removes only markers in view (`src/components/MapView.vue:130`)
6. `updateMarker(sno, station)` — applied only to `diff.changed` SNOs to refresh icon and popup (`src/components/MapView.vue:117`)

### Filter Toggle Path

1. User checks/unchecks `FilterControl.vue` checkbox — bound directly to `store.filterHasNoBikes`
2. `watch(() => store.filterHasNoBikes, ...)` fires in `MapView.vue` (`src/components/MapView.vue:374`)
3. All current markers cleared from `markersMap`; `renderVisibleMarkers()` redraws with new filter applied

### NearbyPanel → Map FlyTo Path

1. User clicks station row in `NearbyPanel.vue` → `store.flyTo(sno)` sets `store.targetSno` (`src/components/NearbyPanel.vue:30`)
2. `watch(() => store.targetSno, ...)` fires in `MapView.vue` (`src/components/MapView.vue:385`)
3. `map.flyTo(...)` at zoom 17; after 700ms timeout, `addMarker()` and `openPopup()` called

### Geolocation / Follow-Mode Path

1. `navigator.geolocation.watchPosition()` starts on mount in `MapView.vue`
2. Each position fix: `store.setUserLocation(lat, lng)` updates store; `userMarker` position updated imperatively
3. `followMode = true` on first fix; `map.panTo()` on each subsequent fix while active
4. `map.on('dragstart')` sets `followMode = false`; custom LocateControl re-enables it

### Auto-Refresh / Page Visibility Path

1. `setInterval` every 120 000ms calls `store.fetchStations()` → diff → re-render (`src/components/MapView.vue:243`)
2. `document.visibilitychange` (`hidden`) clears interval; (`visible`) immediately refetches and restarts interval (`src/components/MapView.vue:356`)

## Key Abstractions

**stationsMap (Map<sno, StationData>):**
- Purpose: Primary data structure; keyed by station number string
- Location: `src/stores/stationStore.js:8`
- Pattern: Native JS `Map` — not a reactive array; replaced atomically on each fetch

**markersMap (Map<sno, L.Marker>):**
- Purpose: Tracks live Leaflet marker objects for individual stations
- Location: Module-scope in `src/components/MapView.vue:17`
- Pattern: Manually kept in sync with what is visually on the map

**clusterMap (Map<clusterId, L.CircleMarker>):**
- Purpose: Tracks live Leaflet circle markers for Supercluster aggregate points
- Location: Module-scope in `src/components/MapView.vue:18`
- Pattern: IDs are Supercluster-generated integers; cleared on zoom/move when cluster leaves view

**superclusterIndex (Supercluster):**
- Purpose: R-tree spatial index for viewport-bounded cluster queries
- Location: Module-scope in `src/components/MapView.vue:19`
- Config: `radius: 60`, `maxZoom: 16`

## Entry Points

**App Bootstrap:**
- Location: `src/main.js`
- Triggers: Browser loads `index.html` → Vite serves `main.js` → mounts Vue app with Pinia

**Map Initialization:**
- Location: `onMounted()` in `src/components/MapView.vue:260`
- Responsibilities: Creates `L.map`, tile layer, `markersLayer`, zoom control, locate control, geolocation watcher, initial fetch, auto-refresh interval

## Architectural Constraints

- **Global state pollution:** `window.startRoute = startRoute` is set on mount and cleared on unmount (`src/components/MapView.vue:344`). Required because routing button is rendered via raw popup HTML with an `onclick` attribute that cannot close over Vue scope.
- **No Vue reactivity for Leaflet objects:** `map`, `markersMap`, `clusterMap`, `superclusterIndex` are plain `let`/`const` variables — deliberately NOT `ref()` or `reactive()` to avoid Vue intercepting Leaflet's internal mutations.
- **Colour logic duplicated:** `getMarkerColor()` exists in both `MapView.vue:58` and `NearbyPanel.vue:66` with identical thresholds. Not shared via a utility.
- **Single store, no modules:** All station state in one flat Pinia store. Acceptable at current scale.
- **No TypeScript:** All files are `.js` / `.vue` with no type annotations.

## Anti-Patterns

### Duplicated colour logic

**What happens:** `getMarkerColor` / `markerColor` functions with identical threshold logic appear in both `src/components/MapView.vue:58` and `src/components/NearbyPanel.vue:66`.
**Why it's wrong:** Changing a threshold (e.g. "low bikes" cutoff from 5 to 3) requires editing two files; they can silently diverge.
**Do this instead:** Extract to `src/utils/markerColor.js` and import in both components.

### `window.startRoute` global

**What happens:** `startRoute` is attached to `window` so Leaflet popup raw HTML `onclick` can call it (`src/components/MapView.vue:344`).
**Why it's wrong:** Pollutes global scope; breaks if two map instances ever coexist; not cleaned up on error paths.
**Do this instead:** Use a Leaflet `DomEvent.on` listener attached after popup open (listen to `popupopen` event), or render the button via a Vue portal.

## Error Handling

**Strategy:** Silent fail with console.error for API errors; `alert()` for user-facing routing errors.

**Patterns:**
- `fetchStations()` wraps fetch in try/catch, logs error, returns `null` — callers check for null before proceeding (`src/stores/stationStore.js:39`)
- `routingControl.on('routingerror')` removes the control and shows `alert()` (`src/components/MapView.vue:232`)
- Geolocation `onError` callback only updates the button CSS state — no user notification (`src/components/MapView.vue:321`)

## Cross-Cutting Concerns

**Logging:** `console.error` only on fetch failure. No structured logging.
**Validation:** None — API response is consumed without schema validation.
**Authentication:** None — all data is public (YouBike open API + OSM tiles).

## Red Flags

- **Colour logic duplication** (`MapView.vue:58` and `NearbyPanel.vue:66`) — risk of threshold drift.
- **`window.startRoute` global** — fragile coupling between Leaflet popup HTML and Vue component scope.
- **No error feedback to user on geolocation failure** — `onError` silently changes button state only.
- **Supercluster fully rebuilt on every poll** — `loadSupercluster()` creates a new index from all stations every 2 minutes regardless of diff size; for large station sets this could be slow.
- **`alert()` calls** in `startRoute` and routing error handler — blocks UI thread; should use a toast/modal.

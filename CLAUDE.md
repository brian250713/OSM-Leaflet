# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server at http://localhost:5173/OSM-Leaflet/
npm run build     # Build for production
npm run deploy    # Build + deploy to GitHub Pages (vite build && gh-pages -d dist)
npm run preview   # Preview production build locally
```

There is no test suite or linter configured.

## Architecture

This is a single-page Vue 3 + Vite + Pinia app that displays real-time YouBike 2.0 station data on an OpenStreetMap/Leaflet map.

**Key design principle:** Vue owns UI state; Leaflet owns the map imperatively. Markers are never rendered through Vue's vDOM — all Leaflet objects are managed in module-scope variables inside `MapView.vue`.

### Data flow

1. `stationStore` fetches the Taipei YouBike API every 2 minutes and stores stations in `Map<sno, StationData>` (`stationsMap`).
2. `diffUpdate()` computes `{ added, changed, removed }` sets so only mutated markers are redrawn — not the entire layer.
3. `MapView.vue` holds the Supercluster R-tree index (`superclusterIndex`) and two Maps of live Leaflet objects (`markersMap: sno→CircleMarker`, `clusterMap: id→CircleMarker`). On every `moveend`/`zoomend`, `renderVisibleMarkers()` queries the viewport bbox and only adds/removes markers that entered or left the view.

### Component layout

- `App.vue` — root container; stacks `MapView`, `FilterControl` (top overlay), a colour legend, and `NearbyPanel`.
- `MapView.vue` — all Leaflet logic: map init, geolocation (`watchPosition`), follow-mode, clustering, routing (LRM + OSRM demo server `router.project-osrm.org`), Page Visibility API auto-pause, and the "relocate" custom control.
- `NearbyPanel.vue` — bottom slide-up panel; computes the 5 nearest stations with available bikes using `haversineDistance`; triggers `store.flyTo(sno)` which `MapView` watches to pan and open that station's popup.
- `FilterControl.vue` — checkbox that toggles `store.filterHasNoBikes`; `MapView` watches this and triggers a full marker re-render.

### Routing

Walking routes are drawn by `L.Routing.control` (Leaflet Routing Machine). The "導航過來" button is rendered inside a Leaflet popup via raw HTML, so `startRoute` is exposed on `window` to allow the `onclick` attribute to reach the function.

### Station colour logic (duplicated in MapView and NearbyPanel)

| Condition | Colour |
|-----------|--------|
| `act !== '1'` (disabled) | `#a0aec0` grey |
| `available_rent_bikes === 0` | `#e53e3e` red |
| 1–4 bikes | `#ed8936` orange |
| ≥ 5 bikes | `#38a169` green |

### Vite base path

`vite.config.js` sets `base: '/OSM-Leaflet/'` for GitHub Pages deployment. The dev server URL is therefore `http://localhost:5173/OSM-Leaflet/`.

# Proposal: Gear, Compass & Taiwan Basemap

## Why

Station and user-location markers are plain circles that feel generic and clash with the steampunk UI introduced in the previous change. Replacing them with thematic SVG shapes (gear for stations, compass rose for user position) completes the steampunk aesthetic. Additionally, switching the basemap to the Taiwan General Electronic Map (grayscale) provides an authoritative, locally-accurate tile layer that fits the desaturated steampunk palette better than Stamen Toner.

## What Changes

- Station markers: replace `L.circleMarker` (canvas layer) with `L.divIcon` containing an inline SVG gear, colored by bike-availability status using the steampunk palette already in `--sp-*` CSS variables.
- Cluster markers: unchanged (remain `L.circleMarker`; clusters are aggregate, not individual stations).
- User-location marker: replace the blue pulsing circle (`user-dot` + `user-pulse`) with an SVG compass rose in brass (`#cd9b1d`). Pulse animation kept on the surrounding ring.
- Color values in specs updated to match the steampunk palette already live in `style.css`.
- Basemap: replace Stamen Toner with 臺灣通用電子地圖 WMTS (NLSC) + CSS `grayscale(1)` filter. No API key required.

## Capabilities

### New Capabilities

None — no new user-facing feature is introduced.

### Modified Capabilities

- `station-marker`: Shape changes from `L.CircleMarker` to `L.divIcon` SVG gear; status colors updated to steampunk palette (`#4a7c4e` / `#c4611a` / `#8b2020` / `#5c5c5c`); `setStyle()` in-place update replaced by `setIcon()`.
- `user-location`: Marker visual changes from blue pulsing circle to brass compass rose SVG; pulse ring retained; no behavioral change.
- `map-display`: Basemap tile URL and attribution change; CSS grayscale filter added.

## Impact

- `src/components/MapView.vue`: `addMarker()`, `updateMarker()`, geolocation icon creation, and CSS class `user-dot`.
- `src/style.css`: Remove `.user-dot` / `.user-pulse` rules; add `.sp-station-marker` and `.sp-compass` rules; add `.sp-user-pulse` ring; add `grayscale(1)` filter on `.sp-map-tiles`.
- No new npm dependencies.
- No API, routing, or data-layer changes.
- Attribution must credit 內政部國土測繪中心.

# Design: Gear, Compass & Taiwan Basemap

## Context

Station markers currently use `L.circleMarker` — a Leaflet SVG canvas primitive. It is fast because it lives on a shared canvas element, not the DOM. Switching to `L.divIcon` creates one DOM element per visible marker, but `renderVisibleMarkers()` already limits the visible set to the viewport, so DOM count stays bounded in practice.

The user-location marker already uses `L.divIcon` (`.user-dot` + `.user-pulse`), so the compass rose is a drop-in swap with no architectural change.

The current basemap is Stamen Toner (via Stadia Maps). Switching to NLSC WMTS requires a URL format change and a CSS grayscale filter.

## Goals / Non-Goals

**Goals:**
- Gear SVG replaces circle for station markers; colored by bike status using the steampunk palette
- Compass rose SVG replaces blue pulsing dot for user location; pulse ring retained
- Spec colors updated to steampunk palette to match live code

**Non-Goals:**
- Cluster markers — remain `L.circleMarker` (aggregate count, not individual identity)
- Gear rotation animation on station markers (too noisy; FilterControl gear rotates on toggle)
- Compass rose rotation with device heading (no `DeviceOrientationEvent` in this app)
- Responsive icon sizing based on zoom level

## Decisions

### D1 — divIcon for stations (not custom canvas renderer)

**Chosen:** `L.divIcon` with inline SVG.  
**Alternative:** Custom `L.Canvas` renderer with a gear path — keeps canvas speed but requires implementing Leaflet's internal `_updateCircle`-like methods, significantly more complex.  
**Rationale:** Viewport-limited rendering keeps DOM count low (~20–50 markers at typical zoom). Inline SVG is readable, maintainable, and reuses the same gear path already in `FilterControl.vue`. Not worth the canvas renderer complexity.

### D2 — SVG gear path reused from FilterControl

Same Material Design gear path already in the codebase. No new assets.  
Icon size: **28×28px**, `iconAnchor: [14, 14]` (centered).  
`currentColor` trick: set `color` on the wrapper div, SVG `fill="currentColor"` — color change via `setIcon()` with a new html string.

### D3 — `setIcon()` for marker color updates

`L.circleMarker` used `setStyle({ fillColor })`. `L.divIcon` has no `setStyle`; color is baked into the HTML string.  
**Chosen:** `updateMarker()` calls `m.setIcon(L.divIcon({ html: gearHtml(color) }))`.  
**Rationale:** Simplest approach; divIcon already rebuilds the DOM on `setIcon`. Performance acceptable because `updateMarker` only fires for stations that actually changed (diff-based update).

### D4 — Compass rose: 4-point SVG star

```
points="12,1 14.5,9.5 23,12 14.5,14.5 12,23 9.5,14.5 1,12 9.5,9.5"
```
Fill: `#cd9b1d` (brass). Center dot: `#2c1810` (mahogany).  
Pulse ring: keep existing `.user-pulse` CSS animation, restyled to brass border.  
Icon size: **32×32px**, `iconAnchor: [16, 16]`.

### D5 — CSS-only for station inactive state

Disabled stations (`act !== '1'`) currently get `#a0aec0` (old grey) → update to `#5c5c5c` (worn iron). Already done in code; spec delta captures this.

### D6 — Taiwan basemap: NLSC WMTS + CSS grayscale

**Tile URL:**
```
https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}
```
Note: NLSC WMTS uses `{z}/{y}/{x}` order (TileRow/TileCol), opposite of OSM's `{z}/{x}/{y}`. Leaflet accepts this directly.

**Grayscale approach:** `L.tileLayer(url, { className: 'sp-map-tiles', ... })` + CSS `filter: grayscale(1) brightness(0.92)` on `.sp-map-tiles`. Avoids a server-side grayscale tile layer; one CSS rule.

**Alternative considered:** Stamen Toner (current) — already B&W, no filter needed. Rejected because Taiwan data coverage and road accuracy is poor outside cities; NLSC is authoritative for Taiwan.

**Alternative considered:** WMTS grayscale-specific layer from NLSC (e.g., EMAP5) — layer availability unconfirmed; CSS filter is simpler and more maintainable.

**Attribution:** `© <a href="https://maps.nlsc.gov.tw/">內政部國土測繪中心</a>`

## Risks / Trade-offs

- **NLSC WMTS availability** → Government tile server; may have downtime or rate limiting. Mitigation: no fallback needed for a demo app; worst case tiles fail to load gracefully (Leaflet shows empty tiles, not an error).
- **DOM marker performance at very high zoom** → User zoomed to see 100+ individual stations would have 100+ DOM elements. Acceptable; modern browsers handle hundreds of simple divs easily. Cluster kicks in at lower zooms.
- **divIcon rebuilds on `setIcon()`** → Minor flicker possible on rapid API updates. Already the case for the popup HTML; same diff-gating applies.
- **Gear readability at 28px** → Teeth are visible but fine. 24px would be marginal. 28px confirmed adequate in explore discussion.

## Migration Plan

Pure visual swap — no data model or API changes. No rollback needed beyond reverting the two files (`MapView.vue`, `style.css`). Deploy via existing `npm run deploy`.

## Open Questions

None — all decisions resolved in explore session.

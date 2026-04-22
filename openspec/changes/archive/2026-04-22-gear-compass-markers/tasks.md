## 1. Station Gear Marker — MapView.vue

- [x] 1.1 Add `gearHtml(color)` helper that returns a divIcon `html` string with the gear SVG path, `fill="currentColor"`, and the given color set on the wrapper div
- [x] 1.2 Rewrite `addMarker()`: replace `L.circleMarker` with `L.marker([lat, lng], { icon: L.divIcon({ className: '', html: gearHtml(color), iconSize: [28,28], iconAnchor: [14,14] }) })`
- [x] 1.3 Rewrite `updateMarker()`: replace `m.setStyle(...)` with `m.setIcon(L.divIcon({ className: '', html: gearHtml(newColor), iconSize: [28,28], iconAnchor: [14,14] }))`
- [x] 1.4 Remove `markersMap` type comment reference to `CircleMarker` → update to `Marker (divIcon)`

## 2. Compass Rose User Marker — MapView.vue

- [x] 2.1 Add `compassHtml` constant: 4-point star SVG, fill `#cd9b1d`, center dot `#2c1810`, 32×32px viewBox
- [x] 2.2 Replace the `user-dot` + `user-pulse` divIcon html in `onPosition` first-fix block with `compassHtml` + a `sp-user-pulse` wrapper div
- [x] 2.3 Update `iconSize` to `[32, 32]` and `iconAnchor` to `[16, 16]`

## 3. Basemap — MapView.vue + style.css

- [x] 3.1 Replace tile URL with `https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}` and add `className: 'sp-map-tiles'`
- [x] 3.2 Update attribution string to `© <a href="https://maps.nlsc.gov.tw/">內政部國土測繪中心</a>`
- [x] 3.3 Add `.sp-map-tiles { filter: grayscale(1) brightness(0.92); }` to style.css

## 4. CSS — style.css

- [x] 4.1 Remove `.user-dot` rule
- [x] 4.2 Rename / rewrite `.user-pulse` → `.sp-user-pulse`: change border color from blue to `var(--sp-brass)` (`#cd9b1d`), keep keyframe animation
- [x] 4.3 Add `.sp-station-marker` wrapper style if needed (e.g., `display:flex; align-items:center; justify-content:center`)

## 5. Verify in browser

- [x] 5.1 Run dev server; confirm Taiwan basemap loads with grayscale filter
- [x] 5.2 Confirm gear icons appear with correct status colors (green/orange/red/grey)
- [x] 5.3 Enable geolocation; confirm brass compass rose appears with pulse ring
- [x] 5.4 Trigger station data refresh; confirm gear color updates in place without flicker
- [x] 5.5 Check mobile touch target: tap gear marker opens popup correctly

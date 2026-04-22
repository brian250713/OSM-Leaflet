# Proposal: Steampunk UI — Victorian Brass Light Theme

## Summary

Redesign the YouBike map UI from modern flat design to a Victorian-adventure steampunk aesthetic. CSS-only changes — zero logic changes. One tile URL change.

## Goals

- Warm Victorian steampunk feel: brass, leather, aged parchment, candlelight
- Station status semantics preserved (green/orange/red → patina/furnace/rust)
- Lightweight scope: palette + typography + border style only
- Map tiles → Stamen Toner (B&W vintage print map feel)

## Non-goals

- SVG gear icons or decorative illustrations
- Texture image assets
- Mechanical animations (gear spin, etc.)
- JS logic changes
- Layout restructure

## Design Decisions

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--sp-parchment` | `#f0d9a0` | Panel backgrounds |
| `--sp-parchment-dark` | `#e8d4a0` | Gradient end |
| `--sp-brass` | `#cd9b1d` | Accent, bright brass |
| `--sp-brass-dark` | `#8b6914` | Borders, shadows |
| `--sp-mahogany` | `#2c1810` | Text primary |
| `--sp-leather` | `#7a5c3a` | Text secondary |
| `--sp-panel-dark` | `#2c1a0e` | NearbyPanel background |

### Station Status Colors

| State | Old | New |
|---|---|---|
| ≥5 bikes | `#38a169` green | `#4a7c4e` copper patina |
| 1–4 bikes | `#ed8936` orange | `#c4611a` furnace orange |
| 0 bikes | `#e53e3e` red | `#8b2020` iron rust |
| disabled | `#a0aec0` grey | `#5c5c5c` worn iron |

### Typography

- Heading/title: **Cinzel** (Google Fonts — Roman inscription style)
- Body/label: **Crimson Text** (Google Fonts — Victorian book style)
- Loaded via `<link>` in `index.html`

### Map Tile

Stamen Toner via Stadia Maps:
```
https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png
```
No API key required for basic use.

### Panel Aesthetics

- Border radius: 4–6px (down from 10–16px, more angular/mechanical)
- Borders: `2px solid #8b6914`
- Box-shadow: warm brown + inset top highlight (simulates metal reflection)
- NearbyPanel: dark mahogany bg (`#2c1a0e`), brass handle bar
- Filter/Legend: parchment gradient bg

## Files Changed

| File | Change |
|---|---|
| `index.html` | Add Google Fonts `<link>` |
| `src/style.css` | Full palette + typography + border redesign |
| `src/components/MapView.vue` | Tile URL only (1 line) |

# STACK
_Last updated: 2026-04-29_

## Summary
This is a Vue 3 single-page application built with Vite that displays real-time YouBike 2.0 station data on an interactive Leaflet map. The project uses Pinia for state management and Supercluster for efficient marker clustering. It is deployed to GitHub Pages via the `gh-pages` npm package.

## Languages

**Primary:**
- JavaScript (ES Modules) — all source files in `src/`

**Templates:**
- Vue SFC (`.vue`) — `src/App.vue`, `src/components/MapView.vue`, `src/components/NearbyPanel.vue`, `src/components/FilterControl.vue`

## Runtime

**Environment:**
- Node.js (version not pinned — no `.nvmrc` or `.node-version` present)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks & Libraries

**Core UI:**
- `vue` ^3.4.0 — component framework, Composition API (`<script setup>`)

**State Management:**
- `pinia` ^2.1.7 — store at `src/stores/stationStore.js`

**Mapping:**
- `leaflet` ^1.9.4 — interactive map rendering, markers, controls
- `leaflet-routing-machine` ^3.2.12 — walking route overlay via LRM

**Clustering:**
- `supercluster` ^8.0.1 — R-tree spatial index for viewport-aware marker clustering; instance held in module scope inside `src/components/MapView.vue`

## Build & Dev Tools

**Bundler:**
- `vite` ^5.0.0
- Config: `vite.config.js` — sets `base: '/OSM-Leaflet/'` for GitHub Pages sub-path

**Vue Plugin:**
- `@vitejs/plugin-vue` ^5.0.0 — SFC compilation

**Deployment:**
- `gh-pages` ^6.1.1 — `npm run deploy` runs `vite build && gh-pages -d dist`

## Scripts

```bash
npm run dev      # Dev server at http://localhost:5173/OSM-Leaflet/
npm run build    # Production build → dist/
npm run preview  # Preview dist/ locally
npm run deploy   # Build + push dist/ to GitHub Pages
```

## Configuration

**Build base path:** `/OSM-Leaflet/` (set in `vite.config.js`)

**No linter or formatter configured** — no `.eslintrc*`, `.prettierrc*`, or `biome.json` detected.

**No test framework configured** — no `jest.config.*` or `vitest.config.*` detected.

**Environment variables:** No `.env` files present; no `import.meta.env` references found in source.

## Red Flags
- No Node.js version pinned (no `.nvmrc`), so `npm install` may behave differently across machines.
- No linter or formatter configured — code style is enforced only by convention.
- No test suite present — zero automated test coverage.
- `gh-pages` deploy script has no pre-deploy checks (no lint, no test gate).

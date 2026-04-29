# STRUCTURE
_Last updated: 2026-04-29_

## Summary

A small, flat project with five source files under `src/`. There are no subdirectories beyond `components/`, `stores/`, and `utils/`. Config, build output, and planning documents sit at the project root. The structure follows standard Vue 3 + Vite conventions without enforced module boundaries.

## Directory Layout

```
OSM-Leaflet/
├── src/
│   ├── main.js                  # App bootstrap: createApp + Pinia + mount
│   ├── App.vue                  # Root component; composes all child components
│   ├── style.css                # Global styles (Claymorphism warm-orange theme)
│   ├── components/
│   │   ├── MapView.vue          # All Leaflet map logic (imperative, ~397 lines)
│   │   ├── NearbyPanel.vue      # Bottom slide-up nearest-stations panel
│   │   └── FilterControl.vue    # Top-overlay filter toggle checkbox
│   ├── stores/
│   │   └── stationStore.js      # Pinia store: API fetch, diff, flyTo state
│   └── utils/
│       └── geo.js               # haversineDistance() pure utility
├── public/                      # Static assets served at root (Vite default)
├── dist/                        # Build output (generated, not committed)
├── .planning/
│   └── codebase/                # GSD codebase map documents
├── .claude/
│   ├── commands/                # Claude slash commands
│   ├── memory/                  # Persistent Claude memory files
│   ├── skills/                  # Project skill definitions
│   └── settings.json
├── index.html                   # Vite HTML entry point
├── vite.config.js               # Vite config (base: '/OSM-Leaflet/')
├── package.json                 # Dependencies and scripts
└── CLAUDE.md                    # Claude Code project instructions
```

## Directory Purposes

**`src/components/`:**
- Purpose: Vue single-file components (SFCs)
- Contains: All `.vue` files — UI components only, no business logic
- Key files: `MapView.vue` (largest file, all Leaflet), `NearbyPanel.vue`, `FilterControl.vue`

**`src/stores/`:**
- Purpose: Pinia store definitions
- Contains: `stationStore.js` — the only store; holds all shared application state
- Key files: `src/stores/stationStore.js`

**`src/utils/`:**
- Purpose: Pure, framework-agnostic helper functions
- Contains: `geo.js` with `haversineDistance`
- Key files: `src/utils/geo.js`

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents consumed by planning and execution agents
- Generated: By `/gsd-map-codebase` command
- Committed: Yes

**`.claude/`:**
- Purpose: Claude Code project configuration, memory, and skills
- Generated: Partially (settings files manual; skills committed)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `index.html`: Vite HTML shell; references `src/main.js`
- `src/main.js`: Creates Vue app, installs Pinia, mounts to `#app`

**Configuration:**
- `vite.config.js`: Sets `base: '/OSM-Leaflet/'` for GitHub Pages; registers `@vitejs/plugin-vue`
- `package.json`: Dependency manifest and npm scripts

**Core Logic:**
- `src/stores/stationStore.js`: API fetch, diff computation, all reactive state
- `src/components/MapView.vue`: All Leaflet imperative logic, clustering, geolocation, routing

**Styles:**
- `src/style.css`: Global CSS — Claymorphism warm-orange theme, popup styles, marker CSS
- Inline styles also used inside `buildPopupHTML()` in `MapView.vue`

## Naming Conventions

**Files:**
- Vue components: PascalCase (e.g., `MapView.vue`, `NearbyPanel.vue`, `FilterControl.vue`)
- JS modules: camelCase (e.g., `stationStore.js`, `geo.js`)
- Config files: lowercase with dots (e.g., `vite.config.js`)

**Directories:**
- All lowercase, plural where applicable (`components/`, `stores/`, `utils/`)

**Variables:**
- Store state keys: camelCase (`stationsMap`, `filterHasNoBikes`, `lastUpdateTime`)
- Leaflet module-scope vars: camelCase (`markersMap`, `clusterMap`, `superclusterIndex`, `routingControl`)
- CSS classes: kebab-case (`yb-popup`, `locate-btn-active`, `sp-station-marker`)

**Functions:**
- camelCase verbs (`fetchStations`, `diffUpdate`, `renderVisibleMarkers`, `loadSupercluster`, `buildPopupHTML`, `getMarkerColor`, `startRoute`)

## Where to Add New Code

**New Vue UI panel/overlay:**
- Implementation: `src/components/YourPanel.vue`
- Import and place in: `src/App.vue` template
- Store bindings via: `useStationStore()` in `<script setup>`

**New store state or action:**
- Add to: `src/stores/stationStore.js` inside `state()` or `actions`
- No new store files needed at current scale; consider splitting if store exceeds ~150 lines

**New map feature (markers, layers, controls):**
- Add to: `src/components/MapView.vue` — keep all Leaflet logic co-located here
- Add module-scope `let` variables above `onMounted`; initialize inside `onMounted`; clean up in `onUnmounted`

**New pure utility function:**
- Add to: `src/utils/geo.js` if geo-related, or create `src/utils/yourUtil.js` for other domains
- Export as named function; no default exports

**New CSS:**
- Global/shared styles: `src/style.css`
- Component-scoped styles: `<style scoped>` block in the relevant `.vue` file (currently not used — all styles are global)

## Special Directories

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes (by `npm run build`)
- Committed: No (in `.gitignore`)

**`public/`:**
- Purpose: Static assets copied verbatim to build output root
- Generated: No
- Committed: Yes (if files added)

## Red Flags

- **`MapView.vue` is ~397 lines** — the largest file by far. All Leaflet concerns are co-located by design, but further features (e.g. additional route types, layer toggles) will push it toward an unmanageable size. Consider extracting routing logic to a composable `src/composables/useRouting.js` if it grows.
- **No `composables/` directory** — reusable stateful logic (e.g. geolocation, interval management) is embedded directly in `MapView.vue`'s `onMounted`. There is no established pattern for extracting Vue composables in this project yet.
- **Single CSS file (`style.css`)** — all global styles including popup markup, map controls, and theme variables share one file with no section organisation. Will become hard to maintain as UI grows.

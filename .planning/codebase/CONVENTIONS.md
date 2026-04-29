# CONVENTIONS
_Last updated: 2026-04-29_

## Summary
This is a small Vue 3 + Pinia SPA with four source files and one utility module. No linter or formatter is configured. Conventions are consistent within the project but informal — inferred from observed usage rather than enforced tooling.

## Language & Module Format

- All source files use plain JavaScript (no TypeScript). `package.json` declares `"type": "module"`.
- Vue SFCs use `<script setup>` (Composition API) exclusively.
- `src/main.js`, `src/stores/stationStore.js`, `src/utils/geo.js`, and `vite.config.js` are `.js` files.

## Naming Patterns

**Files:**
- Vue components: PascalCase — `MapView.vue`, `NearbyPanel.vue`, `FilterControl.vue`, `App.vue`
- Stores: camelCase with `Store` suffix — `stationStore.js`
- Utilities: camelCase noun — `geo.js`
- Store file is located at `src/stores/stationStore.js`
- Utility file is located at `src/utils/geo.js`

**Variables & Functions:**
- Regular variables and function names: camelCase — `markersMap`, `clusterMap`, `superclusterIndex`, `renderVisibleMarkers`, `loadSupercluster`, `buildPopupHTML`, `getMarkerColor`
- Boolean flags: descriptive camelCase — `followMode`, `filterHasNoBikes`
- Store instance: always named `store` — `const store = useStationStore()`
- Pinia composable: `use` prefix + PascalCase store name — `useStationStore`

**CSS Classes:**
- BEM-inspired kebab-case — `nearby-panel`, `panel-handle`, `handle-bar`, `station-item`, `yb-popup`, `yb-stat-label`, `locate-btn-active`
- Component-scoped prefixes used informally: `yb-` for popup elements, `sp-` for steampunk/Claymorphism marker elements, `locate-btn` for the locate control

**Constants:**
- Module-level constants: SCREAMING_SNAKE_CASE — `API_URL`, `GEAR_PATH`

## Import Organization

No enforced ordering. Observed pattern across files:

1. Vue runtime imports (`vue`, `pinia`)
2. Third-party libraries (`leaflet`, `leaflet-routing-machine`, `supercluster`)
3. Internal stores (`../stores/stationStore`)
4. Internal utilities (`../utils/geo`)
5. CSS side-effect imports (`leaflet/dist/leaflet.css`, `./style.css`) — only in `main.js`

Example from `MapView.vue`:
```js
import { onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet-routing-machine'
import Supercluster from 'supercluster'
import { useStationStore } from '../stores/stationStore'
```

## Component Patterns

**All components use `<script setup>`** (no Options API, no `defineComponent`).

**State access:**
- Store is always imported and assigned at the top of `<script setup>`:
  ```js
  const store = useStationStore()
  ```
- Local reactive state uses `ref` — only `NearbyPanel.vue` uses `ref` (`expanded`).
- Derived data uses `computed` — only `NearbyPanel.vue` uses `computed` (`nearbyStations`).

**Template patterns:**
- `v-model` is used directly on store properties (e.g., `v-model="store.filterHasNoBikes"` in `FilterControl.vue`) — no intermediate local ref.
- `v-for` always includes `:key` bound to a unique identifier (`item.sno`).
- Conditional rendering uses `v-if`/`v-else-if`/`<template v-else>`.
- Inline styles are used for dynamic colours: `:style="{ background: markerColor(item) }"`.
- No `<style scoped>` blocks in any component — all CSS lives in `src/style.css` (global).

**MapView.vue special pattern:**
- All Leaflet objects are stored in module-scope `let`/`const` variables, not Vue reactive state. This is the core architectural constraint: Leaflet manages its own DOM imperatively.
- Watchers (`watch`) bridge Vue reactive state to imperative Leaflet calls.
- `window.startRoute` is assigned in `onMounted` to allow popup `onclick` attributes to reach the function. This is an explicit workaround for Leaflet's raw HTML popup limitation.

## Pinia Store Patterns

Store is defined with Options-style `defineStore` (not setup-style):
```js
export const useStationStore = defineStore('station', {
  state: () => ({ ... }),
  actions: { ... },
})
```

- No `getters` defined — computed derivations happen in components.
- State uses `Map` for the primary data structure (`stationsMap: new Map()`).
- Actions are `async` where needed and always `try/catch/finally`.
- `console.error` is the only error reporting mechanism.

## Error Handling

- Network errors in `fetchStations`: caught, logged with `console.error`, returns `null` to caller.
- Geolocation errors: silently update button state via `updateLocateButton('disabled')`.
- Routing errors: `routingerror` event triggers `alert()` — inline user-facing message.
- No global error boundary or Vue `errorCaptured` hook.

## Utility / Helper Functions

- `src/utils/geo.js` exports one pure function: `haversineDistance(lat1, lng1, lat2, lng2)` returning metres.
- JSDoc comment present on this function (only instance in the project).
- Colour logic (`getMarkerColor` / `markerColor`) is duplicated between `MapView.vue` and `NearbyPanel.vue` — not extracted to a shared utility.

## Comments & Documentation

- Section separator comments used in `MapView.vue` with dash-boxed headers: `// ─── Section name ─────`
- Inline comments on non-obvious logic (diff algorithm, arc gauge math, supercluster rendering).
- JSDoc used only for `haversineDistance` in `src/utils/geo.js`.
- No `@ts-check` or type annotations anywhere.

## Code Style (Observed, Not Enforced)

- 2-space indentation throughout.
- Single quotes for strings.
- No trailing semicolons in `.vue` `<script setup>` blocks; semicolons present in `.js` files only where natural (none in this small codebase).
- Short `if` bodies sometimes written on one line: `if (n < 5) return '#EA580C'`.
- Template literals used for HTML string generation (`buildPopupHTML`, `gearHtml`).
- No Prettier, ESLint, or Biome config files detected.

## Red Flags

- **Duplicated colour logic:** `getMarkerColor` in `MapView.vue` and `markerColor` in `NearbyPanel.vue` implement identical rules with different hex values for two colours (`#A8947E` vs `#a0aec0`, `#65A30D` vs `#38a169`). The colours are actually slightly different, which may be intentional but is easy to desync.
- **`window.startRoute` global:** Assigning a function to `window` to bridge Leaflet popup HTML strings to Vue logic is fragile and untestable. Acknowledged in CLAUDE.md.
- **`v-model` on store state directly:** `FilterControl.vue` binds `v-model` directly to `store.filterHasNoBikes`. This works but bypasses the action pattern, making the mutation invisible in Pinia devtools.
- **No TypeScript:** Data shapes (station object fields, diff result structure) are undocumented in code — only described in CLAUDE.md.
- **No linter or formatter configured:** Code style consistency relies entirely on author discipline.

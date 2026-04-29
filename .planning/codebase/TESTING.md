# TESTING
_Last updated: 2026-04-29_

## Summary
This project has zero test infrastructure. No test runner, no assertion library, no test files, and no test-related npm scripts exist. The only testable pure-function logic (`haversineDistance`, `diffUpdate`) is untested. All verification is manual via the dev server.

## Test Framework

**Runner:** None
**Assertion Library:** None
**Test Config:** None

No `jest.config.*`, `vitest.config.*`, or similar files are present. No `@vitest/core`, `jest`, `mocha`, or equivalent packages appear in `package.json` dependencies or devDependencies.

## Test Files

No `*.test.*` or `*.spec.*` files exist anywhere in the repository.

## What Is Testable (But Untested)

**`src/utils/geo.js` — `haversineDistance(lat1, lng1, lat2, lng2)`**
- Pure function with no side effects.
- Takes four numbers, returns a number (distance in metres).
- Highest-priority candidate for unit tests: zero dependencies, deterministic output.

**`src/stores/stationStore.js` — `diffUpdate(newMap)`**
- Pure logic: compares two `Map<sno, StationData>` instances and returns `{ added, changed, removed }` Sets.
- Has no external I/O but is a method on a Pinia store instance, so requires store setup.
- Could be tested with Pinia's `createPinia()` + `setActivePinia()` test helpers.
- Key edge cases: empty-to-populated, station going inactive (`act`), bike count changes, station removal.

**`src/stores/stationStore.js` — `fetchStations()`**
- Async action that calls `fetch` and mutates store state.
- Testable with `fetch` mocking (e.g., `vi.fn()` or `global.fetch = ...`).

**Colour logic (duplicated)**
- `getMarkerColor` in `src/components/MapView.vue` (module-scope function, not exported).
- `markerColor` in `src/components/NearbyPanel.vue` (component-local function, not exported).
- Both implement the same 4-branch colour rule. Neither is exported, making unit testing require extraction.

## What Is Difficult to Test

**`src/components/MapView.vue`**
- Tightly coupled to Leaflet DOM APIs (`L.map`, `L.marker`, `L.layerGroup`, etc.) and browser APIs (`navigator.geolocation`, `document.addEventListener`, `window`).
- All logic lives inside `onMounted` or module-scope variables — no injectable dependencies.
- Would require a full JSDOM + Leaflet mock environment or an E2E browser test (Playwright/Cypress).

**`src/components/NearbyPanel.vue`** and **`src/components/FilterControl.vue`**
- Simpler components; could be tested with Vue Test Utils + Pinia, but no framework is installed.

## CI/CD & Coverage

- No CI pipeline configuration detected (no `.github/workflows/`, no `Makefile` targets for tests).
- No coverage thresholds or reporting configured.
- Deployment is manual: `npm run deploy` (vite build + gh-pages).

## How to Add Testing (Recommended Path)

The lowest-effort, highest-value addition would be Vitest (already aligned with the Vite toolchain):

```bash
npm install -D vitest @vue/test-utils
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Start with pure-function tests:
- `src/utils/geo.js` — `haversineDistance` (zero setup required)
- `src/stores/stationStore.js` — `diffUpdate` (requires `setActivePinia(createPinia())`)

## Red Flags

- **Zero test coverage.** The entire codebase is untested. Any refactor of `diffUpdate` or `haversineDistance` has no regression safety net.
- **Colour logic duplication is undetected.** The two `markerColor` implementations use slightly different hex values (`#A8947E` vs `#a0aec0` for disabled; `#65A30D` vs `#38a169` for available). Without tests, this silent divergence goes unnoticed.
- **`window.startRoute` global mutation** makes the routing trigger untestable without a real browser environment.
- **No type safety.** The absence of TypeScript and tests means API response shape changes (e.g., YouBike field renames) would fail silently at runtime.

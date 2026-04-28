## Context

The app is a single-page Vue 3 + Vite app. All visual styles live in `src/style.css` as CSS custom properties under a `:root {}` block using a `--sp-*` naming convention (Steampunk). Components reference these tokens directly. No CSS framework (Tailwind etc.) is used — all styles are hand-written CSS.

The redesign is purely visual: no behavioral, data, or component logic changes.

## Goals / Non-Goals

**Goals:**
- Replace every `--sp-*` token with `--warm-*` Claymorphism tokens
- Remove decorative Steampunk elements (gear SVGs, rivet pseudo-elements, metal texture gradients)
- Apply Claymorphism visual style: rounded (16–24px), thick borders, double clay shadows, light surfaces
- Use Varela Round + Nunito Sans (Google Fonts) instead of Cinzel + Crimson Text
- Warm the map tile filter from grayscale to sepia
- Soften station status colors while keeping clear green/orange/red semantics

**Non-Goals:**
- No changes to component logic, data flow, or Leaflet integration
- No Tailwind or CSS framework adoption
- No dark mode support
- No animation additions (removal only)

## Decisions

**Decision 1: CSS custom properties only (no Tailwind)**
Keep existing plain CSS architecture. Adding Tailwind for a visual-only change would increase bundle size and require rewriting all class names.

**Decision 2: Light bottom panel instead of dark**
`NearbyPanel` was `#2c1a0e` (near-black). Claymorphism uses light surfaces everywhere. Switching to `#FFFBF5` with a warm border-top maintains the panel distinction without dark contrast.

**Decision 3: Keep `--warm-*` prefix namespace**
Rename token namespace from `--sp-*` to `--warm-*` for clarity. If a future theme is added, the namespace makes origin obvious.

**Decision 4: Station colors stay semantically green/orange/red**
Softened but not neutralized — accessibility contrast must be maintained against the cream background. Values chosen: `#65A30D` / `#EA580C` / `#DC2626` / `#A8947E`.

**Decision 5: Remove gear + rivet decorations entirely**
No replacement decorations — simpler, cleaner. Claymorphism relies on shape and shadow, not surface decoration.

## Risks / Trade-offs

- [Font flash on first load] → Use `font-display: swap` via Google Fonts URL parameter (already default)
- [Sepia map tiles may reduce readability of OSM labels] → Keep brightness at 1.05 to compensate; revert to `brightness(1)` if labels are hard to read
- [Light panel on map background] → Clay shadow (`0 -8px 20px`) separates panel from map clearly
- [Contrast regression] → `#9A3412` on `#FFF7ED` = ~7:1 ratio, passes WCAG AA; verify station colors on light bg

## Migration Plan

1. Update `index.html` — swap Google Fonts link
2. Rewrite `src/style.css` — new `:root` tokens, all component rules
3. Edit `src/components/NearbyPanel.vue` — remove `<svg>` gear, update any hardcoded colors
4. Edit `src/components/FilterControl.vue` — remove `<svg>` gear, update toggle
5. Edit `src/App.vue` — update legend dot hex values
6. Edit `src/components/MapView.vue` — update station color constants + map tile CSS class

Rollback: `git revert` — all changes are in 6 files, no DB or API impact.

## Open Questions

- (none — all design decisions resolved in exploration phase)

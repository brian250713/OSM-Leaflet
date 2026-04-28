## 1. Fonts & HTML

- [x] 1.1 Replace Google Fonts link in `index.html` — swap Cinzel/Crimson Text for Varela Round + Nunito Sans

## 2. Design Tokens (style.css)

- [x] 2.1 Delete all `--sp-*` custom properties from `:root`
- [x] 2.2 Add `--warm-*` token set: bg, surface, border, primary, primary-s, text, muted, accent
- [x] 2.3 Add station status color tokens: `--s-green`, `--s-orange`, `--s-red`, `--s-grey`
- [x] 2.4 Add shape tokens: `--radius-sm` (12px), `--radius-md` (18px), `--radius-lg` (24px)
- [x] 2.5 Add shadow tokens: `--shadow-clay`, `--shadow-clay-sm`
- [x] 2.6 Add border token: `--border-clay` (3px solid `--warm-border`)
- [x] 2.7 Add font tokens: `--font-head`, `--font-body`
- [x] 2.8 Update `body` font-family to use `--font-body`

## 3. Component Styles (style.css)

- [x] 3.1 Rewrite `.filter-control` — cream bg, clay border, clay shadow, radius-md
- [x] 3.2 Rewrite `.toggle-label`, `.toggle-track`, `.toggle-thumb` — warm colors, pill toggle
- [x] 3.3 Remove `.filter-control::after` rivet pseudo-element
- [x] 3.4 Rewrite `.legend` — cream bg, clay border, clay shadow, radius-md
- [x] 3.5 Update `.legend-item` — warm text color, Nunito Sans
- [x] 3.6 Update `.legend-dot` — `border-radius: 50%` (circles instead of squares)
- [x] 3.7 Remove `.legend::after` rivet pseudo-element
- [x] 3.8 Rewrite `.nearby-panel` — cream surface, warm border-top, clay shadow upward, radius-lg top corners
- [x] 3.9 Remove `.nearby-panel` metal texture `background-image` repeating-linear-gradient
- [x] 3.10 Remove `.nearby-panel::after` rivet pseudo-element
- [x] 3.11 Update `.handle-bar` — warm primary color
- [x] 3.12 Update `.panel-title` — warm text, Varela Round
- [x] 3.13 Update `.panel-meta`, `.panel-gear` class → remove gear spin styles
- [x] 3.14 Update `.station-item` dividers — warm border color
- [x] 3.15 Update `.station-name` — warm text, Nunito Sans
- [x] 3.16 Update `.station-meta-text` — warm muted color
- [x] 3.17 Update `.bikes-num` — warm text, Varela Round
- [x] 3.18 Rewrite `.leaflet-popup-content-wrapper` — cream bg, clay border, clay shadow
- [x] 3.19 Update `.yb-popup-name` — warm text, Varela Round
- [x] 3.20 Update `.yb-popup-area`, `.yb-stat-label` — warm muted
- [x] 3.21 Update `.yb-stat-num` — warm text, Varela Round
- [x] 3.22 Update `.yb-bar-bg` — warm border color as track
- [x] 3.23 Rewrite `.yb-nav-btn` — accent blue (`--warm-accent`), radius-sm
- [x] 3.24 Rewrite `.locate-btn` — cream bg, clay border, clay shadow, radius-sm
- [x] 3.25 Update `.sp-user-pulse` border → `--warm-primary`
- [x] 3.26 Update map tile filter class `.sp-map-tiles` → sepia(0.25) saturate(0.8) brightness(1.05)
- [x] 3.27 Remove `@keyframes gear-spin` and `.panel-gear`, `.toggle-gear` style blocks
- [x] 3.28 Remove `@keyframes` / styles for rivet and metal texture helpers

## 4. NearbyPanel.vue

- [x] 4.1 Remove spinning gear `<svg>` element from panel header
- [x] 4.2 Update any hardcoded color values (`#...`) to use `--warm-*` tokens or new station color constants

## 5. FilterControl.vue

- [x] 5.1 Remove gear `<svg>` element from toggle label
- [x] 5.2 Update any hardcoded color values to warm tokens

## 6. App.vue

- [x] 6.1 Update legend dot inline styles: green `#65A30D`, orange `#EA580C`, red `#DC2626`, grey `#A8947E`

## 7. MapView.vue

- [x] 7.1 Update station color constants: green `#65A30D`, orange `#EA580C`, red `#DC2626`, grey `#A8947E`
- [x] 7.2 Update map tile CSS class reference from `.sp-map-tiles` to `.warm-map-tiles` (if class renamed)

## 8. Verification

- [x] 8.1 Run dev server (`npm run dev`) and visually verify filter bar, legend, nearby panel, popups
- [x] 8.2 Confirm no gear icons visible anywhere
- [x] 8.3 Confirm map tiles have warm sepia tone
- [x] 8.4 Confirm NearbyPanel is light (cream), not dark
- [x] 8.5 Confirm fonts render as Varela Round / Nunito Sans

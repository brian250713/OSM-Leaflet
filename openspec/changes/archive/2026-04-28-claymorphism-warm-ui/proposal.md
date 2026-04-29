## Why

The current Steampunk theme (dark panels, brass, gears, Cinzel/Crimson Text) is visually heavy and industrial — mismatched with a public transit app meant to feel friendly and approachable. Switching to a Claymorphism warm-orange aesthetic improves usability perception and aligns with modern, soft UI trends seen in consumer apps.

## What Changes

- Replace all `--sp-*` CSS design tokens with `--warm-*` Claymorphism tokens
- Replace dark bottom panel (`#2c1a0e`) with light cream surface (`#FFFBF5`)
- Replace `Cinzel` + `Crimson Text` fonts with `Varela Round` + `Nunito Sans`
- Remove gear SVG animations, rivet pseudo-elements, metal texture gradients
- Replace brass/parchment border style with thick rounded clay borders (3px, 16–24px radius)
- Replace drop shadows with double clay shadows (outer orange-tinted + inner white highlight)
- Update station status colors to softer warm variants
- Update map tile filter from `grayscale` to warm `sepia`
- Update legend dot shapes from squares to circles

## Capabilities

### New Capabilities

- `claymorphism-theme`: Full design token system — colors, typography, shadows, borders — for the Claymorphism warm-orange visual style applied across all UI components

### Modified Capabilities

- (none — no behavioral requirement changes, purely visual)

## Impact

- `src/style.css` — full rewrite of design tokens and component styles
- `index.html` — add Google Fonts import (Varela Round + Nunito Sans)
- `src/components/NearbyPanel.vue` — remove gear SVG, update class names if needed
- `src/components/FilterControl.vue` — remove gear SVG, update toggle styles
- `src/App.vue` — update hardcoded legend dot hex colors
- `src/components/MapView.vue` — update station color constants, map tile filter class

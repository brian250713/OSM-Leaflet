## ADDED Requirements

### Requirement: Design tokens define warm Claymorphism visual system
The app SHALL use a `--warm-*` CSS custom property namespace defining the full visual token set: background, surface, border, primary, text, muted colors; radius scale; and clay shadow definitions.

#### Scenario: Tokens available globally
- **WHEN** any component references a `--warm-*` CSS variable
- **THEN** the value resolves correctly from the `:root` block in `style.css`

### Requirement: Typography uses Varela Round and Nunito Sans
The app SHALL load Varela Round (headings/labels) and Nunito Sans (body/metadata) from Google Fonts and apply them as `--font-head` and `--font-body` tokens respectively.

#### Scenario: Fonts load on page render
- **WHEN** the app loads in a browser with internet access
- **THEN** panel titles render in Varela Round and station names render in Nunito Sans

### Requirement: All UI panels use light cream surfaces
All overlay panels (filter bar, legend, nearby panel, popups) SHALL use `--warm-surface` (`#FFFBF5`) as background — no dark backgrounds.

#### Scenario: NearbyPanel is light
- **WHEN** user opens the NearbyPanel
- **THEN** panel background is cream/white, not dark brown

### Requirement: Clay shadow applied to all floating elements
All floating UI elements (filter bar, legend, nearby panel, popups, locate button) SHALL use the clay double shadow: `0 8px 20px rgba(249,115,22,0.18)` outer + `inset 0 1px 0 rgba(255,255,255,0.70)` inner.

#### Scenario: Filter bar has clay shadow
- **WHEN** filter bar renders on the map
- **THEN** it displays an orange-tinted outer shadow and a bright inner highlight

### Requirement: Borders are thick and rounded
All UI panels SHALL use `3px solid #FDDCB5` borders and border-radius of 16px or greater.

#### Scenario: Legend has rounded corners
- **WHEN** legend renders in the bottom-right corner
- **THEN** corners are visibly rounded (≥16px radius)

### Requirement: Steampunk decorations are removed
The app SHALL NOT render gear SVG animations, rivet pseudo-element corners, or metal texture repeating gradients.

#### Scenario: No gears visible
- **WHEN** user views the app
- **THEN** no rotating gear icons appear in the filter bar or nearby panel header

### Requirement: Map tiles use warm sepia filter
The map tile layer SHALL apply `filter: sepia(0.25) saturate(0.8) brightness(1.05)` instead of the previous grayscale filter.

#### Scenario: Map has warm tone
- **WHEN** map tiles render
- **THEN** tiles display a warm sepia tone rather than grey

### Requirement: Station status colors pass contrast on light background
Station marker colors SHALL maintain WCAG AA contrast ratio (≥3:1 for large text / graphical elements) against the warm background.

#### Scenario: Green marker visible on cream
- **WHEN** a station with ≥5 bikes renders on the map
- **THEN** the green marker (`#65A30D`) is clearly distinguishable against cream/white backgrounds

## ADDED Requirements

### Requirement: Basemap uses Taiwan General Electronic Map with grayscale filter
The system SHALL render the basemap using the NLSC WMTS tile service for 臺灣通用電子地圖, with a CSS grayscale filter applied to produce a desaturated steampunk-compatible appearance.

#### Scenario: Map loads with Taiwan basemap
- **WHEN** the application mounts and the map initializes
- **THEN** the tile layer SHALL use the URL `https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}`
- **THEN** the tile layer SHALL have `className: 'sp-map-tiles'`
- **THEN** `.sp-map-tiles` SHALL apply `filter: grayscale(1) brightness(0.92)` via CSS

#### Scenario: Attribution credits NLSC
- **WHEN** the map renders
- **THEN** the Leaflet attribution control SHALL display `© 內政部國土測繪中心` with a link to `https://maps.nlsc.gov.tw/`

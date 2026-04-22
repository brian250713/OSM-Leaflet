## ADDED Requirements

### Requirement: Leaflet map initializes with Canvas renderer
The system SHALL initialize a Leaflet map with `renderer: L.canvas()` to support high-density marker rendering without creating DOM nodes per marker.

#### Scenario: Map initializes on page load
- **WHEN** the application mounts
- **THEN** a Leaflet map SHALL render in the `#map` container using Canvas renderer
- **THEN** the default view SHALL center on Taipei (25.046, 121.517) at zoom level 14

---

### Requirement: supercluster manages spatial indexing
The system SHALL use `supercluster` to index all station points and compute clusters, replacing Leaflet.markercluster.

#### Scenario: Stations are indexed on first data load
- **WHEN** station data is fetched for the first time
- **THEN** all stations SHALL be loaded into a `supercluster` index
- **THEN** `getClusters(bbox, zoom)` SHALL return results in O(log n) time

#### Scenario: Map re-renders clusters on move or zoom
- **WHEN** the user pans or zooms the map
- **THEN** the system SHALL call `supercluster.getClusters()` with the current viewport bbox and zoom
- **THEN** only markers/clusters within the viewport SHALL be rendered

---

### Requirement: Markers are removed when outside viewport
The system SHALL only render markers visible in the current viewport, removing out-of-view markers from the Leaflet layer.

#### Scenario: Pan removes off-screen markers
- **WHEN** the user pans the map so a station leaves the viewport
- **THEN** that station's marker SHALL be removed from the Leaflet layer
- **THEN** newly visible station markers SHALL be added

---

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

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

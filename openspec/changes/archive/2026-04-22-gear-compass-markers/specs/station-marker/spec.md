## MODIFIED Requirements

### Requirement: Markers display available bike count as color-coded gear icons
The system SHALL render each station as a `L.divIcon` containing an inline SVG gear (28×28px), colored by `available_rent_bikes` count using the steampunk palette.

#### Scenario: Station has no bikes
- **WHEN** `available_rent_bikes === 0` and `act === "1"`
- **THEN** the gear icon SHALL use fill color `#8b2020` (iron rust)

#### Scenario: Station has fewer than 5 bikes
- **WHEN** `available_rent_bikes >= 1` and `available_rent_bikes <= 4` and `act === "1"`
- **THEN** the gear icon SHALL use fill color `#c4611a` (furnace orange)

#### Scenario: Station has 5 or more bikes
- **WHEN** `available_rent_bikes >= 5` and `act === "1"`
- **THEN** the gear icon SHALL use fill color `#4a7c4e` (copper patina)

#### Scenario: Station is inactive
- **WHEN** `act !== "1"`
- **THEN** the gear icon SHALL use fill color `#5c5c5c` (worn iron)

---

### Requirement: Marker size is touch-friendly
The system SHALL render markers large enough for finger-tap interaction on mobile.

#### Scenario: Marker size on mobile
- **WHEN** the map renders station markers
- **THEN** each `divIcon` SHALL have an `iconSize` of `[28, 28]` and `iconAnchor` of `[14, 14]`

---

## MODIFIED Requirements

### Requirement: Marker color updates without recreation
The system SHALL update marker appearance in-place when `available_rent_bikes` changes.

#### Scenario: Color update on diff
- **WHEN** a diff update detects a change in `available_rent_bikes` for a station
- **THEN** the system SHALL call `marker.setIcon(L.divIcon({ html: gearHtml(newColor) }))` on the existing marker
- **THEN** the marker SHALL NOT be removed and re-added to the layer

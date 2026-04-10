## ADDED Requirements

### Requirement: Markers display available bike count as color-coded circles
The system SHALL render each station as a `L.CircleMarker` on Canvas, colored by `available_rent_bikes` count.

#### Scenario: Station has no bikes
- **WHEN** `available_rent_bikes === 0` and `act === "1"`
- **THEN** the marker SHALL use fill color `#e53e3e` (red)

#### Scenario: Station has fewer than 5 bikes
- **WHEN** `available_rent_bikes >= 1` and `available_rent_bikes <= 4` and `act === "1"`
- **THEN** the marker SHALL use fill color `#ed8936` (orange)

#### Scenario: Station has 5 or more bikes
- **WHEN** `available_rent_bikes >= 5` and `act === "1"`
- **THEN** the marker SHALL use fill color `#38a169` (green)

#### Scenario: Station is inactive
- **WHEN** `act !== "1"`
- **THEN** the marker SHALL use fill color `#a0aec0` (gray)

---

### Requirement: Marker size is touch-friendly
The system SHALL render markers large enough for finger-tap interaction on mobile.

#### Scenario: Marker radius on mobile
- **WHEN** the map renders station markers
- **THEN** each `CircleMarker` SHALL have a radius of at least 10px

---

### Requirement: Marker color updates without recreation
The system SHALL update marker color in-place when `available_rent_bikes` changes, without removing and re-adding the marker.

#### Scenario: Color update on diff
- **WHEN** a diff update detects a change in `available_rent_bikes` for a station
- **THEN** the system SHALL call `marker.setStyle({ fillColor: newColor })` on the existing marker
- **THEN** the marker SHALL NOT be removed and re-added

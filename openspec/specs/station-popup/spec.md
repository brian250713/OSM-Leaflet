## ADDED Requirements

### Requirement: Popup opens on marker click
The system SHALL show a Leaflet popup when the user clicks a station marker.

#### Scenario: Popup displays station info
- **WHEN** the user clicks a station marker
- **THEN** a popup SHALL open containing:
  - Station name (`sna`, with "YouBike2.0_" prefix removed for display)
  - District (`sarea`)
  - Available rent bikes count
  - Available return (parking) spots count
  - Total capacity (`Quantity`)

---

### Requirement: Popup contains a visual availability progress bar
The system SHALL display a progress bar in the popup showing the proportion of available bikes.

#### Scenario: Progress bar reflects availability
- **WHEN** the popup opens
- **THEN** the progress bar SHALL fill to `(available_rent_bikes / Quantity) * 100%`
- **THEN** the bar color SHALL match the marker color (red / orange / green)

---

### Requirement: Popup contains an in-app walk routing button
The system SHALL include a「導航過來」button in the popup that triggers in-app walk routing.

#### Scenario: In-app routing button triggers walk route
- **WHEN** the user taps the「導航過來」button in the popup
- **THEN** the popup SHALL close
- **THEN** `startRoute(latitude, longitude)` SHALL be called with the station's coordinates

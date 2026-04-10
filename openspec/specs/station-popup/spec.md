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

### Requirement: Popup contains a Google Maps navigation link
The system SHALL include a one-tap navigation link in the popup.

#### Scenario: Google Maps link opens navigation
- **WHEN** the user taps the navigation button in the popup
- **THEN** a new tab SHALL open with Google Maps directions to the station's coordinates
- **THEN** the URL format SHALL be: `https://www.google.com/maps/dir/?api=1&destination=<latitude>,<longitude>`

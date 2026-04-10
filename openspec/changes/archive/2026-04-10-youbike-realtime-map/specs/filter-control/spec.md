## ADDED Requirements

### Requirement: Filter toggle hides stations with no available bikes
The system SHALL provide a toggle control that, when enabled, hides all markers where `available_rent_bikes === 0`.

#### Scenario: Filter enabled (default state)
- **WHEN** the application loads
- **THEN** the filter toggle SHALL be ON by default
- **THEN** markers where `available_rent_bikes === 0` SHALL NOT be rendered on the map

#### Scenario: Filter disabled
- **WHEN** the user turns off the filter toggle
- **THEN** all active station markers SHALL be visible regardless of bike count
- **THEN** red markers (0 bikes) SHALL appear on the map

---

### Requirement: Filter state is stored in Pinia
The system SHALL manage the filter toggle state in a Pinia store so it is accessible to both the UI component and the Leaflet rendering logic.

#### Scenario: Filter state persists during data refresh
- **WHEN** a 2-minute auto-refresh occurs while the filter is ON
- **THEN** newly rendered/updated markers SHALL respect the current filter state
- **THEN** the toggle position SHALL remain unchanged after the refresh

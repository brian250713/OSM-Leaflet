## ADDED Requirements

### Requirement: Follow mode state machine
The system SHALL maintain a follow mode state that determines whether the map view tracks the user's position.

#### Scenario: Follow mode activates on successful location
- **WHEN** `watchPosition` receives the first successful position
- **THEN** follow mode SHALL be set to FOLLOWING

#### Scenario: Follow mode deactivates on manual drag
- **WHEN** the user drags the map manually (dragstart event)
- **THEN** follow mode SHALL be set to FREE
- **THEN** the map view SHALL stop panning to the user's position on subsequent GPS updates

#### Scenario: Map pans in FOLLOWING state
- **WHEN** follow mode is FOLLOWING
- **AND** `watchPosition` receives a new position
- **THEN** the map SHALL `panTo` the new coordinates without animation

#### Scenario: Map does not pan in FREE state
- **WHEN** follow mode is FREE
- **AND** `watchPosition` receives a new position
- **THEN** the map view SHALL NOT change
- **THEN** userMarker and accuracyCircle SHALL still update their positions

---

### Requirement: Relocate button
The system SHALL display a relocate button as a Leaflet custom control in the topright position, below the zoom controls.

#### Scenario: Button is active when location is available
- **WHEN** `watchPosition` has received at least one successful position
- **THEN** the relocate button SHALL be displayed in an active (blue) style

#### Scenario: Button is disabled when location is unavailable
- **WHEN** geolocation permission is denied, or the browser does not support Geolocation API, or `watchPosition` has not yet received a position
- **THEN** the relocate button SHALL be displayed in a disabled (grey) style
- **THEN** the button SHALL NOT respond to click events

#### Scenario: Button click re-enters FOLLOWING mode
- **WHEN** the user clicks the active relocate button
- **THEN** follow mode SHALL be set to FOLLOWING
- **THEN** the map SHALL `flyTo` the current user position, preserving the current zoom level

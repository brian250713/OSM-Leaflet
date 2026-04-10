## ADDED Requirements

### Requirement: Geolocation on startup
The system SHALL request the user's geolocation when the application mounts and fly to that location on the map.

#### Scenario: Geolocation granted
- **WHEN** the user grants location permission
- **THEN** the map SHALL `flyTo` the user's coordinates at zoom level 16
- **THEN** a distinct user-location marker (blue pulsing circle) SHALL be placed at that position

#### Scenario: Geolocation denied or unavailable
- **WHEN** the user denies location permission, or the browser does not support Geolocation API
- **THEN** the map SHALL remain centered on Taipei default (25.046, 121.517) at zoom 14
- **THEN** no error message SHALL block the map from displaying
- **THEN** the nearby panel SHALL show a message:「開啟定位後可查看附近站點」

---

### Requirement: Distance calculation from user location
The system SHALL calculate the straight-line distance from the user's location to each station using the Haversine formula.

#### Scenario: Distance is calculated for nearby panel
- **WHEN** user location is known
- **THEN** each station's distance from the user SHALL be calculated in metres
- **THEN** the nearby panel SHALL sort stations by ascending distance

## MODIFIED Requirements

### Requirement: Geolocation on startup
The system SHALL request the user's geolocation when the application mounts using `watchPosition` for continuous tracking, and fly to that location on the first fix.

#### Scenario: Geolocation granted
- **WHEN** the user grants location permission
- **THEN** the map SHALL `flyTo` the user's coordinates at zoom level 18 on the first fix
- **THEN** a distinct user-location marker (blue pulsing circle) SHALL be placed at that position
- **THEN** a 100m accuracy circle SHALL be placed at that position
- **THEN** follow mode SHALL be set to FOLLOWING

#### Scenario: Geolocation denied or unavailable
- **WHEN** the user denies location permission, or the browser does not support Geolocation API
- **THEN** the map SHALL remain centered on Taipei default (25.046, 121.517) at zoom 14
- **THEN** no error message SHALL block the map from displaying
- **THEN** the nearby panel SHALL show a message:「開啟定位後可查看附近站點」

---

### Requirement: Continuous location tracking
The system SHALL continuously track the user's location and update visual indicators on each GPS update.

#### Scenario: User moves while app is open
- **WHEN** `watchPosition` fires with a new position
- **THEN** userMarker SHALL move to the new coordinates
- **THEN** accuracyCircle SHALL move to the new coordinates
- **THEN** `store.setUserLocation` SHALL be called with the new coordinates

#### Scenario: Tracking is cleaned up on unmount
- **WHEN** the component is unmounted
- **THEN** `navigator.geolocation.clearWatch(watchId)` SHALL be called to stop tracking

---

### Requirement: Distance calculation from user location
The system SHALL calculate the straight-line distance from the user's location to each station using the Haversine formula.

#### Scenario: Distance is calculated for nearby panel
- **WHEN** user location is known
- **THEN** each station's distance from the user SHALL be calculated in metres
- **THEN** the nearby panel SHALL sort stations by ascending distance

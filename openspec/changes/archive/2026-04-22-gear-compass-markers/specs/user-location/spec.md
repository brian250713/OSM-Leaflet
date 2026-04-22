## MODIFIED Requirements

### Requirement: Geolocation on startup
The system SHALL request the user's geolocation when the application mounts using `watchPosition` for continuous tracking, and fly to that location on the first fix.

#### Scenario: Geolocation granted
- **WHEN** the user grants location permission
- **THEN** the map SHALL `flyTo` the user's coordinates at zoom level 18 on the first fix
- **THEN** a brass compass rose marker (32×32px SVG, fill `#cd9b1d`, centered anchor) SHALL be placed at that position
- **THEN** a pulsing brass ring animation SHALL surround the compass rose
- **THEN** a 100m accuracy circle SHALL be placed at that position
- **THEN** follow mode SHALL be set to FOLLOWING

#### Scenario: Geolocation denied or unavailable
- **WHEN** the user denies location permission, or the browser does not support Geolocation API
- **THEN** the map SHALL remain centered on Taipei default (25.046, 121.517) at zoom 14
- **THEN** no error message SHALL block the map from displaying
- **THEN** the nearby panel SHALL show a message:「開啟定位後可查看附近站點」

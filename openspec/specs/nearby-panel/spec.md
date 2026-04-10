## ADDED Requirements

### Requirement: Nearby panel shows closest stations with available bikes
The system SHALL display a panel listing the 5 nearest stations that have at least 1 available bike, sorted by ascending distance from the user's location.

#### Scenario: Panel populates after geolocation
- **WHEN** user location is obtained
- **THEN** the nearby panel SHALL display up to 5 stations
- **THEN** each entry SHALL show: station name, distance (e.g.,「350 公尺」), and available bike count

#### Scenario: Fewer than 5 nearby stations have bikes
- **WHEN** fewer than 5 active stations within range have `available_rent_bikes > 0`
- **THEN** the panel SHALL show only the available entries (no empty rows)

---

### Requirement: Clicking a nearby panel entry flies the map to that station
The system SHALL pan and zoom the map to the selected station when the user taps a panel entry.

#### Scenario: Tap station in panel
- **WHEN** the user taps a station entry in the nearby panel
- **THEN** the map SHALL `flyTo` that station's coordinates at zoom level 17
- **THEN** the station's popup SHALL open automatically

---

### Requirement: Panel shows placeholder when location is unavailable
The system SHALL show a message in the panel when geolocation has not been granted.

#### Scenario: No location permission
- **WHEN** the user's location is unknown
- **THEN** the panel SHALL display:「開啟定位後可查看附近站點」
- **THEN** no station list SHALL be shown

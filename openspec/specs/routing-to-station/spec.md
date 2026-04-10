## Requirements

### Requirement: Walk route displayed on map
The system SHALL calculate and render a walking route from the user's current location to the selected station using LRM and OSRM Demo (foot profile).

#### Scenario: Route drawn successfully
- **WHEN** the user clicks「導航過來」in a station popup and user location is available
- **THEN** the system SHALL remove any existing route
- **THEN** LRM SHALL request a foot-profile route from user location to the station coordinates
- **THEN** the route polyline SHALL be drawn on the map in blue (`#3182ce`, weight 4)

#### Scenario: No user location
- **WHEN** the user clicks「導航過來」and location permission has not been granted
- **THEN** the system SHALL display an alert: 「請先允許定位以使用導航功能」
- **THEN** no route SHALL be drawn

#### Scenario: OSRM routing error
- **WHEN** the OSRM Demo server returns an error or cannot find a route
- **THEN** the system SHALL display an alert: 「找不到路線，請稍後再試」
- **THEN** any partially drawn route SHALL be removed

---

### Requirement: Walk instructions panel shown
The system SHALL display LRM's default routing instructions panel containing distance, estimated time, and turn-by-turn directions.

#### Scenario: Panel appears after route calculation
- **WHEN** a route is successfully calculated
- **THEN** the LRM default panel SHALL appear showing total walking distance and estimated time
- **THEN** turn-by-turn instructions SHALL be listed in the panel

---

### Requirement: Previous route cleared on new request
The system SHALL remove the previous route before drawing a new one.

#### Scenario: New route replaces old route
- **WHEN** the user clicks「導航過來」on any station while a route is already displayed
- **THEN** the existing LRM control SHALL be removed from the map
- **THEN** a new route SHALL be calculated and drawn

---

### Requirement: Route cleaned up on component unmount
The system SHALL remove the LRM control and `window.startRoute` when MapView unmounts.

#### Scenario: Cleanup on unmount
- **WHEN** the MapView component is unmounted
- **THEN** `routingControl` SHALL be removed from the map if it exists
- **THEN** `window.startRoute` SHALL be set to `undefined`

## MODIFIED Requirements

### Requirement: Popup contains a Google Maps navigation link
The system SHALL include two navigation options in the popup: an external Google Maps link and an in-app walk routing button.

#### Scenario: Google Maps link opens navigation
- **WHEN** the user taps the「導航前往」button in the popup
- **THEN** a new tab SHALL open with Google Maps directions to the station's coordinates
- **THEN** the URL format SHALL be: `https://www.google.com/maps/dir/?api=1&destination=<latitude>,<longitude>`

#### Scenario: In-app routing button triggers walk route
- **WHEN** the user taps the「導航過來」button in the popup
- **THEN** the popup SHALL close
- **THEN** `startRoute(latitude, longitude)` SHALL be called with the station's coordinates

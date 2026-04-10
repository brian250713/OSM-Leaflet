## ADDED Requirements

### Requirement: Fetch YouBike API on startup
The system SHALL fetch station data from the YouBike API on application mount.

#### Scenario: Successful initial fetch
- **WHEN** the application mounts
- **THEN** the system SHALL fetch `https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json`
- **THEN** the response SHALL be normalized into `Map<sno, StationData>`
- **THEN** the map SHALL render station markers

#### Scenario: Fetch fails on startup
- **WHEN** the initial fetch fails (network error or non-200 response)
- **THEN** the system SHALL display an error message:「資料載入失敗，請重新整理」
- **THEN** the map SHALL still display (empty, but functional)

---

### Requirement: Auto-refresh every 2 minutes with diff update
The system SHALL re-fetch station data every 2 minutes and update only changed markers.

#### Scenario: Data refreshes on interval
- **WHEN** 2 minutes have elapsed since the last successful fetch
- **THEN** the system SHALL fetch new station data in the background
- **THEN** only markers with changed `available_rent_bikes` or `available_return_bikes` SHALL be updated
- **THEN** the UI SHALL display the update time and count of changed stations

#### Scenario: New station appears in data
- **WHEN** a new `sno` is present in the fetched data that was not in the previous data
- **THEN** the system SHALL add a new marker for that station

#### Scenario: Station disappears from data
- **WHEN** an `sno` present in the previous data is absent from the new fetch
- **THEN** the system SHALL remove that station's marker

---

### Requirement: Page Visibility API controls refresh interval
The system SHALL pause the auto-refresh timer when the browser tab is hidden and resume when visible.

#### Scenario: Tab becomes hidden
- **WHEN** `document.visibilityState` changes to `"hidden"`
- **THEN** the system SHALL clear the auto-refresh interval

#### Scenario: Tab becomes visible
- **WHEN** `document.visibilityState` changes to `"visible"`
- **THEN** the system SHALL immediately fetch fresh data
- **THEN** the system SHALL restart the 2-minute interval

---

### Requirement: Data timestamp is displayed
The system SHALL show the timestamp of the most recent successful fetch in the UI.

#### Scenario: Timestamp updates after refresh
- **WHEN** a fetch completes successfully
- **THEN** the UI SHALL display the `updateTime` field from the API response (e.g., 「資料時間：14:52」)
- **THEN** the display SHALL NOT use the word「即時」to avoid misleading users about API latency

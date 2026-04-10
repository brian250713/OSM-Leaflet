## Why

站點 Popup 現有「導航前往」只是外開 Google Maps，使用者無法在 App 內看到從自身位置到站點的步行路徑與轉彎指引。加入原生路線功能可讓使用者不離開 App 即完成「定位 → 找站 → 導航過去」的完整流程。

## What Changes

- **新增**：站點 Popup 加入「導航過來」按鈕，點擊後在地圖上繪製從用戶位置到該站點的步行路線
- **新增**：整合 Leaflet Routing Machine（LRM）+ OSRM Demo（foot profile）計算步行路徑
- **新增**：LRM 預設面板顯示步行指引（距離、預計時間、轉彎清單）
- **新增**：重新點擊「導航過來」時自動清除舊路線並計算新路線
- **新增**：用戶尚未定位時顯示提示訊息

## Capabilities

### New Capabilities

- `routing-to-station`: 從用戶目前位置步行導航至指定 YouBike 站點，含路線繪製與轉彎指引面板

### Modified Capabilities

- `station-popup`: Popup 新增「導航過來」按鈕，觸發 routing-to-station 功能

## Impact

- **依賴套件**：新增 `leaflet-routing-machine`
- **修改檔案**：`src/components/MapView.vue`（LRM 初始化、routingControl 狀態、startRoute function、buildPopupHTML 按鈕）
- **全域 scope**：`window.startRoute` 掛載（Popup HTML string 的 onclick 需要）
- **外部服務**：OSRM Demo Server（`https://router.project-osrm.org`），練習用途，不保證 SLA

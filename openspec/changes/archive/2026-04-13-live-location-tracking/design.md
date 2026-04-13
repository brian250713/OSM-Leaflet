## Context

`MapView.vue` 目前以 `getCurrentPosition` 取得一次性座標，建立靜態 `userMarker` 與 `L.circle`（accuracyCircle），之後皆不再更新。`watchPosition` 的持續回呼需要對應的 module-scope 狀態（watchId、accuracyCircle reference、followMode flag）以及 Leaflet custom control 按鈕。

## Goals / Non-Goals

**Goals:**
- 以 `watchPosition` 持續追蹤 GPS，每次更新移動 userMarker 與 accuracyCircle
- 實作三狀態跟隨模式：FOLLOWING → FREE → FOLLOWING（透過按鈕切換）
- 新增重新定位 Leaflet custom control，按下後 flyTo 使用者位置並回到 FOLLOWING
- 定位失敗 / 未授權時按鈕灰色不可互動

**Non-Goals:**
- 路線導航畫面不隨使用者移動（routing waypoint 固定在導航發起時的位置）
- 不顯示 GPS 精度數值
- 不支援背景定位（僅前景使用）

## Decisions

### D1：follow 狀態用 module-scope boolean，非 reactive

**選擇**：`let followMode = false`（普通變數）
**理由**：followMode 只影響 Leaflet 行為（panTo / 不 panTo），不需觸發 Vue re-render。用 `ref` 反而增加不必要的 reactivity 開銷，且可能產生不預期的 watch 觸發。

### D2：watchPosition 回呼用 `panTo`，按鈕用 `flyTo`

**選擇**：連續 GPS 更新 → `panTo`；按鈕重新定位 → `flyTo(currentLoc, map.getZoom())`
**理由**：`panTo` 無縮放動畫，持續跟隨時不突兀；`flyTo` 有動畫反饋，適合使用者主動觸發的一次性操作。保持當前 zoom 避免強迫縮放打斷使用者瀏覽。

### D3：重新定位按鈕用 Leaflet Custom Control

**選擇**：`L.Control.extend` 建立 custom control，`position: 'topright'`
**理由**：與現有 zoom control 風格一致，z-index 由 Leaflet 管理，不需手動處理 Vue template 的疊加問題。按鈕 HTML 在 `onAdd` 中建立，狀態更新透過 `updateLocateButton(state)` helper 操作 DOM class。

**替代方案考量**：Vue template 中絕對定位 div — 較簡單，但需手動對齊且樣式隔離較差。

### D4：accuracyCircle 改為 module-scope reference

**選擇**：`let accuracyCircle = null`，首次定位時 `L.circle(...).addTo(map)` 並存 reference，後續更新呼叫 `accuracyCircle.setLatLng([lat, lng])`
**理由**：現有 `L.circle` 無 reference 無法更新；`setLatLng` 是 Leaflet 原生 API，比 remove/re-add 效能更好。radius 固定 100m（非真實 GPS accuracy），與現有行為一致。

### D5：拖動偵測用 `dragstart` 事件

**選擇**：`map.on('dragstart', () => { followMode = false; ... })`
**理由**：`dragstart` 只在使用者「主動」拖動時觸發，`flyTo` / `panTo` 的程式觸發不會觸發此事件，避免跟隨模式因程式移動地圖而誤關閉。

## Risks / Trade-offs

- **GPS 更新頻率過高** → `panTo` 動畫可能互相干擾產生抖動。緩解：`panTo` 加 `{ animate: false }` 選項，或僅在位移 > 5m 時才 panTo。
- **使用者在室內 GPS 漂移** → followMode 開啟時地圖可能小幅漂移。緩解：此為 GPS 硬體限制，可接受；未來可加 accuracy threshold（coords.accuracy > 50m 時不 panTo）。
- **`watchPosition` watchId 未清除** → memory leak。緩解：`onUnmounted` 中 `navigator.geolocation.clearWatch(watchId)`。

## Migration Plan

純前端修改，無 API 或資料結構變更，無需 migration。部署即生效，可隨時回滾。

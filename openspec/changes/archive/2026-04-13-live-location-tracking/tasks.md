## 1. Module-scope 狀態宣告

- [x] 1.1 在 `MapView.vue` 加入 `let watchId = null`
- [x] 1.2 在 `MapView.vue` 加入 `let accuracyCircle = null`
- [x] 1.3 在 `MapView.vue` 加入 `let followMode = false`
- [x] 1.4 在 `MapView.vue` 加入 `let locateBtn = null`（重新定位按鈕 DOM reference）

## 2. 重新定位 Leaflet Custom Control

- [x] 2.1 在 `onMounted` 前定義 `LocateControl = L.Control.extend({ ... })`，`position: 'topright'`
- [x] 2.2 `onAdd` 中建立按鈕 DOM，初始套用 disabled 樣式，存入 `locateBtn`
- [x] 2.3 按鈕 click handler：設 `followMode = true`，呼叫 `map.flyTo(currentLoc, map.getZoom())`，更新按鈕樣式
- [x] 2.4 定義 `updateLocateButton(state)` helper，切換 active / disabled class
- [x] 2.5 在 `onMounted` 中將 `LocateControl` 加入地圖

## 3. watchPosition 取代 getCurrentPosition

- [x] 3.1 移除現有 `navigator.geolocation.getCurrentPosition(...)` 呼叫
- [x] 3.2 改用 `navigator.geolocation.watchPosition(onPosition, onError, { enableHighAccuracy: true, timeout: 8000 })`，將 `watchId` 存起來
- [x] 3.3 `onPosition` 回呼：更新 `store.setUserLocation(lat, lng)`
- [x] 3.4 `onPosition` 回呼：若 `userMarker` 已存在則 `userMarker.setLatLng([lat, lng])`，否則建立新 marker（首次定位邏輯）
- [x] 3.5 `onPosition` 回呼：若 `accuracyCircle` 已存在則 `accuracyCircle.setLatLng([lat, lng])`，否則 `L.circle(...).addTo(map)` 並存 reference
- [x] 3.6 首次定位時：`map.flyTo([lat, lng], 18)`，設 `followMode = true`，呼叫 `updateLocateButton('active')`
- [x] 3.7 非首次定位時：若 `followMode === true` 則 `map.panTo([lat, lng], { animate: false })`
- [x] 3.8 `onError` 回呼：確保按鈕維持 disabled 狀態（`updateLocateButton('disabled')`）

## 4. 拖動偵測

- [x] 4.1 `map.on('dragstart', () => { followMode = false; updateLocateButton('active') })` — 拖動後按鈕仍可點（active），只是不再跟隨

## 5. 生命週期清理

- [x] 5.1 在 `onUnmounted` 中加入 `if (watchId !== null) navigator.geolocation.clearWatch(watchId)`

## 6. 按鈕樣式

- [x] 6.1 在 `<style>` 或全域 CSS 加入 `.locate-btn` 基本樣式（topright，與 zoom button 一致的外觀）
- [x] 6.2 加入 `.locate-btn.active` 藍色樣式
- [x] 6.3 加入 `.locate-btn.disabled` 灰色樣式、`pointer-events: none`

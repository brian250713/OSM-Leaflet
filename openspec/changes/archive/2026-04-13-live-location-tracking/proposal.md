## Why

目前定位功能使用 `getCurrentPosition`，僅在 app 啟動時取得一次座標；使用者實際步行前往站點時，地圖上的藍點與精度圓圈停留在原地，無法反映真實位置，也無法讓地圖持續對準使用者。

## What Changes

- 將 `getCurrentPosition` 替換為 `watchPosition`，持續接收 GPS 更新
- userMarker（藍點）與 100m accuracyCircle 在每次 GPS 更新時同步移動
- 新增「跟隨模式」狀態機：啟動後預設跟隨，使用者手動拖動地圖後停止跟隨
- 新增重新定位按鈕（Leaflet custom control），按下後重新進入跟隨模式並飛到現在位置
- 重新定位按鈕在定位未授權或失敗時顯示為灰色不可按

## Capabilities

### New Capabilities
- `location-follow-mode`: 地圖跟隨使用者移動的狀態機與重新定位按鈕

### Modified Capabilities
- `user-location`: 定位從一次性快照改為持續追蹤；新增 watchPosition / clearWatch 生命週期；accuracyCircle 改為可更新

## Impact

- `src/components/MapView.vue`：主要修改，涉及定位邏輯、follow 狀態、按鈕 custom control、onUnmounted 清理
- `src/stores/stationStore.js`：userLocation 需隨 watchPosition 持續更新（現有 `setUserLocation` 介面足夠）

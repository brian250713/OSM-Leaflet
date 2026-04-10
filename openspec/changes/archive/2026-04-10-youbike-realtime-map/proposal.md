## Why

台北市有 1300+ YouBike 2.0 站點，但現有官方 App 啟動慢、定位不直覺。使用者在路邊趕時間找車時，需要一個「打開即定位、馬上看到附近有車的站」的輕量 Web App。

## What Changes

- **新增**：Vue 3 + Vite Web App，以 Leaflet 地圖為主介面
- **新增**：串接台北市 YouBike 即時 API，每 2 分鐘自動更新
- **新增**：Geolocation 定位，地圖自動 flyTo 用戶位置
- **新增**：1300+ 站點以顏色區分可借數量狀態（紅/橘/綠/灰）
- **新增**：supercluster 空間索引 + L.canvas() renderer，支援高密度站點效能
- **新增**：Page Visibility API 智慧更新策略（背景 Tab 暫停、回來立即刷新）
- **新增**：站點 Popup（進度條、Google Maps 導航連結）
- **新增**：附近站點側邊欄（最近 5 個有車的站，按距離排序）
- **新增**：「只顯示有車的站」過濾器 toggle（預設開啟）

## Capabilities

### New Capabilities

- `map-display`: Leaflet 地圖初始化、Canvas renderer、supercluster 空間索引、視野內站點動態渲染
- `station-data`: YouBike API fetch、資料正規化（Map<sno, station>）、2 分鐘 diff 更新、Page Visibility 控制
- `user-location`: Geolocation 定位、flyTo 動畫、用戶位置 marker、距離計算
- `station-marker`: Canvas 繪製彩色 marker（含可借數字）、顏色狀態邏輯（紅/橘/綠/灰）
- `station-popup`: Popup UI（站名、可借/可還、進度條、Google Maps 連結）
- `nearby-panel`: 側邊欄顯示最近 5 個有車的站，按距離排序，點擊跳轉地圖
- `filter-control`: 「只顯示有車的站」toggle、過濾邏輯與 Pinia 狀態管理

### Modified Capabilities

（無現有 spec，全為新增）

## Impact

- **依賴套件**：leaflet、supercluster、vue、pinia、vite
- **外部 API**：`https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json`（Azure Blob，支援 CORS，無需 proxy）
- **瀏覽器 API**：Geolocation API、Page Visibility API（`document.visibilityState`）
- **資料量**：~500KB / 次請求，1300+ GeoJSON 點位

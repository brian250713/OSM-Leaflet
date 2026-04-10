## 1. 專案初始化

- [x] 1.1 `npm create vite@latest` 建立 Vue 3 + Vite 專案，安裝依賴：`leaflet`、`supercluster`、`pinia`
- [x] 1.2 設定 `vite.config.js`，確認 dev server 可正常啟動
- [x] 1.3 清除 Vite 預設樣板（`App.vue`、`assets/`），建立基本頁面結構
- [x] 1.4 在 `main.js` 引入 Pinia，建立基礎 store 結構（`useStationStore`）

## 2. 地圖初始化（map-display）

- [x] 2.1 建立 `MapView.vue` 組件，在 `onMounted` 以 `L.map('#map', { renderer: L.canvas() })` 初始化地圖
- [x] 2.2 設定預設中心點台北（25.046, 121.517）、zoom 14，加入 OpenStreetMap tile layer
- [x] 2.3 將 `supercluster` 實例化，確認 `loadStations()` 與 `getClusters(bbox, zoom)` 介面可用
- [x] 2.4 在 `map.on('moveend zoomend')` 事件中呼叫 `renderVisibleMarkers()`，只渲染視野內站點

## 3. 資料層（station-data）

- [x] 3.1 在 `useStationStore` 建立 `fetchStations()` action，fetch API 並轉換為 `Map<sno, StationData>`
- [x] 3.2 實作 `diffUpdate(newData)` 函式：比對舊新資料，回傳 `{ added, changed, removed }` 三組 sno 集合
- [x] 3.3 在 `MapView.vue` 的 `onMounted` 呼叫 `fetchStations()`，完成後觸發首次 `renderVisibleMarkers()`
- [x] 3.4 實作 Page Visibility API 監聽：`visibilitychange` → 隱藏時清除 interval，顯示時立即 fetch + 重設 interval
- [x] 3.5 設定 2 分鐘 `setInterval` 呼叫 `fetchStations()`，fetch 完成後執行 `diffUpdate` 並更新地圖
- [x] 3.6 在 UI 顯示「資料時間：HH:MM」（取 API `updateTime` 欄位），fetch 中顯示 spinner

## 4. 用戶定位（user-location）

- [x] 4.1 在 `onMounted` 呼叫 `navigator.geolocation.getCurrentPosition()`
- [x] 4.2 定位成功後：`map.flyTo([lat, lng], 16)` 並在用戶座標放置藍色脈動圓圈 marker
- [x] 4.3 在 store 儲存 `userLocation: { lat, lng } | null`
- [x] 4.4 定位失敗時：`userLocation` 維持 `null`，地圖停在預設台北中心，不顯示錯誤彈窗
- [x] 4.5 實作 `haversineDistance(lat1, lng1, lat2, lng2)` 工具函式，回傳公尺距離

## 5. 站點 Marker 樣式（station-marker）

- [x] 5.1 實作 `getMarkerColor(station)` 函式：依 `act` 與 `available_rent_bikes` 回傳對應色碼
- [x] 5.2 在 `addMarker(station)` 中建立 `L.circleMarker([lat, lng], { radius: 10, fillColor, ... })`，存入 `markersMap`
- [x] 5.3 在 `updateMarker(sno, newData)` 中呼叫 `marker.setStyle({ fillColor: newColor })`，不重建 marker
- [x] 5.4 在 `removeMarker(sno)` 中從 layer 移除並從 `markersMap` 刪除

## 6. 站點 Popup（station-popup）

- [x] 6.1 實作 `buildPopupHTML(station)` 函式，產生包含站名（去除「YouBike2.0_」前綴）、行政區、可借/可還數的 HTML
- [x] 6.2 加入進度條 HTML：`<div style="width: X%; background: COLOR">` 根據 `available_rent_bikes / Quantity` 計算
- [x] 6.3 加入 Google Maps 導航按鈕：`<a href="https://www.google.com/maps/dir/?api=1&destination=LAT,LNG" target="_blank">`
- [x] 6.4 在 `addMarker()` 中綁定 `.bindPopup(buildPopupHTML(station))`
- [x] 6.5 `updateMarker()` 時同步更新 popup 內容：`marker.setPopupContent(buildPopupHTML(newData))`

## 7. 附近站點側邊欄（nearby-panel）

- [x] 7.1 建立 `NearbyPanel.vue` 組件，從 store 取得 `userLocation` 與 `stationsMap`
- [x] 7.2 實作 computed `nearbyStations`：過濾 `available_rent_bikes > 0`，計算距離，按距離升冪排列，取前 5 筆
- [x] 7.3 渲染站點列表：站名、距離（公尺）、可借數；`userLocation` 為 null 時顯示「開啟定位後可查看附近站點」
- [x] 7.4 點擊站點項目時呼叫 `map.flyTo([lat, lng], 17)` 並開啟該站 popup
- [x] 7.5 行動端樣式：bottom sheet 設計，固定在畫面下方，可上滑展開（純 CSS，不需額外套件）

## 8. 過濾器（filter-control）

- [x] 8.1 在 `useStationStore` 加入 `filterHasNoBikes: boolean`，預設 `true`
- [x] 8.2 建立 `FilterControl.vue` 組件，包含 toggle 開關，雙向綁定 `filterHasNoBikes`
- [x] 8.3 在 `renderVisibleMarkers()` 中依 `filterHasNoBikes` 決定是否跳過 `available_rent_bikes === 0` 的站點
- [x] 8.4 filter 狀態改變時觸發重繪，確保地圖立即反映過濾結果

## 9. 整合與收尾

- [x] 9.1 確認 `MapView`、`NearbyPanel`、`FilterControl` 在 `App.vue` 中正確組合排版
- [x] 9.2 行動端 RWD 測試（Chrome DevTools 模擬 375px 寬度），確認 marker、popup、panel 皆可正常操作
- [x] 9.3 測試 Page Visibility：切換 tab 30 秒後回來，確認資料有重新 fetch 並更新時間戳
- [x] 9.4 測試 diff 更新：模擬資料變化，確認只有變化的 marker 更新顏色（不全部重建）
- [x] 9.5 在 `vite.config.js` 設定 `base: '/OSM-Leaflet/'`（對應 GitHub repo 名稱）
- [x] 9.6 `vite build` 確認 production build 無錯誤
- [x] 9.7 在 `package.json` 加入 `"deploy": "gh-pages -d dist"` script，安裝 `gh-pages` 套件
- [x] 9.8 執行 `npm run deploy`，確認 GitHub Pages 上線並可正常定位與顯示站點

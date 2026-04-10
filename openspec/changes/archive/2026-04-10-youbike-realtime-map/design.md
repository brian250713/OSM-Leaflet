## Context

台北市 YouBike 2.0 即時 API 回傳 1300+ 站點資料（~500KB JSON），瀏覽器需在行動端地圖上高效渲染並每 2 分鐘更新。核心使用場景為路邊使用者快速找到附近可借車的站點，對初始載入速度與定位體驗要求高。

## Goals / Non-Goals

**Goals:**
- 開啟即定位，flyTo 用戶位置，幾秒內看到附近站點
- 1300+ 站點不卡頓（60fps 平移/縮放）
- 每 2 分鐘背景更新，只更新有變化的 marker，用戶幾乎無感
- 行動端觸控友善（marker 夠大、側邊欄可滑動）

**Non-Goals:**
- 路線規劃或導航（連結到 Google Maps 即可）
- 用戶帳號、租借紀錄、後端服務
- 離線模式、PWA Service Worker
- 台北市以外的站點

## Decisions

### 1. Vue 管 UI，Leaflet 命令式管地圖

**決策**：Vue 組件只負責 Sidebar、Filter、狀態提示 UI。地圖上的 marker 完全由 Leaflet 命令式 API 管理，不透過 Vue vDOM。

**理由**：若把 1300 個 marker 放進 `v-for`，每次資料更新 Vue diff 需遍歷整棵 vDOM 樹，導致明顯卡頓。Leaflet 的 layer 操作是直接 DOM mutation，繞過 Vue 響應式成本。

**備選方案**：vue-leaflet（`@vue-leaflet/vue-leaflet`）→ 拒絕，因為它把每個 marker 包成 Vue 組件，1300 個組件的開銷不可接受。

---

### 2. supercluster 取代 Leaflet.markercluster

**決策**：使用 `supercluster` 做空間索引與 cluster 計算，Leaflet 只負責繪製 `supercluster.getClusters()` 的結果。

**理由**：
- `Leaflet.markercluster` 每次縮放需重建整個 cluster 樹，1300 站在中心城區密度下有明顯延遲
- `supercluster` 使用 R-tree，`getClusters()` 為 O(log n)，且只需在 map `moveend`/`zoomend` 時呼叫，不重建

**備選方案**：關閉 clustering，全部顯示 → 拒絕，台北市中心密度下視覺完全無法辨識。

---

### 3. L.canvas() 作為 Leaflet renderer

**決策**：初始化地圖時指定 `renderer: L.canvas()`，所有 CircleMarker 使用 Canvas 繪製。

**理由**：1300 個 SVG 元素對瀏覽器 layout/paint 成本高；Canvas 統一繪製所有點，效能顯著較佳。點擊偵測由 Leaflet 內建的 canvas hit detection 處理（CircleMarker 支援）。

---

### 4. 資料結構：Map<sno, station>

**決策**：fetch 回來的陣列立刻轉為 `Map<sno, station>`，marker 也以 `Map<sno, L.CircleMarker>` 管理。

**理由**：每次 diff 更新為 O(1) lookup，不需遍歷陣列。

```
stationsMap: Map<sno, StationData>   // Pinia store
markersMap:  Map<sno, L.CircleMarker> // Leaflet layer，不進 Vue
```

---

### 5. Page Visibility API 更新策略

**決策**：
- `setInterval` 每 2 分鐘觸發更新
- `document.addEventListener('visibilitychange')` 監聽：
  - Tab 隱藏 → 清除 interval
  - Tab 顯示 → 立即 fetch，重設 interval

**理由**：避免背景 tab 每 2 分鐘浪費 500KB 請求；用戶切回來時資料立刻是最新的，符合路邊使用場景。

---

### 6. 更新 Diff 策略

每次新資料到來：

```
for each station in newData:
  if not in markersMap → addMarker()
  else if available_rent_bikes changed → updateMarkerColor()

for each sno in markersMap:
  if not in newData → removeMarker()
```

只操作有變化的 marker，不重建整個 layer。UI 顯示「14:52 更新・3 站有變化」。

---

### 7. 顏色狀態邏輯

```
available_rent_bikes = 0          → #e53e3e  (紅，沒車)
available_rent_bikes 1–4          → #ed8936  (橘，快沒車)
available_rent_bikes ≥ 5          → #38a169  (綠，充足)
act !== "1"                       → #a0aec0  (灰，停用)
```

## Risks / Trade-offs

| 風險 | 緩解方式 |
|------|----------|
| Azure Blob CORS 政策變動 | 備選：用 Cloudflare Workers 做代理（免費方案） |
| supercluster + L.canvas() 點擊偵測邊界案例 | 使用 `CircleMarker` 而非自訂 Canvas，Leaflet 內建 hit detection 已處理 |
| 行動端 Geolocation 權限被拒 | 拒絕時 fallback 到台北市中心（25.046, 121.517），不阻擋地圖顯示 |
| 500KB 每 2 分鐘在低速網路 | 顯示「更新中」spinner；若 fetch 失敗保留舊資料，顯示「資料可能已過時」 |
| 政府 API 本身有 1-3 分鐘延遲 | UI 顯示資料的 `updateTime` 欄位，不顯示「即時」字樣 |

## Open Questions

- 是否需要站名搜尋功能（`Leaflet-search`）？目前 scope 不包含，可作為後續 iteration。
- 側邊欄在小螢幕上的呈現：底部抽屜（bottom sheet）vs 可收合側欄？建議底部抽屜，更符合行動端使用習慣。

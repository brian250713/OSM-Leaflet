# YouBike 即時地圖

台北市 YouBike 2.0 即時站點地圖，以「路邊找車」為核心使用場景。

## 功能

- **定位優先**：開啟即定位，自動飛到你的位置（zoom 18），顯示 100 公尺範圍圓圈
- **即時站點**：1300+ 站點依可借數量顯示顏色
  - 🟢 綠色：≥ 5 輛
  - 🟠 橘色：1–4 輛
  - 🔴 紅色：沒有車
  - ⚫ 灰色：停用中
- **自動更新**：每 2 分鐘背景更新，切換 Tab 時暫停、回來立即刷新（Page Visibility API）
- **站點資訊**：點擊站點顯示可借數、可還數、進度條及 Google Maps 導航連結
- **附近站點**：底部顯示最近 5 個有車的站，依距離排序，點擊直接跳轉
- **過濾器**：一鍵隱藏沒有車的站點（預設開啟）

## 技術架構

| 項目 | 選擇 |
|------|------|
| 框架 | Vue 3 + Vite + Pinia |
| 地圖 | Leaflet + `L.canvas()` renderer |
| 空間索引 | supercluster（取代 MarkerCluster） |
| 資料來源 | [台北市政府開放資料](https://data.taipei/dataset/detail?id=c6bc8aed-557d-41d5-bfb1-8da24f78f2fb) |

**效能策略：**
- Vue 管 UI，Leaflet 命令式管地圖（不透過 vDOM 渲染 marker）
- supercluster R-tree 空間索引，viewport 內 O(log n) 查詢
- Diff 更新：每次刷新只更新有變化的 marker，不重建整個 layer
- 資料以 `Map<sno, station>` 儲存，diff 為 O(1)

## 安裝與開發

```bash
npm install
npm run dev
```

開啟 `http://localhost:5173/OSM-Leaflet/`

## 部署

```bash
npm run build   # 建置
npm run deploy  # 部署至 GitHub Pages
```

## 資料說明

資料來源為台北市政府 YouBike 即時 API，通常有 1–3 分鐘延遲，介面上顯示「資料時間」而非「即時」。

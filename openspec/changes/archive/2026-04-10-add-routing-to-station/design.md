## Context

現有 App 架構：Vue 3 管 UI，Leaflet 命令式管地圖，`map` 物件封裝在 `MapView.vue` 的 module scope 內不外露。站點 Popup 以 `buildPopupHTML()` 產生純 HTML string，onclick handler 無法直接存取 Vue scope 的 function。

## Goals / Non-Goals

**Goals:**
- 在 Popup 加「導航過來」按鈕，觸發 LRM 計算並繪製步行路線
- LRM 面板使用預設樣式（不客製化 UI）
- 新路線請求自動清除舊路線
- 用戶未定位時給予提示

**Non-Goals:**
- 站點間路線（場景 B）
- 自訂 LRM UI 面板樣式
- 非步行交通模式（自行車、開車）
- 離線路線計算

## Decisions

### 1. LRM 整合位置：全部在 MapView.vue

`map` 物件不外露。LRM 需要直接操作 `map`，因此 routing 邏輯全部放在 `MapView.vue` 內，與現有 marker 管理並列。

> 替代方案：透過 `provide/inject` 或 store 傳遞 `map`。但這打破現有封裝，且為練習項目引入不必要複雜度。

### 2. Popup onclick 橋接方式：`window.startRoute`

`buildPopupHTML()` 產生 HTML string，無法閉包 Vue function。採用 `window.startRoute = (lat, lng) => {...}` 掛載到全域，Popup 按鈕用 `onclick="startRoute(lat,lng)"` 觸發。

> 替代方案：`map.on('popupopen')` 事件後查 DOM 綁 listener。較乾淨但繁瑣；練習用途 window 方式可接受。

### 3. OSRM profile：foot

「導航到站點」的情境是步行前往，選用 `foot` profile。OSRM Demo server 支援 `/route/v1/foot/`。

serviceUrl 設為：`https://router.project-osrm.org/route/v1/foot`

### 4. 不覆蓋現有 marker：`createMarker: () => null`

LRM 預設會在起終點放自己的 marker，會蓋住用戶位置標記與站點 CircleMarker。設為 `() => null` 停用 LRM 的 waypoint marker。

## Risks / Trade-offs

- **OSRM Demo 不穩定** → 練習用途可接受；錯誤由 LRM 內建的 `routingerror` 事件處理，顯示 alert 提示
- **`window.startRoute` 全域污染** → 命名夠具體（`startRoute` → 或更具體的 `ybStartRoute`），衝突機率低；`onUnmounted` 時清除
- **LRM panel 與現有 UI 重疊** → LRM 預設吸附右側，FilterControl 在左上，NearbyPanel 在底部，重疊風險低；若有問題可用 CSS `z-index` 處理

## Open Questions

- OSRM Demo 的 `foot` profile 回應速度：台灣資料是否齊全？（需實際測試確認）

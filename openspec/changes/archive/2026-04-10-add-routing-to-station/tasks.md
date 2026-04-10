## 1. 安裝依賴

- [x] 1.1 執行 `npm install leaflet-routing-machine`，確認 `package.json` 更新

## 2. MapView.vue — LRM 整合

- [x] 2.1 在 `MapView.vue` import LRM：`import 'leaflet-routing-machine'`
- [x] 2.2 新增 module-scope 變數 `let routingControl = null`
- [x] 2.3 實作 `startRoute(toLat, toLng)` function：
  - 檢查 `store.userLocation`，無則 alert 提示
  - 若 `routingControl` 存在，先 `map.removeControl(routingControl)`
  - 建立 `L.Routing.control`，使用 OSRM foot profile，`createMarker: () => null`，路線顏色 `#3182ce` weight 4
  - 綁定 `routingerror` 事件，alert 提示找不到路線並清除 control
  - 將 function 掛載到 `window.startRoute`
- [x] 2.4 在 `onMounted` 呼叫一次 `startRoute` 的初始化（掛 `window.startRoute`）
- [x] 2.5 在 `onUnmounted` 加入清理：移除 `routingControl`，設 `window.startRoute = undefined`

## 3. Popup 按鈕

- [x] 3.1 在 `buildPopupHTML()` 加入「導航過來」按鈕：
  - `onclick="startRoute(${station.latitude}, ${station.longitude})"`
  - 按鈕樣式與現有「導航前往」並排或下方

## 4. 驗證

- [x] 4.1 有定位情況：點站點 Popup → 點「導航過來」→ 確認路線繪製在地圖上，LRM panel 出現
- [ ] 4.2 路線替換：再點另一個站的「導航過來」→ 確認舊路線消失、新路線出現
- [ ] 4.3 無定位情況：拒絕定位後點「導航過來」→ 確認 alert「請先允許定位以使用導航功能」出現
- [ ] 4.4 OSRM 錯誤處理：確認 `routingerror` 事件有綁定（DevTools → Network 可觀察 OSRM 請求）

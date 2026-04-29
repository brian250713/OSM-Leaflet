<template>
  <div class="app-container">
    <MapView />
    <div class="top-overlay">
      <FilterControl />
    </div>
    <div class="legend">
      <div class="legend-item"><span class="legend-dot" style="background:#65A30D"></span>≥ 5 輛</div>
      <div class="legend-item"><span class="legend-dot" style="background:#EA580C"></span>1–4 輛</div>
      <div class="legend-item"><span class="legend-dot" style="background:#DC2626"></span>沒有車</div>
      <div class="legend-item"><span class="legend-dot" style="background:#A8947E"></span>停用</div>
    </div>
    <NearbyPanel />
  </div>
</template>

<script setup>
import MapView from './components/MapView.vue'
import NearbyPanel from './components/NearbyPanel.vue'
import FilterControl from './components/FilterControl.vue'
</script>

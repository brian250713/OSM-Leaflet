<template>
  <div class="app-container">
    <MapView />
    <div class="top-overlay">
      <FilterControl />
    </div>
    <div class="legend">
      <div class="legend-item"><span class="legend-dot" style="background:#4a7c4e"></span>≥ 5 輛</div>
      <div class="legend-item"><span class="legend-dot" style="background:#c4611a"></span>1–4 輛</div>
      <div class="legend-item"><span class="legend-dot" style="background:#8b2020"></span>沒有車</div>
      <div class="legend-item"><span class="legend-dot" style="background:#5c5c5c"></span>停用</div>
    </div>
    <NearbyPanel />
  </div>
</template>

<script setup>
import MapView from './components/MapView.vue'
import NearbyPanel from './components/NearbyPanel.vue'
import FilterControl from './components/FilterControl.vue'
</script>

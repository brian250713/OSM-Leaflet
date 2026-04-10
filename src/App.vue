<template>
  <div class="app-container">
    <MapView />
    <div class="top-overlay">
      <FilterControl />
    </div>
    <div class="legend">
      <div class="legend-item"><span class="legend-dot" style="background:#38a169"></span>≥ 5 輛</div>
      <div class="legend-item"><span class="legend-dot" style="background:#ed8936"></span>1–4 輛</div>
      <div class="legend-item"><span class="legend-dot" style="background:#e53e3e"></span>沒有車</div>
      <div class="legend-item"><span class="legend-dot" style="background:#a0aec0"></span>停用</div>
    </div>
    <NearbyPanel />
  </div>
</template>

<script setup>
import MapView from './components/MapView.vue'
import NearbyPanel from './components/NearbyPanel.vue'
import FilterControl from './components/FilterControl.vue'
</script>

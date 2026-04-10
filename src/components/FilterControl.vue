<template>
  <div class="filter-control">
    <label class="toggle-label">
      <input type="checkbox" v-model="store.filterHasNoBikes" />
      <span class="toggle-track">
        <span class="toggle-thumb"></span>
      </span>
      <span class="toggle-text">只顯示有車的站</span>
    </label>
  </div>
</template>

<script setup>
import { useStationStore } from '../stores/stationStore'
const store = useStationStore()
</script>

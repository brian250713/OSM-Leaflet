<template>
  <div class="nearby-panel" :class="{ expanded }">
    <!-- Handle / header -->
    <div class="panel-handle" @click="expanded = !expanded">
      <div class="handle-bar"></div>
      <div class="panel-header-row">
        <span class="panel-title">附近站點</span>
        <svg class="panel-gear" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
        </svg>
        <span class="panel-meta">
          <template v-if="store.isLoading">更新中…</template>
          <template v-else-if="store.lastUpdateTime">
            資料時間：{{ store.lastUpdateTime }}
            <span v-if="store.changedCount > 0" class="changed-badge">
              {{ store.changedCount }} 站更新
            </span>
          </template>
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="panel-content">
      <div v-if="!store.userLocation" class="no-location">
        開啟定位後可查看附近站點
      </div>
      <template v-else>
        <div
          v-for="item in nearbyStations"
          :key="item.sno"
          class="station-item"
          @click="store.flyTo(item.sno)"
        >
          <div class="station-dot" :style="{ background: markerColor(item) }"></div>
          <div class="station-info">
            <div class="station-name">{{ item.displayName }}</div>
            <div class="station-meta-text">
              {{ item.distance }} 公尺・{{ item.sarea }}
            </div>
          </div>
          <div class="station-bikes">
            <div class="station-bikes-row">
              <span class="bikes-label">借</span>
              <span class="bikes-num" :style="{ color: markerColor(item) }">{{ item.available_rent_bikes }}</span>
            </div>
            <div class="station-bikes-row">
              <span class="bikes-label">還</span>
              <span class="bikes-num return">{{ item.available_return_bikes }}</span>
            </div>
          </div>
        </div>
        <div v-if="nearbyStations.length === 0" class="no-location">
          附近暫無可借車輛
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStationStore } from '../stores/stationStore'
import { haversineDistance } from '../utils/geo'

const store = useStationStore()
const expanded = ref(false)

function markerColor(station) {
  if (station.act !== '1') return '#5c5c5c'
  const n = station.available_rent_bikes
  if (n === 0) return '#8b2020'
  if (n < 5)   return '#c4611a'
  return '#4a7c4e'
}

const nearbyStations = computed(() => {
  if (!store.userLocation) return []
  const { lat, lng } = store.userLocation
  const results = []
  for (const [, s] of store.stationsMap) {
    if (s.act !== '1' || s.available_rent_bikes <= 0) continue
    results.push({
      ...s,
      displayName: s.sna.replace('YouBike2.0_', ''),
      distance: Math.round(haversineDistance(lat, lng, s.latitude, s.longitude)),
    })
  }
  return results.sort((a, b) => a.distance - b.distance).slice(0, 5)
})
</script>

<template>
  <div class="nearby-panel" :class="{ expanded }">
    <!-- Handle / header -->
    <div class="panel-handle" @click="expanded = !expanded">
      <div class="handle-bar"></div>
      <div class="panel-header-row">
        <span class="panel-title">附近站點</span>
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
  if (station.act !== '1') return '#a0aec0'
  const n = station.available_rent_bikes
  if (n === 0) return '#e53e3e'
  if (n < 5)   return '#ed8936'
  return '#38a169'
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

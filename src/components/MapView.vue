<template>
  <div id="map"></div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet-routing-machine'
import Supercluster from 'supercluster'
import { useStationStore } from '../stores/stationStore'

const store = useStationStore()

// --- Module-scope state (NOT reactive — Leaflet owns these) ---
let map = null
let markersLayer = null
const markersMap = new Map()   // sno        → L.CircleMarker
const clusterMap = new Map()   // cluster id → L.CircleMarker
let superclusterIndex = null
let userMarker = null
let intervalId = null
let routingControl = null

// ─── Colour logic ──────────────────────────────────────────────
function getMarkerColor(station) {
  if (station.act !== '1') return '#a0aec0'
  const n = station.available_rent_bikes
  if (n === 0) return '#e53e3e'
  if (n < 5)   return '#ed8936'
  return '#38a169'
}

// ─── Popup HTML ────────────────────────────────────────────────
function buildPopupHTML(station) {
  const name = station.sna.replace('YouBike2.0_', '')
  const pct  = station.Quantity > 0
    ? Math.round((station.available_rent_bikes / station.Quantity) * 100)
    : 0
  const color = getMarkerColor(station)

  return `
    <div class="yb-popup">
      <div class="yb-popup-name">${name}</div>
      <div class="yb-popup-area">${station.sarea}</div>
      <div class="yb-popup-stats">
        <span class="yb-stat"><span class="yb-stat-label">可借</span><strong class="yb-stat-num" style="color:${color}">${station.available_rent_bikes}</strong></span>
        <span class="yb-stat"><span class="yb-stat-label">可還</span><strong class="yb-stat-num" style="color:#4299e1">${station.available_return_bikes}</strong></span>
      </div>
      <div class="yb-bar-bg">
        <div class="yb-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <button onclick="startRoute(${station.latitude}, ${station.longitude})" class="yb-nav-btn">
        導航過來
      </button>
    </div>`
}

// ─── Marker management ─────────────────────────────────────────
function addMarker(station) {
  if (store.filterHasNoBikes && station.available_rent_bikes === 0) return
  if (station.act !== '1') return
  const m = L.circleMarker([station.latitude, station.longitude], {
    radius: 10,
    fillColor: getMarkerColor(station),
    fillOpacity: 0.9,
    color: '#fff',
    weight: 1.5,
    interactive: true,
  })
  m.bindPopup(buildPopupHTML(station), { maxWidth: 220 })
  m.addTo(markersLayer)
  markersMap.set(station.sno, m)
}

function updateMarker(sno, station) {
  const m = markersMap.get(sno)
  if (!m) return
  m.setStyle({ fillColor: getMarkerColor(station) })
  m.setPopupContent(buildPopupHTML(station))
}

function removeMarker(sno) {
  const m = markersMap.get(sno)
  if (m) { m.remove(); markersMap.delete(sno) }
}

// ─── supercluster render ───────────────────────────────────────
function renderVisibleMarkers() {
  if (!map || !superclusterIndex) return

  const bounds = map.getBounds()
  const bbox   = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]
  const zoom   = Math.floor(map.getZoom())

  const clusters = superclusterIndex.getClusters(bbox, zoom)

  const visibleSnos     = new Set()
  const visibleClusters = new Set()

  for (const item of clusters) {
    if (item.properties.cluster) {
      const id = item.id
      visibleClusters.add(id)
      if (!clusterMap.has(id)) {
        const [lng, lat] = item.geometry.coordinates
        const count = item.properties.point_count
        const radius = Math.min(12 + Math.sqrt(count) * 2, 32)
        const cm = L.circleMarker([lat, lng], {
          radius,
          fillColor: '#4299e1',
          fillOpacity: 0.85,
          color: '#fff',
          weight: 1.5,
          interactive: false,
        })
        cm.bindTooltip(String(count), {
          permanent: true,
          className: 'cluster-label',
          direction: 'center',
          offset: [0, 0],
        })
        cm.addTo(markersLayer)
        clusterMap.set(id, cm)
      }
    } else {
      const sno     = item.properties.sno
      const station = store.stationsMap.get(sno)
      if (!station) continue
      visibleSnos.add(sno)
      if (!markersMap.has(sno)) addMarker(station)
    }
  }

  // Remove out-of-view individual markers (or newly filtered ones)
  for (const [sno] of [...markersMap]) {
    const station = store.stationsMap.get(sno)
    const shouldFilter = store.filterHasNoBikes && station?.available_rent_bikes === 0
    if (!visibleSnos.has(sno) || shouldFilter) removeMarker(sno)
  }

  // Remove out-of-view cluster markers
  for (const [id, cm] of [...clusterMap]) {
    if (!visibleClusters.has(id)) { cm.remove(); clusterMap.delete(id) }
  }
}

// ─── Load / reload supercluster index ─────────────────────────
function loadSupercluster(stationsMap) {
  const points = []
  for (const [sno, s] of stationsMap) {
    points.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.longitude, s.latitude] },
      properties: { sno },
    })
  }
  superclusterIndex = new Supercluster({ radius: 60, maxZoom: 16 })
  superclusterIndex.load(points)
}

// ─── Routing ──────────────────────────────────────────────────
function startRoute(toLat, toLng) {
  const loc = store.userLocation
  if (!loc) {
    alert('請先允許定位以使用導航功能')
    return
  }

  if (routingControl) {
    map.removeControl(routingControl)
    routingControl = null
  }

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(loc.lat, loc.lng),
      L.latLng(toLat, toLng),
    ],
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      profile: 'foot',
    }),
    lineOptions: {
      styles: [{ color: '#3182ce', weight: 4 }],
    },
    createMarker: () => null,
    show: false,
  }).addTo(map)

  routingControl.on('routingerror', () => {
    alert('找不到路線，請稍後再試')
    if (routingControl) {
      map.removeControl(routingControl)
      routingControl = null
    }
  })
}

// ─── Interval helpers ─────────────────────────────────────────
function startInterval() {
  intervalId = setInterval(async () => {
    const diff = await store.fetchStations()
    if (!diff) return
    loadSupercluster(store.stationsMap)

    // Apply diff to existing markers (changed only — add/remove via renderVisibleMarkers)
    for (const sno of diff.changed) {
      updateMarker(sno, store.stationsMap.get(sno))
    }
    // Remove markers for stations that disappeared
    for (const sno of diff.removed) removeMarker(sno)

    renderVisibleMarkers()
  }, 2 * 60 * 1000)
}

// ─── Lifecycle ────────────────────────────────────────────────
onMounted(async () => {
  // 2.1 + 2.2 — Map init
  map = L.map('map', { renderer: L.canvas(), zoomControl: false })
  L.control.zoom({ position: 'topright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)
  map.setView([25.046, 121.517], 14)

  markersLayer = L.layerGroup().addTo(map)

  // 2.4 — Render on move/zoom
  map.on('moveend zoomend', renderVisibleMarkers)

  // 3.3 — Initial fetch
  const diff = await store.fetchStations()
  if (diff) {
    loadSupercluster(store.stationsMap)
    renderVisibleMarkers()
  }

  // 4.1–4.4 — Geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords
        store.setUserLocation(lat, lng)
        map.flyTo([lat, lng], 18)

        // User location marker — DivIcon so CSS pulse animation works
        const icon = L.divIcon({
          className: '',
          html: '<div class="user-dot"></div><div class="user-pulse"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
        userMarker = L.marker([lat, lng], { icon, interactive: false }).addTo(map)

        // 100 公尺範圍圓圈
        L.circle([lat, lng], {
          radius: 100,
          color: '#3182ce',
          weight: 1.5,
          fillColor: '#3182ce',
          fillOpacity: 0.08,
          interactive: false,
        }).addTo(map)
      },
      () => { /* denied — stay at Taipei default, no error popup */ },
      { timeout: 8000 }
    )
  }

  // 3.4 — Page Visibility API
  document.addEventListener('visibilitychange', onVisibilityChange)

  // 3.5 — Start auto-refresh
  startInterval()

  // Routing — expose to Popup onclick
  window.startRoute = startRoute
})

onUnmounted(() => {
  clearInterval(intervalId)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (routingControl) map.removeControl(routingControl)
  window.startRoute = undefined
  if (map) map.remove()
})

async function onVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    clearInterval(intervalId)
  } else {
    const diff = await store.fetchStations()
    if (diff) {
      loadSupercluster(store.stationsMap)
      for (const sno of diff.changed) updateMarker(sno, store.stationsMap.get(sno))
      for (const sno of diff.removed) removeMarker(sno)
      renderVisibleMarkers()
    }
    startInterval()
  }
}

// ─── Watchers ─────────────────────────────────────────────────

// 8.3–8.4 — Filter toggle → full re-render
watch(
  () => store.filterHasNoBikes,
  () => {
    for (const [sno, m] of [...markersMap]) { m.remove(); markersMap.delete(sno) }
    renderVisibleMarkers()
  }
)

// 7.4 — NearbyPanel flyTo
watch(
  () => store.targetSno,
  (sno) => {
    if (!sno || !map) return
    const station = store.stationsMap.get(sno)
    if (!station) return
    store.clearTarget()
    map.flyTo([station.latitude, station.longitude], 17)
    setTimeout(() => {
      if (!markersMap.has(sno)) addMarker(station)
      markersMap.get(sno)?.openPopup()
    }, 700)
  }
)
</script>

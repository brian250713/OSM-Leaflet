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
const markersMap = new Map()   // sno        → L.Marker (divIcon)
const clusterMap = new Map()   // cluster id → L.CircleMarker
let superclusterIndex = null
let userMarker = null
let accuracyCircle = null
let watchId = null
let followMode = false
let locateBtn = null
let intervalId = null
let routingControl = null

// ─── Locate button helper ─────────────────────────────────────
function updateLocateButton(state) {
  if (!locateBtn) return
  locateBtn.classList.remove('locate-btn-active', 'locate-btn-disabled')
  locateBtn.classList.add(state === 'active' ? 'locate-btn-active' : 'locate-btn-disabled')
}

// ─── Locate Custom Control ─────────────────────────────────────
const LocateControl = L.Control.extend({
  options: { position: 'topright' },
  onAdd() {
    const btn = L.DomUtil.create('button', 'locate-btn locate-btn-disabled')
    btn.title = '重新定位'
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"/>
    </svg>`
    locateBtn = btn
    L.DomEvent.on(btn, 'click', L.DomEvent.stopPropagation)
    L.DomEvent.on(btn, 'click', () => {
      if (btn.classList.contains('locate-btn-disabled')) return
      const loc = store.userLocation
      if (!loc || !map) return
      followMode = true
      map.flyTo([loc.lat, loc.lng], map.getZoom())
    })
    return btn
  },
})

// ─── Colour logic ──────────────────────────────────────────────
function getMarkerColor(station) {
  if (station.act !== '1') return '#5c5c5c'
  const n = station.available_rent_bikes
  if (n === 0) return '#8b2020'
  if (n < 5)   return '#c4611a'
  return '#4a7c4e'
}

// ─── Icon builders ────────────────────────────────────────────
const GEAR_PATH = 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z'

function gearHtml(color) {
  return `<div class="sp-station-marker" style="color:${color}"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="${GEAR_PATH}"/></svg></div>`
}

const compassHtml = `<div class="sp-user-pulse"></div><svg class="sp-compass" viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><polygon points="12,1 14.5,9.5 23,12 14.5,14.5 12,23 9.5,14.5 1,12 9.5,9.5" fill="#cd9b1d"/><circle cx="12" cy="12" r="2.5" fill="#2c1810"/></svg>`

// ─── Popup HTML ────────────────────────────────────────────────
function buildPopupHTML(station) {
  const name = station.sna.replace('YouBike2.0_', '')
  const pct  = station.Quantity > 0
    ? Math.round((station.available_rent_bikes / station.Quantity) * 100)
    : 0
  const color = getMarkerColor(station)
  // Arc gauge: semicircle M10,50 → top → 90,50, sweep=0 (counterclockwise = upward)
  // Full semicircle arc length = π × 40 ≈ 125.664
  const arcLen = (pct * 125.664 / 100).toFixed(1)

  return `
    <div class="yb-popup">
      <div class="yb-popup-name">${name}</div>
      <div class="yb-popup-area">${station.sarea}</div>
      <div class="yb-popup-stats">
        <span class="yb-stat"><span class="yb-stat-label">可借</span><strong class="yb-stat-num" style="color:${color}">${station.available_rent_bikes}</strong></span>
        <span class="yb-stat"><span class="yb-stat-label">可還</span><strong class="yb-stat-num" style="color:#e8c050">${station.available_return_bikes}</strong></span>
      </div>
      <svg class="yb-gauge" viewBox="0 0 100 55">
        <path d="M10,50 A40,40 0 0,1 90,50" class="gauge-track"/>
        <path d="M10,50 A40,40 0 0,1 90,50" class="gauge-fill"
              style="stroke:${color};stroke-dasharray:${arcLen} 200"/>
        <text x="50" y="54" class="gauge-pct">${pct}%</text>
      </svg>
      <button onclick="startRoute(${station.latitude}, ${station.longitude})" class="yb-nav-btn">
        導航過來
      </button>
    </div>`
}

// ─── Marker management ─────────────────────────────────────────
function addMarker(station) {
  if (store.filterHasNoBikes && station.available_rent_bikes === 0) return
  if (station.act !== '1') return
  const icon = L.divIcon({ className: '', html: gearHtml(getMarkerColor(station)), iconSize: [28, 28], iconAnchor: [14, 14] })
  const m = L.marker([station.latitude, station.longitude], { icon })
  m.bindPopup(buildPopupHTML(station), { maxWidth: 220 })
  m.addTo(markersLayer)
  markersMap.set(station.sno, m)
}

function updateMarker(sno, station) {
  const m = markersMap.get(sno)
  if (!m) return
  m.setIcon(L.divIcon({ className: '', html: gearHtml(getMarkerColor(station)), iconSize: [28, 28], iconAnchor: [14, 14] }))
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
  L.tileLayer('https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}', {
    attribution: '© <a href="https://maps.nlsc.gov.tw/">內政部國土測繪中心</a>',
    maxZoom: 20,
    className: 'sp-map-tiles',
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

  // Geolocation — continuous tracking via watchPosition
  new LocateControl().addTo(map)

  if (navigator.geolocation) {
    const onPosition = ({ coords }) => {
      const { latitude: lat, longitude: lng } = coords
      store.setUserLocation(lat, lng)

      if (!userMarker) {
        // First fix — create marker, circle, fly to location, enter FOLLOWING
        const icon = L.divIcon({
          className: '',
          html: compassHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
        userMarker = L.marker([lat, lng], { icon, interactive: false }).addTo(map)

        accuracyCircle = L.circle([lat, lng], {
          radius: 100,
          color: '#3182ce',
          weight: 1.5,
          fillColor: '#3182ce',
          fillOpacity: 0.08,
          interactive: false,
        }).addTo(map)

        map.flyTo([lat, lng], 18)
        followMode = true
        updateLocateButton('active')
      } else {
        // Subsequent fix — update position
        userMarker.setLatLng([lat, lng])
        accuracyCircle.setLatLng([lat, lng])
        if (followMode) map.panTo([lat, lng], { animate: false })
      }
    }

    const onError = () => {
      updateLocateButton('disabled')
    }

    watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      timeout: 8000,
    })
  }

  // Disable follow mode when user manually drags the map
  map.on('dragstart', () => {
    followMode = false
    updateLocateButton('active')
  })

  // 3.4 — Page Visibility API
  document.addEventListener('visibilitychange', onVisibilityChange)

  // 3.5 — Start auto-refresh
  startInterval()

  // Routing — expose to Popup onclick
  window.startRoute = startRoute
})

onUnmounted(() => {
  clearInterval(intervalId)
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)
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

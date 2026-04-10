import { defineStore } from 'pinia'

const API_URL =
  'https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json'

export const useStationStore = defineStore('station', {
  state: () => ({
    stationsMap: new Map(),   // Map<sno, StationData>
    userLocation: null,       // { lat, lng } | null
    filterHasNoBikes: true,   // hide stations with 0 available bikes
    lastUpdateTime: '',       // "HH:MM" from API updateTime
    isLoading: false,
    changedCount: 0,
    targetSno: null,          // sno to flyTo (set by NearbyPanel)
  }),

  actions: {
    async fetchStations() {
      this.isLoading = true
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const newMap = new Map()
        let updateTime = ''
        for (const station of data) {
          newMap.set(station.sno, station)
          if (!updateTime && station.updateTime) {
            updateTime = station.updateTime.slice(11, 16) // "HH:MM"
          }
        }

        const diff = this.diffUpdate(newMap)
        this.stationsMap = newMap
        this.lastUpdateTime = updateTime
        this.changedCount = diff.changed.size + diff.added.size
        return diff
      } catch (e) {
        console.error('fetchStations failed:', e)
        return null
      } finally {
        this.isLoading = false
      }
    },

    // Returns { added, changed, removed } sets of sno strings
    diffUpdate(newMap) {
      const added = new Set()
      const changed = new Set()
      const removed = new Set()

      for (const [sno, station] of newMap) {
        if (!this.stationsMap.has(sno)) {
          added.add(sno)
        } else {
          const old = this.stationsMap.get(sno)
          if (
            old.available_rent_bikes !== station.available_rent_bikes ||
            old.available_return_bikes !== station.available_return_bikes
          ) {
            changed.add(sno)
          }
        }
      }
      for (const sno of this.stationsMap.keys()) {
        if (!newMap.has(sno)) removed.add(sno)
      }
      return { added, changed, removed }
    },

    setUserLocation(lat, lng) {
      this.userLocation = { lat, lng }
    },

    flyTo(sno) {
      this.targetSno = sno
    },

    clearTarget() {
      this.targetSno = null
    },
  },
})

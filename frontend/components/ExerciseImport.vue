<template>
  <div class="exercise-import">
    <!-- Upload Area -->
    <div
      class="relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer"
      :class="isDragging
        ? 'border-emerald-500 bg-emerald-500/10'
        : 'border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/30'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
          :class="isDragging ? 'bg-emerald-500/30' : 'bg-slate-800/50'">
          <svg class="w-8 h-8 transition-colors" :class="isDragging ? 'text-emerald-400' : 'text-slate-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p class="text-lg font-medium text-white mb-1">
            {{ isDragging ? '松开以上传' : '拖拽文件到这里' }}
          </p>
          <p class="text-sm text-slate-400">
            支持 KML、GPX、TCX 格式的运动轨迹文件
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span class="px-2 py-1 rounded-lg bg-slate-800/50">.kml</span>
          <span class="px-2 py-1 rounded-lg bg-slate-800/50">.gpx</span>
          <span class="px-2 py-1 rounded-lg bg-slate-800/50">.tcx</span>
        </div>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".kml,.gpx,.tcx"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="mt-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-slate-400">正在上传...</span>
        <span class="text-sm font-medium text-emerald-400">{{ uploadProgress }}%</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-bar-fill"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Import Success -->
    <div v-if="importedData" class="mt-6">
      <div class="glass-card overflow-hidden">
        <!-- Header -->
        <div class="p-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 border-b border-slate-700/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white">运动数据解析成功</h3>
                <p class="text-sm text-slate-400">{{ importedData.name || '运动记录' }}</p>
              </div>
            </div>
            <button
              @click="closeMap"
              class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-slate-500">日期</div>
                <div class="text-sm font-medium text-white">{{ formatDate(importedData.exerciseDate) }}</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-slate-500">时长</div>
                <div class="text-sm font-medium text-white">{{ formatDuration(importedData.durationMinutes) }}</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-slate-500">距离</div>
                <div class="text-sm font-medium text-white">{{ importedData.distanceKm }} km</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-coral-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-coral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-slate-500">消耗</div>
                <div class="text-sm font-medium text-white">{{ importedData.caloriesBurned }} kcal</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map -->
        <div class="relative">
          <div ref="mapContainer" class="w-full h-80"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
          <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-red-400">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as L from 'leaflet'
import axios from 'axios'

onMounted(() => {
  if (process.client) {
    import('leaflet/dist/leaflet.css')
  }
})

const api = useApi()
const emit = defineEmits(['imported'])

const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const importedData = ref(null)
const error = ref(null)
const map = ref(null)
const mapContainer = ref(null)
const trackData = ref(null)

function handleDrop(e) {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

function handleFileSelect(e) {
  const files = e.target.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

async function handleFile(file) {
  error.value = null
  uploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post('/api/exercises/import', formData, {
      baseURL: useRuntimeConfig().public.apiBase,
      headers: {
        'Authorization': `Bearer ${api.getToken()}`
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })

    importedData.value = response.data.record
    trackData.value = response.data.trackData

    emit('imported', response.data.record)

    nextTick(() => {
      initMap(response.data.trackData)
    })
  } catch (err) {
    error.value = err.response?.data?.error || err.message || '导入失败，请重试'
  } finally {
    uploading.value = false
  }
}

function initMap(data) {
  if (!data || !data.trackPoints || data.trackPoints.length === 0) return

  if (map.value) {
    map.value.remove()
    map.value = null
  }

  map.value = L.map(mapContainer.value).setView(
    [data.trackPoints[0].lat, data.trackPoints[0].lon],
    13
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map.value)

  const latlngs = data.trackPoints.map(point => [point.lat, point.lon])

  const polyline = L.polyline(latlngs, {
    color: '#10b981',
    weight: 4,
    opacity: 0.9
  }).addTo(map.value)

  const startIcon = L.divIcon({
    html: '<div style="background: #22c55e; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
    className: 'custom-marker',
    iconSize: [14, 14]
  })

  const endIcon = L.divIcon({
    html: '<div style="background: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
    className: 'custom-marker',
    iconSize: [14, 14]
  })

  L.marker(latlngs[0], { icon: startIcon }).addTo(map.value).bindPopup('起点')
  L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(map.value).bindPopup('终点')

  map.value.fitBounds(polyline.getBounds(), { padding: [50, 50] })
}

function closeMap() {
  importedData.value = null
  trackData.value = null
  if (map.value) {
    map.value.remove()
    map.value = null
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} 分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`
}

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style scoped>
.exercise-import :deep(.custom-marker) {
  background: transparent;
  border: none;
}
</style>

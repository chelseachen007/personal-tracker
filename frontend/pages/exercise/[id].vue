<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面头部 -->
      <div class="mb-6">
        <button @click="goBack" class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回列表
        </button>

        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>

        <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p class="text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <div v-else-if="record">
          <!-- 运动信息卡片 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <!-- 头部信息 -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {{ exerciseTypeMap[record.exerciseType] || record.exerciseType }}
                    </span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatDate(record.exerciseDate) }}
                    </span>
                  </div>
                  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                    运动详情
                  </h1>
                </div>
                <button
                  @click="deleteRecord"
                  class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  title="删除记录"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 核心指标 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">时长</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ formatDuration(record.durationMinutes) }}
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">距离</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ record.distanceKm ? record.distanceKm + ' km' : '-' }}
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">消耗</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ record.caloriesBurned ? record.caloriesBurned + ' kcal' : '-' }}
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">平均配速</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ record.avgPace ? formatPace(record.avgPace) : '-' }}
                </div>
              </div>
            </div>

            <!-- 详细指标 -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">详细指标</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">最大速度</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ record.maxSpeed ? record.maxSpeed + ' km/h' : '-' }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">最高海拔</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ record.maxElevation ? record.maxElevation + ' m' : '-' }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">最低海拔</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ record.minElevation ? record.minElevation + ' m' : '-' }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">海拔差</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ calculateElevationDiff() }}
                  </div>
                </div>
              </div>

              <!-- 爬升和下降 -->
              <div class="grid grid-cols-2 gap-4 mt-4">
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span class="text-sm font-medium text-green-700 dark:text-green-300">累计爬升</span>
                  </div>
                  <div class="text-xl font-bold text-green-700 dark:text-green-300">
                    {{ record.totalClimb ? record.totalClimb + ' m' : '-' }}
                  </div>
                </div>

                <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span class="text-sm font-medium text-red-700 dark:text-red-300">累计下降</span>
                  </div>
                  <div class="text-xl font-bold text-red-700 dark:text-red-300">
                    {{ record.totalDescent ? record.totalDescent + ' m' : '-' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 地图 -->
            <div v-if="trackPoints && trackPoints.length > 0" class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">运动轨迹</h3>
              <div ref="mapContainer" class="w-full h-96 rounded-lg overflow-hidden"></div>
            </div>

            <!-- 图表 -->
            <div v-if="trackPoints && trackPoints.length > 1" class="p-6 border-b border-gray-200 dark:border-gray-700">
              <ExerciseCharts :track-points="trackPoints" />
            </div>

            <!-- 分段配速 -->
            <div v-if="trackPoints && trackPoints.length > 1 && record.distanceKm && record.distanceKm >= 1" class="p-6 border-b border-gray-200 dark:border-gray-700">
              <SplitsData :track-points="trackPoints" :distance-km="record.distanceKm" />
            </div>

            <!-- 备注 -->
            <div v-if="record.notes" class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">备注</h3>
              <p class="text-gray-600 dark:text-gray-400">{{ record.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const route = useRoute()
const router = useRouter()
const api = useApi()

const loading = ref(true)
const error = ref(null)
const record = ref(null)
const trackPoints = ref(null)
const map = ref(null)
const mapContainer = ref(null)

const exerciseTypeMap = {
  running: '跑步',
  cycling: '骑行',
  swimming: '游泳',
  weights: '力量训练',
  yoga: '瑜伽',
  walking: '步行',
  hiit: 'HIIT',
  jumping: '跳绳',
  other: '其他'
}

async function loadRecord() {
  try {
    loading.value = true
    error.value = null

    const records = await api.getExerciseRecords()
    const found = records.find(r => r.id === parseInt(route.params.id))

    if (!found) {
      error.value = '记录不存在'
      return
    }

    record.value = found

    // Parse track points
    if (found.trackPoints) {
      try {
        trackPoints.value = typeof found.trackPoints === 'string'
          ? JSON.parse(found.trackPoints)
          : found.trackPoints

        // Initialize map
        nextTick(() => {
          initMap()
        })
      } catch (e) {
        console.error('Failed to parse track points:', e)
      }
    }
  } catch (err) {
    error.value = err.message || '加载记录失败'
  } finally {
    loading.value = false
  }
}

function initMap() {
  if (!trackPoints.value || trackPoints.value.length === 0 || !mapContainer.value) {
    return
  }

  // Destroy old map
  if (map.value) {
    map.value.remove()
    map.value = null
  }

  // Create new map
  map.value = L.map(mapContainer.value).setView(
    [trackPoints.value[0].lat, trackPoints.value[0].lon],
    13
  )

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map.value)

  // Draw track
  const latlngs = trackPoints.value.map(point => [point.lat, point.lon])

  const polyline = L.polyline(latlngs, {
    color: '#8b5cf6',
    weight: 3,
    opacity: 0.8
  }).addTo(map.value)

  // Add start and end markers
  const startIcon = L.divIcon({
    html: '<div style="background: #22c55e; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    className: 'custom-marker',
    iconSize: [12, 12]
  })

  const endIcon = L.divIcon({
    html: '<div style="background: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    className: 'custom-marker',
    iconSize: [12, 12]
  })

  L.marker(latlngs[0], { icon: startIcon }).addTo(map.value).bindPopup('起点')
  L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(map.value).bindPopup('终点')

  // Fit map bounds
  map.value.fitBounds(polyline.getBounds(), { padding: [50, 50] })
}

async function deleteRecord() {
  if (confirm('确定要删除这条记录吗？此操作无法撤销。')) {
    try {
      await api.deleteExerciseRecord(record.value.id)
      goBack()
    } catch (err) {
      alert('删除失败: ' + err.message)
    }
  }
}

function goBack() {
  router.push('/exercise')
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} 分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours} 小时 ${mins} 分钟`
}

function formatPace(pace) {
  const mins = Math.floor(pace)
  const secs = Math.round((pace - mins) * 60)
  return `${mins}'${secs.toString().padStart(2, '0')}" /km`
}

function calculateElevationDiff() {
  if (record.value.maxElevation && record.value.minElevation) {
    return (record.value.maxElevation - record.value.minElevation) + ' m'
  }
  return '-'
}

onMounted(() => {
  loadRecord()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style scoped>
.custom-marker {
  background: transparent;
  border: none;
}
</style>

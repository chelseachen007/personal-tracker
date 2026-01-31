<template>
  <div class="exercise-import">
    <!-- 上传区域 -->
    <div
      class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
      :class="isDragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
          <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p class="text-lg font-medium text-gray-900 dark:text-white">
            拖拽文件到这里或点击上传
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            支持 .kml, .gpx, .tcx 格式的运动文件
          </p>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept=".kml,.gpx,.tcx"
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          @click="$refs.fileInput.click()"
          class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          选择文件
        </button>
      </div>
    </div>

    <!-- 上传状态 -->
    <div v-if="uploading" class="mt-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">正在上传...</span>
        <span class="text-sm font-medium text-purple-600 dark:text-purple-400">{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="bg-purple-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- 导入成功后的地图展示 -->
    <div v-if="importedData" class="mt-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <!-- 运动信息头部 -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                🏃 运动数据解析成功！
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ importedData.name }}
              </p>
            </div>
            <button
              @click="closeMap"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 运动详情 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400">日期</div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(importedData.exerciseDate) }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400">时长</div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDuration(importedData.durationMinutes) }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400">距离</div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ importedData.distanceKm }} km
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <div class="text-xs text-gray-500 dark:text-gray-400">消耗</div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ importedData.caloriesBurned }} kcal
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 地图 -->
        <div class="relative">
          <div ref="mapContainer" class="w-full h-96"></div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import L from 'leaflet'
import axios from 'axios'

// Import Leaflet CSS only on client side
onMounted(() => {
  if (process.client) {
    import('leaflet/dist/leaflet.css')
  }
})

const api = useApi()
const emit = defineEmits(['imported'])

// 状态
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const importedData = ref(null)
const error = ref(null)
const map = ref(null)
const mapContainer = ref(null)

// 文件处理
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

    // Use axios for upload progress support
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

    // 初始化地图
    nextTick(() => {
      initMap(response.data.trackData)
    })
  } catch (err) {
    error.value = err.response?.data?.error || err.message || '导入失败，请重试'
  } finally {
    uploading.value = false
  }
}

// 地图相关
const trackData = ref(null)

function initMap(data) {
  if (!data || !data.trackPoints || data.trackPoints.length === 0) {
    return
  }

  // 销毁旧地图
  if (map.value) {
    map.value.remove()
    map.value = null
  }

  // 创建新地图
  map.value = L.map(mapContainer.value).setView(
    [data.trackPoints[0].lat, data.trackPoints[0].lon],
    13
  )

  // 添加 OpenStreetMap 图层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map.value)

  // 绘制轨迹
  const latlngs = data.trackPoints.map(point => [point.lat, point.lon])

  const polyline = L.polyline(latlngs, {
    color: '#8b5cf6',
    weight: 3,
    opacity: 0.8
  }).addTo(map.value)

  // 标记起点和终点
  const startIcon = L.divIcon({
    html: '<div style="background: #22c55e; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
    className: 'custom-marker',
    iconSize: [12, 12]
  })

  const endIcon = L.divIcon({
    html: '<div style="background: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
    className: 'custom-marker',
    iconSize: [12, 12]
  })

  L.marker(latlngs[0], { icon: startIcon }).addTo(map.value).bindPopup('起点')
  L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(map.value).bindPopup('终点')

  // 自动调整地图视野
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

// 格式化函数
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} 分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours} 小时 ${mins} 分钟`
}

// 清理
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

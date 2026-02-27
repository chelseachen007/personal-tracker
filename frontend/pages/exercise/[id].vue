<template>
  <div class="min-h-screen relative">
    <!-- Background -->
    <div class="mesh-bg"></div>
    <div class="noise-overlay"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors animate-fade-in"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        返回列表
      </button>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24">
        <div class="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-500">加载中...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="glass-card p-8 text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-red-400">{{ error }}</p>
      </div>

      <!-- Record Content -->
      <div v-else-if="record" class="space-y-6">
        <!-- Header Card -->
        <div class="glass-card overflow-hidden animate-fade-in">
          <div class="p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent border-b border-slate-700/50">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  :class="getSportBgClass(record.exerciseType)">
                  {{ getSportIcon(record.exerciseType) }}
                </div>
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <span class="text-2xl font-bold text-slate-800">{{ exerciseTypeMap[record.exerciseType] || record.exerciseType }}</span>
                    <span v-if="record.routeName" class="text-slate-400">· {{ record.routeName }}</span>
                  </div>
                  <div class="text-slate-400">{{ formatDate(record.exerciseDate) }}</div>
                </div>
              </div>
              <button
                @click="deleteRecord"
                class="p-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Core Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-700/50">
            <div class="p-6">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs text-slate-500 uppercase tracking-wider">时长</span>
              </div>
              <div class="stat-number text-3xl text-slate-800">{{ formatDuration(record.durationMinutes) }}</div>
            </div>

            <div class="p-6">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span class="text-xs text-slate-500 uppercase tracking-wider">距离</span>
              </div>
              <div class="stat-number text-3xl text-slate-800">{{ record.distanceKm ? `${record.distanceKm} km` : '-' }}</div>
            </div>

            <div class="p-6">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-coral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                <span class="text-xs text-slate-500 uppercase tracking-wider">消耗</span>
              </div>
              <div class="stat-number text-3xl text-slate-800">{{ record.caloriesBurned ? `${record.caloriesBurned}` : '-' }}</div>
              <div class="text-xs text-slate-500">kcal</div>
            </div>

            <div class="p-6">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span class="text-xs text-slate-500 uppercase tracking-wider">配速</span>
              </div>
              <div class="stat-number text-3xl text-slate-800">{{ record.avgPace ? formatPace(record.avgPace) : '-' }}</div>
              <div v-if="record.avgPace" class="text-xs text-slate-500">/km</div>
            </div>
          </div>
        </div>

        <!-- Hiking Specific -->
        <div v-if="record.exerciseType === 'hiking'" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
          <!-- Elevation Card -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              海拔数据
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div class="text-sm text-emerald-400 mb-1">累计爬升</div>
                <div class="text-2xl font-bold text-slate-800">{{ record.totalClimb ? `${record.totalClimb} m` : '-' }}</div>
              </div>
              <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div class="text-sm text-red-400 mb-1">累计下降</div>
                <div class="text-2xl font-bold text-slate-800">{{ record.totalDescent ? `${record.totalDescent} m` : '-' }}</div>
              </div>
              <div class="p-4 rounded-xl bg-slate-800/50">
                <div class="text-sm text-slate-400 mb-1">最高海拔</div>
                <div class="text-2xl font-bold text-slate-800">{{ record.maxElevation ? `${record.maxElevation} m` : '-' }}</div>
              </div>
              <div class="p-4 rounded-xl bg-slate-800/50">
                <div class="text-sm text-slate-400 mb-1">最低海拔</div>
                <div class="text-2xl font-bold text-slate-800">{{ record.minElevation ? `${record.minElevation} m` : '-' }}</div>
              </div>
            </div>
          </div>

          <!-- Route Info -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              路线信息
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-slate-700/50">
                <span class="text-slate-500">路线名称</span>
                <span class="text-slate-800 font-medium">{{ record.routeName || '-' }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-slate-700/50">
                <span class="text-slate-500">难度等级</span>
                <span class="px-3 py-1 rounded-lg text-sm font-medium" :class="getDifficultyClass(record.difficulty)">
                  {{ getDifficultyLabel(record.difficulty) }}
                </span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-slate-500">平均速度</span>
                <span class="text-slate-800 font-medium">{{ record.avgSpeed ? `${record.avgSpeed} km/h` : '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Badminton Specific -->
        <div v-if="record.exerciseType === 'badminton'" class="glass-card p-6 animate-fade-in-up">
          <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span class="text-2xl">🏸</span>
            对局数据
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div class="text-sm text-cyan-400 mb-1">对局类型</div>
              <div class="text-xl font-bold text-slate-800">{{ getMatchTypeLabel(record.matchType) }}</div>
            </div>
            <div class="p-4 rounded-xl bg-slate-800/50">
              <div class="text-sm text-slate-400 mb-1">对局数量</div>
              <div class="text-xl font-bold text-slate-800">{{ record.gamesPlayed || '-' }} 场</div>
            </div>
            <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div class="text-sm text-emerald-400 mb-1">胜场</div>
              <div class="text-xl font-bold text-slate-800">{{ record.gamesWon || '-' }} 场</div>
            </div>
            <div class="p-4 rounded-xl bg-slate-800/50">
              <div class="text-sm text-slate-400 mb-1">场地</div>
              <div class="text-xl font-bold text-slate-800">{{ record.venue === 'indoor' ? '室内' : '室外' }}</div>
            </div>
          </div>
        </div>

        <!-- RPE Rating -->
        <div v-if="record.rpe" class="glass-card p-6 animate-fade-in-up">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">感受评分</h3>
          <div class="flex items-center gap-8">
            <div class="text-center">
              <div class="text-5xl font-bold mb-2" :class="getRPEColorClass(record.rpe)">{{ record.rpe }}</div>
              <div class="text-sm text-slate-500">/ 10</div>
            </div>
            <div class="flex-1">
              <div class="text-lg font-medium mb-4" :class="getRPEColorClass(record.rpe)">
                {{ getRPEEmoji(record.rpe) }} {{ getRPELabel(record.rpe) }}
              </div>
              <div class="flex gap-1">
                <div
                  v-for="i in 10"
                  :key="i"
                  class="flex-1 h-3 rounded-full transition-all"
                  :class="{
                    'bg-emerald-500': i <= 2,
                    'bg-cyan-500': i > 2 && i <= 4,
                    'bg-yellow-500': i > 4 && i <= 6,
                    'bg-orange-500': i > 6 && i <= 8,
                    'bg-red-500': i > 8
                  }"
                  :style="{ opacity: i <= record.rpe ? 1 : 0.15 }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weather -->
        <div v-if="record.weatherCondition || record.temperature" class="glass-card p-6 animate-fade-in-up">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">天气状况</h3>
          <div class="flex flex-wrap gap-4">
            <div v-if="record.weatherCondition" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50">
              <span class="text-3xl">{{ getWeatherIcon(record.weatherCondition) }}</span>
              <div>
                <div class="text-xs text-slate-500">天气</div>
                <div class="text-lg font-medium text-slate-800">{{ record.weatherCondition }}</div>
              </div>
            </div>
            <div v-if="record.temperature" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50">
              <span class="text-3xl">🌡️</span>
              <div>
                <div class="text-xs text-slate-500">温度</div>
                <div class="text-lg font-medium text-slate-800">{{ record.temperature }}°C</div>
              </div>
            </div>
            <div v-if="record.humidity" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50">
              <span class="text-3xl">💧</span>
              <div>
                <div class="text-xs text-slate-500">湿度</div>
                <div class="text-lg font-medium text-slate-800">{{ record.humidity }}%</div>
              </div>
            </div>
            <div v-if="record.windSpeed" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50">
              <span class="text-3xl">💨</span>
              <div>
                <div class="text-xs text-slate-500">风速</div>
                <div class="text-lg font-medium text-slate-800">{{ record.windSpeed }} km/h</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Track Map -->
        <div v-if="trackPoints && trackPoints.length > 0" class="glass-card overflow-hidden animate-fade-in-up">
          <div class="p-6 border-b border-slate-700/50">
            <h3 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              运动轨迹
            </h3>
          </div>
          <div ref="mapContainer" class="w-full h-96"></div>
        </div>

        <!-- Charts -->
        <div v-if="trackPoints && trackPoints.length > 1" class="glass-card p-6 animate-fade-in-up">
          <ExerciseCharts :track-points="trackPoints" />
        </div>

        <!-- Splits -->
        <div v-if="trackPoints && trackPoints.length > 1 && record.distanceKm >= 1" class="glass-card p-6 animate-fade-in-up">
          <SplitsData :track-points="trackPoints" :distance-km="record.distanceKm" />
        </div>

        <!-- Notes -->
        <div v-if="record.notes" class="glass-card p-6 animate-fade-in-up">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">备注</h3>
          <p class="text-slate-600 whitespace-pre-wrap">{{ record.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import L from 'leaflet'

onMounted(() => {
  if (import.meta.client) {
    import('leaflet/dist/leaflet.css')
  }
})

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
  hiking: '徒步',
  badminton: '羽毛球',
  running: '跑步',
  cycling: '骑行',
  swimming: '游泳',
  weights: '力量训练',
  yoga: '瑜伽',
  walking: '步行',
  hiit: 'HIIT',
  tennis: '网球',
  basketball: '篮球',
  football: '足球',
  other: '其他'
}

function getSportIcon(type) {
  const icons = {
    hiking: '🥾',
    badminton: '🏸',
    running: '🏃',
    cycling: '🚴',
    swimming: '🏊',
    walking: '🚶',
    tennis: '🎾',
    basketball: '🏀',
    football: '⚽'
  }
  return icons[type] || '📌'
}

function getSportBgClass(type) {
  const classes = {
    hiking: 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30',
    badminton: 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30',
    running: 'bg-gradient-to-br from-purple-500/30 to-pink-500/30',
    cycling: 'bg-gradient-to-br from-orange-500/30 to-red-500/30',
    swimming: 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30'
  }
  return classes[type] || 'bg-slate-700/50'
}

function getMatchTypeLabel(type) {
  const labels = { singles: '单打', doubles: '双打', mixed: '混双' }
  return labels[type] || type
}

function getDifficultyClass(diff) {
  const classes = {
    easy: 'bg-emerald-500/20 text-emerald-300',
    moderate: 'bg-yellow-500/20 text-yellow-300',
    hard: 'bg-orange-500/20 text-orange-300',
    expert: 'bg-red-500/20 text-red-300'
  }
  return classes[diff] || 'bg-slate-700/50 text-slate-300'
}

function getDifficultyLabel(diff) {
  const labels = { easy: '简单', moderate: '中等', hard: '困难', expert: '专家' }
  return labels[diff] || '-'
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

    if (found.trackPoints) {
      try {
        trackPoints.value = typeof found.trackPoints === 'string'
          ? JSON.parse(found.trackPoints)
          : found.trackPoints

        nextTick(() => initMap())
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
  if (!trackPoints.value || trackPoints.value.length === 0 || !mapContainer.value) return

  if (map.value) {
    map.value.remove()
    map.value = null
  }

  map.value = L.map(mapContainer.value).setView(
    [trackPoints.value[0].lat, trackPoints.value[0].lon],
    13
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map.value)

  const latlngs = trackPoints.value.map(p => [p.lat, p.lon])

  const polyline = L.polyline(latlngs, {
    color: '#10b981',
    weight: 4,
    opacity: 0.9
  }).addTo(map.value)

  const startIcon = L.divIcon({
    html: '<div style="background: #22c55e; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    className: 'custom-marker',
    iconSize: [16, 16]
  })

  const endIcon = L.divIcon({
    html: '<div style="background: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    className: 'custom-marker',
    iconSize: [16, 16]
  })

  L.marker(latlngs[0], { icon: startIcon }).addTo(map.value).bindPopup('起点')
  L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(map.value).bindPopup('终点')

  map.value.fitBounds(polyline.getBounds(), { padding: [50, 50] })
}

async function deleteRecord() {
  if (confirm('确定要删除这条记录吗？')) {
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
    weekday: 'long'
  })
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function formatPace(pace) {
  const mins = Math.floor(pace)
  const secs = Math.round((pace - mins) * 60)
  return `${mins}'${secs.toString().padStart(2, '0')}"`
}

function getWeatherIcon(condition) {
  const icons = {
    '晴天': '☀️', '多云': '⛅', '阴天': '☁️',
    '小雨': '🌧️', '中雨': '🌧️', '大雨': '⛈️',
    '雪': '❄️', '雾': '🌫️'
  }
  return icons[condition] || '🌤️'
}

function getRPEEmoji(rpe) {
  if (rpe <= 2) return '😊'
  if (rpe <= 4) return '😀'
  if (rpe <= 6) return '😐'
  if (rpe <= 8) return '😓'
  return '😫'
}

function getRPELabel(rpe) {
  if (rpe <= 2) return '非常轻松'
  if (rpe <= 4) return '轻松'
  if (rpe <= 6) return '中等强度'
  if (rpe <= 8) return '比较吃力'
  return '非常吃力'
}

function getRPEColorClass(rpe) {
  if (rpe <= 2) return 'text-emerald-400'
  if (rpe <= 4) return 'text-cyan-400'
  if (rpe <= 6) return 'text-yellow-400'
  if (rpe <= 8) return 'text-orange-400'
  return 'text-red-400'
}

onMounted(() => loadRecord())

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

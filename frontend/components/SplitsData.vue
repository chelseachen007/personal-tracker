<template>
  <div class="splits-data">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
      分段配速 (每公里)
    </h3>

    <div v-if="!splits || splits.length === 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center text-gray-500 dark:text-gray-400">
      暂无分段数据
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <!-- 分段列表 -->
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="(split, index) in splits"
          :key="index"
          class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          :class="{
            'bg-purple-50 dark:bg-purple-900/20': isFastest(split, index),
            'bg-red-50 dark:bg-red-900/20': isSlowest(split, index)
          }"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- 分段号 -->
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                :class="{
                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300': !isFastest(split, index) && !isSlowest(split, index),
                  'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300': isFastest(split, index),
                  'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300': isSlowest(split, index)
                }"
              >
                {{ index + 1 }}
              </div>

              <!-- 配速 -->
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">
                  {{ formatPace(split.pace) }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatTime(split.time) }}
                </div>
              </div>

              <!-- 海拔变化 -->
              <div v-if="split.elevationChange" class="text-sm">
                <span v-if="split.elevationChange > 0" class="text-green-600 dark:text-green-400">
                  ↑ {{ split.elevationChange.toFixed(0) }} m
                </span>
                <span v-else-if="split.elevationChange < 0" class="text-red-600 dark:text-red-400">
                  ↓ {{ Math.abs(split.elevationChange).toFixed(0) }} m
                </span>
              </div>
            </div>

            <!-- 标记 -->
            <div v-if="isFastest(split, index)" class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs font-medium">
              最快
            </div>
            <div v-else-if="isSlowest(split, index)" class="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs font-medium">
              最慢
            </div>
          </div>
        </div>
      </div>

      <!-- 汇总统计 -->
      <div class="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">最快配速</div>
            <div class="text-lg font-semibold text-green-600 dark:text-green-400">
              {{ formatPace(stats.fastest) }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">最慢配速</div>
            <div class="text-lg font-semibold text-red-600 dark:text-red-400">
              {{ formatPace(stats.slowest) }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">平均配速</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ formatPace(stats.average) }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">总段数</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ splits.length }} 段
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  trackPoints: {
    type: Array,
    default: () => []
  },
  distanceKm: {
    type: Number,
    default: 0
  }
})

// 计算分段数据
const splits = computed(() => {
  if (!props.trackPoints || props.trackPoints.length < 2 || props.distanceKm === 0) {
    return []
  }

  const splits = []
  const segmentDistance = 1000 // 每公里

  let currentSegmentStart = 0
  let currentSegmentPoints = [props.trackPoints[0]]
  let totalDistance = 0
  let segmentStartTime = props.trackPoints[0].time

  for (let i = 1; i < props.trackPoints.length; i++) {
    const prev = props.trackPoints[i - 1]
    const curr = props.trackPoints[i]

    const distance = calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon)
    totalDistance += distance

    currentSegmentPoints.push(curr)

    // 如果累计距离达到或超过 1 公里，完成一段
    if (totalDistance >= segmentDistance || i === props.trackPoints.length - 1) {
      const segmentTime = curr.time - segmentStartTime

      // 计算配速
      const segmentDistanceKm = totalDistance / 1000
      const pace = segmentTime > 0 ? (segmentTime / 60) / segmentDistanceKm : 0

      // 计算海拔变化
      const elevationChange = curr.alt - currentSegmentPoints[0].alt

      splits.push({
        distance: segmentDistanceKm,
        time: segmentTime,
        pace,
        elevationChange
      })

      // 重置下一段
      totalDistance = 0
      segmentStartTime = curr.time
      currentSegmentPoints = [curr]
    }
  }

  return splits
})

// 计算统计
const stats = computed(() => {
  if (splits.value.length === 0) {
    return { fastest: null, slowest: null, average: null }
  }

  const paces = splits.value.map(s => s.pace).filter(p => p > 0)

  if (paces.length === 0) {
    return { fastest: null, slowest: null, average: null }
  }

  const fastest = Math.min(...paces)
  const slowest = Math.max(...paces)
  const average = paces.reduce((sum, p) => sum + p, 0) / paces.length

  return { fastest, slowest, average }
})

function isFastest(split, index) {
  if (!stats.value.fastest || split.pace === 0) return false
  return split.pace === stats.value.fastest
}

function isSlowest(split, index) {
  if (!stats.value.slowest || split.pace === 0) return false
  return split.pace === stats.value.slowest
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

function formatPace(pace) {
  if (!pace) return '-'
  const mins = Math.floor(pace)
  const secs = Math.round((pace - mins) * 60)
  return `${mins}'${secs.toString().padStart(2, '0')}"`
}

function formatTime(ms) {
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="pb-records">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      个人最佳 (PB)
    </h3>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent"></div>
    </div>

    <div v-else-if="records.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      暂无记录
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- 最远距离 -->
      <div v-if="records.longestDistance" class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-blue-100 text-sm font-medium mb-1">最远距离</p>
            <p class="text-3xl font-bold">
              {{ records.longestDistance.distanceKm }}<span class="text-lg ml-1">km</span>
            </p>
          </div>
          <div class="bg-white/20 rounded-full p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-sm text-blue-100">
          <span>{{ formatDate(records.longestDistance.exerciseDate) }}</span>
          <span class="bg-white/20 px-2 py-1 rounded-full text-xs">
            {{ exerciseTypeMap[records.longestDistance.exerciseType] }}
          </span>
        </div>
      </div>

      <!-- 最长时长 -->
      <div v-if="records.longestDuration" class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-green-100 text-sm font-medium mb-1">最长时长</p>
            <p class="text-3xl font-bold">
              {{ formatDuration(records.longestDuration.durationMinutes) }}
            </p>
          </div>
          <div class="bg-white/20 rounded-full p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-sm text-green-100">
          <span>{{ formatDate(records.longestDuration.exerciseDate) }}</span>
          <span class="bg-white/20 px-2 py-1 rounded-full text-xs">
            {{ exerciseTypeMap[records.longestDuration.exerciseType] }}
          </span>
        </div>
      </div>

      <!-- 最快配速 -->
      <div v-if="records.fastestPace" class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-purple-100 text-sm font-medium mb-1">最快配速</p>
            <p class="text-3xl font-bold">
              {{ formatPace(records.fastestPace.avgPace) }}
            </p>
          </div>
          <div class="bg-white/20 rounded-full p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-sm text-purple-100">
          <span>{{ formatDate(records.fastestPace.exerciseDate) }}</span>
          <span class="bg-white/20 px-2 py-1 rounded-full text-xs">
            {{ exerciseTypeMap[records.fastestPace.exerciseType] }}
          </span>
        </div>
      </div>

      <!-- 最高爬升 -->
      <div v-if="records.mostClimb" class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-orange-100 text-sm font-medium mb-1">最高爬升</p>
            <p class="text-3xl font-bold">
              {{ records.mostClimb.totalClimb }}<span class="text-lg ml-1">m</span>
            </p>
          </div>
          <div class="bg-white/20 rounded-full p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-sm text-orange-100">
          <span>{{ formatDate(records.mostClimb.exerciseDate) }}</span>
          <span class="bg-white/20 px-2 py-1 rounded-full text-xs">
            {{ exerciseTypeMap[records.mostClimb.exerciseType] }}
          </span>
        </div>
      </div>

      <!-- 最大速度 -->
      <div v-if="records.maxSpeed" class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-red-100 text-sm font-medium mb-1">最大速度</p>
            <p class="text-3xl font-bold">
              {{ records.maxSpeed.maxSpeed }}<span class="text-lg ml-1">km/h</span>
            </p>
          </div>
          <div class="bg-white/20 rounded-full p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-sm text-red-100">
          <span>{{ formatDate(records.maxSpeed.exerciseDate) }}</span>
          <span class="bg-white/20 px-2 py-1 rounded-full text-xs">
            {{ exerciseTypeMap[records.maxSpeed.exerciseType] }}
          </span>
        </div>
      </div>

      <!-- 最多卡路里 -->
      <div v-if="records.mostCalories" class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-pink-100 text-sm font-medium mb-1">最多消耗</p>
            <p class="text-3xl font-bold">
              {{ records.mostCalories.caloriesBurned }}<span class="text-lg ml-1">kcal</span>
            </p>
          </div>
          <div class="bg-white/20 rounded-full p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-sm text-pink-100">
          <span>{{ formatDate(records.mostCalories.exerciseDate) }}</span>
          <span class="bg-white/20 px-2 py-1 rounded-full text-xs">
            {{ exerciseTypeMap[records.mostCalories.exerciseType] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const loading = ref(true)
const records = ref({})

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

async function loadPBRecords() {
  try {
    loading.value = true

    const allRecords = await api.getExerciseRecords()

    // 过滤掉空值记录
    const validRecords = allRecords.filter(r => r.distanceKm || r.durationMinutes || r.avgPace || r.totalClimb || r.maxSpeed || r.caloriesBurned)

    if (validRecords.length === 0) {
      records.value = {}
      return
    }

    // 计算各项 PB
    records.value = {
      longestDistance: validRecords.reduce((a, b) =>
        (a.distanceKm || 0) > (b.distanceKm || 0) ? a : b
      ),
      longestDuration: validRecords.reduce((a, b) =>
        a.durationMinutes > b.durationMinutes ? a : b
      ),
      fastestPace: validRecords
        .filter(r => r.avgPace)
        .reduce((a, b) => a.avgPace < b.avgPace ? a : b),
      mostClimb: validRecords
        .filter(r => r.totalClimb)
        .reduce((a, b) => (a.totalClimb || 0) > (b.totalClimb || 0) ? a : b),
      maxSpeed: validRecords
        .filter(r => r.maxSpeed)
        .reduce((a, b) => (a.maxSpeed || 0) > (b.maxSpeed || 0) ? a : b),
      mostCalories: validRecords
        .filter(r => r.caloriesBurned)
        .reduce((a, b) => (a.caloriesBurned || 0) > (b.caloriesBurned || 0) ? a : b)
    }
  } catch (error) {
    console.error('Failed to load PB records:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function formatPace(pace) {
  if (!pace) return '-'
  const mins = Math.floor(pace)
  const secs = Math.round((pace - mins) * 60)
  return `${mins}'${secs.toString().padStart(2, '0')}"`
}

onMounted(() => {
  loadPBRecords()
})

defineExpose({
  loadPBRecords
})
</script>

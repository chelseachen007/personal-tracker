<template>
  <div class="exercise-heatmap">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      运动日历 ({{ currentYear }}年{{ currentMonth }}月)
    </h3>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <!-- 月份选择 -->
      <div class="flex items-center justify-between mb-6">
        <button
          @click="prevMonth"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ currentYear }}年 {{ currentMonth }}月
          </span>
        </div>

        <button
          @click="nextMonth"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- 星期标题 -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
          :key="day"
          class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- 日期格子 -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="aspect-square flex items-center justify-center rounded-lg cursor-pointer transition hover:scale-105"
          :class="getDayClass(day)"
          @click="showDayDetails(day)"
        >
          <div class="text-center">
            <div class="text-sm font-medium">{{ day.dayOfMonth }}</div>
            <div v-if="day.count > 0" class="text-xs mt-1">{{ day.count }}</div>
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="flex items-center justify-center gap-4 mt-6">
        <span class="text-xs text-gray-500 dark:text-gray-400">无</span>
        <div class="flex gap-1">
          <div v-for="level in 5" :key="level" class="w-4 h-4 rounded" :class="getLevelClass(level)"></div>
        </div>
        <span class="text-xs text-gray-500 dark:text-gray-400">多</span>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="selectedDay" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="selectedDay = null">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ selectedDay.date }}
          </h4>
          <button @click="selectedDay = null" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="selectedDayRecords.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
          暂无运动记录
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="record in selectedDayRecords"
            :key="record.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ exerciseTypeMap[record.exerciseType] }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDuration(record.durationMinutes) }}
                {{ record.distanceKm ? ` · ${record.distanceKm} km` : '' }}
              </div>
            </div>
            <span class="text-purple-600 dark:text-purple-400 font-medium">
              {{ record.caloriesBurned ? `${record.caloriesBurned} kcal` : '' }}
            </span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">运动次数</span>
            <span class="font-semibold text-gray-900 dark:text-white">
              {{ selectedDayRecords.length }} 次
            </span>
          </div>
          <div class="flex items-center justify-between text-sm mt-2">
            <span class="text-gray-600 dark:text-gray-400">总时长</span>
            <span class="font-semibold text-gray-900 dark:text-white">
              {{ formatDuration(selectedDayRecords.reduce((sum, r) => sum + r.durationMinutes, 0)) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const loading = ref(true)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const monthlyData = ref({})
const selectedDay = ref(null)
const selectedDayRecords = ref([])

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

// 计算日历天数
const calendarDays = computed(() => {
  const days = []

  // 获取当月第一天是星期几
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1).getDay()

  // 获取当月总天数
  const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()

  // 填充空白天数
  for (let i = 0; i < firstDay; i++) {
    days.push({
      date: '',
      dayOfMonth: '',
      count: 0,
      isToday: false,
      isEmpty: true
    })
  }

  // 填充实际天数
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const count = monthlyData.value[dateStr] || 0
    const isToday = isDateToday(dateStr)

    days.push({
      date: dateStr,
      dayOfMonth: i,
      count,
      isToday,
      isEmpty: false
    })
  }

  return days
})

async function loadMonthlyData() {
  try {
    loading.value = true

    const startDate = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-01`
    const endDate = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-31`

    const records = await api.getExerciseRecords({ startDate, endDate })

    // 统计每天的运动次数
    monthlyData.value = {}
    records.forEach(record => {
      const dateStr = record.exerciseDate.split('T')[0]
      monthlyData.value[dateStr] = (monthlyData.value[dateStr] || 0) + 1
    })
  } catch (error) {
    console.error('Failed to load monthly data:', error)
  } finally {
    loading.value = false
  }
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadMonthlyData()
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadMonthlyData()
}

function getDayClass(day) {
  if (day.isEmpty) return ''

  const classes = []

  if (day.isToday) {
    classes.push('ring-2 ring-orange-500 dark:ring-orange-400')
  }

  if (day.count === 0) {
    classes.push('bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500')
  } else {
    classes.push(getLevelClass(day.count))
    classes.push('text-white')
  }

  return classes.join(' ')
}

function getLevelClass(count) {
  if (count === 0) return ''
  if (count === 1) return 'bg-green-500'
  if (count === 2) return 'bg-green-600'
  if (count === 3) return 'bg-yellow-500'
  if (count >= 4) return 'bg-orange-500'
  return 'bg-red-500'
}

async function showDayDetails(day) {
  if (day.isEmpty || day.count === 0) return

  try {
    selectedDay.value = day

    const records = await api.getExerciseRecords({
      startDate: day.date,
      endDate: day.date
    })

    selectedDayRecords.value = records
  } catch (error) {
    console.error('Failed to load day details:', error)
  }
}

function isDateToday(dateStr) {
  const today = new Date()
  const date = new Date(dateStr)
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

watch([currentYear, currentMonth], () => {
  loadMonthlyData()
})

onMounted(() => {
  loadMonthlyData()
})
</script>

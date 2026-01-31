<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面头部 -->
      <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">数据分析</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">洞察您的数据趋势，做出更好的决策</p>
        </div>
        <div class="flex items-center gap-4">
          <select v-model="timeRange" @change="loadData"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white">
            <option value="7">最近7天</option>
            <option value="30">最近30天</option>
            <option value="90">最近90天</option>
          </select>
        </div>
      </div>

      <!-- 营养趋势 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">营养摄入趋势</h3>
        <div class="h-72">
          <Line :data="nutritionChartData" :options="lineChartOptions" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 运动类型分布 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">运动类型分布</h3>
          <div class="h-64">
            <Doughnut :data="exerciseDistributionData" :options="doughnutOptions" />
          </div>
        </div>

        <!-- 运动时长趋势 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">运动时长趋势</h3>
          <div class="h-64">
            <Bar :data="exerciseTrendData" :options="barChartOptions" />
          </div>
        </div>
      </div>

      <!-- 财务趋势 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">收支趋势</h3>
        <div class="h-72">
          <Line :data="financeChartData" :options="lineChartOptions" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 睡眠质量 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">睡眠质量趋势</h3>
          <div class="h-64">
            <Bar :data="sleepQualityData" :options="sleepBarOptions" />
          </div>
        </div>

        <!-- 心情趋势 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">心情与精力趋势</h3>
          <div class="h-64">
            <Line :data="moodTrendData" :options="lineChartOptions" />
          </div>
        </div>
      </div>

      <!-- 健康指标 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">健康指标趋势</h3>
        <div class="h-72">
          <Line :data="healthChartData" :options="healthChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const api = useApi()
const timeRange = ref('30')

// 数据存储
const mealRecords = ref([])
const exerciseRecords = ref([])
const financeRecords = ref([])
const sleepRecords = ref([])
const moodRecords = ref([])
const healthRecords = ref([])

// 日期格式化
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 生成日期标签
function generateDateLabels(days) {
  const labels = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    labels.push(formatDate(date))
  }
  return labels
}

// 按日期聚合数据
function aggregateByDate(records, dateField, valueField, days) {
  const data = new Array(days).fill(null)
  const today = new Date()

  records.forEach(record => {
    const recordDate = new Date(record[dateField])
    const daysDiff = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24))
    if (daysDiff >= 0 && daysDiff < days) {
      const index = days - 1 - daysDiff
      // 累加当天的值
      if (data[index] === null) data[index] = 0
      data[index] += (record[valueField] || 0)
    }
  })

  return data
}

// 营养图表数据
const nutritionChartData = computed(() => ({
  labels: generateDateLabels(parseInt(timeRange.value)),
  datasets: [
    {
      label: '卡路里 (kcal)',
      data: aggregateByDate(mealRecords.value, 'mealDate', 'calories', parseInt(timeRange.value)),
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      fill: true,
      tension: 0.3,
      yAxisID: 'y'
    },
    {
      label: '蛋白质 (g)',
      data: aggregateByDate(mealRecords.value, 'mealDate', 'protein', parseInt(timeRange.value)),
      borderColor: '#ef4444',
      backgroundColor: 'transparent',
      tension: 0.3,
      yAxisID: 'y1'
    },
    {
      label: '碳水 (g)',
      data: aggregateByDate(mealRecords.value, 'mealDate', 'carbs', parseInt(timeRange.value)),
      borderColor: '#eab308',
      backgroundColor: 'transparent',
      tension: 0.3,
      yAxisID: 'y1'
    },
    {
      label: '脂肪 (g)',
      data: aggregateByDate(mealRecords.value, 'mealDate', 'fat', parseInt(timeRange.value)),
      borderColor: '#3b82f6',
      backgroundColor: 'transparent',
      tension: 0.3,
      yAxisID: 'y1'
    }
  ]
}))

// 运动类型分布
const exerciseDistributionData = computed(() => {
  const typeMap = {
    running: '跑步',
    cycling: '骑行',
    swimming: '游泳',
    weights: '力量',
    walking: '步行',
    other: '其他'
  }

  const counts = {}
  exerciseRecords.value.forEach(r => {
    const type = typeMap[r.exerciseType] || r.exerciseType
    counts[type] = (counts[type] || 0) + 1
  })

  return {
    labels: Object.keys(counts),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: [
        '#8b5cf6', '#3b82f6', '#06b6d4', '#22c55e', '#eab308', '#f97316'
      ],
      borderWidth: 0
    }]
  }
})

// 运动时长趋势
const exerciseTrendData = computed(() => ({
  labels: generateDateLabels(parseInt(timeRange.value)),
  datasets: [{
    label: '运动时长 (分钟)',
    data: aggregateByDate(exerciseRecords.value, 'exerciseDate', 'durationMinutes', parseInt(timeRange.value)),
    backgroundColor: '#8b5cf6',
    borderRadius: 4
  }]
}))

// 财务趋势
const financeChartData = computed(() => {
  const income = aggregateByDate(
    financeRecords.value.filter(r => r.transactionType === 'income'),
    'recordDate', 'amount', parseInt(timeRange.value)
  )
  const expense = aggregateByDate(
    financeRecords.value.filter(r => r.transactionType === 'expense'),
    'recordDate', 'amount', parseInt(timeRange.value)
  )

  return {
    labels: generateDateLabels(parseInt(timeRange.value)),
    datasets: [
      {
        label: '收入',
        data: income,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: '支出',
        data: expense,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  }
})

// 睡眠质量
const sleepQualityData = computed(() => {
  const days = parseInt(timeRange.value)
  const labels = generateDateLabels(days)
  const duration = new Array(days).fill(null)
  const quality = new Array(days).fill(null)
  const today = new Date()

  sleepRecords.value.forEach(record => {
    const recordDate = new Date(record.sleepDate)
    const daysDiff = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24))
    if (daysDiff >= 0 && daysDiff < days) {
      const index = days - 1 - daysDiff
      duration[index] = record.durationHours
      quality[index] = record.quality
    }
  })

  return {
    labels,
    datasets: [
      {
        label: '睡眠时长 (小时)',
        data: duration,
        backgroundColor: '#6366f1',
        borderRadius: 4
      },
      {
        label: '睡眠质量 (1-5)',
        data: quality,
        type: 'line',
        borderColor: '#f472b6',
        backgroundColor: 'transparent',
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  }
})

// 心情趋势
const moodTrendData = computed(() => {
  const days = parseInt(timeRange.value)
  const mood = new Array(days).fill(null)
  const energy = new Array(days).fill(null)
  const stress = new Array(days).fill(null)
  const today = new Date()

  moodRecords.value.forEach(record => {
    const recordDate = new Date(record.recordDate)
    const daysDiff = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24))
    if (daysDiff >= 0 && daysDiff < days) {
      const index = days - 1 - daysDiff
      mood[index] = record.mood
      energy[index] = record.energy
      stress[index] = record.stress
    }
  })

  return {
    labels: generateDateLabels(days),
    datasets: [
      {
        label: '心情',
        data: mood,
        borderColor: '#a855f7',
        backgroundColor: 'transparent',
        tension: 0.3
      },
      {
        label: '精力',
        data: energy,
        borderColor: '#22c55e',
        backgroundColor: 'transparent',
        tension: 0.3
      },
      {
        label: '压力',
        data: stress,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        tension: 0.3
      }
    ]
  }
})

// 健康指标
const healthChartData = computed(() => {
  const days = parseInt(timeRange.value)
  const weight = new Array(days).fill(null)
  const systolic = new Array(days).fill(null)
  const diastolic = new Array(days).fill(null)
  const today = new Date()

  healthRecords.value.forEach(record => {
    const recordDate = new Date(record.recordDate)
    const daysDiff = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24))
    if (daysDiff >= 0 && daysDiff < days) {
      const index = days - 1 - daysDiff
      if (record.weight) weight[index] = record.weight
      if (record.systolic) systolic[index] = record.systolic
      if (record.diastolic) diastolic[index] = record.diastolic
    }
  })

  return {
    labels: generateDateLabels(days),
    datasets: [
      {
        label: '体重 (kg)',
        data: weight,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        yAxisID: 'y'
      },
      {
        label: '收缩压',
        data: systolic,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        tension: 0.3,
        yAxisID: 'y1'
      },
      {
        label: '舒张压',
        data: diastolic,
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  }
})

// 通用折线图选项
const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#9ca3af',
        usePointStyle: true,
        padding: 15
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af' }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      grid: { color: 'rgba(156, 163, 175, 0.1)' },
      ticks: { color: '#9ca3af' }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: { drawOnChartArea: false },
      ticks: { color: '#9ca3af' }
    }
  }
}))

// 柱状图选项
const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af' }
    },
    y: {
      grid: { color: 'rgba(156, 163, 175, 0.1)' },
      ticks: { color: '#9ca3af' },
      beginAtZero: true
    }
  }
}))

// 睡眠柱状图选项（双Y轴）
const sleepBarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#9ca3af',
        usePointStyle: true
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af' }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { display: true, text: '小时', color: '#9ca3af' },
      grid: { color: 'rgba(156, 163, 175, 0.1)' },
      ticks: { color: '#9ca3af' },
      min: 0,
      max: 12
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: { display: true, text: '质量', color: '#9ca3af' },
      grid: { drawOnChartArea: false },
      ticks: { color: '#9ca3af' },
      min: 0,
      max: 6
    }
  }
}))

// 健康图表选项
const healthChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#9ca3af',
        usePointStyle: true
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af' }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { display: true, text: '体重 (kg)', color: '#9ca3af' },
      grid: { color: 'rgba(156, 163, 175, 0.1)' },
      ticks: { color: '#9ca3af' }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: { display: true, text: '血压 (mmHg)', color: '#9ca3af' },
      grid: { drawOnChartArea: false },
      ticks: { color: '#9ca3af' }
    }
  }
}))

// 环形图选项
const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        color: '#9ca3af',
        padding: 15,
        usePointStyle: true
      }
    }
  }
}))

// 加载数据
async function loadData() {
  const days = parseInt(timeRange.value)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    const [meals, exercises, finances, sleeps, moods, health] = await Promise.all([
      api.getMealRecords({ startDate: startDate.toISOString() }),
      api.getExerciseRecords({ startDate: startDate.toISOString() }),
      api.getFinanceRecords({ startDate: startDate.toISOString() }),
      api.getSleepRecords({ startDate: startDate.toISOString() }),
      api.getMoodRecords({ startDate: startDate.toISOString() }),
      api.getHealthRecords({ startDate: startDate.toISOString() })
    ])

    mealRecords.value = meals || []
    exerciseRecords.value = exercises || []
    financeRecords.value = finances || []
    sleepRecords.value = sleeps || []
    moodRecords.value = moods || []
    healthRecords.value = health || []
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

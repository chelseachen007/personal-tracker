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

      <!-- 卡路里平衡 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">卡路里平衡</h3>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            摄入 - 消耗 = 净卡路里
          </span>
        </div>
        <div class="h-72">
          <Line :data="calorieBalanceData" :options="calorieChartOptions" />
        </div>
      </div>

      <!-- 健康评分趋势 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">综合健康评分趋势</h3>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold" :style="{ color: healthScoreLevel?.color }">
              {{ currentHealthScore }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ healthScoreLevel?.label || '-' }}
            </span>
          </div>
        </div>
        <div class="h-72">
          <Line :data="healthScoreTrendData" :options="scoreTrendOptions" />
        </div>
      </div>

      <!-- 情绪化行为模式 -->
      <div v-if="emotionalPatterns?.patterns" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">情绪化行为模式</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(pattern, key) in displayPatterns"
            :key="key"
            class="p-4 rounded-lg border"
            :class="pattern.detected ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700'"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900 dark:text-white">{{ pattern.title }}</span>
              <span :class="pattern.detected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'">
                {{ pattern.detected ? '⚠️ 检测到' : '✅ 正常' }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ pattern.description }}</p>
          </div>
        </div>
        <div v-if="emotionalPatterns?.recommendations?.length > 0" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p class="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">💡 建议</p>
          <ul class="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li v-for="(rec, i) in emotionalPatterns.recommendations" :key="i">• {{ rec }}</li>
          </ul>
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
const calorieBalance = ref(null)
const healthScoreTrend = ref([])
const emotionalPatterns = ref(null)

// 日期格式化
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 当前健康评分
const currentHealthScore = computed(() => {
  if (healthScoreTrend.value.length > 0) {
    const latest = healthScoreTrend.value[healthScoreTrend.value.length - 1]
    return latest.totalScore || 0
  }
  return 0
})

// 健康评分等级
const healthScoreLevel = computed(() => {
  const score = currentHealthScore.value
  if (score >= 90) return { level: 'excellent', label: '优秀', color: '#22c55e' }
  if (score >= 75) return { level: 'good', label: '良好', color: '#3b82f6' }
  if (score >= 60) return { level: 'fair', label: '一般', color: '#eab308' }
  if (score >= 40) return { level: 'poor', label: '较差', color: '#f97316' }
  return { level: 'very_poor', label: '很差', color: '#ef4444' }
})

// 显示的情绪化行为模式
const displayPatterns = computed(() => {
  const patterns = emotionalPatterns.value?.patterns || {}
  return {
    stressEating: {
      title: '压力饮食',
      detected: patterns.stressEating?.detected,
      description: patterns.stressEating?.detected
        ? `压力大时平均摄入 ${patterns.stressEating.highStressAvg} kcal，比压力低时多 ${patterns.stressEating.differencePercent}%`
        : '未检测到压力相关的饮食变化'
    },
    moodSpending: {
      title: '情绪消费',
      detected: patterns.moodSpending?.detected,
      description: patterns.moodSpending?.detected
        ? `心情差时平均消费 ${patterns.moodSpending.lowMoodAvg} 元，高于心情好时`
        : '未检测到情绪相关的消费变化'
    },
    anxietyInactivity: {
      title: '焦虑少动',
      detected: patterns.anxietyInactivity?.detected,
      description: patterns.anxietyInactivity?.detected
        ? `压力大时平均运动 ${patterns.anxietyInactivity.highStressAvg} 分钟，明显减少`
        : '未检测到压力相关的运动减少'
    }
  }
})

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

// ========== 新增图表数据 ==========

// 卡路里平衡数据
const calorieBalanceData = computed(() => {
  if (!calorieBalance.value?.dailyData) {
    return { labels: [], datasets: [] }
  }

  const days = parseInt(timeRange.value)
  const dailyData = calorieBalance.value.dailyData.slice(-days)

  return {
    labels: dailyData.map(d => formatDate(d.date)),
    datasets: [
      {
        label: '摄入 (kcal)',
        data: dailyData.map(d => d.intake),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: '消耗 (kcal)',
        data: dailyData.map(d => d.burned),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: '净卡路里',
        data: dailyData.map(d => d.net),
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.3
      }
    ]
  }
})

// 卡路里图表选项
const calorieChartOptions = computed(() => ({
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
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || ''
          if (label) label += ': '
          label += Math.round(context.parsed.y) + ' kcal'
          if (context.dataset.label === '净卡路里') {
            const val = context.parsed.y
            label += (val > 0 ? ' (盈余)' : val < 0 ? ' (赤字)' : ' (平衡)')
          }
          return label
        }
      }
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

// 健康评分趋势数据
const healthScoreTrendData = computed(() => {
  if (healthScoreTrend.value.length === 0) {
    return { labels: [], datasets: [] }
  }

  const days = parseInt(timeRange.value)
  const trendData = healthScoreTrend.value.slice(-days)

  return {
    labels: trendData.map(d => formatDate(d.date)),
    datasets: [
      {
        label: '总评分',
        data: trendData.map(d => d.totalScore),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 3
      },
      {
        label: '运动',
        data: trendData.map(d => d.exercise),
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        tension: 0.3
      },
      {
        label: '饮食',
        data: trendData.map(d => d.diet),
        borderColor: '#22c55e',
        backgroundColor: 'transparent',
        tension: 0.3
      },
      {
        label: '睡眠',
        data: trendData.map(d => d.sleep),
        borderColor: '#6366f1',
        backgroundColor: 'transparent',
        tension: 0.3
      },
      {
        label: '心情',
        data: trendData.map(d => d.mood),
        borderColor: '#f472b6',
        backgroundColor: 'transparent',
        tension: 0.3
      }
    ]
  }
})

// 健康评分趋势图表选项
const scoreTrendOptions = computed(() => ({
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
      grid: { color: 'rgba(156, 163, 175, 0.1)' },
      ticks: { color: '#9ca3af' },
      min: 0,
      max: 100
    }
  }
}))

// 加载数据
async function loadData() {
  const days = parseInt(timeRange.value)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    const [meals, exercises, finances, sleeps, moods, health, balance, score, patterns] = await Promise.all([
      api.getMealRecords({ startDate: startDate.toISOString() }),
      api.getExerciseRecords({ startDate: startDate.toISOString() }),
      api.getFinanceRecords({ startDate: startDate.toISOString() }),
      api.getSleepRecords({ startDate: startDate.toISOString() }),
      api.getMoodRecords({ startDate: startDate.toISOString() }),
      api.getHealthRecords({ startDate: startDate.toISOString() }),
      api.getCalorieBalance(startDate.toISOString(), new Date().toISOString()),
      api.getHealthScore(),
      api.getEmotionalPatterns(30)
    ])

    mealRecords.value = meals || []
    exerciseRecords.value = exercises || []
    financeRecords.value = finances || []
    sleepRecords.value = sleeps || []
    moodRecords.value = moods || []
    healthRecords.value = health || []
    calorieBalance.value = balance || null
    healthScoreTrend.value = score?.dailyTrend || []
    emotionalPatterns.value = patterns || null
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

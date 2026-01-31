<template>
  <div class="exercise-charts">
    <!-- 配速曲线图 -->
    <div v-if="paceData && paceData.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        配速曲线
      </h3>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div class="h-64">
          <Line :data="paceChartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <!-- 海拔剖面图 -->
    <div v-if="elevationData && elevationData.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        海拔剖面
      </h3>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div class="h-64">
          <Line :data="elevationChartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  trackPoints: {
    type: Array,
    default: () => []
  }
})

// 计算配速数据
const paceData = computed(() => {
  if (!props.trackPoints || props.trackPoints.length < 2) return []

  const data = []
  const segmentKm = 0.5 // 每 500m 一个数据点

  for (let i = 1; i < props.trackPoints.length; i++) {
    const prev = props.trackPoints[i - 1]
    const curr = props.trackPoints[i]

    const distance = calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon)
    const timeDiff = (curr.time - prev.time) / 1000 // 秒

    if (timeDiff > 0 && distance > 0) {
      const speed = (distance / timeDiff) * 3.6 // km/h
      const pace = speed > 0 ? 60 / speed : 0 // min/km

      data.push({
        distance: segmentKm * i,
        pace: pace
      })
    }
  }

  return data
})

// 计算海拔数据
const elevationData = computed(() => {
  if (!props.trackPoints) return []

  return props.trackPoints.map((point, index) => ({
    distance: index,
    elevation: point.alt || 0
  }))
})

// 配速图表数据
const paceChartData = computed(() => ({
  labels: paceData.value.map(d => d.distance.toFixed(1)),
  datasets: [
    {
      label: '配速',
      data: paceData.value.map(d => d.pace),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 4
    }
  ]
}))

// 海拔图表数据
const elevationChartData = computed(() => ({
  labels: elevationData.value.map((_, i) => i),
  datasets: [
    {
      label: '海拔 (m)',
      data: elevationData.value.map(d => d.elevation),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 4
    }
  ]
}))

// 图表选项
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      displayColors: false,
      callbacks: {
        label: function(context) {
          if (context.dataset.label === '配速') {
            const mins = Math.floor(context.raw)
            const secs = Math.round((context.raw - mins) * 60)
            return `配速: ${mins}'${secs.toString().padStart(2, '0')}" /km`
          } else {
            return `海拔: ${context.raw.toFixed(0)} m`
          }
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      },
      ticks: {
        color: '#9ca3af',
        maxTicksLimit: 8
      }
    },
    y: {
      display: true,
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      },
      ticks: {
        color: '#9ca3af'
      }
    }
  }
}))

// 计算距离
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
</script>

<style scoped>
.exercise-charts canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>

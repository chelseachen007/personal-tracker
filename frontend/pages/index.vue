<template>
  <div class="min-h-screen relative">
    <!-- Navigation -->
    <nav class="sticky top-0 z-40 border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo & Nav -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span class="text-lg font-bold text-white tracking-tight">Tracker</span>
              </div>
            </div>
            <div class="hidden md:ml-8 md:flex md:space-x-1">
              <NuxtLink
                v-for="item in navItems"
                :key="item.name"
                :to="item.to"
                class="nav-link"
                :class="[$route.path === item.to ? 'active text-emerald-400' : 'text-slate-400 hover:text-white']"
              >
                <component :is="item.icon" class="w-4 h-4 mr-2" />
                {{ item.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- Right Side -->
          <div class="flex items-center gap-4">
            <!-- Search -->
            <button
              @click="openSearch"
              class="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>搜索</span>
              <kbd class="px-2 py-0.5 text-xs rounded-lg bg-slate-700/50 text-slate-500 ml-2">⌘K</kbd>
            </button>

            <!-- User Menu -->
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                {{ authStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              <button
                @click="logout"
                class="text-sm text-slate-400 hover:text-coral-400 transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Global Search -->
    <GlobalSearch ref="globalSearchRef" />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 animate-fade-in">
        <h1 class="text-3xl font-bold text-white mb-2">
          {{ greeting }}，<span class="gradient-text">{{ authStore.user?.username || '用户' }}</span>
        </h1>
        <p class="text-slate-400">这是你的个人数据概览</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="(stat, index) in stats"
          :key="stat.label"
          class="stat-card animate-fade-in-up group cursor-default"
          :class="`stagger-${index + 1}`"
          :style="{ '--accent-color': stat.color }"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="p-2 rounded-xl" :class="stat.bgClass">
              <component :is="stat.icon" class="w-5 h-5" :class="stat.iconClass" />
            </div>
            <div class="text-xs text-slate-500">
              <span :class="stat.trend > 0 ? 'text-emerald-400' : 'text-coral-400'">
                {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
              </span>
            </div>
          </div>
          <div class="stat-number text-3xl text-white mb-1">{{ stat.value }}</div>
          <div class="text-sm text-slate-400">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Insights Card -->
      <div v-if="insights.length > 0" class="mb-8 animate-fade-in-up stagger-5">
        <div class="glass-card overflow-hidden">
          <div class="p-6 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border-b border-slate-700/50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl bg-emerald-500/20">
                <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white">今日洞察</h3>
                <p class="text-sm text-slate-400">基于你的数据生成的智能建议</p>
              </div>
            </div>
          </div>
          <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="(insight, index) in insights"
              :key="index"
              class="insight-card flex items-start gap-3"
            >
              <div class="text-2xl">{{ insight.icon }}</div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-white text-sm">{{ insight.title }}</p>
                <p class="text-xs text-slate-400 mt-0.5 line-clamp-2">{{ insight.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8 animate-fade-in-up stagger-6">
        <h3 class="text-lg font-semibold text-white mb-4">快捷操作</h3>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            class="action-btn group"
          >
            <div class="p-3 rounded-xl mb-3 transition-all duration-300" :class="action.bgClass">
              <component :is="action.icon" class="w-6 h-6" :class="action.iconClass" />
            </div>
            <span class="text-sm text-slate-300 group-hover:text-white transition-colors">{{ action.name }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Active Goals -->
      <div v-if="activeGoals.length > 0" class="animate-fade-in-up stagger-6">
        <h3 class="text-lg font-semibold text-white mb-4">活跃目标</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="goal in activeGoals"
            :key="goal.id"
            class="glass-card p-5 group hover:border-emerald-500/30 transition-all duration-300"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <h4 class="font-semibold text-white capitalize">{{ goal.goalType }}</h4>
                <p class="text-sm text-slate-400 mt-1">
                  目标：<span class="text-slate-300">{{ goal.targetValue }}</span>
                </p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold gradient-text">
                  {{ Math.round((goal.currentValue / goal.targetValue) * 100) }}%
                </div>
                <div class="text-xs text-slate-500 mt-1">
                  {{ goal.currentValue }} / {{ goal.targetValue }}
                </div>
              </div>
            </div>
            <div class="progress-bar">
              <div
                class="progress-bar-fill"
                :style="{ width: Math.min((goal.currentValue / goal.targetValue) * 100, 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { h, computed } from 'vue'

const authStore = useAuthStore()
const api = useApi()

const healthRecords = ref([])
const mealRecords = ref([])
const exerciseRecords = ref([])
const financeRecords = ref([])
const goals = ref([])
const calorieBalance = ref(null)
const healthScore = ref(null)
const insights = ref([])

const globalSearchRef = ref()

// Icon components as render functions
const IconHealth = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' })
  ])
}

const IconMeal = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
  ])
}

const IconExercise = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
  ])
}

const IconFinance = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
}

const IconWellness = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
}

const IconAnalytics = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
  ])
}

const IconGoal = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' })
  ])
}

const IconDashboard = {
  render: () => h('svg', { class: 'w-full h-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' })
  ])
}

const navItems = [
  { name: '概览', to: '/', icon: IconDashboard },
  { name: '健康', to: '/health', icon: IconHealth },
  { name: '餐食', to: '/meals', icon: IconMeal },
  { name: '运动', to: '/exercise', icon: IconExercise },
  { name: '财务', to: '/finance', icon: IconFinance },
  { name: '心情', to: '/wellness', icon: IconWellness },
  { name: '分析', to: '/analytics', icon: IconAnalytics },
  { name: '目标', to: '/goals', icon: IconGoal }
]

const quickActions = [
  { name: '健康', to: '/health', icon: IconHealth, iconClass: 'text-emerald-400', bgClass: 'bg-emerald-500/20 group-hover:bg-emerald-500/30' },
  { name: '餐食', to: '/meals', icon: IconMeal, iconClass: 'text-cyan-400', bgClass: 'bg-cyan-500/20 group-hover:bg-cyan-500/30' },
  { name: '运动', to: '/exercise', icon: IconExercise, iconClass: 'text-purple-400', bgClass: 'bg-purple-500/20 group-hover:bg-purple-500/30' },
  { name: '财务', to: '/finance', icon: IconFinance, iconClass: 'text-coral-400', bgClass: 'bg-coral-500/20 group-hover:bg-coral-500/30' },
  { name: '心情', to: '/wellness', icon: IconWellness, iconClass: 'text-pink-400', bgClass: 'bg-pink-500/20 group-hover:bg-pink-500/30' },
  { name: '分析', to: '/analytics', icon: IconAnalytics, iconClass: 'text-blue-400', bgClass: 'bg-blue-500/20 group-hover:bg-blue-500/30' }
]

const stats = computed(() => [
  {
    label: '健康记录',
    value: healthRecords.value.length,
    icon: IconHealth,
    iconClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/20',
    color: '#10b981',
    trend: 12
  },
  {
    label: '餐食记录',
    value: mealRecords.value.length,
    icon: IconMeal,
    iconClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500/20',
    color: '#06b6d4',
    trend: 8
  },
  {
    label: '运动记录',
    value: exerciseRecords.value.length,
    icon: IconExercise,
    iconClass: 'text-purple-400',
    bgClass: 'bg-purple-500/20',
    color: '#a855f7',
    trend: 15
  },
  {
    label: '交易记录',
    value: financeRecords.value.length,
    icon: IconFinance,
    iconClass: 'text-coral-400',
    bgClass: 'bg-coral-500/20',
    color: '#f97316',
    trend: -3
  }
])

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const activeGoals = computed(() =>
  goals.value.filter(g => g.status === 'active').slice(0, 4)
)

function openSearch() {
  globalSearchRef.value?.open()
}

function logout() {
  authStore.logout()
  navigateTo('/login')
}

// Generate insights
function generateInsights() {
  const newInsights = []

  if (calorieBalance.value?.summary) {
    const { netCalories, totalIntake, totalBurned } = calorieBalance.value.summary
    if (netCalories > 500) {
      newInsights.push({
        icon: '🔥',
        title: '卡路里盈余',
        description: `今日摄入 ${totalIntake} kcal，消耗 ${totalBurned} kcal，盈余 ${netCalories} kcal`
      })
    } else if (netCalories < -500) {
      newInsights.push({
        icon: '⚖️',
        title: '卡路里赤字',
        description: `今日摄入 ${totalIntake} kcal，消耗 ${totalBurned} kcal，缺口 ${Math.abs(netCalories)} kcal`
      })
    }
  }

  if (healthScore.value) {
    const { totalScore, breakdown = {} } = healthScore.value
    if (totalScore >= 75) {
      newInsights.push({
        icon: '🌟',
        title: '健康状态良好',
        description: `今日健康评分 ${totalScore} 分，继续保持！`
      })
    } else if (totalScore < 60) {
      newInsights.push({
        icon: '⚠️',
        title: '健康状态需关注',
        description: '今日健康评分较低，注意休息和运动'
      })
    }

    if (breakdown.sleep < 15) {
      newInsights.push({
        icon: '😴',
        title: '睡眠不足',
        description: '昨晚睡眠质量不佳，建议今晚早点休息'
      })
    }
    if (breakdown.exercise < 10) {
      newInsights.push({
        icon: '🏃',
        title: '运动量不足',
        description: '今日还没有运动记录，来一次30分钟的锻炼吧'
      })
    }
  }

  activeGoals.value.forEach(goal => {
    const progress = (goal.currentValue / goal.targetValue) * 100
    if (progress >= 80 && progress < 100) {
      newInsights.push({
        icon: '🎯',
        title: '目标即将达成',
        description: `"${goal.goalType}" 目标已完成 ${Math.round(progress)}%，加油！`
      })
    }
  })

  insights.value = newInsights.slice(0, 4)
}

async function loadData() {
  try {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setHours(0, 0, 0, 0)

    const [health, meals, exercise, finance, allGoals, balance, score] = await Promise.all([
      api.getHealthRecords({ limit: 5 }),
      api.getMealRecords({ limit: 5 }),
      api.getExerciseRecords({ limit: 5 }),
      api.getFinanceRecords({ limit: 5 }),
      api.getGoals(),
      api.getCalorieBalance(startDate.toISOString(), today.toISOString()),
      api.getHealthScore(today.toISOString().split('T')[0])
    ])

    healthRecords.value = health || []
    mealRecords.value = meals || []
    exerciseRecords.value = exercise || []
    financeRecords.value = finance || []
    goals.value = allGoals || []
    calorieBalance.value = balance || null
    healthScore.value = score || null

    generateInsights()
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

onMounted(() => {
  authStore.loadFromStorage()
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  loadData()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

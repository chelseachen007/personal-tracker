<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                个人追踪器
              </h1>
            </div>
            <div class="ml-6 flex space-x-8">
              <NuxtLink
                v-for="item in navItems"
                :key="item.name"
                :to="item.to"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="$route.path === item.to
                  ? 'border-blue-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'"
              >
                {{ item.icon }} {{ item.name }}
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- 全局搜索按钮 -->
            <button
              @click="openSearch"
              class="hidden md:flex items-center px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="hidden lg:inline">搜索...</span>
              <kbd class="ml-2 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded">⌘K</kbd>
            </button>

            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ authStore.user?.username }}
            </span>
            <button
              @click="logout"
              class="text-sm text-red-600 hover:text-red-500"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 全局搜索组件 -->
    <GlobalSearch ref="globalSearchRef" />

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          仪表盘
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Quick Stats -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ healthRecords.length }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">健康记录</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ mealRecords.length }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">已记录餐食</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ exerciseRecords.length }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">运动记录</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-orange-600 mb-2">{{ financeRecords.length }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">交易记录</div>
          </div>
        </div>

        <!-- 智能建议卡片 -->
        <div v-if="insights.length > 0" class="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl shadow-sm p-6 mb-8 text-white">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            今日洞察
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(insight, index) in insights"
              :key="index"
              class="flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm"
            >
              <span class="text-2xl">{{ insight.icon }}</span>
              <div>
                <p class="font-medium">{{ insight.title }}</p>
                <p class="text-sm text-white/80">{{ insight.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            快捷操作
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <NuxtLink
              to="/health"
              class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <span class="text-2xl mb-2">💪</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">记录健康</span>
            </NuxtLink>
            <NuxtLink
              to="/meals"
              class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <span class="text-2xl mb-2">🍽️</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">记录餐食</span>
            </NuxtLink>
            <NuxtLink
              to="/exercise"
              class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <span class="text-2xl mb-2">🏃</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">记录运动</span>
            </NuxtLink>
            <NuxtLink
              to="/finance"
              class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
            >
              <span class="text-2xl mb-2">💰</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">记录财务</span>
            </NuxtLink>
            <NuxtLink
              to="/wellness"
              class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
            >
              <span class="text-2xl mb-2">😊</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">睡眠心情</span>
            </NuxtLink>
            <NuxtLink
              to="/analytics"
              class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
            >
              <span class="text-2xl mb-2">📈</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">数据分析</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Goals Section -->
        <div v-if="activeGoals.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            活跃目标
          </h3>
          <div class="space-y-4">
            <div
              v-for="goal in activeGoals"
              :key="goal.id"
              class="border-l-4 border-blue-500 pl-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white capitalize">
                    {{ goal.goalType }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    目标：{{ goal.targetValue }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ Math.round((goal.currentValue / goal.targetValue) * 100) }}%
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ goal.currentValue }} / {{ goal.targetValue }}
                  </div>
                </div>
              </div>
              <div class="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all"
                  :style="{ width: Math.min((goal.currentValue / goal.targetValue) * 100, 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
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

const navItems = [
  { name: '仪表盘', to: '/', icon: '📊' },
  { name: '健康', to: '/health', icon: '💪' },
  { name: '餐食', to: '/meals', icon: '🍽️' },
  { name: '运动', to: '/exercise', icon: '🏃' },
  { name: '财务', to: '/finance', icon: '💰' },
  { name: '心情', to: '/wellness', icon: '😊' },
  { name: '分析', to: '/analytics', icon: '📈' },
  { name: '目标', to: '/goals', icon: '🎯' }
]

const activeGoals = computed(() =>
  goals.value.filter(g => g.status === 'active')
)

function openSearch() {
  globalSearchRef.value?.open()
}

function logout() {
  authStore.logout()
  navigateTo('/login')
}

// 生成今日洞察
function generateInsights() {
  const newInsights = []
  const today = new Date().toISOString().split('T')[0]

  // 今日卡路里余额
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

  // 健康评分
  if (healthScore.value) {
    const { totalScore, level, recommendations } = healthScore.value
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
        description: recommendations?.[0] || '今日健康评分较低，注意休息和运动'
      })
    }

    // 根据各维度添加建议
    const breakdown = healthScore.value.breakdown || {}
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

  // 目标进度提醒
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

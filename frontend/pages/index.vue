<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                Personal Tracker
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
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ authStore.user?.username }}
            </span>
            <button
              @click="logout"
              class="text-sm text-red-600 hover:text-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Dashboard
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Quick Stats -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ healthRecords.length }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Health Records</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ mealRecords.length }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Meals Logged</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ exerciseRecords.length }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Workouts</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="text-3xl font-bold text-orange-600 mb-2">{{ financeRecords.length }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Transactions</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NuxtLink
              to="/health"
              class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <span class="text-2xl mb-2">💪</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">Log Health</span>
            </NuxtLink>
            <NuxtLink
              to="/meals"
              class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <span class="text-2xl mb-2">🍽️</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">Log Meal</span>
            </NuxtLink>
            <NuxtLink
              to="/exercise"
              class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <span class="text-2xl mb-2">🏃</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">Log Exercise</span>
            </NuxtLink>
            <NuxtLink
              to="/finance"
              class="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
            >
              <span class="text-2xl mb-2">💰</span>
              <span class="text-sm text-gray-700 dark:text-gray-300">Log Finance</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Goals Section -->
        <div v-if="activeGoals.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Goals
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
                    Target: {{ goal.targetValue }}
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

const navItems = [
  { name: 'Dashboard', to: '/', icon: '📊' },
  { name: 'Health', to: '/health', icon: '💪' },
  { name: 'Meals', to: '/meals', icon: '🍽️' },
  { name: 'Exercise', to: '/exercise', icon: '🏃' },
  { name: 'Finance', to: '/finance', icon: '💰' },
  { name: 'Goals', to: '/goals', icon: '🎯' }
]

const activeGoals = computed(() =>
  goals.value.filter(g => g.status === 'active')
)

function logout() {
  authStore.logout()
  navigateTo('/login')
}

async function loadData() {
  try {
    const [health, meals, exercise, finance, allGoals] = await Promise.all([
      api.getHealthRecords({ limit: 5 }),
      api.getMealRecords({ limit: 5 }),
      api.getExerciseRecords({ limit: 5 }),
      api.getFinanceRecords({ limit: 5 }),
      api.getGoals()
    ])

    healthRecords.value = health
    mealRecords.value = meals
    exerciseRecords.value = exercise
    financeRecords.value = finance
    goals.value = allGoals
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

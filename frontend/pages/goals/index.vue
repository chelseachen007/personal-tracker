<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          🎯 Goals
        </h1>
        <button
          @click="showForm = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Goal
        </button>
      </div>

      <!-- Add Goal Form -->
      <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New Goal
        </h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Goal Type
              </label>
              <select
                v-model="form.goalType"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="weight">Target Weight (kg)</option>
                <option value="savings">Savings Goal (¥)</option>
                <option value="exercise_hours">Exercise Hours</option>
                <option value="calories_burned">Calories to Burn</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Value
              </label>
              <input
                v-model.number="form.targetValue"
                type="number"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deadline (Optional)
            </label>
            <input
              v-model="form.deadline"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Goal
            </button>
            <button
              type="button"
              @click="showForm = false"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Goals List -->
      <div v-if="goals.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <p class="text-gray-500 dark:text-gray-400">No goals yet. Create your first goal!</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="goal in sortedGoals"
          :key="goal.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          :class="{ 'border-l-4 border-green-500': goal.status === 'completed' }"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {{ formatGoalType(goal.goalType) }}
              </h3>
              <p v-if="goal.deadline" class="text-sm text-gray-500 dark:text-gray-400">
                Deadline: {{ formatDate(goal.deadline) }}
              </p>
            </div>
            <span
              class="px-3 py-1 text-xs rounded-full"
              :class="{
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': goal.status === 'completed',
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': goal.status === 'active',
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': goal.status === 'paused'
              }"
            >
              {{ goal.status }}
            </span>
          </div>

          <div class="mb-4">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600 dark:text-gray-400">Progress</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ formatValue(goal.currentValue) }} / {{ formatValue(goal.targetValue) }}
                ({{ Math.round((goal.currentValue / goal.targetValue) * 100) }}%)
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all duration-300"
                :class="{
                  'bg-green-500': goal.status === 'completed',
                  'bg-blue-500': goal.status === 'active',
                  'bg-gray-400': goal.status === 'paused'
                }"
                :style="{ width: Math.min((goal.currentValue / goal.targetValue) * 100, 100) + '%' }"
              ></div>
            </div>
          </div>

          <div class="flex space-x-2">
            <button
              v-if="goal.status === 'active'"
              @click="updateGoalValue(goal, -1)"
              class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Decrease
            </button>
            <button
              v-if="goal.status === 'active'"
              @click="updateGoalValue(goal, 1)"
              class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              Increase
            </button>
            <button
              v-if="goal.status === 'completed'"
              @click="resetGoal(goal)"
              class="px-3 py-1 text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Goal Suggestions -->
      <div v-if="goals.length < 3" class="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💡 Goal Suggestions
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="quickCreate('weight', 70)"
            class="p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div class="text-2xl mb-2">⚖️</div>
            <div class="font-medium text-gray-900 dark:text-white">Target Weight</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Reach your ideal weight</div>
          </button>
          <button
            @click="quickCreate('savings', 10000)"
            class="p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div class="text-2xl mb-2">💰</div>
            <div class="font-medium text-gray-900 dark:text-white">Savings Goal</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Build your emergency fund</div>
          </button>
          <button
            @click="quickCreate('exercise_hours', 100)"
            class="p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <div class="text-2xl mb-2">🏃</div>
            <div class="font-medium text-gray-900 dark:text-white">Exercise Hours</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Stay active and fit</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const showForm = ref(false)
const goals = ref([])

const form = ref({
  goalType: 'weight',
  targetValue: null,
  deadline: ''
})

const sortedGoals = computed(() => {
  return [...goals.value].sort((a, b) => {
    // Completed at the end
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (b.status === 'completed' && a.status !== 'completed') return -1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})

async function loadGoals() {
  try {
    goals.value = await api.getGoals()
  } catch (error) {
    console.error('Failed to load goals:', error)
  }
}

async function submitForm() {
  try {
    await api.createGoal(form.value)
    showForm.value = false
    form.value = {
      goalType: 'weight',
      targetValue: null,
      deadline: ''
    }
    await loadGoals()
  } catch (error) {
    alert('Failed to create goal: ' + error.message)
  }
}

async function updateGoalValue(goal, change) {
  const newValue = Math.max(0, goal.currentValue + change)

  // This would need a backend API to update goal values
  // For now, we'll simulate it
  goal.currentValue = newValue

  if (newValue >= goal.targetValue) {
    goal.status = 'completed'
  }
}

async function resetGoal(goal) {
  goal.currentValue = 0
  goal.status = 'active'
}

function quickCreate(type, defaultValue) {
  form.value.goalType = type
  form.value.targetValue = defaultValue
  showForm.value = true
}

function formatGoalType(type) {
  const types = {
    weight: 'Target Weight',
    savings: 'Savings Goal',
    exercise_hours: 'Exercise Hours',
    calories_burned: 'Calories to Burn'
  }
  return types[type] || type
}

function formatValue(value) {
  return typeof value === 'number' ? value.toFixed(1) : value
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

onMounted(() => {
  loadGoals()
})
</script>

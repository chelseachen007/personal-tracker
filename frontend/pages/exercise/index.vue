<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          🏃 Exercise Records
        </h1>
        <button
          @click="showForm = true"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          + Log Exercise
        </button>
      </div>

      <!-- Add Exercise Form -->
      <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Log Exercise
        </h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                v-model="form.exerciseDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exercise Type
              </label>
              <select
                v-model="form.exerciseType"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="weights">Weight Training</option>
                <option value="yoga">Yoga</option>
                <option value="walking">Walking</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (minutes)
              </label>
              <input
                v-model.number="form.durationMinutes"
                type="number"
                required
                min="1"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Distance (km)
              </label>
              <input
                v-model.number="form.distanceKm"
                type="number"
                step="0.01"
                placeholder="Optional"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Calories Burned
              </label>
              <input
                v-model.number="form.caloriesBurned"
                type="number"
                placeholder="Optional"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              v-model="form.notes"
              rows="2"
              placeholder="How did it go?"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save
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

      <!-- Stats Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="text-3xl font-bold text-purple-600">{{ totalDuration }} min</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Total Duration (This Month)</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="text-3xl font-bold text-orange-600">{{ totalCalories }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Calories Burned</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="text-3xl font-bold text-blue-600">{{ records.length }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Total Workouts</div>
        </div>
      </div>

      <!-- Records List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Duration
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Distance
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Calories
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="exercise in records" :key="exercise.id">
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ formatDate(exercise.exerciseDate) }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span
                    class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  >
                    {{ formatExerciseType(exercise.exerciseType) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ exercise.durationMinutes }} min
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ exercise.distanceKm ? `${exercise.distanceKm} km` : '-' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ exercise.caloriesBurned || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const showForm = ref(false)
const records = ref([])

const form = ref({
  exerciseDate: new Date().toISOString().split('T')[0],
  exerciseType: 'running',
  durationMinutes: null,
  distanceKm: null,
  caloriesBurned: null,
  notes: ''
})

const totalDuration = computed(() => {
  return records.value.reduce((sum, e) => sum + e.durationMinutes, 0)
})

const totalCalories = computed(() => {
  return records.value.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0)
})

async function loadRecords() {
  try {
    records.value = await api.getExerciseRecords()
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

async function submitForm() {
  try {
    await api.createExerciseRecord(form.value)
    showForm.value = false
    form.value = {
      exerciseDate: new Date().toISOString().split('T')[0],
      exerciseType: 'running',
      durationMinutes: null,
      distanceKm: null,
      caloriesBurned: null,
      notes: ''
    }
    await loadRecords()
  } catch (error) {
    alert('Failed to log exercise: ' + error.message)
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

function formatExerciseType(type) {
  const types = {
    running: '🏃 Running',
    cycling: '🚴 Cycling',
    swimming: '🏊 Swimming',
    weights: '🏋️ Weights',
    yoga: '🧘 Yoga',
    walking: '🚶 Walking',
    other: '📋 Other'
  }
  return types[type] || type
}

onMounted(() => {
  loadRecords()
})
</script>

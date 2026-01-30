<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          🍽️ Meal Records
        </h1>
        <button
          @click="showForm = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Add Meal
        </button>
      </div>

      <!-- Add Meal Form -->
      <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Meal
        </h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date & Time
              </label>
              <input
                v-model="form.mealDate"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meal Type
              </label>
              <select
                v-model="form.mealType"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Food Name
            </label>
            <input
              v-model="form.foodName"
              type="text"
              required
              placeholder="e.g., Chicken Salad"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Calories
              </label>
              <input
                v-model.number="form.calories"
                type="number"
                placeholder="kcal"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Protein (g)
              </label>
              <input
                v-model.number="form.protein"
                type="number"
                step="0.1"
                placeholder="g"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Carbs (g)
              </label>
              <input
                v-model.number="form.carbs"
                type="number"
                step="0.1"
                placeholder="g"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fat (g)
              </label>
              <input
                v-model.number="form.fat"
                type="number"
                step="0.1"
                placeholder="g"
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
              placeholder="Optional"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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

      <!-- Today's Summary -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today's Nutrition
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ todayStats.calories }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Calories</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ todayStats.protein }}g</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Protein</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ todayStats.carbs }}g</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Carbs</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ todayStats.fat }}g</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Fat</div>
          </div>
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
                  Food
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Calories
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Macros (P/C/F)
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="meal in records" :key="meal.id">
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ formatDate(meal.mealDate) }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="{
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': meal.mealType === 'breakfast',
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': meal.mealType === 'lunch',
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': meal.mealType === 'dinner',
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': meal.mealType === 'snack'
                    }"
                  >
                    {{ meal.mealType }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ meal.foodName }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ meal.calories || '-' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ formatMacros(meal) }}
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
  mealDate: new Date().toISOString().slice(0, 16),
  mealType: 'breakfast',
  foodName: '',
  calories: null,
  protein: null,
  carbs: null,
  fat: null,
  notes: ''
})

const todayStats = computed(() => {
  const today = new Date().toDateString()
  const todayMeals = records.value.filter(m =>
    new Date(m.mealDate).toDateString() === today
  )

  return {
    calories: todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
    protein: todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0).toFixed(1),
    carbs: todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0).toFixed(1),
    fat: todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0).toFixed(1)
  }
})

async function loadRecords() {
  try {
    records.value = await api.getMealRecords()
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

async function submitForm() {
  try {
    await api.createMealRecord(form.value)
    showForm.value = false
    form.value = {
      mealDate: new Date().toISOString().slice(0, 16),
      mealType: 'breakfast',
      foodName: '',
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      notes: ''
    }
    await loadRecords()
  } catch (error) {
    alert('Failed to add meal: ' + error.message)
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString()
}

function formatMacros(meal) {
  const parts = []
  if (meal.protein) parts.push(`${meal.protein}P`)
  if (meal.carbs) parts.push(`${meal.carbs}C`)
  if (meal.fat) parts.push(`${meal.fat}F`)
  return parts.join(' / ') || '-'
}

onMounted(() => {
  loadRecords()
})
</script>

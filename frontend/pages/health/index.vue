<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          💪 Health Records
        </h1>
        <button
          @click="showForm = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Record
        </button>
      </div>

      <!-- Add Record Form -->
      <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Health Record
        </h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                v-model="form.recordDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weight (kg)
              </label>
              <input
                v-model.number="form.weight"
                type="number"
                step="0.1"
                placeholder="Optional"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Height (cm)
              </label>
              <input
                v-model.number="form.height"
                type="number"
                step="0.1"
                placeholder="Optional"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Systolic BP
              </label>
              <input
                v-model.number="form.systolic"
                type="number"
                placeholder="Optional"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Diastolic BP
              </label>
              <input
                v-model.number="form.diastolic"
                type="number"
                placeholder="Optional"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heart Rate (bpm)
              </label>
              <input
                v-model.number="form.heartRate"
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
              rows="3"
              placeholder="Optional notes"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              @click="showForm = false"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Records List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Weight
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  BMI
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Blood Pressure
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Heart Rate
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="record in records" :key="record.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ formatDate(record.recordDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ record.weight || '-' }} kg
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ calculateBMI(record) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ record.systolic && record.diastolic ? `${record.systolic}/${record.diastolic}` : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ record.heartRate || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    @click="deleteRecord(record.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="records.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
          No health records yet. Click "Add Record" to start tracking.
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
  recordDate: new Date().toISOString().split('T')[0],
  weight: null,
  height: null,
  systolic: null,
  diastolic: null,
  heartRate: null,
  notes: ''
})

async function loadRecords() {
  try {
    records.value = await api.getHealthRecords()
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

async function submitForm() {
  try {
    await api.createHealthRecord(form.value)
    showForm.value = false
    form.value = {
      recordDate: new Date().toISOString().split('T')[0],
      weight: null,
      height: null,
      systolic: null,
      diastolic: null,
      heartRate: null,
      notes: ''
    }
    await loadRecords()
  } catch (error) {
    alert('Failed to create record: ' + error.message)
  }
}

async function deleteRecord(id) {
  if (confirm('Are you sure you want to delete this record?')) {
    try {
      await api.deleteHealthRecord(id)
      await loadRecords()
    } catch (error) {
      alert('Failed to delete record: ' + error.message)
    }
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

function calculateBMI(record) {
  if (record.weight && record.height) {
    const heightInM = record.height / 100
    const bmi = record.weight / (heightInM * heightInM)
    return bmi.toFixed(1)
  }
  return '-'
}

onMounted(() => {
  loadRecords()
})
</script>

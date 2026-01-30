<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          💰 Finance Tracker
        </h1>
        <button
          @click="showForm = true"
          class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          + Add Transaction
        </button>
      </div>

      <!-- Add Transaction Form -->
      <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Transaction
        </h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Type
              </label>
              <select
                v-model="form.transactionType"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                v-model="form.category"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option v-if="form.transactionType === 'expense'" value="food">Food & Dining</option>
                <option v-if="form.transactionType === 'expense'" value="transport">Transport</option>
                <option v-if="form.transactionType === 'expense'" value="entertainment">Entertainment</option>
                <option v-if="form.transactionType === 'expense'" value="shopping">Shopping</option>
                <option v-if="form.transactionType === 'expense'" value="utilities">Utilities</option>
                <option v-if="form.transactionType === 'expense'" value="health">Health</option>
                <option v-if="form.transactionType === 'expense'" value="other">Other</option>
                <option v-if="form.transactionType === 'income'" value="salary">Salary</option>
                <option v-if="form.transactionType === 'income'" value="freelance">Freelance</option>
                <option v-if="form.transactionType === 'income'" value="investment">Investment</option>
                <option v-if="form.transactionType === 'income'" value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              v-model="form.description"
              type="text"
              placeholder="What's this for?"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method
            </label>
            <select
              v-model="form.paymentMethod"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select...</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="wechat">WeChat Pay</option>
              <option value="alipay">Alipay</option>
            </select>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
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

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Income</div>
          <div class="text-2xl font-bold text-green-600">¥{{ totalIncome.toFixed(2) }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Expenses</div>
          <div class="text-2xl font-bold text-red-600">¥{{ totalExpense.toFixed(2) }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Balance</div>
          <div class="text-2xl font-bold" :class="balance >= 0 ? 'text-blue-600' : 'text-red-600'">
            ¥{{ balance.toFixed(2) }}
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
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Description
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="record in records" :key="record.id">
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ formatDate(record.recordDate) }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="record.transactionType === 'income'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                  >
                    {{ record.transactionType }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white capitalize">
                  {{ record.category }}
                </td>
                <td class="px-6 py-4 text-sm font-medium"
                  :class="record.transactionType === 'income' ? 'text-green-600' : 'text-red-600'"
                >
                  {{ record.transactionType === 'income' ? '+' : '-' }}¥{{ record.amount.toFixed(2) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ record.description || '-' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ record.paymentMethod || '-' }}
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
  recordDate: new Date().toISOString().split('T')[0],
  transactionType: 'expense',
  category: 'food',
  amount: null,
  description: '',
  paymentMethod: ''
})

const totalIncome = computed(() => {
  return records.value
    .filter(r => r.transactionType === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
})

const totalExpense = computed(() => {
  return records.value
    .filter(r => r.transactionType === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)
})

const balance = computed(() => {
  return totalIncome.value - totalExpense.value
})

async function loadRecords() {
  try {
    records.value = await api.getFinanceRecords()
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

async function submitForm() {
  try {
    await api.createFinanceRecord(form.value)
    showForm.value = false
    form.value = {
      recordDate: new Date().toISOString().split('T')[0],
      transactionType: 'expense',
      category: 'food',
      amount: null,
      description: '',
      paymentMethod: ''
    }
    await loadRecords()
  } catch (error) {
    alert('Failed to add transaction: ' + error.message)
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

onMounted(() => {
  loadRecords()
})
</script>

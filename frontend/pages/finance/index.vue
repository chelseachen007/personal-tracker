<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          💰 Finance Tracker
        </h1>
        <div class="flex gap-2">
          <button
            @click="showOcr = !showOcr"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            📷 OCR 识别
          </button>
          <button
            @click="showForm = true"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div v-if="showOcr" class="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">📷 OCR 识别 - 财务记录</h3>
          <button @click="showOcr = false" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <OcrUpload type="finance" @saved="onOcrSaved" />
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</label>
            <select
              v-model="filters.period"
              @change="onFilterChange"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="lastMonth">Last Month</option>
              <option value="lastYear">Last Year</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</label>
            <select
              v-model="filters.type"
              @change="onFilterChange"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
            <select
              v-model="filters.category"
              @change="onFilterChange"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</label>
            <select
              v-model="sortBy"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High-Low)</option>
              <option value="amount-asc">Amount (Low-High)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Income</div>
          <div class="text-2xl font-bold text-green-600">¥{{ filteredIncome.toFixed(2) }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ filteredIncomeCount }} transactions</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Expenses</div>
          <div class="text-2xl font-bold text-red-600">¥{{ filteredExpense.toFixed(2) }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ filteredExpenseCount }} transactions</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Balance</div>
          <div class="text-2xl font-bold" :class="filteredBalance >= 0 ? 'text-blue-600' : 'text-red-600'">
            ¥{{ filteredBalance.toFixed(2) }}
          </div>
          <div class="text-xs text-gray-400 mt-1">Net result</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Period</div>
          <div class="text-lg font-bold text-gray-900 dark:text-white">{{ periodLabel }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ filteredRecords.length }} records</div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Monthly Trend Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">📈 Monthly Trend</h3>
            <div class="flex gap-2">
              <button
                @click="trendType = 'both'"
                :class="trendType === 'both' ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-3 py-1 text-xs rounded"
              >
                Both
              </button>
              <button
                @click="trendType = 'income'"
                :class="trendType === 'income' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-3 py-1 text-xs rounded"
              >
                Income
              </button>
              <button
                @click="trendType = 'expense'"
                :class="trendType === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-3 py-1 text-xs rounded"
              >
                Expense
              </button>
            </div>
          </div>
          <div class="h-64">
            <canvas id="trendChart"></canvas>
          </div>
        </div>

        <!-- Category Pie Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">🥧 Category Breakdown</h3>
            <select
              v-model="pieChartType"
              class="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="expense">By Expense</option>
              <option value="income">By Income</option>
            </select>
          </div>
          <div class="h-64">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Category Rankings -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-5 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Top Categories</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="item in topCategories"
            :key="item.category"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-gray-900 dark:text-white">{{ item.category }}</span>
              <span class="text-sm" :class="item.type === 'income' ? 'text-green-600' : 'text-red-600'">
                ¥{{ item.amount.toFixed(2) }}
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="h-2 rounded-full"
                :class="item.type === 'income' ? 'bg-green-600' : 'bg-red-600'"
                :style="{ width: item.percentage + '%' }"
              ></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ item.count }} transactions · {{ item.percentage.toFixed(1) }}%
            </div>
          </div>
        </div>
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
                <option value="">Select...</option>
                <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
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
              <option v-for="method in uniquePaymentMethods" :key="method" :value="method">{{ method }}</option>
            </select>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
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

      <!-- Records List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Showing {{ filteredRecords.length }} of {{ records.length }} records
            </div>
          </div>
        </div>
        <div class="overflow-x-auto max-h-96 overflow-y-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="record in sortedRecords" :key="record.id" class="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
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
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ record.category }}
                </td>
                <td class="px-6 py-4 text-sm font-medium whitespace-nowrap"
                  :class="record.transactionType === 'income' ? 'text-green-600' : 'text-red-600'"
                >
                  {{ record.transactionType === 'income' ? '+' : '-' }}¥{{ record.amount.toFixed(2) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                  {{ record.description || '-' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ record.paymentMethod || '-' }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <button
                    @click="deleteRecord(record.id)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
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
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const api = useApi()

const showForm = ref(false)
const showOcr = ref(false)
const records = ref([])
const trendType = ref('both')
const pieChartType = ref('expense')

const filters = ref({
  period: 'all',
  type: 'all',
  category: 'all'
})

const sortBy = ref('date-desc')

const form = ref({
  recordDate: new Date().toISOString().split('T')[0],
  transactionType: 'expense',
  category: '',
  amount: null,
  description: '',
  paymentMethod: ''
})

// Charts
let trendChartInstance = null
let categoryChartInstance = null

// Computed
const uniqueCategories = computed(() => {
  const cats = [...new Set(records.value.map(r => r.category).filter(Boolean))]
  return cats.sort()
})

const uniquePaymentMethods = computed(() => {
  const methods = [...new Set(records.value.map(r => r.paymentMethod).filter(Boolean))]
  return methods.sort()
})

const periodLabel = computed(() => {
  const period = filters.value.period
  if (period === 'all') return 'All Time'
  if (period === 'month') return 'This Month'
  if (period === 'year') return 'This Year'
  if (period === 'lastMonth') return 'Last Month'
  if (period === 'lastYear') return 'Last Year'
  return 'Custom'
})

const filteredRecords = computed(() => {
  let result = [...records.value]
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Period filter
  if (filters.value.period === 'month') {
    result = result.filter(r => {
      const d = new Date(r.recordDate)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    })
  } else if (filters.value.period === 'year') {
    result = result.filter(r => {
      const d = new Date(r.recordDate)
      return d.getFullYear() === currentYear
    })
  } else if (filters.value.period === 'lastMonth') {
    result = result.filter(r => {
      const d = new Date(r.recordDate)
      const lastMonth = new Date(currentYear, currentMonth - 1, 1)
      return d.getFullYear() === lastMonth.getFullYear() && d.getMonth() === lastMonth.getMonth()
    })
  } else if (filters.value.period === 'lastYear') {
    result = result.filter(r => {
      const d = new Date(r.recordDate)
      return d.getFullYear() === currentYear - 1
    })
  }

  // Type filter
  if (filters.value.type !== 'all') {
    result = result.filter(r => r.transactionType === filters.value.type)
  }

  // Category filter
  if (filters.value.category !== 'all') {
    result = result.filter(r => r.category === filters.value.category)
  }

  return result
})

const sortedRecords = computed(() => {
  const result = [...filteredRecords.value]
  const [field, order] = sortBy.value.split('-')

  result.sort((a, b) => {
    let aVal = a[field === 'amount' ? 'amount' : 'recordDate']
    let bVal = b[field === 'amount' ? 'amount' : 'recordDate']

    if (field === 'recordDate') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }

    if (order === 'desc') return bVal > aVal ? 1 : -1
    return aVal > bVal ? 1 : -1
  })

  return result
})

const filteredIncome = computed(() => {
  return filteredRecords.value
    .filter(r => r.transactionType === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
})

const filteredExpense = computed(() => {
  return filteredRecords.value
    .filter(r => r.transactionType === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)
})

const filteredIncomeCount = computed(() => {
  return filteredRecords.value.filter(r => r.transactionType === 'income').length
})

const filteredExpenseCount = computed(() => {
  return filteredRecords.value.filter(r => r.transactionType === 'expense').length
})

const filteredBalance = computed(() => {
  return filteredIncome.value - filteredExpense.value
})

const topCategories = computed(() => {
  const categoryMap = {}
  const totalAmount = pieChartType.value === 'income' ? filteredIncome.value : filteredExpense.value

  filteredRecords.value
    .filter(r => r.transactionType === pieChartType.value)
    .forEach(r => {
      if (!categoryMap[r.category]) {
        categoryMap[r.category] = { amount: 0, count: 0, type: r.transactionType }
      }
      categoryMap[r.category].amount += r.amount
      categoryMap[r.category].count += 1
    })

  return Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      type: data.type,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 9)
})

// Monthly data for trend chart
const monthlyData = computed(() => {
  const monthlyMap = {}
  const months = []

  // Get all months in range
  const dates = filteredRecords.value.map(r => new Date(r.recordDate))
  if (dates.length === 0) return { labels: [], income: [], expense: [] }

  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))

  for (let d = new Date(minDate); d <= maxDate; d.setMonth(d.getMonth() + 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push(key)
    monthlyMap[key] = { income: 0, expense: 0 }
  }

  filteredRecords.value.forEach(r => {
    const d = new Date(r.recordDate)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthlyMap[key]) {
      monthlyMap[key][r.transactionType] += r.amount
    }
  })

  return {
    labels: months.map(m => {
      const [y, mon] = m.split('-')
      return `${mon}/${y.slice(2)}`
    }),
    income: months.map(m => monthlyMap[m]?.income || 0),
    expense: months.map(m => monthlyMap[m]?.expense || 0)
  }
})

// Category data for pie chart
const categoryData = computed(() => {
  const categoryMap = {}
  const totalAmount = pieChartType.value === 'income' ? filteredIncome.value : filteredExpense.value

  filteredRecords.value
    .filter(r => r.transactionType === pieChartType.value)
    .forEach(r => {
      if (!categoryMap[r.category]) {
        categoryMap[r.category] = 0
      }
      categoryMap[r.category] += r.amount
    })

  const sorted = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])

  return {
    labels: sorted.map(([cat]) => cat),
    data: sorted.map(([, amount]) => amount)
  }
})

// Methods
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
    resetForm()
    await loadRecords()
  } catch (error) {
    alert('Failed to add transaction: ' + error.message)
  }
}

async function deleteRecord(id) {
  if (!confirm('Are you sure you want to delete this record?')) return
  try {
    await api.deleteFinanceRecord(id)
    await loadRecords()
  } catch (error) {
    alert('Failed to delete: ' + error.message)
  }
}

function resetForm() {
  form.value = {
    recordDate: new Date().toISOString().split('T')[0],
    transactionType: 'expense',
    category: '',
    amount: null,
    description: '',
    paymentMethod: ''
  }
}

function onOcrSaved() {
  showOcr.value = false
  loadRecords()
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function onFilterChange() {
  updateCharts()
}

// Chart functions
function initTrendChart() {
  const ctx = document.getElementById('trendChart')
  if (!ctx) return

  if (trendChartInstance) {
    trendChartInstance.destroy()
  }

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#9CA3AF' : '#4B5563'

  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyData.value.labels,
      datasets: [
        {
          label: 'Income',
          data: monthlyData.value.income,
          borderColor: '#16A34A',
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          fill: true,
          tension: 0.3,
          hidden: trendType.value === 'expense'
        },
        {
          label: 'Expense',
          data: monthlyData.value.expense,
          borderColor: '#DC2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          fill: true,
          tension: 0.3,
          hidden: trendType.value === 'income'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: isDark ? '#374151' : '#E5E7EB' }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: isDark ? '#374151' : '#E5E7EB' }
        }
      }
    }
  })
}

function initCategoryChart() {
  const ctx = document.getElementById('categoryChart')
  if (!ctx) return

  if (categoryChartInstance) {
    categoryChartInstance.destroy()
  }

  const colors = [
    '#F97316', '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F43F5E'
  ]

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryData.value.labels,
      datasets: [{
        data: categoryData.value.data,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 8,
            font: { size: 11 }
          }
        }
      }
    }
  })
}

function updateCharts() {
  nextTick(() => {
    initTrendChart()
    initCategoryChart()
  })
}

// Lifecycle
onMounted(async () => {
  await loadRecords()
  nextTick(() => {
    initTrendChart()
    initCategoryChart()
  })
})

watch([trendType, pieChartType], () => {
  updateCharts()
})

watch(filters, () => {
  updateCharts()
}, { deep: true })
</script>

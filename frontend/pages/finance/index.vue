<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面头部 -->
      <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            财务追踪
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            追踪您的收入和支出
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showOcr = !showOcr"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            OCR 识别
          </button>
          <button
            @click="showForm = !showForm"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ showForm ? '收起' : '添加交易' }}
          </button>
        </div>
      </div>

      <!-- OCR 区域 -->
      <div v-if="showOcr" class="bg-purple-50 dark:bg-purple-900/20 rounded-xl shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            OCR 识别 - 财务记录
          </h3>
          <button @click="showOcr = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <OcrUpload type="finance" @saved="onOcrSaved" />
      </div>

      <!-- 筛选区域 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">时间段:</label>
            <select
              v-model="filters.period"
              @change="onFilterChange"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">全部</option>
              <option value="month">本月</option>
              <option value="year">今年</option>
              <option value="lastMonth">上月</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">类型:</label>
            <select
              v-model="filters.type"
              @change="onFilterChange"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">全部</option>
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div>
              <div class="text-xl font-bold text-green-600">¥{{ filteredIncome.toFixed(2) }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">收入</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5v-12" />
              </svg>
            </div>
            <div>
              <div class="text-xl font-bold text-red-600">¥{{ filteredExpense.toFixed(2) }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">支出</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 17h.01M15 7h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div class="text-xl font-bold" :class="filteredBalance >= 0 ? 'text-blue-600' : 'text-red-600'">
                ¥{{ filteredBalance.toFixed(2) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">结余</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10h7a2 2 0 002-2V9a2 2 0 00-2-2h-7a2 2 0 00-2 2v6a2 2 0 002 2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div class="text-xl font-bold text-gray-900 dark:text-white">{{ filteredRecords.length }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">记录数</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加交易表单 -->
      <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          添加交易记录
        </h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                日期
              </label>
              <input
                v-model="form.recordDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                类型
              </label>
              <select
                v-model="form.transactionType"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                分类
              </label>
              <select
                v-model="form.category"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">选择...</option>
                <option value="餐饮">餐饮</option>
                <option value="购物">购物</option>
                <option value="交通">交通</option>
                <option value="娱乐">娱乐</option>
                <option value="医疗">医疗</option>
                <option value="教育">教育</option>
                <option value="居住">居住</option>
                <option value="通讯">通讯</option>
                <option value="工资">工资</option>
                <option value="奖金">奖金</option>
                <option value="投资">投资</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                金额
              </label>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              描述
            </label>
            <input
              v-model="form.description"
              type="text"
              placeholder="用途描述"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              支付方式
            </label>
            <select
              v-model="form.paymentMethod"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">选择...</option>
              <option value="现金">现金</option>
              <option value="微信">微信</option>
              <option value="支付宝">支付宝</option>
              <option value="银行卡">银行卡</option>
              <option value="信用卡">信用卡</option>
            </select>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              保存
            </button>
            <button
              type="button"
              @click="showForm = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              取消
            </button>
          </div>
        </form>
      </div>

      <!-- 数据表格 -->
      <AgDataTable
        :column-defs="columnDefs"
        :row-data="filteredRecords"
        :height="'500px'"
        :pagination="true"
        :enable-export="true"
        @export="handleExport"
        @refresh="loadRecords"
      />
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const showForm = ref(false)
const showOcr = ref(false)
const records = ref([])

const filters = ref({
  period: 'all',
  type: 'all'
})

const form = ref({
  recordDate: new Date().toISOString().split('T')[0],
  transactionType: 'expense',
  category: '',
  amount: null,
  description: '',
  paymentMethod: ''
})

// 表格列定义
const columnDefs = ref([
  {
    field: 'recordDate',
    headerName: '日期',
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: (params) => formatDate(params.value)
  },
  {
    field: 'transactionType',
    headerName: '类型',
    cellRenderer: (params) => {
      const type = params.value
      if (type === 'income') {
        return '<span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">收入</span>'
      }
      return '<span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">支出</span>'
    }
  },
  {
    field: 'category',
    headerName: '分类',
    filter: true
  },
  {
    field: 'amount',
    headerName: '金额',
    type: 'numericColumn',
    cellRenderer: (params) => {
      const type = params.data.transactionType
      const colorClass = type === 'income' ? 'text-green-600' : 'text-red-600'
      const sign = type === 'income' ? '+' : '-'
      return `<span class="${colorClass} font-medium">${sign}¥${params.value.toFixed(2)}</span>`
    }
  },
  {
    field: 'description',
    headerName: '描述',
    flex: 1
  },
  {
    field: 'paymentMethod',
    headerName: '支付方式',
    valueFormatter: (params) => params.value || '-'
  },
  {
    field: 'actions',
    headerName: '操作',
    sortable: false,
    filter: false,
    width: 100,
    cellRenderer: (params) => {
      return `
        <button class="delete-btn px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded text-sm" data-id="${params.data.id}">
          删除
        </button>
      `
    }
  }
])

// 筛选后的记录
const filteredRecords = computed(() => {
  let result = [...records.value]
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

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
  }

  if (filters.value.type !== 'all') {
    result = result.filter(r => r.transactionType === filters.value.type)
  }

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

const filteredBalance = computed(() => {
  return filteredIncome.value - filteredExpense.value
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
    resetForm()
    await loadRecords()
  } catch (error) {
    alert('添加交易失败: ' + error.message)
  }
}

async function deleteRecord(id) {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      await api.deleteFinanceRecord(id)
      await loadRecords()
    } catch (error) {
      alert('删除记录失败: ' + error.message)
    }
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

function onFilterChange() {
  // 筛选变化时，computed 会自动更新
}

function handleExport({ format }) {
  const { exportFinanceRecords } = useExport()
  exportFinanceRecords(filteredRecords.value, format)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 监听表格内的删除按钮点击
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target
    if (target.classList.contains('delete-btn')) {
      const id = parseInt(target.getAttribute('data-id'))
      deleteRecord(id)
    }
  })
})

onMounted(() => {
  loadRecords()
})
</script>

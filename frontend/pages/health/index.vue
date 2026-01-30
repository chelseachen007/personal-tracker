<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面头部 -->
      <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            健康记录
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            追踪您的体重、血压和健康指标
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showForm = !showForm"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ showForm ? '收起' : '添加记录' }}
          </button>
        </div>
      </div>

      <!-- 快速统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.latestWeight || '-' }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">最新体重</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.avgWeight || '-' }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">平均体重</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats.avgBP ? `${stats.avgBP.systolic}/${stats.avgBP.diastolic}` : '-' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">平均血压</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ records.length }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">总记录数</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加记录表单 -->
      <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          添加健康记录
        </h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                日期
              </label>
              <input
                v-model="form.recordDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                体重
              </label>
              <input
                v-model.number="form.weight"
                type="number"
                step="0.1"
                placeholder="可选"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                身高
              </label>
              <input
                v-model.number="form.height"
                type="number"
                step="0.1"
                placeholder="可选"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                收缩压
              </label>
              <input
                v-model.number="form.systolic"
                type="number"
                placeholder="可选"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                舒张压
              </label>
              <input
                v-model.number="form.diastolic"
                type="number"
                placeholder="可选"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                心率
              </label>
              <input
                v-model.number="form.heartRate"
                type="number"
                placeholder="可选"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              备注
            </label>
            <textarea
              v-model="form.notes"
              rows="2"
              placeholder="可选备注"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
        :row-data="records"
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
const records = ref([])
const stats = ref({
  latestWeight: null,
  avgWeight: null,
  avgBP: null
})

const form = ref({
  recordDate: new Date().toISOString().split('T')[0],
  weight: null,
  height: null,
  systolic: null,
  diastolic: null,
  heartRate: null,
  notes: ''
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
    field: 'weight',
    headerName: '体重',
    type: 'numericColumn',
    valueFormatter: (params) => params.value ? `${params.value} kg` : '-'
  },
  {
    field: 'bmi',
    headerName: 'BMI',
    type: 'numericColumn',
    valueGetter: (params) => {
      if (params.data.weight && params.data.height) {
        const heightInM = params.data.height / 100
        return (params.data.weight / (heightInM * heightInM)).toFixed(1)
      }
      return ''
    }
  },
  {
    field: 'bloodPressure',
    headerName: '血压',
    valueGetter: (params) => {
      if (params.data.systolic && params.data.diastolic) {
        return `${params.data.systolic}/${params.data.diastolic}`
      }
      return '-'
    }
  },
  {
    field: 'heartRate',
    headerName: '心率',
    type: 'numericColumn',
    valueFormatter: (params) => params.value ? `${params.value} bpm` : '-'
  },
  {
    field: 'notes',
    headerName: '备注',
    flex: 1
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

async function loadRecords() {
  try {
    records.value = await api.getHealthRecords()
    await loadStats()
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

async function loadStats() {
  try {
    const data = await api.getHealthStats()
    stats.value = {
      latestWeight: data.latestWeight,
      avgWeight: data.avgWeight,
      avgBP: data.avgBP
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
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
    alert('创建记录失败: ' + error.message)
  }
}

async function deleteRecord(id) {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      await api.deleteHealthRecord(id)
      await loadRecords()
    } catch (error) {
      alert('删除记录失败: ' + error.message)
    }
  }
}

function handleExport({ format }) {
  const { exportHealthRecords } = useExport()
  exportHealthRecords(records.value, format)
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

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面头部 -->
      <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            运动记录
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            追踪您的锻炼和身体活动
          </p>
        </div>
        <div class="flex gap-3">
          <button @click="showForm = !showForm"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ showForm ? '收起' : '添加运动' }}
          </button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalDuration }} min</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">总时长</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalCalories }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">消耗卡路里</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.monthlyDuration }} min</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">本月运动</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ records.length }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">总运动次数</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加运动表单 -->
      <div v-if="showForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          添加运动记录
        </h3>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                日期
              </label>
              <input v-model="form.exerciseDate" type="date" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                运动类型
              </label>
              <select v-model="form.exerciseType" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="running">跑步</option>
                <option value="cycling">骑行</option>
                <option value="swimming">游泳</option>
                <option value="weights">力量训练</option>
                <option value="yoga">瑜伽</option>
                <option value="walking">步行</option>
                <option value="hiit">HIIT</option>
                <option value="jumping">跳绳</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                时长 (分钟)
              </label>
              <input v-model.number="form.durationMinutes" type="number" required min="1"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                距离
              </label>
              <input v-model.number="form.distanceKm" type="number" step="0.01" placeholder="可选"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                消耗卡路里
              </label>
              <input v-model.number="form.caloriesBurned" type="number" placeholder="可选"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              备注
            </label>
            <textarea v-model="form.notes" rows="2" placeholder="感觉怎么样？"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
          </div>
          <div class="flex space-x-3">
            <button type="submit"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              保存
            </button>
            <button type="button" @click="showForm = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              取消
            </button>
          </div>
        </form>
      </div>

      <!-- 数据表格 -->
      <AgDataTable :column-defs="columnDefs" :row-data="records" :height="'500px'" :pagination="true"
        :enable-export="true" @export="handleExport" @refresh="loadRecords" />
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const showForm = ref(false)
const records = ref([])
const stats = ref({
  totalDuration: 0,
  totalCalories: 0,
  monthlyDuration: 0
})

const form = ref({
  exerciseDate: new Date().toISOString().split('T')[0],
  exerciseType: 'running',
  durationMinutes: null,
  distanceKm: null,
  caloriesBurned: null,
  notes: ''
})

// 运动类型映射
const exerciseTypeMap = {
  running: '跑步',
  cycling: '骑行',
  swimming: '游泳',
  weights: '力量训练',
  yoga: '瑜伽',
  walking: '步行',
  hiit: 'HIIT',
  jumping: '跳绳',
  other: '其他'
}

// 表格列定义
const columnDefs = ref([
  {
    field: 'exerciseDate',
    headerName: '日期',
    sortable: true,
    filter: 'agDateColumnFilter',
    valueFormatter: (params) => formatDate(params.value)
  },
  {
    field: 'exerciseType',
    headerName: '运动类型',
    cellRenderer: (params) => {
      const type = params.value
      const label = exerciseTypeMap[type] || type
      return `<span class="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">${label}</span>`
    }
  },
  {
    field: 'durationMinutes',
    headerName: '时长',
    type: 'numericColumn',
    valueFormatter: (params) => `${params.value} min`
  },
  {
    field: 'distanceKm',
    headerName: '距离',
    type: 'numericColumn',
    valueFormatter: (params) => params.value ? `${params.value} km` : '-'
  },
  {
    field: 'caloriesBurned',
    headerName: '消耗',
    type: 'numericColumn',
    valueFormatter: (params) => params.value ? `${params.value} kcal` : '-'
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

async function loadRecords () {
  try {
    records.value = await api.getExerciseRecords()
    await loadStats()
  } catch (error) {
    console.error('Failed to load records:', error)
  }
}

async function loadStats () {
  try {
    const data = await api.getExerciseStats()
    stats.value = {
      totalDuration: data.totalDuration,
      totalCalories: data.totalCalories,
      monthlyDuration: data.monthlyDuration
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

async function submitForm () {
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
    alert('添加运动记录失败: ' + error.message)
  }
}

async function deleteRecord (id) {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      await api.deleteExerciseRecord(id)
      await loadRecords()
    } catch (error) {
      alert('删除记录失败: ' + error.message)
    }
  }
}

function handleExport ({ format }) {
  const { exportExerciseRecords } = useExport()
  exportExerciseRecords(records.value, format)
}

function formatDate (dateStr) {
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
